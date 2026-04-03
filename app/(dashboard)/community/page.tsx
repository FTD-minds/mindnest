import { createServerClient } from '@/lib/supabase/server'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import Link from 'next/link'

function getAgeMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  return Math.max(0, Math.min(36, months))
}

export default async function CommunityPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
        <p className="text-sage-400 text-sm">
          Please{' '}
          <Link href="/login" className="text-brand-600 underline">
            sign in
          </Link>{' '}
          to join the community.
        </p>
      </div>
    )
  }

  // Fetch baby for age context on new posts
  const { data: babies } = await supabase
    .from('babies')
    .select('date_of_birth')
    .eq('user_id', user.id)
    .limit(1)

  const babyAgeMonths = babies?.[0]
    ? getAgeMonths(babies[0].date_of_birth)
    : null

  // Fetch latest 20 posts with author profiles
  const { data: rawPosts } = await supabase
    .from('community_posts')
    .select(`
      id, content, baby_age_months, likes_count,
      nest_reply, nest_replied_at, created_at, user_id,
      profiles!inner ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch which posts the current user has liked
  const postIds = rawPosts?.map(p => p.id) ?? []
  const { data: myLikes } = postIds.length > 0
    ? await supabase
        .from('community_post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)
    : { data: [] }

  const likedSet = new Set(myLikes?.map(l => l.post_id) ?? [])

  const posts = (rawPosts ?? []).map(p => ({
    ...p,
    liked_by_me: likedSet.has(p.id),
  }))

  return (
    <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">
          Community
        </p>
        <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
          You're not alone
        </h1>
        <p className="text-sm text-sage-400 mt-2 leading-relaxed">
          Share wins, questions, and real moments with other mamas.
          Nest is here too — every post gets a personal reply.
        </p>
      </header>

      <CommunityFeed
        initialPosts={posts}
        currentUserId={user.id}
        babyAgeMonths={babyAgeMonths}
      />
    </div>
  )
}
