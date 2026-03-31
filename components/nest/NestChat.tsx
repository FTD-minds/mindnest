'use client'

import { useEffect, useRef } from 'react'
import { useNestChat } from '@/hooks/useNestChat'
import { NestMessage } from './NestMessage'
import { NestInput } from './NestInput'

export function NestChat() {
  const { messages, sendMessage, isLoading, error } = useNestChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b border-sage-100">
        <div className="w-9 h-9 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 font-bold text-sm">
          N
        </div>
        <div>
          <p className="font-semibold text-gray-800">Nest</p>
          <p className="text-xs text-sage-400">Your AI wellness coach</p>
        </div>
        {isLoading && (
          <span className="ml-auto text-xs text-sage-400 animate-pulse">Nest is typing…</span>
        )}
      </header>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <NestMessage key={i} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
              N
            </div>
            <div className="bg-white border border-sage-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <p className="text-center text-xs text-red-400 py-2">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <NestInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
