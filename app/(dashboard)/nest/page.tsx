import { createServerClient } from '@/lib/supabase/server'
import { NestVoiceChat } from '@/components/nest/NestVoiceChat'

const FREE_TIER_LIMIT = 10

export default async function NestPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let firstName:      string      = 'there'
  let parentType:     string|null = null
  let isPremium:      boolean     = false
  let messagesUsed:   number      = 0
  let preferredVoice: string      = 'Bella'

  if (user) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [
      { data: profile },
      { data: subscription },
      { count: usageCount },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, parent_type, beta_access, preferred_voice')
        .eq('id', user.id)
        .single(),
      supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('nest_usage_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString()),
    ])

    firstName      = profile?.full_name?.split(' ')[0] ?? 'there'
    parentType     = profile?.parent_type ?? null
    isPremium      = ['active', 'trialing'].includes(subscription?.status ?? '') || (profile?.beta_access ?? false)
    messagesUsed   = usageCount ?? 0
    preferredVoice = profile?.preferred_voice ?? 'Bella'
  }

  return (
    <div className="h-screen flex flex-col">
      <NestVoiceChat
        firstName={firstName}
        parentType={parentType}
        messagesUsed={messagesUsed}
        messageLimit={FREE_TIER_LIMIT}
        isPremium={isPremium}
        preferredVoice={preferredVoice}
      />
    </div>
  )
}
