import { Card } from '@/components/ui/card'

export default function ActivitiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-700">Today&apos;s Activities</h1>
        <p className="text-sage-500 mt-1">Age-matched activities to help your baby grow and thrive.</p>
      </div>

      {/* Activity feed — populated once data fetching is wired up */}
      <Card>
        <p className="text-center text-sage-400 py-8 text-sm">
          Activities will appear here once you&apos;ve completed onboarding and added your baby&apos;s profile.
        </p>
      </Card>
    </div>
  )
}
