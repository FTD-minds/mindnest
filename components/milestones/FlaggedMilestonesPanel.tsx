'use client'

import { useState } from 'react'

interface FlaggedMilestone {
  id:              string
  milestone_title: string
  brain_area:      string
}

interface FlaggedMilestonesPanelProps {
  milestones: FlaggedMilestone[]
  babyId:     string
}

const AREA_COLORS: Record<string, string> = {
  'Language':         'bg-brand-100 text-brand-700',
  'Motor':            'bg-green-100 text-green-700',
  'Social-Emotional': 'bg-warm-100 text-warm-700',
  'Cognitive':        'bg-purple-100 text-purple-700',
  'Sensory':          'bg-blue-100 text-blue-700',
}

const REFERRAL_COPY: Record<string, string> = {
  'Language':
    'Consider mentioning to your pediatrician. A speech-language pathologist can offer a quick assessment.',
  'Motor':
    'Worth mentioning to your pediatrician. A pediatric occupational or physical therapist can help.',
  'Social-Emotional':
    'Consider raising with your pediatrician. Early support makes a big difference.',
  'Cognitive':
    'Worth mentioning at your next pediatrician visit.',
  'Sensory':
    'Consider mentioning to your pediatrician. A pediatric OT specialising in sensory processing can assess.',
}

export function FlaggedMilestonesPanel({ milestones, babyId }: FlaggedMilestonesPanelProps) {
  const [localDismissed, setLocalDismissed] = useState<Set<string>>(new Set())

  const visible = milestones.filter(m => !localDismissed.has(m.id))

  if (visible.length === 0) return null

  // Group by brain area, preserving insertion order (sorted by brain_area from the query)
  const grouped = visible.reduce<Record<string, FlaggedMilestone[]>>((acc, m) => {
    if (!acc[m.brain_area]) acc[m.brain_area] = []
    acc[m.brain_area].push(m)
    return acc
  }, {})

  async function handleDismiss(milestoneId: string) {
    // Optimistic update — hide immediately
    setLocalDismissed(prev => { const next = new Set(prev); next.add(milestoneId); return next })
    await fetch('/api/milestones/dismiss', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ babyId, milestoneId }),
    })
  }

  return (
    <section className="mb-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-1">
        Worth a closer look
      </p>
      <p className="text-[12px] text-sage-400 mb-4 leading-relaxed">
        Every baby develops differently. These milestones are worth mentioning to your
        pediatrician at your next visit.
      </p>

      <div className="space-y-3">
        {Object.entries(grouped).map(([area, items]) => (
          <div
            key={area}
            className="bg-warm-50 border border-warm-200 rounded-2xl px-5 py-4"
          >
            {/* Brain area badge */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                  AREA_COLORS[area] ?? 'bg-sage-100 text-sage-600'
                }`}
              >
                {area}
              </span>
            </div>

            {/* Referral suggestion */}
            <p className="text-[11px] text-warm-700 leading-relaxed mb-3 italic">
              {REFERRAL_COPY[area] ?? 'Worth mentioning at your next pediatrician visit.'}
            </p>

            {/* Milestone rows */}
            <div className="space-y-2.5">
              {items.map(m => (
                <div key={m.id} className="flex items-start justify-between gap-3">
                  <p className="text-[13px] text-brand-900 font-medium leading-snug flex-1">
                    {m.milestone_title}
                  </p>
                  <button
                    onClick={() => handleDismiss(m.id)}
                    className="
                      text-[10px] text-sage-400 hover:text-sage-600
                      transition-colors whitespace-nowrap flex-shrink-0 mt-0.5
                      underline underline-offset-2
                    "
                  >
                    Not applicable
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
