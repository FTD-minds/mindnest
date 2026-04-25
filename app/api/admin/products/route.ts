import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

async function requireAdmin() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return profile?.is_admin ? user : null
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createAdminClient()
  const { data: products, error } = await db
    .from('affiliate_products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: products ?? [] })
}

export async function POST(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { title, description, image_url, affiliate_url, age_min_months, age_max_months, category, is_active } = body

  if (!title || !affiliate_url) {
    return NextResponse.json({ error: 'title and affiliate_url are required' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data: product, error } = await db
    .from('affiliate_products')
    .insert({
      title,
      description:    description    ?? null,
      image_url:      image_url      ?? null,
      affiliate_url,
      age_min_months: age_min_months ?? 0,
      age_max_months: age_max_months ?? 48,
      category:       category       ?? null,
      is_active:      is_active      ?? true,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product }, { status: 201 })
}

export async function PATCH(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { id, ...fields } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const db = createAdminClient()
  const { data: product, error } = await db
    .from('affiliate_products')
    .update(fields)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product })
}
