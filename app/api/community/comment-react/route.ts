import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

const VALID_TYPES = ['heart', 'me_too', 'sending_love'] as const
type ReactionType = typeof VALID_TYPES[number]

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { commentId, reactionType } = body as { commentId?: string; reactionType?: string }

  if (!commentId) {
    return NextResponse.json({ error: 'commentId is required' }, { status: 400 })
  }
  if (!reactionType || !VALID_TYPES.includes(reactionType as ReactionType)) {
    return NextResponse.json(
      { error: `reactionType must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()

  const [{ data: comment }, { data: existing }] = await Promise.all([
    db.from('community_comments').select('reactions').eq('id', commentId).single(),
    db.from('comment_reactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType)
      .maybeSingle(),
  ])

  if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })

  const counts = (comment.reactions ?? { heart: 0, me_too: 0, sending_love: 0 }) as Record<string, number>

  if (existing) {
    const newCounts = { ...counts, [reactionType]: Math.max(0, (counts[reactionType] ?? 0) - 1) }
    await Promise.all([
      db.from('comment_reactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType),
      db.from('community_comments').update({ reactions: newCounts }).eq('id', commentId),
    ])
    return NextResponse.json({ reacted: false, counts: newCounts })
  }

  const newCounts = { ...counts, [reactionType]: (counts[reactionType] ?? 0) + 1 }
  await Promise.all([
    db.from('comment_reactions').insert({ comment_id: commentId, user_id: user.id, reaction_type: reactionType }),
    db.from('community_comments').update({ reactions: newCounts }).eq('id', commentId),
  ])
  return NextResponse.json({ reacted: true, counts: newCounts })
}
