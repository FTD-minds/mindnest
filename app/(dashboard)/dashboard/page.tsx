import Link from 'next/link'

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  })
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-sage-50 px-5 pt-10 pb-28 lg:pb-10 max-w-xl mx-auto">

      {/* ── Greeting ────────────────────────────────────────────── */}
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-4 font-medium">
          {todayLabel()}
        </p>
        <h1 className="font-display leading-[1.08] text-brand-900 mb-4">
          <span className="text-[2.6rem] font-normal italic block">Good morning,</span>
          <span className="text-[2.6rem] font-semibold block">Mama</span>
        </h1>
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
          <p className="text-sm text-sage-400 tracking-wide">
            Your little one is growing beautifully
          </p>
        </div>
      </header>

      {/* ── Talk to Nest ─────────────────────────────────────────── */}
      <Link href="/nest" className="block mb-5">
        <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-7 py-8 cursor-pointer group transition-colors hover:bg-brand-700">
          {/* Decorative organic circles */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-brand-500 opacity-20 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute right-6 -bottom-6 w-28 h-28 rounded-full bg-brand-700 opacity-25" />

          <p className="text-[10px] uppercase tracking-[0.22em] text-brand-300 mb-4 relative z-10">
            Your AI Coach
          </p>
          <h2 className="font-display text-white text-[1.8rem] italic font-normal leading-tight mb-2 relative z-10">
            Talk to Nest
          </h2>
          <p className="text-brand-200 text-sm leading-relaxed relative z-10 mb-6 max-w-[75%]">
            How are you feeling today?
          </p>
          <div className="flex items-center gap-2.5 relative z-10">
            <span className="text-brand-300 text-[10px] uppercase tracking-[0.2em]">
              Begin conversation
            </span>
            <span className="text-brand-300 text-base">→</span>
          </div>
        </div>
      </Link>

      {/* ── Today’s Activities ──────────────────────────────────────── */}
      <section className="mb-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-xl italic text-brand-900">
            Today’s Activities
          </h2>
          <Link
            href="/activities"
            className="text-[10px] uppercase tracking-[0.18em] text-brand-600 hover:text-brand-700 transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-8 text-center">
          <p className="font-display text-base italic text-sage-400 mb-1">
            No activities yet
          </p>
          <p className="text-xs text-sage-400 leading-relaxed">
            Complete your baby’s profile to unlock<br />age-matched activities.
          </p>
        </div>
      </section>

      {/* ── Daily Check-in ────────────────────────────────────────── */}
      <Link href="/checkin">
        <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-5 flex items-center justify-between group hover:border-warm-500 transition-colors">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-1">
              Daily Ritual
            </p>
            <h3 className="font-display text-lg italic text-brand-900">
              Check in with yourself
            </h3>
          </div>
          <span className="text-sage-400 text-xl group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </div>
      </Link>

    </div>
  )
}
