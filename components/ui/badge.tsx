import type { HTMLAttributes } from 'react'

const variants = {
  brand:     'bg-brand-100 text-brand-700',
  sage:      'bg-sage-100 text-sage-700',
  blue:      'bg-blue-100 text-blue-700',
  orange:    'bg-orange-100 text-orange-700',
  pink:      'bg-pink-100 text-pink-700',
  yellow:    'bg-yellow-100 text-yellow-700',
  gray:      'bg-gray-100 text-gray-600',
  premium:   'bg-amber-100 text-amber-700',
} as const

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants
}

export function Badge({ variant = 'gray', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

// Maps brain_area strings from the database to badge color variants
export const brainAreaVariant: Record<string, keyof typeof variants> = {
  Language:          'blue',
  Motor:             'orange',
  'Social-Emotional':'pink',
  Sensory:           'yellow',
  Cognitive:         'brand',
}
