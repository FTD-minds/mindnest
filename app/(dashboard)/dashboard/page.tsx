import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { MessageCircleIcon, ActivityIcon, HeartIcon, ChevronRightIcon } from '@/components/ui/icons'

const QUICK_ACTIONS = [
  {
    label:       'Talk to Nest',
    description: 'Your AI wellness coach is ready to listen.',
    href:        '/nest',
    Icon:        MessageCircleIcon,
    color:       'bg-brand-50 text-brand-600',
  },
  {
    label:       'Today\'s Activities',
    description: 'Age-matched activities for your baby.',
    href:        '/activities',
    Icon:        ActivityIcon,
    color:       'bg-sage-50 text-sage-600',
  },
  {
    label:       'Daily Check-in',
    description: 'How are you feeling today, mama?',
    href:        '/checkin',
    Icon:        HeartIcon,
    color:       'bg-pink-50 text-pink-500',
  },
]

export default function DashboardPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-700">Good morning, Mama</h1>
        <p className="text-sage-500 mt-1">Here&apos;s what&apos;s waiting for you today.</p>
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        {QUICK_ACTIONS.map(({ label, description, href, Icon, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                </div>
                <ChevronRightIcon size={18} className="text-gray-300 flex-shrink-0" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
