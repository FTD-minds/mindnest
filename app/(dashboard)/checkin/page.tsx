import { createServerClient } from '@/lib/supabase/server'
import { WellnessCheckin } from '@/components/wellness/WellnessCheckin'
import type { ParentType } from '@/types'

export default async function CheckinPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let parentType: ParentType | null = null
  let firstName = ''

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('parent_type, full_name')
      .eq('id', user.id)
      .single()

    parentType = (profile?.parent_type as ParentType) ?? null
    firstName  = profile?.full_name?.split(' ')[0] ?? ''
  }

  return (
    <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Daily Ritual</p>
        <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
          Check in with yourself
        </h1>
        <p className="text-sm text-sage-400 mt-2">A moment just for you. Nest is listening.</p>
      </header>
      <WellnessCheckin parentType={parentType} firstName={firstName} />
    </div>
  )
}
