'use client'

import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types'

interface UseNestChatOptions {
  firstName?: string
  parentType?: string | null
}

function buildInitialMessage(firstName: string, parentType: string | null): ChatMessage {
  let content: string

  if (parentType === 'expecting') {
    content =
      `Hi ${firstName}! I'm Nest, your parenting companion.` +
      `I'm here to support you through every week of your pregnancy and beyond. ` +
      `How are you feeling today?`
  } else if (parentType === 'dad') {
    content =
      `Hi ${firstName}! I'm Nest, your parenting companion.` +
      `Every age. Every stage — I'm here for all of it. ` +
      `How are you and your little one doing today?`
  } else if (parentType === 'partner') {
    content =
      `Hi ${firstName}! I'm Nest, your parenting companion.` +
      `Every age. Every stage — I'm here for all of it. ` +
      `How are you and your little one doing today?`
  } else {
    // mom or unknown
    content =
      `Hi ${firstName}! I'm Nest, your parenting companion.` +
      `Every age. Every stage — I'm here for all of it. ` +
      `How are you and your little one doing today?`
  }

  return { role: 'assistant', content }
}

export function useNestChat({ firstName = 'there', parentType = null }: UseNestChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    buildInitialMessage(firstName, parentType),
  ])
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
        setMessages(prev => prev.slice(0, -1))
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading]
  )

  return { messages, sendMessage, isLoading, error }
}
