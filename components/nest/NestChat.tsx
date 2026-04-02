'use client'

import { useEffect, useRef } from 'react'
import { useNestChat } from '@/hooks/useNestChat'
import { NestMessage } from './NestMessage'
import { NestInput } from './NestInput'

export function NestChat() {
  const { messages, sendMessage, isLoading, error } = useNestChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex flex-col h-full bg-sage-50">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center gap-4 px-6 py-5 bg-white border-b border-sage-100">
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
          <span className="font-display italic text-brand-700 text-sm">N</span>
        </div>
        <div>
          <p className="font-display text-lg italic text-brand-900 leading-none">Nest</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-sage-400 mt-1">
            Wellness Coach
          </p>
        </div>
        {isLoading && (
          <span className="ml-auto text-[10px] uppercase tracking-[0.15em] text-sage-400 animate-pulse">
            thinking
          </span>
        )}
      </header>

      {/* ── Messages ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-7 space-y-5">
        {messages.map((msg, i) => (
          <NestMessage key={i} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="font-display italic text-brand-700 text-[11px]">N</span>
            </div>
            <div className="bg-warm-100 border border-warm-400 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:160ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:320ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-[11px] text-sage-400 py-2">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0">
        <NestInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
