'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, MessageCircleIcon, ActivityIcon, HeartIcon } from '@/components/ui/icons'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard',  Icon: HomeIcon          },
  { label: 'Nest',      href: '/nest',        Icon: MessageCircleIcon },
  { label: 'Activities',href: '/activities',  Icon: ActivityIcon      },
  { label: 'Check-in',  href: '/checkin',     Icon: HeartIcon         },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-sage-100 z-30">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-sage-100">
          <span className="text-2xl font-bold text-brand-700">MindNest</span>
          <p className="text-xs text-sage-500 mt-0.5 italic">Every age. Every stage.</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors
                  ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-500 hover:bg-sage-50 hover:text-sage-800'
                  }
                `}
              >
                <Icon size={18} />
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer tagline */}
        <div className="px-6 py-4 border-t border-sage-100">
          <p className="text-xs text-sage-400 italic">Nest has you covered.</p>
        </div>
      </aside>

      {/* ── Mobile bottom nav ─────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-sage-100">
        <div className="flex">
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium
                  transition-colors
                  ${active ? 'text-brand-600' : 'text-gray-400'}
                `}
              >
                <Icon size={20} />
                <span>{label}</span>
                {active && <span className="w-1 h-1 rounded-full bg-brand-500" />}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
