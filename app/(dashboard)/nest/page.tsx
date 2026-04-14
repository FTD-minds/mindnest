import { createServerClient } from '@/lib/supabase/server'
import { NestVoiceChat } from '@/components/nest/NestVoiceChat'

export default async function NestPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let firstName:  string      = 'there'
  let parentType: string|null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, parent_type')
      .eq('id', user.id)
      .single()

    firstName  = profile?.full_name?.split(' ')[0] ?? 'there'
    parentType = profile?.parent_type ?? null
  }

  return (
    <div className="h-screen flex flex-col">
      <NestVoiceChat firstName={firstName} parentType={parentType} />
    </div>
  )
}
