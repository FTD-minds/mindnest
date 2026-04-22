import { createAdminClient } from '@/lib/supabase/admin-client'
import { InviteCodeActions } from './InviteCodeActions'

export default async function AdminInviteCodesPage() {
  const db = createAdminClient()

  const { data: codes } = await db
    .from('invite_codes')
    .select(`
      *,
      creator:created_by (full_name),
      user:used_by (full_name, email)
    `)
    .order('created_at', { ascending: false })

  const allCodes = codes ?? []
  const usedCount   = allCodes.filter(c => c.used_by).length
  const activeCount = allCodes.filter(c => c.is_active && !c.used_by).length

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-gray-900">Invite Codes</h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeCount} available · {usedCount} used · {allCodes.length} total
          </p>
        </div>
        <InviteCodeActions />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Code</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Used by</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Used at</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Created by</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Created</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400">Copy</th>
            </tr>
          </thead>
          <tbody>
            {allCodes.map(c => {
              const usedBy  = c.user    as { full_name: string; email: string } | null
              const creator = c.creator as { full_name: string } | null
              const status  = !c.is_active ? 'deactivated' : c.used_by ? 'used' : 'available'
              const statusColor = {
                available:   'bg-green-100 text-green-700',
                used:        'bg-gray-100 text-gray-500',
                deactivated: 'bg-red-100 text-red-600',
              }[status]

              return (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-sm font-medium text-gray-900">{c.code}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {usedBy ? (
                      <div>
                        <p className="text-gray-900">{usedBy.full_name || '—'}</p>
                        <p className="text-[11px] text-gray-400">{usedBy.email}</p>
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[11px] text-gray-400">
                    {c.used_at ? new Date(c.used_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-[11px] text-gray-500">
                    {creator?.full_name ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-[11px] text-gray-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <InviteCodeActions copyCode={c.code} />
                  </td>
                </tr>
              )
            })}
            {allCodes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">
                  No invite codes yet. Generate one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
