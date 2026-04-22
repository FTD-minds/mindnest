import { createAdminClient } from '@/lib/supabase/admin-client'

const PLAN_PRICE: Record<string, number> = {
  monthly:  9.99,
  annual:   59.99,
  lifetime: 149.99,
}

const PLAN_MRR: Record<string, number> = {
  monthly:  9.99,
  annual:   59.99 / 12,
  lifetime: 0,           // one-time, excluded from MRR
}

function currency(n: number) {
  return `$${n.toFixed(2)}`
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function AdminSubscriptionsPage() {
  const db = createAdminClient()

  const { data: subs } = await db
    .from('subscriptions')
    .select('*, profiles!subscriptions_user_id_fkey (full_name, email)')
    .order('created_at', { ascending: false })

  const allSubs = subs ?? []

  // MRR — active + trialing subscriptions
  const activeRecurring = allSubs.filter(s => ['active', 'trialing'].includes(s.status) && s.plan !== 'lifetime')
  const mrr = activeRecurring.reduce((sum, s) => sum + (PLAN_MRR[s.plan] ?? 0), 0)

  // Totals
  const totalSubs   = allSubs.length
  const activeSubs  = allSubs.filter(s => s.status === 'active').length
  const trialingSubs = allSubs.filter(s => s.status === 'trialing').length
  const pastDueSubs = allSubs.filter(s => s.status === 'past_due').length
  const canceledSubs = allSubs.filter(s => s.status === 'canceled').length

  // By plan
  const byPlan = ['monthly', 'annual', 'lifetime'].map(p => ({
    plan:     p,
    count:    allSubs.filter(s => s.plan === p).length,
    revenue:  allSubs.filter(s => s.plan === p && s.status === 'active').length * PLAN_PRICE[p],
  }))

  const STATUS_COLORS: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    trialing:  'bg-blue-100 text-blue-700',
    past_due:  'bg-red-100 text-red-700',
    canceled:  'bg-gray-100 text-gray-500',
    unpaid:    'bg-orange-100 text-orange-700',
    paused:    'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
      </div>

      {/* ── MRR + counts ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="MRR"
          value={currency(mrr)}
          sub="Monthly recurring revenue"
        />
        <StatCard label="Total subscribers" value={String(totalSubs)} />
        <StatCard label="Active"   value={String(activeSubs)} sub={`${trialingSubs} trialing`} />
        <StatCard label="Past due" value={String(pastDueSubs)} sub={`${canceledSubs} canceled`} />
      </div>

      {/* ── Plan breakdown ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {byPlan.map(({ plan, count, revenue }) => (
          <div key={plan} className="bg-white rounded-2xl border border-gray-200 px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 capitalize">{plan}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{count}</p>
            <p className="text-sm text-gray-500">
              {plan === 'monthly' && `${currency(PLAN_PRICE.monthly)}/mo each`}
              {plan === 'annual'  && `${currency(PLAN_PRICE.annual)}/yr each`}
              {plan === 'lifetime' && `${currency(PLAN_PRICE.lifetime)} one-time`}
            </p>
            {revenue > 0 && (
              <p className="text-xs text-gray-400 mt-1">{currency(revenue)} active revenue</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Subscriptions table ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">All subscriptions</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">User</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Plan</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Renewal</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Started</th>
            </tr>
          </thead>
          <tbody>
            {allSubs.map(s => {
              const profile = s.profiles as { full_name: string; email: string } | null
              return (
                <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="text-gray-900 font-medium">{profile?.full_name || '—'}</p>
                    <p className="text-[11px] text-gray-400">{profile?.email}</p>
                  </td>
                  <td className="px-5 py-3 capitalize text-gray-700">{s.plan}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-[11px]">
                    {s.plan === 'lifetime'
                      ? 'Lifetime'
                      : s.current_period_end
                        ? new Date(s.current_period_end).toLocaleDateString()
                        : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-[11px]">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
            {allSubs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                  No subscriptions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
