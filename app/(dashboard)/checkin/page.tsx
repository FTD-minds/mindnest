import { WellnessCheckin } from '@/components/wellness/WellnessCheckin'

export default function CheckinPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-700">Daily Check-in</h1>
        <p className="text-sage-500 mt-1">A moment just for you. Nest is listening.</p>
      </div>
      <WellnessCheckin />
    </div>
  )
}
