import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { AddBabyForm } from '@/components/profile/AddBabyForm'

export default async function AddBabyPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 pt-10 pb-28 lg:pb-10">
        <p className="text-sage-400 text-sm">
          Please <Link href="/login" className="text-brand-600 underline">sign in</Link>.
        </p>
      </div>
    )
  }

  const { data: babies } = await supabase
    .from('babies')
    .select('id, name, is_twin')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const allBabies = babies ?? []

  if (allBabies.length >= 6) {
    return (
      <div className="max-w-md mx-auto px-5 pt-10 pb-28 lg:pb-10">
        <header className="mb-6">
          <Link href="/profile" className="text-[10px] uppercase tracking-[0.2em] text-sage-400 hover:text-brand-600 transition-colors mb-4 inline-flex items-center gap-1.5">
            ← Back
          </Link>
          <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">Add a child</h1>
        </header>
        <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-6 text-center">
          <p className="text-sm text-sage-500">Maximum of 6 children per account reached.</p>
        </div>
      </div>
    )
  }

  // Only offer twin-linking to non-twin babies
  const linkableBabies = allBabies.filter(b => !b.is_twin)

  return (
    <div className="max-w-md mx-auto px-5 pt-10 pb-28 lg:pb-10">
      <header className="mb-8">
        <Link
          href="/profile"
          className="text-[10px] uppercase tracking-[0.2em] text-sage-400 hover:text-brand-600 transition-colors mb-4 inline-flex items-center gap-1.5"
        >
          ← Back
        </Link>
        <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
          Add a child
        </h1>
        <p className="text-sm text-sage-400 mt-2">
          We'll use this to match age-perfect activities and milestones.
        </p>
      </header>

      <AddBabyForm
        existingBabies={linkableBabies.map(b => ({ id: b.id, name: b.name }))}
      />
    </div>
  )
}
