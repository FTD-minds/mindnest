import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { postId } = body

  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from('community_post_likes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existing) {
    // Unlike
    await supabase
      .from('community_post_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId)

    return NextResponse.json({ liked: false })
  }

  // Like
  await supabase
    .from('community_post_likes')
    .insert({ user_id: user.id, post_id: postId })

  return NextResponse.json({ liked: true })
}
