import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

// ── GET — fetch approved comments for a post ─────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  if (!postId) return NextResponse.json({ error: 'postId is required' }, { status: 400 })

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()

  const { data: comments, error } = await db
    .from('community_comments')
    .select(`
      id, post_id, parent_id, content, reactions, is_approved, created_at,
      profiles ( full_name )
    `)
    .eq('post_id', postId)
    .eq('is_approved', true)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const commentIds = (comments ?? []).map(c => c.id)

  // Fetch this user's reactions on these comments
  const { data: myReactions } = commentIds.length > 0
    ? await db
        .from('comment_reactions')
        .select('comment_id, reaction_type')
        .eq('user_id', user.id)
        .in('comment_id', commentIds)
    : { data: [] }

  const reactMap: Record<string, string[]> = {}
  for (const r of myReactions ?? []) {
    if (!reactMap[r.comment_id]) reactMap[r.comment_id] = []
    reactMap[r.comment_id].push(r.reaction_type)
  }

  const enriched = (comments ?? []).map(c => ({
    ...c,
    profiles:     Array.isArray(c.profiles) ? (c.profiles[0] ?? null) : c.profiles,
    my_reactions: reactMap[c.id] ?? [],
  }))

  return NextResponse.json({ comments: enriched })
}

// ── POST — submit a comment ───────────────────────────────────────────────────

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { postId, content, parentId } = body as {
    postId?:   string
    content?:  string
    parentId?: string | null
  }

  if (!postId)  return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }
  if (content.length > 500) {
    return NextResponse.json({ error: 'content must be 500 characters or fewer' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trimmed = content.trim()
  const db      = createAdminClient()

  // ── AI moderation ────────────────────────────────────────────────────────
  // Short comments (≤40 chars) are auto-approved — avoids false rejections
  // on "yes", "same!", emoji-only, and other clearly benign short replies.
  const SKIP_MODERATION_THRESHOLD = 40
  const approved = true
  if (trimmed.length > SKIP_MODERATION_THRESHOLD) {
    try {
      const { data: modData, error: modError } = await db.functions.invoke('moderate-post', {
        body: { content: trimmed },
      })
      if (!modError && modData && modData.approved === false) {
        return NextResponse.json(
          {
            error:   'moderation_failed',
            message: "That comment didn't quite fit our community guidelines — keep it kind and supportive!",
          },
          { status: 400 },
        )
      }
    } catch {
      // Fail open
    }
  }

  // ── Insert comment ────────────────────────────────────────────────────────
  const { data: comment, error: insertError } = await db
    .from('community_comments')
    .insert({
      post_id:     postId,
      user_id:     user.id,
      parent_id:   parentId ?? null,
      content:     trimmed,
      is_approved: approved,
    })
    .select('id, post_id, parent_id, content, reactions, is_approved, created_at')
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // ── Increment comment_count on the post ───────────────────────────────────
  if (approved) {
    const { data: post } = await db
      .from('community_posts')
      .select('comment_count')
      .eq('id', postId)
      .single()

    await db
      .from('community_posts')
      .update({ comment_count: (post?.comment_count ?? 0) + 1 })
      .eq('id', postId)
  }

  return NextResponse.json({ comment: { ...comment, my_reactions: [], profiles: null } }, { status: 201 })
}
