import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const revalidate = 0

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('community_posts')
    .select('id, content, post_type, age_group, baby_age_months, nest_reply, nest_replied_at, created_at, category_id, topic_category_id, comment_count, reactions, user_id, likes_count, is_memory_card, milestone_id, is_approved')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(50)

  console.log('[/api/community/feed] posts:', data?.length ?? 0, 'error:', error?.message ?? null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
