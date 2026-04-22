import { createAdminClient } from '@/lib/supabase/admin-client'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function AdminOverviewPage() {
  const db = createAdminClient()

  const now         = new Date()
  const minus7      = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000).toISOString()
  const minus30     = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: new7 },
    { count: new30 },
    { count: totalMessages },
    { data: profiles },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', minus7),
    db.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', minus30),
    db.from('chat_messages').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('parent_type, onboarding_complete'),
  ])

  const allProfiles   = profiles ?? []
  const onboardedCount = allProfiles.filter(p => p.onboarding_complete).length
  const onboardingPct  = allProfiles.length > 0
    ? Math.round((onboardedCount / allProfiles.length) * 100)
    : 0

  const byType = ['mom', 'dad', 'partner', 'expecting'].map(t => ({
    type:  t,
    count: allProfiles.filter(p => p.parent_type === t).length,
  }))
  const unset = allProfiles.filter(p => !p.parent_type).length

  // Recent signups
  const { data: recent } = await db
    .from('profiles')
    .select('full_name, email, created_at, parent_type')
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
      </div>

      {/* ── Key stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total users"       value={totalUsers ?? 0} />
        <StatCard label="New (7 days)"      value={new7 ?? 0} />
        <StatCard label="New (30 days)"     value={new30 ?? 0} />
        <StatCard label="Onboarding rate"   value={`${onboardingPct}%`} sub={`${onboardedCount} of ${allProfiles.length}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Users by type */}
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Users by parent type</p>
          <div className="space-y-3">
            {byType.map(({ type, count }) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm capitalize text-gray-600">{type}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 bg-[#1c2e1c] rounded-full"
                      style={{ width: allProfiles.length > 0 ? `${(count / allProfiles.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
            {unset > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Not set</span>
                <span className="text-sm font-medium text-gray-400">{unset}</span>
              </div>
            )}
          </div>
        </div>

        {/* Nest messages */}
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Engagement</p>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] text-gray-400 mb-0.5">Total Nest messages sent</p>
              <p className="text-3xl font-bold text-gray-900">{(totalMessages ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 mb-0.5">Avg messages per user</p>
              <p className="text-xl font-bold text-gray-700">
                {allProfiles.length > 0
                  ? ((totalMessages ?? 0) / allProfiles.length).toFixed(1)
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent signups ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Recent signups</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Name</th>
              <th className="px-6 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Email</th>
              <th className="px-6 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Type</th>
              <th className="px-6 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(recent ?? []).map((u, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">{u.full_name || '—'}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-3 text-[11px] capitalize text-gray-500">{u.parent_type ?? '—'}</td>
                <td className="px-6 py-3 text-[11px] text-gray-400">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
