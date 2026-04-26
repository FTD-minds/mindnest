import { createServerClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPremium = false
  if (user) {
    const [{ data: subscription }, { data: profile }] = await Promise.all([
      supabase.from('subscriptions').select('status').eq('user_id', user.id).single(),
      supabase.from('profiles').select('beta_access, beta_access_expires_at').eq('id', user.id).single(),
    ])

    const betaExpiry    = profile?.beta_access_expires_at ? new Date(profile.beta_access_expires_at) : null
    const hasBetaAccess = (profile?.beta_access ?? false) && (betaExpiry === null || betaExpiry > new Date())
    isPremium = ['active', 'trialing'].includes(subscription?.status ?? '') || hasBetaAccess
  }

  return (
    <div className="min-h-screen bg-sage-50">
      <DashboardNav isPremium={isPremium} />
      {/* Offset for desktop sidebar (lg:ml-64) and mobile bottom nav (pb-20) */}
      <main className="lg:ml-64 pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
