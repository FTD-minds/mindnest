import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const VALID_TYPES = ['heart', 'me_too', 'sending_love'] as const
type ReactionType = typeof VALID_TYPES[number]

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { postId, reactionType } = body as { postId?: string; reactionType?: string }

  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }
  if (!reactionType || !VALID_TYPES.includes(reactionType as ReactionType)) {
    return NextResponse.json(
      { error: `reactionType must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch current reactions JSONB and check if this user already reacted
  const [{ data: post }, { data: existing }] = await Promise.all([
    supabase
      .from('community_posts')
      .select('reactions')
      .eq('id', postId)
      .single(),
    supabase
      .from('community_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType)
      .maybeSingle(),
  ])

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const counts = (post.reactions ?? { heart: 0, me_too: 0, sending_love: 0 }) as Record<string, number>

  if (existing) {
    // Un-react
    await Promise.all([
      supabase
        .from('community_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType),
      supabase
        .from('community_posts')
        .update({ reactions: { ...counts, [reactionType]: Math.max(0, (counts[reactionType] ?? 0) - 1) } })
        .eq('id', postId),
    ])
    return NextResponse.json({
      reacted: false,
      counts:  { ...counts, [reactionType]: Math.max(0, (counts[reactionType] ?? 0) - 1) },
    })
  }

  // React
  await Promise.all([
    supabase
      .from('community_reactions')
      .insert({ post_id: postId, user_id: user.id, reaction_type: reactionType }),
    supabase
      .from('community_posts')
      .update({ reactions: { ...counts, [reactionType]: (counts[reactionType] ?? 0) + 1 } })
      .eq('id', postId),
  ])
  return NextResponse.json({
    reacted: true,
    counts:  { ...counts, [reactionType]: (counts[reactionType] ?? 0) + 1 },
  })
}
