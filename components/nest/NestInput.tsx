'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { SendIcon, SpinnerIcon } from '@/components/ui/icons'

interface NestInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export function NestInput({ onSend, isLoading }: NestInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
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
    <div className="flex items-end gap-3 px-4 py-3 bg-white border-t border-sage-100">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Message Nest… (Enter to send, Shift+Enter for new line)"
        rows={1}
        disabled={isLoading}
        className="
          flex-1 resize-none rounded-xl border border-sage-200 bg-sage-50
          px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent
          disabled:opacity-60 transition-all max-h-40
        "
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        className="
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          bg-brand-600 text-white transition-colors
          hover:bg-brand-700 disabled:bg-brand-200 disabled:cursor-not-allowed
        "
      >
        {isLoading
          ? <SpinnerIcon size={16} className="text-white" />
          : <SendIcon size={16} />}
      </button>
    </div>
  )
}
