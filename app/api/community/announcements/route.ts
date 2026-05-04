import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

export const revalidate = 0

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 200 })

  const db = createAdminClient()
  const { data } = await db
    .from('nest_announcements')
    .select('id, title, content, is_pinned, is_active, created_at')
    .eq('is_active', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
