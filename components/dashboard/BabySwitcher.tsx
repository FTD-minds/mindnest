'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Baby {
  id:   string
  name: string
}

interface BabySwitcherProps {
  babies:          Baby[]
  selectedBabyId:  string | null
}

export function BabySwitcher({ babies, selectedBabyId }: BabySwitcherProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [optimisticId, setOptimisticId] = useState<string | null>(null)

  const activeId = optimisticId ?? selectedBabyId ?? babies[0]?.id

  if (babies.length <= 1) return null

  async function handleSelect(babyId: string) {
    if (babyId === activeId || pending) return
    setOptimisticId(babyId)

    await fetch('/api/babies/select', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ babyId }),
    })

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      {babies.map(baby => {
        const active = baby.id === activeId
        return (
          <button
            key={baby.id}
            onClick={() => handleSelect(baby.id)}
            disabled={pending}
            className={`
              px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide
              transition-all duration-150 border
              ${active
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white text-sage-500 border-sage-200 hover:border-brand-300 hover:text-brand-700'
              }
              ${pending ? 'opacity-60 cursor-wait' : 'cursor-pointer'}
            `}
          >
            {baby.name}
          </button>
        )
      })}
    </div>
  )
}
