'use client'

import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types'

interface UseNestChatOptions {
  firstName?:           string
  parentType?:          string | null
  initialMessagesUsed?: number
  messageLimit?:        number
  isPremium?:           boolean
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
    content =
      `Hi ${firstName}! I'm Nest, your parenting companion.` +
      `Every age. Every stage — I'm here for all of it. ` +
      `How are you and your little one doing today?`
  }

  return { role: 'assistant', content }
}

export function useNestChat({
  firstName           = 'there',
  parentType          = null,
  initialMessagesUsed = 0,
  messageLimit        = 20,
  isPremium           = false,
}: UseNestChatOptions = {}) {
  const [messages,      setMessages]      = useState<ChatMessage[]>(() => [
    buildInitialMessage(firstName, parentType),
  ])
  const [isLoading,     setIsLoading]     = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [limitReached,  setLimitReached]  = useState(false)
  const [messagesUsed,  setMessagesUsed]  = useState(initialMessagesUsed)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading || limitReached) return

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

        // Handle monthly limit before generic error check
        if (res.status === 403) {
          const data = await res.json()
          if (data.error === 'limit_reached') {
            setLimitReached(true)
            setMessagesUsed(data.messagesUsed as number)
            setMessages(prev => prev.slice(0, -1)) // remove unsent user message
            return
          }
        }

        if (!res.ok) throw new Error(`${res.status}`)

        const data = await res.json()
        setMessagesUsed(prev => prev + 1)
        const nestMessage: ChatMessage = { role: 'assistant', content: data.message }
        setMessages(prev => [...prev, nestMessage])
      } catch {
        setError('Nest is unavailable right now. Please try again in a moment.')
        setMessages(prev => prev.slice(0, -1))
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, limitReached]
  )

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    limitReached,
    messagesUsed,
    messageLimit,
    isPremium,
  }
}
