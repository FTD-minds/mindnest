import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { BabySwitcher } from '@/components/dashboard/BabySwitcher'
import { getAgeBand } from '@/lib/utils'

function getAgeMonths(dateOfBirth: string): number {
  const dob  = new Date(dateOfBirth)
  const now  = new Date()
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  return Math.max(0, Math.min(48, months))
}

function getTrimester(week: number | null): 1 | 2 | 3 {
  if (!week || week <= 13) return 1
  if (week <= 26)          return 2
  return 3
}

export default async function ActivitiesPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
        <p className="text-sage-400 text-sm">
          Please <Link href="/login" className="text-brand-600 underline">sign in</Link> to see activities.
        </p>
      </div>
    )
  }

  // Profile — need parent_type and pregnancy_week in addition to selected_baby_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('selected_baby_id, parent_type, pregnancy_week')
    .eq('id', user.id)
    .single()

  const isExpecting = profile?.parent_type === 'expecting'

  // ── Subscription (needed for both paths) ────────────────────────────────────
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', user.id)
    .single()

  const isPremiumUser =
    sub?.status === 'active' || sub?.status === 'trialing' || sub?.plan === 'lifetime'

  // ── EXPECTING PATH ───────────────────────────────────────────────────────────
  if (isExpecting) {
    const pregnancyWeek = profile?.pregnancy_week ?? null
    const trimester     = getTrimester(pregnancyWeek)

    const { data: prenatalActivities } = await supabase
      .from('daily_activities')
      .select('*')
      .eq('content_type', 'prenatal')
      .eq('trimester', trimester)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    const trimesterLabel = ['First', 'Second', 'Third'][trimester - 1]
    const weekLabel      = pregnancyWeek ? `Week ${pregnancyWeek}` : `${trimesterLabel} Trimester`

    return (
      <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
        <header className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">For You</p>
          <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
            {weekLabel} — Activities for You
          </h1>
          <p className="text-sm text-sage-400 mt-2">
            {trimesterLabel} trimester · curated for where you are right now
          </p>
        </header>

        <ActivityFeed
          initialActivities={prenatalActivities ?? []}
          trimester={trimester}
          isPremiumUser={isPremiumUser ?? false}
          completedToday={[]}
        />
      </div>
    )
  }

  // ── BABY ACTIVITY PATH ───────────────────────────────────────────────────────

  // All babies for switcher
  const { data: babies } = await supabase
    .from('babies')
    .select('id, name, date_of_birth')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const allBabies  = babies ?? []
  const selectedId = profile?.selected_baby_id ?? allBabies[0]?.id ?? null
  const baby       = allBabies.find(b => b.id === selectedId) ?? allBabies[0] ?? null

  if (!baby) {
    return (
      <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
        <header className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Daily Practice</p>
          <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
            Today's Activities
          </h1>
        </header>
        <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-8 text-center">
          <p className="font-display text-base italic text-sage-400 mb-1">No baby profile yet</p>
          <p className="text-xs text-sage-400 leading-relaxed mb-3">
            Add your baby's profile to unlock age-matched activities.
          </p>
          <Link
            href="/profile/add-baby"
            className="text-[11px] uppercase tracking-wider text-brand-600 hover:text-brand-700"
          >
            Add baby →
          </Link>
        </div>
      </div>
    )
  }

  const ageMonths  = getAgeMonths(baby.date_of_birth)
  const band       = getAgeBand(ageMonths)

  const today      = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // IDs completed by this baby in the last 7 days — exclude from feed
  const { data: recentCompletions } = await supabase
    .from('activity_completions')
    .select('activity_id, completed_date')
    .eq('user_id', user.id)
    .eq('baby_id', baby.id)
    .gte('completed_date', sevenDaysAgo)

  const recentlyCompletedIds = recentCompletions?.map(c => c.activity_id) ?? []

  // Today-only completions — used to show check marks on cards still in the feed
  const completedTodayIds = recentCompletions
    ?.filter(c => c.completed_date === today)
    .map(c => c.activity_id) ?? []

  const activitiesQuery = supabase
    .from('daily_activities')
    .select('*')
    .eq('content_type', 'baby')
    .eq('min_age_months', band.min)
    .eq('max_age_months', band.max)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (recentlyCompletedIds.length > 0) {
    activitiesQuery.not('id', 'in', `(${recentlyCompletedIds.join(',')})`)
  }

  const { data: activities } = await activitiesQuery

  const ageLabel =
    ageMonths < 12
      ? `${ageMonths} month${ageMonths !== 1 ? 's' : ''}`
      : `${Math.floor(ageMonths / 12)}y${ageMonths % 12 ? ` ${ageMonths % 12}mo` : ''}`

  return (
    <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Daily Practice</p>
        <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
          Today's Activities
        </h1>
        <p className="text-sm text-sage-400 mt-2">
          Matched to {baby.name} · {ageLabel} old
        </p>
      </header>

      <BabySwitcher
        babies={allBabies.map(b => ({ id: b.id, name: b.name }))}
        selectedBabyId={selectedId}
      />

      <ActivityFeed
        initialActivities={activities ?? []}
        babyId={baby.id}
        babyAgeMonths={ageMonths}
        isPremiumUser={isPremiumUser ?? false}
        completedToday={completedTodayIds}
      />
    </div>
  )
}
