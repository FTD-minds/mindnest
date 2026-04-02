'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, MessageCircleIcon, ActivityIcon, HeartIcon } from '@/components/ui/icons'

const NAV_ITEMS = [
  { label: 'Home',       href: '/dashboard',  Icon: HomeIcon          },
  { label: 'Nest',       href: '/nest',        Icon: MessageCircleIcon },
  { label: 'Activities', href: '/activities',  Icon: ActivityIcon      },
  { label: 'Check-in',   href: '/checkin',     Icon: HeartIcon         },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-sage-200 z-30">
        <div className="px-7 pt-8 pb-7 border-b border-sage-100">
          <span className="font-display text-2xl italic text-brand-900 block">MindNest</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mt-1">
            Nest has you covered.
          </p>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                  transition-colors duration-150
                  ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-sage-500 hover:bg-sage-100 hover:text-brand-900'
                  }
                `}
              >
                <Icon size={17} />
                <span>{label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="px-7 py-5 border-t border-sage-100">
          <p className="text-[10px] text-sage-400 italic">Every age. Every stage.</p>
        </div>
      </aside>

      {/* ── Mobile bottom nav ─────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-sage-100">
        <div className="flex">
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex-1 flex flex-col items-center gap-1 pt-3 pb-5
                  text-[10px] tracking-wide transition-colors
                  ${active ? 'text-brand-600' : 'text-sage-400'}
                `}
              >
                <Icon size={20} />
                <span className={active ? 'font-medium' : ''}>{label}</span>
                <span
                  className={`w-4 h-0.5 rounded-full transition-colors ${
                    active ? 'bg-brand-600' : 'bg-transparent'
                  }`}
                />
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
