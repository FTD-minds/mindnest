export default function ActivitiesPage() {
  return (
    <div className="max-w-xl mx-auto px-5 pt-10 pb-28 lg:pb-10">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">Daily Practice</p>
        <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
          Today’s Activities
        </h1>
        <p className="text-sm text-sage-400 mt-2">
          Age-matched activities to help your baby grow and thrive.
        </p>
      </header>

      <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-8 text-center">
        <p className="font-display text-base italic text-sage-400 mb-1">
          No activities yet
        </p>
        <p className="text-xs text-sage-400 leading-relaxed">
          Complete your baby’s profile to unlock<br />age-matched activities.
        </p>
      </div>
    </div>
  )
}
