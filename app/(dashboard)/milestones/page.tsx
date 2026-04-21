import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { MilestoneCard } from '@/components/milestones/MilestoneCard'
import { BabySwitcher } from '@/components/dashboard/BabySwitcher'

function getAgeMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  return Math.max(0, Math.min(48, months))
}

function ageLabel(months: number): string {
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`
  const y = Math.floor(months / 12)
  const m = months % 12
  return `${y} year${y !== 1 ? 's' : ''}${m ? ` ${m}mo` : ''}`
}

export default async function MilestonesPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
        <p className="text-sage-400 text-sm">
          Please <Link href="/login" className="text-brand-600 underline">sign in</Link>.
        </p>
      </div>
    )
  }

  // Fetch profile + all babies
  const { data: profile } = await supabase
    .from('profiles')
    .select('selected_baby_id')
    .eq('id', user.id)
    .single()

  const { data: babies } = await supabase
    .from('babies')
    .select('id, name, date_of_birth')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const allBabies = babies ?? []
  const activeBabyId = profile?.selected_baby_id ?? allBabies[0]?.id ?? null
  const activeBaby   = allBabies.find(b => b.id === activeBabyId) ?? allBabies[0] ?? null

  if (!activeBaby) {
    return (
      <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
        <header className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Milestones</p>
          <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
            Your baby's journey
          </h1>
        </header>
        <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-8 text-center">
          <p className="text-sm text-sage-500 mb-3">No baby profile yet.</p>
          <Link href="/profile/add-baby" className="text-[11px] uppercase tracking-wider text-brand-600 hover:text-brand-700">
            Add your baby →
          </Link>
        </div>
      </div>
    )
  }

  const ageMonths = getAgeMonths(activeBaby.date_of_birth)

  // Fetch milestones for a window: current age ±2 months + 3 months ahead
  const windowMin = Math.max(0,  ageMonths - 2)
  const windowMax = Math.min(48, ageMonths + 3)

  const { data: milestones } = await supabase
    .from('developmental_milestones')
    .select('*')
    .gte('age_months', windowMin)
    .lte('age_months', windowMax)
    .order('age_months', { ascending: true })
    .order('brain_area',  { ascending: true })

  const allMilestones = milestones ?? []

  // Fetch which milestones this baby has already noted
  const { data: completions } = await supabase
    .from('milestone_completions')
    .select('milestone_id')
    .eq('baby_id', activeBaby.id)

  const notedIds = new Set((completions ?? []).map(c => c.milestone_id))

  // Split into sections
  const emerging   = allMilestones.filter(m => m.age_months <= ageMonths + 1)
  const comingSoon = allMilestones.filter(m => m.age_months >  ageMonths + 1)

  const notedCount = emerging.filter(m => notedIds.has(m.id)).length

  return (
    <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Milestones</p>
        <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
          {activeBaby.name}'s journey
        </h1>
        <p className="text-sm text-sage-400 mt-1">
          {ageLabel(ageMonths)} old · {notedCount}/{emerging.length} noted this stage
        </p>
      </header>

      {/* ── Baby switcher ────────────────────────────────────────────── */}
      {allBabies.length > 1 && (
        <div className="mb-6">
          <BabySwitcher
            babies={allBabies.map(b => ({ id: b.id, name: b.name }))}
            selectedBabyId={activeBaby.id}
          />
        </div>
      )}

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      {emerging.length > 0 && (
        <div className="bg-white rounded-2xl border border-sage-200 px-6 py-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400">This stage</p>
            <p className="text-[11px] text-brand-600 font-medium">
              {notedCount} of {emerging.length} noted
            </p>
          </div>
          <div className="h-2 bg-sage-100 rounded-full overflow-hidden">
            <div
              className="h-2 bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: emerging.length > 0 ? `${(notedCount / emerging.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* ── Emerging now ─────────────────────────────────────────────── */}
      {emerging.length > 0 && (
        <section className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">
            Emerging now
          </p>
          <div className="space-y-3">
            {emerging.map(m => (
              <MilestoneCard
                key={m.id}
                id={m.id}
                babyId={activeBaby.id}
                title={m.milestone_title}
                description={m.description}
                howToSupport={m.how_to_support}
                brainArea={m.brain_area}
                isEmerging={m.is_emerging}
                isNoted={notedIds.has(m.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Coming soon ──────────────────────────────────────────────── */}
      {comingSoon.length > 0 && (
        <section className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">
            Coming soon
          </p>
          <div className="space-y-3">
            {comingSoon.map(m => (
              <MilestoneCard
                key={m.id}
                id={m.id}
                babyId={activeBaby.id}
                title={m.milestone_title}
                description={m.description}
                howToSupport={m.how_to_support}
                brainArea={m.brain_area}
                isEmerging={false}
                isNoted={notedIds.has(m.id)}
              />
            ))}
          </div>
        </section>
      )}

      {allMilestones.length === 0 && (
        <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-8 text-center">
          <p className="text-sm text-sage-500">No milestones found for this age range.</p>
        </div>
      )}

      {/* ── Reassurance footer ───────────────────────────────────────── */}
      <div className="bg-brand-50 rounded-2xl border border-brand-100 px-6 py-5">
        <p className="text-[11px] text-brand-700 leading-relaxed">
          <span className="font-semibold">Every baby develops at their own pace.</span>{' '}
          These milestones are guides, not deadlines. If you have concerns, your paediatrician is your best resource.
        </p>
      </div>

    </div>
  )
}
