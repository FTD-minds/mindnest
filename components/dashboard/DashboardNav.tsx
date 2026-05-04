'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, MessageCircleIcon, ActivityIcon, HeartIcon, UsersIcon, UserIcon, TrophyIcon } from '@/components/ui/icons'

const NAV_ITEMS = [
  { label: 'Home',       href: '/dashboard',  Icon: HomeIcon          },
  { label: 'Nest',       href: '/nest',        Icon: MessageCircleIcon },
  { label: 'Activities', href: '/activities',  Icon: ActivityIcon      },
  { label: 'Milestones', href: '/milestones',  Icon: TrophyIcon        },
  { label: 'Community',  href: '/community',   Icon: UsersIcon         },
  { label: 'Profile',    href: '/profile',     Icon: UserIcon          },
]

interface DashboardNavProps {
  isPremium?: boolean
}

export function DashboardNav({ isPremium = false }: DashboardNavProps) {
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

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
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

        <div className="px-3 pb-3 border-t border-sage-100 pt-3">
          {/* Upgrade link — only for free users */}
          {!isPremium && (
            <Link
              href="/upgrade"
              className="
                flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm
                text-brand-600 hover:bg-brand-50 transition-colors duration-150
                border border-brand-100 hover:border-brand-200
              "
            >
              <span className="text-[15px] leading-none">✦</span>
              <span className="font-medium">Upgrade to Premium</span>
            </Link>
          )}
          <p className="text-[10px] text-sage-400 italic px-4 pt-3">NEST HAS YOU COVERED.</p>
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

          {/* Mobile upgrade tab — free users only */}
          {!isPremium && (
            <Link
              href="/upgrade"
              className={`
                flex-1 flex flex-col items-center gap-1 pt-3 pb-5
                text-[10px] tracking-wide transition-colors
                ${pathname === '/upgrade' ? 'text-brand-600' : 'text-brand-400'}
              `}
            >
              <span className="text-[18px] leading-none">✦</span>
              <span className={pathname === '/upgrade' ? 'font-medium' : ''}>Upgrade</span>
              <span
                className={`w-4 h-0.5 rounded-full transition-colors ${
                  pathname === '/upgrade' ? 'bg-brand-600' : 'bg-transparent'
                }`}
              />
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}
