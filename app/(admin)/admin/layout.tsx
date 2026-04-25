import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const NAV = [
  { href: '/admin',               label: 'Overview'      },
  { href: '/admin/users',         label: 'Users'         },
  { href: '/admin/subscriptions', label: 'Subscriptions' },
  { href: '/admin/invite-codes',  label: 'Invite Codes'  },
  { href: '/admin/products',      label: 'Products'      },
  { href: '/admin/support',       label: 'Support'       },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-[#1c2e1c] flex flex-col">
        <div className="px-6 py-6 border-b border-[#2d4a2d]">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#7a9e7a] mb-1">MindNest</p>
          <p className="text-[#e8e0d0] font-semibold text-sm">Admin</p>
        </div>

        <nav className="flex-1 py-4">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="
                flex items-center px-6 py-2.5 text-[13px] text-[#b8d4b8]
                hover:bg-[#2d4a2d] hover:text-[#e8e0d0] transition-colors
              "
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-[#2d4a2d]">
          <p className="text-[11px] text-[#7a9e7a] truncate">{profile.full_name}</p>
          <Link
            href="/dashboard"
            className="text-[11px] text-[#7a9e7a] hover:text-[#b8d4b8] transition-colors"
          >
            ← Back to app
          </Link>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 bg-gray-50 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
