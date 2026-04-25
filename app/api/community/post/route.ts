import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { claude } from '@/lib/claude'

const MODERATION_PROMPT = `You are a content moderator for MindNest, a parenting app community. Review the post below and decide if it is appropriate to publish.

Reject the post if it contains any of the following:
- Hate speech, slurs, or discriminatory language
- Harassment, bullying, or personal attacks
- Graphic violence or self-harm content
- Spam, advertising, or irrelevant promotional content
- Misinformation that could harm children or parents

Allow anything that is a genuine parenting experience, question, win, struggle, or moment — even if emotionally raw or difficult.

Respond with ONLY a JSON object in this exact format (no markdown, no explanation):
{ "approved": true }
or
{ "approved": false, "reason": "brief reason here" }`

const NEST_COMMUNITY_PROMPT = `You are Nest, the warm AI coach inside MindNest, responding to a parent who just shared something in the community feed.

Write a single, warm, encouraging reply in 1–2 sentences. Be specific to what they shared.
- If it's a win: celebrate it genuinely and name what developmental milestone or parenting skill it reflects.
- If it's a struggle: validate the feeling first, then offer one practical, hopeful thought.
- If it's a question: give one brief, practical answer and end with encouragement.

Never use hollow praise like "Great job!" or "Amazing!". Be real and specific.
Never diagnose, prescribe, or replace medical advice.
Keep it under 60 words. Warm, expert, human.`

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { content, babyAgeMonths } = body

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: 'content must be 1000 characters or fewer' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── AI content moderation ─────────────────────────────────────────────────
  try {
    const modResponse = await claude.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 60,
      system:     MODERATION_PROMPT,
      messages:   [{ role: 'user', content: content.trim() }],
    })
    const modText = modResponse.content[0].type === 'text' ? modResponse.content[0].text.trim() : ''
    const modResult = JSON.parse(modText) as { approved: boolean; reason?: string }
    if (!modResult.approved) {
      return NextResponse.json(
        { error: 'moderation_failed', reason: modResult.reason ?? 'Content not allowed' },
        { status: 400 },
      )
    }
  } catch {
    // If moderation call fails entirely, allow the post through (fail open)
  }

  // Generate Nest's reply via Claude Haiku (low cost, fast)
  let nestReply: string | null = null
  try {
    const ageContext = typeof babyAgeMonths === 'number'
      ? ` Their baby is ${babyAgeMonths} months old.`
      : ''

    const response = await claude.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 120,
      system:     NEST_COMMUNITY_PROMPT,
      messages:   [{ role: 'user', content: content.trim() + ageContext }],
    })

    nestReply = response.content[0].type === 'text' ? response.content[0].text.trim() : null
  } catch {
    // Non-fatal — post is still saved without Nest reply
  }

  const { data: post, error: insertError } = await supabase
    .from('community_posts')
    .insert({
      user_id:         user.id,
      content:         content.trim(),
      baby_age_months: typeof babyAgeMonths === 'number' ? babyAgeMonths : null,
      nest_reply:      nestReply,
      nest_replied_at: nestReply ? new Date().toISOString() : null,
    })
    .select('*')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ post })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit  = Math.min(parseInt(searchParams.get('limit')  ?? '20'), 50)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: posts, error } = await supabase
    .from('community_posts')
    .select(`
      id, content, baby_age_months, likes_count, nest_reply,
      nest_replied_at, created_at, user_id,
      profiles!inner ( full_name )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch which posts the current user has liked
  const postIds = posts?.map(p => p.id) ?? []
  const { data: likes } = postIds.length > 0
    ? await supabase
        .from('community_post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)
    : { data: [] }

  const likedSet = new Set(likes?.map(l => l.post_id) ?? [])

  const enriched = (posts ?? []).map(p => ({
    ...p,
    liked_by_me: likedSet.has(p.id),
  }))

  return NextResponse.json({ posts: enriched })
}
