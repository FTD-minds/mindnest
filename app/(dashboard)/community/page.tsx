import { createServerClient } from '@/lib/supabase/server'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import Link from 'next/link'

export const revalidate = 0

function getAgeMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  return Math.max(0, Math.min(48, months))
}

function computeAgeGroup(ageMonths: number | null, isExpecting: boolean): string | null {
  if (isExpecting)        return 'expecting'
  if (ageMonths === null) return null
  if (ageMonths <= 3)     return '0-3mo'
  if (ageMonths <= 6)     return '4-6mo'
  if (ageMonths <= 12)    return '7-12mo'
  if (ageMonths <= 18)    return '1y'
  if (ageMonths <= 24)    return '18mo'
  if (ageMonths <= 36)    return '2y'
  return '3y+'
}

const AGE_GROUP_TO_CATEGORY_SLUG: Record<string, string> = {
  'expecting': 'pregnancy',
  '0-3mo':    'newborn',
  '4-6mo':    'baby',
  '7-12mo':   'baby',
  '1y':       'toddler',
  '18mo':     'toddler',
  '2y':       'toddler',
  '3y+':      'toddler',
}

const POST_SELECT = `
  id, content, baby_age_months, age_group, post_type,
  likes_count, reactions, is_memory_card, milestone_id,
  category_id, topic_category_id, comment_count,
  nest_reply, nest_replied_at, created_at, user_id,
  profiles ( full_name )
`

export default async function CommunityPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
        <p className="text-sage-400 text-sm">
          Please{' '}
          <Link href="/login" className="text-brand-600 underline">sign in</Link>
          {' '}to join the community.
        </p>
      </div>
    )
  }

  // ── Premium gate ─────────────────────────────────────────────────────────
  const [{ data: subscription }, { data: profile }] = await Promise.all([
    supabase.from('subscriptions').select('status').eq('user_id', user.id).single(),
    supabase.from('profiles').select('beta_access, beta_access_expires_at, parent_type').eq('id', user.id).single(),
  ])

  const isPremium     = ['active', 'trialing'].includes(subscription?.status ?? '')
  const betaExpiry    = profile?.beta_access_expires_at ? new Date(profile.beta_access_expires_at) : null
  const hasBetaAccess = (profile?.beta_access ?? false) && (betaExpiry === null || betaExpiry > new Date())

  if (!isPremium && !hasBetaAccess) {
    return (
      <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
        <header className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Community</p>
          <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">You&apos;re not alone</h1>
        </header>
        <div className="bg-white rounded-2xl border border-sage-200 px-6 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="font-display text-lg italic text-brand-900 mb-2">Community is a Premium feature</p>
          <p className="text-sm text-sage-400 mb-6 leading-relaxed">
            Connect with other parents, share wins, ask questions, and get a personal reply from Nest on every post.
          </p>
          <Link
            href="/upgrade"
            className="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-brand-700 transition-colors"
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>
    )
  }

  // ── Baby / age data ───────────────────────────────────────────────────────
  const { data: babies } = await supabase
    .from('babies')
    .select('date_of_birth, name')
    .eq('user_id', user.id)
    .limit(1)

  const baby          = babies?.[0] ?? null
  const babyAgeMonths = baby ? getAgeMonths(baby.date_of_birth) : null
  const isExpecting   = profile?.parent_type === 'expecting'
  const ageGroup      = computeAgeGroup(babyAgeMonths, isExpecting)
  const defaultCategorySlug = ageGroup ? (AGE_GROUP_TO_CATEGORY_SLUG[ageGroup] ?? null) : null

  // ── Parallel data fetches ─────────────────────────────────────────────────
  const [
    { data: categories },
    { data: rawStagePosts },
    { data: rawMemoryPosts },
    { data: rawProducts },
  ] = await Promise.all([
    // Categories
    supabase
      .from('community_categories')
      .select('id, name, icon, slug, category_type')
      .order('sort_order', { ascending: true }),

    // All recent posts — client-side stage/topic filtering
    supabase
      .from('community_posts')
      .select(POST_SELECT)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(40),

    // Memory / milestone cards
    supabase
      .from('community_posts')
      .select(POST_SELECT)
      .eq('is_approved', true)
      .eq('is_memory_card', true)
      .order('created_at', { ascending: false })
      .limit(20),

    // Affiliate products
    (() => {
      let q = supabase
        .from('affiliate_products')
        .select('id, title, description, image_url, affiliate_url, age_min_months, age_max_months, category')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6)
      if (babyAgeMonths !== null) {
        q = q.lte('age_min_months', babyAgeMonths).gte('age_max_months', babyAgeMonths)
      }
      return q
    })(),
  ])

  // ── Per-user like + reaction maps ─────────────────────────────────────────
  const allPostIds = [
    ...(rawStagePosts?.map(p => p.id)  ?? []),
    ...(rawMemoryPosts?.map(p => p.id) ?? []),
  ]

  const [{ data: myLikes }, { data: myReactions }] = allPostIds.length > 0
    ? await Promise.all([
        supabase.from('community_post_likes').select('post_id').eq('user_id', user.id).in('post_id', allPostIds),
        supabase.from('community_reactions').select('post_id, reaction_type').eq('user_id', user.id).in('post_id', allPostIds),
      ])
    : [{ data: [] }, { data: [] }]

  const likedSet: Set<string> = new Set(myLikes?.map(l => l.post_id) ?? [])
  const reactMap: Record<string, string[]> = {}
  for (const r of myReactions ?? []) {
    if (!reactMap[r.post_id]) reactMap[r.post_id] = []
    reactMap[r.post_id].push(r.reaction_type)
  }

  function mapPost(p: {
    id: string
    profiles: { full_name: string } | { full_name: string }[] | null
    [key: string]: unknown
  }) {
    return {
      ...p,
      profiles:     Array.isArray(p.profiles) ? (p.profiles[0] ?? null) : p.profiles,
      liked_by_me:  likedSet.has(p.id),
      my_reactions: reactMap[p.id] ?? [],
    }
  }

  console.log('[community/page] rawStagePosts count:', rawStagePosts?.length ?? 0, '| first:', rawStagePosts?.[0]?.id ?? 'none')

  const stagePosts  = (rawStagePosts  ?? []).map(mapPost)
  const memoryPosts = (rawMemoryPosts ?? []).map(mapPost)

  const stageCategories = (categories ?? []).filter(c => c.category_type === 'stage')
  const topicCategories = (categories ?? []).filter(c => c.category_type === 'topic')
  const stageCategoryId = (categories ?? []).find(c => c.slug === defaultCategorySlug)?.id ?? null

  return (
    <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Community</p>
        <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">You&apos;re not alone</h1>
        <p className="text-sm text-sage-400 mt-2 leading-relaxed">
          Share wins, questions, and real moments. Nest is here too — every post gets a personal reply.
        </p>
      </header>

      <CommunityFeed
        initialStagePosts={stagePosts as Parameters<typeof CommunityFeed>[0]['initialStagePosts']}
        initialMemoryPosts={memoryPosts as Parameters<typeof CommunityFeed>[0]['initialMemoryPosts']}
        products={(rawProducts ?? []) as Parameters<typeof CommunityFeed>[0]['products']}
        stageCategories={stageCategories as Parameters<typeof CommunityFeed>[0]['stageCategories']}
        topicCategories={topicCategories as Parameters<typeof CommunityFeed>[0]['topicCategories']}
        currentUserId={user.id}
        babyAgeMonths={babyAgeMonths}
        ageGroup={ageGroup}
        stageCategoryId={stageCategoryId}
      />
    </div>
  )
}
