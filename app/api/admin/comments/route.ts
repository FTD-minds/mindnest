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

export async function DELETE(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const db = createAdminClient()

  const { data: comment } = await db
    .from('community_comments')
    .select('post_id')
    .eq('id', id)
    .single()

  const { error } = await db.from('community_comments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (comment?.post_id) {
    const { data: post } = await db
      .from('community_posts')
      .select('comment_count')
      .eq('id', comment.post_id)
      .single()
    if (post) {
      await db
        .from('community_posts')
        .update({ comment_count: Math.max(0, (post.comment_count ?? 0) - 1) })
        .eq('id', comment.post_id)
    }
  }

  return NextResponse.json({ ok: true })
}
