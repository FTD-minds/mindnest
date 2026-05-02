import { createAdminClient } from '@/lib/supabase/admin-client'
import { CopyButton } from './CopyButton'

function getAgeMonths(dob: string): number {
  const d = new Date(dob)
  const n = new Date()
  return Math.max(0, (n.getFullYear() - d.getFullYear()) * 12 + (n.getMonth() - d.getMonth()))
}

function ageLabel(months: number): string {
  if (months < 12) return `${months}mo`
  const y = Math.floor(months / 12)
  const m = months % 12
  return `${y}y${m ? ` ${m}mo` : ''}`
}

type SearchParams = { q?: string; type?: string }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const db = createAdminClient()
  const q    = searchParams.q?.toLowerCase() ?? ''
  const type = searchParams.type ?? ''

  // Fetch all profiles with active baby DOB
  const { data: profiles } = await db
    .from('profiles')
    .select('id, full_name, email, phone, parent_type, pregnancy_week, onboarding_complete, created_at, selected_baby_id, is_admin')
    .order('created_at', { ascending: false })

  // Fetch all babies to derive ages
  const { data: babies } = await db
    .from('babies')
    .select('id, date_of_birth')

  const babyMap = new Map((babies ?? []).map(b => [b.id, b.date_of_birth]))

  // Fetch auth users for last_sign_in_at
  const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 })
  const authMap = new Map(authData.users.map(u => [u.id, u.last_sign_in_at]))

  let rows = (profiles ?? []).map(p => ({
    ...p,
    last_sign_in:  authMap.get(p.id) ?? null,
    baby_dob:      p.selected_baby_id ? babyMap.get(p.selected_baby_id) ?? null : null,
  }))

  // Filter
  if (q) {
    rows = rows.filter(r =>
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    )
  }
  if (type) {
    rows = rows.filter(r => r.parent_type === type)
  }

  const TYPES = ['mom', 'dad', 'partner', 'expecting']

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-gray-900">Users <span className="text-gray-400 font-normal text-xl">({rows.length})</span></h1>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="flex-1 max-w-xs px-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1c2e1c]"
        />
        <select
          name="type"
          defaultValue={type}
          className="px-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#1c2e1c] bg-white"
        >
          <option value="">All types</option>
          {TYPES.map(t => (
            <option key={t} value={t} className="capitalize">{t}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-[#1c2e1c] text-white rounded-xl hover:bg-[#2d4a2d] transition-colors"
        >
          Filter
        </button>
        {(q || type) && (
          <a href="/admin/users" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center">
            Clear
          </a>
        )}
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Name</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Email</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Phone</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Type</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Baby / Week</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Onboarding</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Joined</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Last sign in</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const babyInfo = r.baby_dob
                ? ageLabel(getAgeMonths(r.baby_dob))
                : r.parent_type === 'expecting' && r.pregnancy_week
                  ? `Wk ${r.pregnancy_week}`
                  : '—'

              return (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900 font-medium">
                    {r.full_name || '—'}
                    {r.is_admin && (
                      <span className="ml-2 text-[9px] bg-[#1c2e1c] text-white px-1.5 py-0.5 rounded uppercase tracking-wide">admin</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{r.email}</td>
                  <td className="px-5 py-3 text-[11px]">
                    {r.phone
                      ? <CopyButton text={r.phone} />
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-5 py-3 capitalize text-gray-500">{r.parent_type ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{babyInfo}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      r.onboarding_complete
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.onboarding_complete ? 'Complete' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-[11px]">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-[11px]">
                    {r.last_sign_in ? new Date(r.last_sign_in).toLocaleDateString() : '—'}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
