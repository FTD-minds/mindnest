import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { BabySwitcher } from '@/components/dashboard/BabySwitcher'

function getAgeMonths(dateOfBirth: string): number {
  const dob  = new Date(dateOfBirth)
  const now  = new Date()
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  return Math.max(0, Math.min(36, months))
}

function getAgeBand(ageMonths: number) {
  if (ageMonths < 3)  return { min: 0,  max: 3  }
  if (ageMonths < 6)  return { min: 3,  max: 6  }
  if (ageMonths < 9)  return { min: 6,  max: 9  }
  if (ageMonths < 12) return { min: 9,  max: 12 }
  if (ageMonths < 18) return { min: 12, max: 18 }
  if (ageMonths < 24) return { min: 18, max: 24 }
  return                     { min: 24, max: 36 }
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

  // Profile for selected_baby_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('selected_baby_id')
    .eq('id', user.id)
    .single()

  // All babies for switcher
  const { data: babies } = await supabase
    .from('babies')
    .select('id, name, date_of_birth')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const allBabies = babies ?? []
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

  const ageMonths = getAgeMonths(baby.date_of_birth)
  const band = getAgeBand(ageMonths)

  const { data: activities } = await supabase
    .from('daily_activities')
    .select('*')
    .eq('min_age_months', band.min)
    .eq('max_age_months', band.max)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const today = new Date().toISOString().split('T')[0]
  const { data: completions } = await supabase
    .from('activity_completions')
    .select('activity_id')
    .eq('user_id', user.id)
    .eq('baby_id', baby.id)
    .eq('completed_date', today)

  const completedToday = completions?.map(c => c.activity_id) ?? []

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
        completedToday={completedToday}
      />
    </div>
  )
}
