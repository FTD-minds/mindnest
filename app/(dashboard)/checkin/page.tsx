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
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-700">Daily Check-in</h1>
        <p className="text-sage-500 mt-1">A moment just for you. Nest is listening.</p>
      </div>
      <WellnessCheckin parentType={parentType} firstName={firstName} />
    </div>
  )
}
