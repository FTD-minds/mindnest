import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { LinkTwinsButton } from '@/components/profile/LinkTwinsButton'

function getAgeMonths(dateOfBirth: string): number {
  const dob  = new Date(dateOfBirth)
  const now  = new Date()
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

export default async function ProfilePage() {
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, selected_baby_id')
    .eq('id', user.id)
    .single()

  const { data: babies } = await supabase
    .from('babies')
    .select('id, name, date_of_birth, gender, is_twin, twin_sibling_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const allBabies = babies ?? []
  const canAddMore = allBabies.length < 6
  // Can only offer twin-linking if there are exactly 2+ unlinked babies
  const unlinkedBabies = allBabies.filter(b => !b.is_twin)
  const canLinkTwins = unlinkedBabies.length >= 2

  return (
    <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Account</p>
        <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
          Your Profile
        </h1>
      </header>

      {/* ── Parent info ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-sage-200 px-6 py-5 mb-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Parent</p>
        <p className="text-base font-medium text-brand-900">{profile?.full_name || '—'}</p>
        <p className="text-sm text-sage-400 mt-0.5">{profile?.email}</p>
      </section>

      {/* ── Children ────────────────────────────────────────────────────── */}
      <section className="mb-5">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400">
            Children ({allBabies.length}/6)
          </p>
        </div>

        <div className="space-y-3">
          {allBabies.map(baby => {
            const months  = getAgeMonths(baby.date_of_birth)
            const isSelected = baby.id === (profile?.selected_baby_id ?? allBabies[0]?.id)
            const twin    = baby.twin_sibling_id
              ? allBabies.find(b => b.id === baby.twin_sibling_id)
              : null

            return (
              <div
                key={baby.id}
                className={`
                  bg-white rounded-2xl border px-6 py-4 flex items-center justify-between
                  ${isSelected ? 'border-brand-300 ring-1 ring-brand-200' : 'border-sage-200'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-semibold text-brand-700">
                      {baby.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-brand-900">{baby.name}</p>
                      {baby.is_twin && (
                        <span className="text-[9px] uppercase tracking-wider bg-warm-200 text-warm-700 px-2 py-0.5 rounded-full font-medium">
                          Twin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-sage-400">
                      {ageLabel(months)}
                      {twin && ` · Twin of ${twin.name}`}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <span className="text-[10px] uppercase tracking-wider text-brand-500 font-medium">
                    Active
                  </span>
                )}
              </div>
            )
          })}

          {allBabies.length === 0 && (
            <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-6 text-center">
              <p className="text-sm text-sage-400">No children added yet.</p>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {canAddMore && (
            <Link
              href="/profile/add-baby"
              className="
                flex items-center justify-center gap-2 w-full
                py-3 rounded-2xl border-2 border-dashed border-sage-200
                text-[11px] uppercase tracking-[0.18em] text-sage-400
                hover:border-brand-300 hover:text-brand-600 transition-colors
              "
            >
              <span className="text-lg leading-none">+</span>
              <span>Add another child</span>
            </Link>
          )}

          {canLinkTwins && (
            <LinkTwinsButton
              babies={unlinkedBabies.map(b => ({ id: b.id, name: b.name }))}
            />
          )}
        </div>

        {!canAddMore && (
          <p className="mt-3 text-center text-xs text-sage-400 italic">
            Maximum of 6 children reached.
          </p>
        )}
      </section>

      {/* ── Subscription ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-sage-200 px-6 py-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Subscription</p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-brand-900">Free plan</p>
          <Link
            href="/upgrade"
            className="text-[11px] uppercase tracking-wider text-brand-600 hover:text-brand-700"
          >
            Upgrade →
          </Link>
        </div>
      </section>

    </div>
  )
}
