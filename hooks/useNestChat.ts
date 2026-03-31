'use client'

import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types'

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi mama! I'm Nest, your personal wellness coach. " +
    "Every age. Every stage — I'm here for all of it. " +
    "How are you and your little one doing today?",
}

export function useNestChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: ChatMessage = { role: 'user', content: content.trim() }
      const nextMessages = [...messages, userMessage]
      setMessages(nextMessages)
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/nest', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ messages: nextMessages }),
        })

        if (!res.ok) throw new Error(`${res.status}`)

        const data = await res.json()
        const nestMessage: ChatMessage = { role: 'assistant', content: data.message }
        setMessages(prev => [...prev, nestMessage])
      } catch {
        setError('Nest is unavailable right now. Please try again in a moment.')
        // Remove the user message if the request failed
        setMessages(prev => prev.slice(0, -1))
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading]
  )

  return { messages, sendMessage, isLoading, error }
}
