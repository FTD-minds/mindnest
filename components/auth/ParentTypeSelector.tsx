'use client'

import type { ParentType } from '@/types'

const OPTIONS: { value: ParentType; label: string; description: string }[] = [
  { value: 'mom',     label: 'Mom',     description: 'She / her'       },
  { value: 'dad',     label: 'Dad',     description: 'He / him'        },
  { value: 'partner', label: 'Partner', description: 'Any pronouns'    },
]

interface ParentTypeSelectorProps {
  selected?: ParentType | null
  onSelect: (type: ParentType) => void
  isLoading?: boolean
}

export function ParentTypeSelector({
  selected,
  onSelect,
  isLoading = false,
}: ParentTypeSelectorProps) {
  return (
    <div className="space-y-3">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => !isLoading && onSelect(opt.value)}
          disabled={isLoading}
          className={`
            w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2
            text-left transition-all
            ${selected === opt.value
              ? 'border-brand-500 bg-brand-50'
              : 'border-sage-100 hover:border-sage-300 bg-white'}
            ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="font-semibold text-gray-800">{opt.label}</span>
          <span className="text-sm text-gray-400">{opt.description}</span>
        </button>
      ))}
    </div>
  )
}
