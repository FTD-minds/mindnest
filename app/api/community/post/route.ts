import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { claude } from '@/lib/claude'

// ── Helpers ─────────────────────────────────────────────────────────────────

function computeAgeGroup(ageMonths: number | null, isExpecting: boolean): string | null {
  if (isExpecting)           return 'expecting'
  if (ageMonths === null)    return null
  if (ageMonths <= 3)        return '0-3mo'
  if (ageMonths <= 6)        return '4-6mo'
  if (ageMonths <= 12)       return '7-12mo'
  if (ageMonths <= 18)       return '1y'
  if (ageMonths <= 24)       return '18mo'
  if (ageMonths <= 36)       return '2y'
  return '3y+'
}

function detectPostType(content: string, isMemoryCard: boolean): 'moment' | 'question' | 'milestone' {
  if (isMemoryCard) return 'milestone'
  const lower = content.toLowerCase()
  if (
    content.trim().endsWith('?') ||
    /\b(how|why|what|when|should|can i|is it|does|help)\b/.test(lower)
  ) return 'question'
  return 'moment'
}

// ── Prompts ──────────────────────────────────────────────────────────────────

const NEST_COMMUNITY_PROMPT = `You are Nest, the warm AI coach inside MindNest, responding to a parent who just shared something in the community feed.

Write a single, warm, encouraging reply in 1–2 sentences. Be specific to what they shared.
- If it's a win: celebrate it genuinely and name what developmental milestone or parenting skill it reflects.
- If it's a struggle: validate the feeling first, then offer one practical, hopeful thought.
- If it's a question: give one brief, practical answer and end with encouragement.
- If it's a milestone celebration: be warm and specific about what this milestone means developmentally.

Never use hollow praise like "Great job!" or "Amazing!". Be real and specific.
Never diagnose, prescribe, or replace medical advice.
Keep it under 60 words. Warm, expert, human.`

// ── POST — create post ────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const {
    content,
    babyAgeMonths,
    post_type: clientPostType,
    is_memory_card    = false,
    milestone_id      = null,
    category_id       = null,
    topic_category_id = null,
  } = body as {
    content:              unknown
    babyAgeMonths?:       unknown
    post_type?:           string
    is_memory_card?:      boolean
    milestone_id?:        string | null
    category_id?:         string | null
    topic_category_id?:   string | null
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }
  if ((content as string).length > 1000) {
    return NextResponse.json({ error: 'content must be 1000 characters or fewer' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const trimmedContent = (content as string).trim()

  // ── AI content moderation via Edge Function ───────────────────────────────
  // Short content (≤40 chars) is auto-approved — skips the edge function call
  // to avoid false rejections on brief, clearly benign posts.
  const SKIP_MODERATION_THRESHOLD = 40
  if (trimmedContent.length > SKIP_MODERATION_THRESHOLD) {
    try {
      const db = createAdminClient()
      const { data: modData, error: modError } = await db.functions.invoke('moderate-post', {
        body: { content: trimmedContent },
      })

      if (!modError && modData && modData.approved === false) {
        return NextResponse.json(
          {
            error:   'moderation_failed',
            message: "That post didn't quite fit our community guidelines — keep it kind and supportive!",
          },
          { status: 400 },
        )
      }
      // modError or unexpected shape → fail open (post allowed through)
    } catch {
      // Network / deployment error → fail open
    }
  }

  // ── Compute metadata ──────────────────────────────────────────────────────
  const ageMonths  = typeof babyAgeMonths === 'number' ? babyAgeMonths : null
  const isExpecting = false // caller can pass babyAgeMonths=null for expecting
  const ageGroup   = computeAgeGroup(ageMonths, isExpecting)
  const postType   = clientPostType === 'question' ? 'question'
    : detectPostType(trimmedContent, is_memory_card)

  // ── Nest community reply ───────────────────────────────────────────────────
  let nestReply: string | null = null
  try {
    const ageContext = ageMonths !== null ? ` Their baby is ${ageMonths} months old.` : ''
    const response = await claude.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 120,
      system:     NEST_COMMUNITY_PROMPT,
      messages:   [{ role: 'user', content: trimmedContent + ageContext }],
    })
    nestReply = response.content[0].type === 'text' ? response.content[0].text.trim() : null
  } catch {
    // Non-fatal
  }

  const { data: post, error: insertError } = await supabase
    .from('community_posts')
    .insert({
      user_id:         user.id,
      content:         trimmedContent,
      baby_age_months: ageMonths,
      age_group:       ageGroup,
      post_type:       postType,
      is_memory_card:  is_memory_card,
      milestone_id:    milestone_id ?? null,
      category_id:     category_id  ?? null,
      is_approved:        true,
      nest_reply:         nestReply,
      nest_replied_at:    nestReply ? new Date().toISOString() : null,
      topic_category_id:  topic_category_id ?? null,
    })
    .select('*')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ post })
}

// ── GET — paginated feed ──────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit     = Math.min(parseInt(searchParams.get('limit')  ?? '20'), 50)
  const offset    = parseInt(searchParams.get('offset') ?? '0')
  const ageGroup  = searchParams.get('ageGroup')
  const memoryOnly = searchParams.get('memoryOnly') === 'true'

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let query = supabase
    .from('community_posts')
    .select(`
      id, content, baby_age_months, age_group, post_type, likes_count, reactions,
      is_memory_card, milestone_id, category_id, topic_category_id, comment_count,
      nest_reply, nest_replied_at, created_at, user_id,
      profiles!inner ( full_name )
    `)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (ageGroup)   query = query.eq('age_group', ageGroup)
  if (memoryOnly) query = query.eq('is_memory_card', true)

  const { data: posts, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const postIds = posts?.map(p => p.id) ?? []

  const [{ data: likes }, { data: reactions }] = postIds.length > 0
    ? await Promise.all([
        supabase.from('community_post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
        supabase.from('community_reactions').select('post_id, reaction_type').eq('user_id', user.id).in('post_id', postIds),
      ])
    : [{ data: [] }, { data: [] }]

  const likedSet: Set<string> = new Set(likes?.map(l => l.post_id) ?? [])
  const reactMap: Record<string, string[]> = {}
  for (const r of reactions ?? []) {
    if (!reactMap[r.post_id]) reactMap[r.post_id] = []
    reactMap[r.post_id].push(r.reaction_type)
  }

  const enriched = (posts ?? []).map(p => ({
    ...p,
    liked_by_me:  likedSet.has(p.id),
    my_reactions: reactMap[p.id] ?? [],
  }))

  return NextResponse.json({ posts: enriched })
}
