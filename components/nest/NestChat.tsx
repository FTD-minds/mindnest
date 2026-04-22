'use client'

import { useState } from 'react'
import { useNestChat } from '@/hooks/useNestChat'
import { NestMessage } from './NestMessage'
import { NestInput } from './NestInput'

interface NestChatProps {
  firstName?:           string
  parentType?:          string | null
  initialMessagesUsed?: number
  messageLimit?:        number
  isPremium?:           boolean
  userId?:              string
  email?:               string
}

export function NestChat({
  firstName           = 'there',
  parentType          = null,
  initialMessagesUsed = 0,
  messageLimit        = 20,
  isPremium           = false,
  userId              = '',
  email               = '',
}: NestChatProps) {
  const { messages, sendMessage, isLoading, error, limitReached, messagesUsed } = useNestChat({
    firstName,
    parentType,
    initialMessagesUsed,
    messageLimit,
    isPremium,
  })

  const [upgradePending, setUpgradePending] = useState(false)

  const handleUpgrade = async () => {
    setUpgradePending(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: 'monthly', userId, email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // silent
    } finally {
      setUpgradePending(false)
    }
  }

  const nearLimit    = !isPremium && messagesUsed >= messageLimit - 4
  const usagePercent = Math.min(100, (messagesUsed / messageLimit) * 100)

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
            Parenting Companion
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
      </div>

      {/* ── Limit reached banner ────────────────────────────────── */}
      {limitReached && (
        <div className="flex-shrink-0 mx-4 mb-3 bg-warm-50 border border-warm-200 rounded-2xl px-5 py-4 text-center">
          <p className="font-display italic text-brand-900 text-base leading-snug mb-1">
            You&apos;ve used all {messageLimit} of your free messages this month.
          </p>
          <p className="text-[12px] text-sage-500 mb-3 leading-relaxed">
            Upgrade to keep the conversation going — unlimited Nest, all features included.
          </p>
          <button
            onClick={handleUpgrade}
            disabled={upgradePending}
            className="bg-[#1c2e1c] text-white text-[12px] tracking-wide rounded-full px-6 py-2.5 hover:bg-[#2d4a2d] transition-colors disabled:opacity-50"
          >
            {upgradePending ? 'Redirecting…' : 'Upgrade to Premium'}
          </button>
        </div>
      )}

      {/* ── Usage counter (free users only) ─────────────────────── */}
      {!isPremium && !limitReached && (
        <div className="flex-shrink-0 px-4 pb-1">
          <div className="h-[2px] bg-sage-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:      `${usagePercent}%`,
                background: nearLimit ? '#e88c6c' : '#6fa86f',
                opacity:    nearLimit ? 0.7 : 0.4,
              }}
            />
          </div>
          <p className={`text-right text-[10px] mt-1 ${nearLimit ? 'text-orange-400' : 'text-sage-300'}`}>
            {messagesUsed} of {messageLimit} free messages this month
          </p>
        </div>
      )}

      {/* ── Input ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0">
        <NestInput
          onSend={sendMessage}
          isLoading={isLoading}
          disabled={limitReached}
          placeholder={limitReached ? 'Upgrade to continue…' : undefined}
        />
      </div>
    </div>
  )
}
