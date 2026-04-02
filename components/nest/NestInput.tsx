'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { SpinnerIcon } from '@/components/ui/icons'

interface NestInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export function NestInput({ onSend, isLoading }: NestInputProps) {
  const [value, setValue]     = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const canSend = value.trim().length > 0 && !isLoading

  return (
    <div className="flex items-end gap-3 px-5 py-4 bg-white border-t border-sage-100">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Write to Nest…"
        rows={1}
        disabled={isLoading}
        className="
          flex-1 resize-none bg-sage-50 border border-sage-200
          rounded-xl px-4 py-3 text-sm text-brand-900
          placeholder-sage-400 leading-relaxed
          focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-transparent
          disabled:opacity-50 transition-all max-h-40
        "
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        className="
          flex-shrink-0 w-10 h-10 rounded-full bg-brand-600 text-white
          flex items-center justify-center transition-all
          hover:bg-brand-700 disabled:bg-sage-200 disabled:cursor-not-allowed
        "
        aria-label="Send"
      >
        {isLoading
          ? <SpinnerIcon size={15} className="text-white" />
          : <span className="text-base leading-none">↑</span>
        }
      </button>
    </div>
  )
}
