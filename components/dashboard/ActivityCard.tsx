'use client'

import { useState } from 'react'
import { LockIcon, CheckIcon, StarIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import type { Activity } from '@/types'

interface ActivityCardProps {
  activity: Activity
  isPremiumUser?: boolean
  isCompleted?: boolean
  existingRating?: number | null
  onComplete: (activityId: string, rating: number) => Promise<void>
}

export function ActivityCard({
  activity,
  isPremiumUser = false,
  isCompleted = false,
  existingRating = null,
  onComplete,
}: ActivityCardProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [rating, setRating]                     = useState<number>(existingRating ?? 0)
  const [hoveredStar, setHoveredStar]           = useState<number>(0)
  const [completing, setCompleting]             = useState(false)
  const [done, setDone]                         = useState(isCompleted)

  const isLocked = activity.is_premium && !isPremiumUser

  async function handleComplete() {
    if (isLocked || done || completing) return
    setCompleting(true)
    try {
      await onComplete(activity.id, rating || 5)
      setDone(true)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="relative bg-white rounded-2xl border border-sage-200 overflow-hidden">
      {/* Premium lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 rounded-2xl">
          <LockIcon size={20} className="text-sage-400" />
          <p className="text-xs font-medium text-sage-500">Premium Activity</p>
          <p className="text-[10px] text-sage-400 uppercase tracking-wider">Upgrade to unlock</p>
        </div>
      )}

      <div className="px-6 pt-6 pb-5">
        {/* Meta row */}
        <div className="flex items-start justify-between mb-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400">
            {activity.brain_area}
            {activity.is_premium && (
              <span className="ml-3 text-warm-500">Premium</span>
            )}
          </p>
          {done && (
            <span className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <CheckIcon size={11} className="text-brand-600" />
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-[1.15rem] italic text-brand-900 leading-snug mb-3">
          {activity.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-sage-500 leading-relaxed mb-4">
          {activity.description}
        </p>

        {/* Meta data */}
        <div className="flex gap-4 text-[11px] text-sage-400 mb-4">
          <span>{activity.duration_min} min</span>
          <span className="text-sage-200">/</span>
          <span>{activity.min_age_months}–{activity.max_age_months} months</span>
          {activity.materials_needed.length > 0 && (
            <>
              <span className="text-sage-200">/</span>
              <span className="truncate">{activity.materials_needed.join(', ')}</span>
            </>
          )}
        </div>

        {/* Instructions toggle */}
        <button
          onClick={() => setShowInstructions(v => !v)}
          className="text-[11px] uppercase tracking-[0.15em] text-brand-600 hover:text-brand-700 transition-colors mb-3"
        >
          {showInstructions ? 'Hide steps' : 'How to do it'}
        </button>

        {showInstructions && (
          <div className="bg-sage-50 rounded-xl px-5 py-4 mb-4 text-sm text-sage-600 leading-relaxed whitespace-pre-wrap border-l-2 border-brand-200">
            {activity.instructions}
          </div>
        )}

        {/* Star rating — post-completion only */}
        {done && (
          <div className="flex items-center gap-1 mb-4">
            <span className="text-[10px] uppercase tracking-wider text-sage-400 mr-2">Rate</span>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-colors"
              >
                <StarIcon
                  size={16}
                  className={
                    star <= (hoveredStar || rating)
                      ? 'text-brand-500 fill-brand-500'
                      : 'text-sage-300'
                  }
                />
              </button>
            ))}
          </div>
        )}

        {/* Complete button */}
        {!done && (
          <button
            onClick={handleComplete}
            disabled={isLocked || completing}
            className="
              w-full mt-1 py-2.5 rounded-xl border border-brand-200
              text-[11px] uppercase tracking-[0.18em] text-brand-600
              hover:bg-brand-50 hover:border-brand-300 transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {completing ? 'Saving…' : 'Mark Complete'}
          </button>
        )}
      </div>
    </div>
  )
}
