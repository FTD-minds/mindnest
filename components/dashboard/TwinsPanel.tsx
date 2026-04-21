import { createServerClient } from '@/lib/supabase/server'
import type { Activity } from '@/types'

interface TwinsPanelProps {
  baby:        { id: string; name: string; date_of_birth: string }
  twin:        { id: string; name: string; date_of_birth: string }
}

function getAgeMonths(dateOfBirth: string): number {
  const dob  = new Date(dateOfBirth)
  const now  = new Date()
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  return Math.max(0, Math.min(48, months))
}

function ageLabel(months: number): string {
  if (months < 12) return `${months}mo`
  const y = Math.floor(months / 12)
  const m = months % 12
  return `${y}y${m ? ` ${m}mo` : ''}`
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

export async function TwinsPanel({ baby, twin }: TwinsPanelProps) {
  const supabase = createServerClient()

  const babyAge = getAgeMonths(baby.date_of_birth)
  const twinAge = getAgeMonths(twin.date_of_birth)
  // Use the lower age for activity matching (more conservative)
  const band = getAgeBand(Math.min(babyAge, twinAge))

  // Fetch up to 2 twin-specific activities for this age band
  const { data: twinActivities } = await supabase
    .from('daily_activities')
    .select('id, title, description, duration_min, brain_area, is_premium')
    .eq('min_age_months', band.min)
    .eq('max_age_months', band.max)
    .eq('is_active', true)
    .contains('tags', ['twins'])
    .limit(2)

  return (
    <section className="mb-5">
      {/* ── Panel header ─────────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-xl italic text-brand-900">
          Your Twins
        </h2>
      </div>

      {/* ── Side-by-side baby cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[baby, twin].map((b, i) => {
          const months = i === 0 ? babyAge : twinAge
          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-sage-200 px-4 py-4 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-semibold text-brand-700">
                  {b.name[0].toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-brand-900">{b.name}</p>
              <p className="text-[11px] text-sage-400 mt-0.5">{ageLabel(months)}</p>
            </div>
          )
        })}
      </div>

      {/* ── Developmental context ────────────────────────────────────── */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl px-5 py-4 mb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-brand-500 mb-1.5">
          Twin development note
        </p>
        <p className="text-sm text-brand-800 leading-relaxed">
          Twins this age are beginning to recognize each other as distinct, consistent presences.
          You may notice them watching, listening, and sometimes reaching toward one another.
          This is the beginning of a lifelong relationship — and your narration helps it grow.
        </p>
      </div>

      {/* ── Twin activities ──────────────────────────────────────────── */}
      {twinActivities && twinActivities.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-sage-400">
            Activities for two
          </p>
          {twinActivities.map(activity => (
            <div
              key={activity.id}
              className="bg-white rounded-2xl border border-sage-200 px-5 py-4"
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-sage-400">
                  {activity.brain_area}
                  {activity.is_premium && (
                    <span className="ml-2 text-warm-500">Premium</span>
                  )}
                </p>
                <span className="text-[10px] text-sage-300">{activity.duration_min} min</span>
              </div>
              <h3 className="font-display text-base italic text-brand-900 leading-snug mb-1.5">
                {activity.title}
              </h3>
              <p className="text-xs text-sage-500 leading-relaxed">
                {activity.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
