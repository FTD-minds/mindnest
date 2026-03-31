'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge, brainAreaVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LockIcon, CheckIcon, StarIcon } from '@/components/ui/icons'
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

  const brainVariant = brainAreaVariant[activity.brain_area] ?? 'gray'

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
    <Card className="relative overflow-hidden">
      {/* Premium lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 rounded-2xl">
          <LockIcon size={24} className="text-amber-500" />
          <p className="text-sm font-medium text-gray-600">Premium Activity</p>
          <p className="text-xs text-gray-400">Upgrade to unlock all activities</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge variant={brainVariant}>{activity.brain_area}</Badge>
            {activity.is_premium && <Badge variant="premium">✦ Premium</Badge>}
          </div>
          <h3 className="font-semibold text-gray-800 leading-snug">{activity.title}</h3>
        </div>
        {done && (
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center">
            <CheckIcon size={14} className="text-sage-600" />
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed mb-3">{activity.description}</p>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
        <span>⏱ {activity.duration_min} min</span>
        <span>👶 {activity.min_age_months}–{activity.max_age_months} months</span>
        {activity.materials_needed.length > 0 && (
          <span>🧸 {activity.materials_needed.join(', ')}</span>
        )}
      </div>

      {/* Instructions toggle */}
      <button
        onClick={() => setShowInstructions(v => !v)}
        className="text-xs text-brand-600 font-medium hover:underline mb-3 block"
      >
        {showInstructions ? 'Hide instructions' : 'Show instructions'}
      </button>

      {showInstructions && (
        <div className="bg-sage-50 rounded-xl p-4 mb-4 text-sm text-sage-700 leading-relaxed whitespace-pre-wrap">
          {activity.instructions}
        </div>
      )}

      {/* Rating (post-completion) */}
      {done && (
        <div className="flex items-center gap-1 mb-4">
          <span className="text-xs text-gray-400 mr-1">Rate it:</span>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <StarIcon
                size={18}
                className={(
                  star <= (hoveredStar || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300'
                )}
              />
            </button>
          ))}
        </div>
      )}

      {/* Action button */}
      {!done && (
        <Button
          variant="primary"
          size="sm"
          loading={completing}
          onClick={handleComplete}
          disabled={isLocked}
          className="w-full"
        >
          Mark Complete
        </Button>
      )}
    </Card>
  )
}
