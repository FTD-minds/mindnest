'use client'

import { useEffect, useState } from 'react'
import { ActivityCard } from './ActivityCard'
import type { Activity } from '@/types'

interface ActivityFeedProps {
  initialActivities: Activity[]
  babyId:            string
  babyAgeMonths:     number
  isPremiumUser:     boolean
  completedToday:    string[]   // activity IDs completed today
  limit?:            number     // if set, show only N activities (dashboard preview)
}

export function ActivityFeed({
  initialActivities,
  babyId,
  babyAgeMonths,
  isPremiumUser,
  completedToday,
  limit,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)

  // Background check: if fewer than 20 activities exist for this age band,
  // call the generate API to fill the gap. Fire-and-forget on mount.
  useEffect(() => {
    if (activities.length < 20) {
      fetch('/api/activities/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ageMonths: babyAgeMonths }),
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
          Nest is finding the best activities for your baby's age.
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
        />
      ))}
    </div>
  )
}
