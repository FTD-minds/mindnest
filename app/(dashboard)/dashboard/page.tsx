import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { BabySwitcher } from '@/components/dashboard/BabySwitcher'
import { TwinsPanel } from '@/components/dashboard/TwinsPanel'

function getAgeMonths(dateOfBirth: string): number {
  const dob  = new Date(dateOfBirth)
  const now  = new Date()
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  return Math.max(0, Math.min(48, months))
}

function getAgeBand(ageMonths: number) {
  if (ageMonths < 3)  return { min: 0,  max: 3  }
  if (ageMonths < 6)  return { min: 3,  max: 6  }
  if (ageMonths < 9)  return { min: 6,  max: 9  }
  if (ageMonths < 12) return { min: 9,  max: 12 }
  if (ageMonths < 18) return { min: 12, max: 18 }
  if (ageMonths < 24) return { min: 18, max: 24 }
  if (ageMonths < 36) return { min: 24, max: 36 }
  if (ageMonths < 42) return { min: 36, max: 42 }
  return                     { min: 42, max: 48 }
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  })
}

function timeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-sage-50 px-5 pt-10 max-w-xl mx-auto">
        <p className="text-sage-400 text-sm">
          <Link href="/login" className="text-brand-600 underline">Sign in</Link> to continue.
        </p>
      </div>
    )
  }

  // Profile — includes full_name, selected_baby_id, parent_type, pregnancy_week
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, selected_baby_id, parent_type, pregnancy_week')
    .eq('id', user.id)
    .single()

  // All babies for switcher (include twin fields)
  const { data: babies } = await supabase
    .from('babies')
    .select('id, name, date_of_birth, is_twin, twin_sibling_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const allBabies = babies ?? []

  // Resolve selected baby: prefer stored selection, fall back to first
  const selectedId = profile?.selected_baby_id ?? allBabies[0]?.id ?? null
  const baby = allBabies.find(b => b.id === selectedId) ?? allBabies[0] ?? null

  // Subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', user.id)
    .single()

  const isPremiumUser =
    sub?.status === 'active' || sub?.status === 'trialing' || sub?.plan === 'lifetime'

  // Activities + completions for selected baby
  let activities: any[] = []
  let ageMonths = 0
  let completedToday: string[] = []

  if (baby) {
    ageMonths = getAgeMonths(baby.date_of_birth)
    const band = getAgeBand(ageMonths)

    const { data: acts } = await supabase
      .from('daily_activities')
      .select('*')
      .eq('min_age_months', band.min)
      .eq('max_age_months', band.max)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(3)

    activities = acts ?? []

    const today = new Date().toISOString().split('T')[0]
    const { data: completions } = await supabase
      .from('activity_completions')
      .select('activity_id')
      .eq('user_id', user.id)
      .eq('baby_id', baby.id)
      .eq('completed_date', today)

    completedToday = completions?.map(c => c.activity_id) ?? []
  }

  const firstName    = profile?.full_name?.split(' ')[0] ?? 'there'
  const isExpecting  = profile?.parent_type === 'expecting'
  const greeting     = `Good ${timeOfDay()},`

  return (
    <div className="min-h-screen bg-sage-50 px-5 pt-10 pb-28 lg:pb-10 max-w-xl mx-auto">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-4 font-medium">
          {todayLabel()}
        </p>
        <h1 className="font-display leading-[1.08] text-brand-900 mb-4">
          <span className="text-[2.6rem] font-normal italic block">{greeting}</span>
          <span className="text-[2.6rem] font-semibold block">{firstName}</span>
        </h1>
        {isExpecting ? (
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
            <p className="text-sm text-sage-400 tracking-wide">
              Your baby is on the way
            </p>
          </div>
        ) : baby ? (
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
            <p className="text-sm text-sage-400 tracking-wide">
              {baby.name} is growing beautifully
            </p>
          </div>
        ) : null}
      </header>

      {/* ── Baby switcher (only shown when 2+ babies, not expecting) ─────── */}
      {!isExpecting && (
        <BabySwitcher
          babies={allBabies.map(b => ({ id: b.id, name: b.name }))}
          selectedBabyId={selectedId}
        />
      )}

      {/* ── Twins panel (only shown when selected baby has a linked twin) ── */}
      {!isExpecting && baby?.is_twin && baby?.twin_sibling_id && (() => {
        const twin = allBabies.find(b => b.id === baby.twin_sibling_id)
        return twin ? (
          <TwinsPanel baby={baby} twin={twin} />
        ) : null
      })()}

      {/* ── Talk to Nest ──────────────────────────────────────────────────── */}
      <Link href="/nest" className="block mb-5">
        <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-7 py-8 cursor-pointer group transition-colors hover:bg-brand-700">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-brand-500 opacity-20 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute right-6 -bottom-6 w-28 h-28 rounded-full bg-brand-700 opacity-25" />
          <p className="text-[10px] uppercase tracking-[0.22em] text-brand-300 mb-4 relative z-10">
            Your AI Coach
          </p>
          <h2 className="font-display text-white text-[1.8rem] italic font-normal leading-tight mb-2 relative z-10">
            Talk to Nest
          </h2>
          <p className="text-brand-200 text-sm leading-relaxed relative z-10 mb-6 max-w-[75%]">
            How are you feeling today?
          </p>
          <div className="flex items-center gap-2.5 relative z-10">
            <span className="text-brand-300 text-[10px] uppercase tracking-[0.2em]">
              Begin conversation
            </span>
            <span className="text-brand-300 text-base">→</span>
          </div>
        </div>
      </Link>

      {/* ── Pregnancy week card (expecting only) ─────────────────────────── */}
      {isExpecting && (
        <section className="mb-5">
          <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-8 text-center">
            {profile?.pregnancy_week ? (
              <>
                <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3 font-medium">
                  Your Pregnancy
                </p>
                <p className="font-display text-[2.8rem] font-semibold text-brand-900 leading-none mb-1">
                  Week {profile.pregnancy_week}
                </p>
                <p className="font-display text-base italic text-sage-400 mt-2">
                  Here&apos;s what&apos;s happening this week
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-base italic text-sage-400 mb-1">
                  Your journey is just beginning
                </p>
                <p className="text-xs text-sage-400 leading-relaxed">
                  Ask Nest anything about your pregnancy — she&apos;s here for every week of the journey.
                </p>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Today's Activities preview (non-expecting only) ───────────────── */}
      {!isExpecting && (
        <section className="mb-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl italic text-brand-900">
              Today's Activities
            </h2>
            <Link
              href="/activities"
              className="text-[10px] uppercase tracking-[0.18em] text-brand-600 hover:text-brand-700 transition-colors"
            >
              View all
            </Link>
          </div>

          {baby ? (
            <ActivityFeed
              initialActivities={activities}
              babyId={baby.id}
              babyAgeMonths={ageMonths}
              isPremiumUser={isPremiumUser ?? false}
              completedToday={completedToday}
              limit={3}
            />
          ) : (
            <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-8 text-center">
              <p className="font-display text-base italic text-sage-400 mb-1">
                No activities yet
              </p>
              <p className="text-xs text-sage-400 leading-relaxed">
                Add your baby&apos;s profile to unlock age-matched activities.
              </p>
              <Link
                href="/profile/add-baby"
                className="inline-block mt-3 text-[11px] uppercase tracking-wider text-brand-600 hover:text-brand-700"
              >
                Add baby →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ── Daily Check-in ────────────────────────────────────────────────── */}
      <Link href="/checkin">
        <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-5 flex items-center justify-between group hover:border-warm-500 transition-colors">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-1">
              Daily Ritual
            </p>
            <h3 className="font-display text-lg italic text-brand-900">
              Check in with yourself
            </h3>
          </div>
          <span className="text-sage-400 text-xl group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </div>
      </Link>

    </div>
  )
}
