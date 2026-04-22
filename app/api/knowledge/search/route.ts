import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { embedText } from '@/lib/voyage'

// POST /api/knowledge/search
// Embeds the query and returns the top-k most similar knowledge documents
// using cosine similarity via the pgvector HNSW index.
export async function POST(req: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { query, limit = 3 } = await req.json()
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  // Embed the query
  const queryEmbedding = await embedText(query)

  // Cosine similarity search — pgvector operator <=> = cosine distance (lower = more similar)
  const { data, error } = await supabase.rpc('match_knowledge_documents', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count:     Math.min(limit, 10),
  })

  if (error) {
    console.error('[knowledge/search] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ results: data ?? [] })
}
