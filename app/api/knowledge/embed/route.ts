import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { embedText } from '@/lib/voyage'

// POST /api/knowledge/embed
// Embeds a document and inserts it into knowledge_documents.
// Protected — requires SUPABASE_SERVICE_ROLE_KEY so only server-side admin
// scripts can write to the knowledge base (not end users).
export async function POST(req: Request) {
  // Auth: require the service role key in the Authorization header
  const authHeader = req.headers.get('authorization')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { title, content, source, category } = await req.json()

  if (!title || !content || !source || !category) {
    return NextResponse.json(
      { error: 'title, content, source, and category are required' },
      { status: 400 }
    )
  }

  const validCategories = ['WHO', 'AAP', 'CDC', 'Research', 'General']
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: `category must be one of: ${validCategories.join(', ')}` },
      { status: 400 }
    )
  }

  // Generate embedding
  const embedding = await embedText(`${title}\n\n${content}`)

  // Use service role client to bypass RLS for writes
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  )

  const { data, error } = await supabase
    .from('knowledge_documents')
    .insert({ title, content, source, category, embedding: JSON.stringify(embedding) })
    .select('id, title')
    .single()

  if (error) {
    console.error('[knowledge/embed] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, document: data })
}
