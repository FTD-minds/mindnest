'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { SpinnerIcon } from './icons'

const variants = {
  primary:     'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300',
  secondary:   'bg-sage-100 text-sage-800 hover:bg-sage-200 disabled:opacity-50',
  ghost:       'bg-transparent text-brand-600 hover:bg-brand-50 disabled:opacity-50',
  outline:     'border border-brand-600 text-brand-600 hover:bg-brand-50 disabled:opacity-50',
  destructive: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50',
} as const

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-brand-500 focus-visible:ring-offset-2
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && <SpinnerIcon size={16} />}
      {children}
    </button>
  )
)

Button.displayName = 'Button'
