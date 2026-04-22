import { createAdminClient } from '@/lib/supabase/admin-client'
import { SupportActions } from './SupportActions'

export default async function AdminSupportPage() {
  const db  = createAdminClient()
  const now = new Date()
  const minus7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // All auth users for last_sign_in
  const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 })
  const authMap = new Map(authData.users.map(u => [u.id, u.last_sign_in_at]))

  // All profiles
  const { data: profiles } = await db
    .from('profiles')
    .select('id, full_name, email, parent_type, onboarding_complete, admin_notes, created_at')
    .order('created_at', { ascending: false })

  // Past-due subscriptions
  const { data: pastDue } = await db
    .from('subscriptions')
    .select('user_id, plan, status, current_period_end')
    .eq('status', 'past_due')

  const pastDueIds = new Set((pastDue ?? []).map(s => s.user_id))
  const pastDueMap = new Map((pastDue ?? []).map(s => [s.user_id, s]))

  const allProfiles = (profiles ?? []).map(p => ({
    ...p,
    last_sign_in: authMap.get(p.id) ?? null,
  }))

  // Inactive users: no sign-in for 7+ days (or never signed in and created 7+ days ago)
  const inactive = allProfiles.filter(p => {
    if (p.last_sign_in) return new Date(p.last_sign_in) < new Date(minus7)
    return new Date(p.created_at) < new Date(minus7)
  })

  const pastDueUsers = allProfiles.filter(p => pastDueIds.has(p.id))

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
      </div>

      {/* ── Past due subscriptions ──────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          Past-due subscriptions
          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
            {pastDueUsers.length}
          </span>
        </h2>
        {pastDueUsers.length === 0 ? (
          <p className="text-sm text-gray-400">No past-due subscriptions.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">User</th>
                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Plan</th>
                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Period end</th>
                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastDueUsers.map(u => {
                  const sub = pastDueMap.get(u.id)
                  return (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{u.full_name || '—'}</p>
                        <p className="text-[11px] text-gray-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-3 capitalize text-gray-600">{sub?.plan}</td>
                      <td className="px-5 py-3 text-[11px] text-gray-400">
                        {sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <SupportActions userId={u.id} email={u.email} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Inactive users ──────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          Inactive 7+ days
          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
            {inactive.length}
          </span>
        </h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">User</th>
                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Type</th>
                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Last sign in</th>
                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Admin notes</th>
                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inactive.map(u => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{u.full_name || '—'}</p>
                    <p className="text-[11px] text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-5 py-3 capitalize text-gray-500">{u.parent_type ?? '—'}</td>
                  <td className="px-5 py-3 text-[11px] text-gray-400">
                    {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-3 w-64">
                    <SupportActions userId={u.id} email={u.email} adminNotes={u.admin_notes} />
                  </td>
                  <td className="px-5 py-3">
                    <SupportActions userId={u.id} email={u.email} showReset />
                  </td>
                </tr>
              ))}
              {inactive.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                    All users are active.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
