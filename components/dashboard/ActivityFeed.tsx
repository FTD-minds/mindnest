'use client'

import { useEffect, useState } from 'react'
import { ActivityCard } from './ActivityCard'
import type { Activity } from '@/types'

interface ActivityFeedProps {
  initialActivities: Activity[]
  babyId?:           string     // absent for prenatal mode — completion tracking skipped
  babyAgeMonths?:    number     // absent for prenatal mode
  trimester?:        1 | 2 | 3  // present for prenatal mode
  isPremiumUser:     boolean
  completedToday:    string[]   // activity IDs completed today (empty for prenatal)
  limit?:            number     // if set, show only N activities (dashboard preview)
}

export function ActivityFeed({
  initialActivities,
  babyId,
  babyAgeMonths,
  trimester,
  isPremiumUser,
  completedToday,
  limit,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)

  // Background check: if fewer than 20 activities exist for this context,
  // call the generate API to fill the gap. Fire-and-forget on mount.
  useEffect(() => {
    if (activities.length < 20) {
      const body = trimester != null
        ? { trimester }
        : { ageMonths: babyAgeMonths }

      fetch('/api/activities/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
        .then(r => r.json())
        .then(data => {
          if (data.generated > 0 && Array.isArray(data.activities)) {
            setActivities(data.activities)
          }
        })
        .catch(() => { /* silent fail — existing activities still show */ })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleComplete(activityId: string, rating: number) {
    if (!babyId) return  // prenatal mode — no completion tracking
    await fetch('/api/activities/complete', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ activityId, babyId, rating }),
    })
  }

  const displayed = limit ? activities.slice(0, limit) : activities

  if (displayed.length === 0) {
    return (
      <div className="bg-warm-100 border border-warm-400 rounded-2xl px-6 py-8 text-center">
        <p className="font-display text-base italic text-sage-400 mb-1">
          Loading activities…
        </p>
        <p className="text-xs text-sage-400">
          {trimester != null
            ? 'Nest is finding activities for your trimester.'
            : 'Nest is finding the best activities for your baby\'s age.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayed.map(activity => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          isPremiumUser={isPremiumUser}
          isCompleted={completedToday.includes(activity.id)}
          onComplete={handleComplete}
          hideComplete={!babyId}
        />
      ))}
    </div>
  )
}
