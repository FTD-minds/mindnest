'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { NestOrb, type OrbState } from '@/components/ui/NestOrb'
import type { ChatMessage } from '@/types'

// ── Strip markdown from Nest responses ────────────────────────────────────────
function stripMarkdown(text: string): string {
  return text
    .split('\n')
    .filter(line => !/^#{1,6}\s/.test(line))
    .filter(line => !/^[\-\*]\s/.test(line.trimStart()))
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── Voice options ──────────────────────────────────────────────────────────────
const VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah',   label: 'Warm & Reassuring'    },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', label: 'Clear & Professional'  },
  { id: 'hpp4J3VqNfWAUOO0d1Us', name: 'Bella',   label: 'Bright & Warm'         },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian',   label: 'Deep & Comforting'     },
]

// ── Status labels ──────────────────────────────────────────────────────────────
const STATUS: Record<OrbState, string> = {
  idle:      'Tap to speak',
  listening: 'Listening…',
  thinking:  'Thinking…',
  speaking:  'Speaking…',
}

function buildInitialMessage(firstName: string, parentType: string | null): ChatMessage {
  if (parentType === 'expecting') {
    return {
      role:    'assistant',
      content: `Hi ${firstName}! I'm Nest, your parenting companion.I'm here to support you through every week of your pregnancy and beyond. How are you feeling today?`,
    }
  }
  return {
    role:    'assistant',
    content: `Hi ${firstName}! I'm Nest, your parenting companion.Every age. Every stage — I'm here for all of it. How are you and your little one doing today?`,
  }
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface NestVoiceChatProps {
  firstName?:    string
  parentType?:   string | null
  messagesUsed?: number
  messageLimit?: number
  isPremium?:    boolean
  userId?:       string
  email?:        string
}

export function NestVoiceChat({
  firstName    = 'there',
  parentType   = null,
  messagesUsed = 0,
  messageLimit = 20,
  isPremium    = false,
  userId       = '',
  email        = '',
}: NestVoiceChatProps) {
  const [orbState,           setOrbState]           = useState<OrbState>('idle')
  const [selectedVoice,      setSelectedVoice]      = useState(VOICES[0].id)
  const [messages,           setMessages]           = useState<ChatMessage[]>(() => [buildInitialMessage(firstName, parentType)])
  const [textInput,          setTextInput]          = useState('')
  const [error,              setError]              = useState<string | null>(null)
  const [voiceEnabled,       setVoiceEnabled]       = useState(true)
  const [autoListen,         setAutoListen]         = useState(true)
  const [limitReached,       setLimitReached]       = useState(false)
  const [localMessagesUsed,  setLocalMessagesUsed]  = useState(messagesUsed)
  const [upgradePending,     setUpgradePending]     = useState(false)

  const audioRef        = useRef<HTMLAudioElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef  = useRef<any>(null)
  const transcriptRef   = useRef<HTMLDivElement>(null)
  const orbStateRef     = useRef<OrbState>('idle')
  const autoListenRef   = useRef(true)
  const voiceEnabledRef = useRef(true)

  // Keep refs in sync so event handlers see current values
  useEffect(() => { orbStateRef.current = orbState },         [orbState])
  useEffect(() => { autoListenRef.current = autoListen },     [autoListen])
  useEffect(() => { voiceEnabledRef.current = voiceEnabled }, [voiceEnabled])

  // Auto-scroll transcript
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    }
  }, [])

  // ── Upgrade handler ───────────────────────────────────────────────────────
  const handleUpgrade = useCallback(async () => {
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
      // silent — user stays on page
    } finally {
      setUpgradePending(false)
    }
  }, [userId, email])

  // ── Start listening (shared between manual tap and auto-listen) ───────────────
  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SpeechRecognition = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition              = new SpeechRecognition()
    recognition.continuous         = false
    recognition.interimResults     = false
    recognition.lang               = 'en-US'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      handleSend(transcript)
    }

    recognition.onerror = () => setOrbState('idle')
    recognition.onend   = () => {
      if (orbStateRef.current === 'listening') setOrbState('idle')
    }

    recognition.start()
    recognitionRef.current = recognition
    setOrbState('listening')
  // handleSend is added after definition via ref pattern — see below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Main flow ────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (userText: string) => {
    const trimmed = userText.trim()
    if (!trimmed) return
    setError(null)

    const userMsg: ChatMessage     = { role: 'user', content: trimmed }
    const nextMessages: ChatMessage[] = [...messages, userMsg]
    setMessages(nextMessages)
    setOrbState('thinking')

    try {
      // 1. Get Nest text response
      const nestRes = await fetch('/api/nest', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: nextMessages }),
      })

      // Handle monthly limit before generic error check
      if (nestRes.status === 403) {
        const data = await nestRes.json()
        if (data.error === 'limit_reached') {
          setLimitReached(true)
          setLocalMessagesUsed(data.messagesUsed as number)
          setMessages(prev => prev.slice(0, -1)) // remove unsent user message
          setOrbState('idle')
          return
        }
      }

      if (!nestRes.ok) throw new Error(`Nest API ${nestRes.status}`)
      const { message: nestText } = await nestRes.json()

      setLocalMessagesUsed(prev => prev + 1)
      const nestMsg: ChatMessage = { role: 'assistant', content: nestText }
      setMessages(prev => [...prev, nestMsg])

      // 2. Get ElevenLabs audio (skipped if voice is muted)
      if (voiceEnabledRef.current) {
        try {
          const voiceRes = await fetch('/api/nest-voice', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ text: nestText, voiceId: selectedVoice }),
          })
          if (!voiceRes.ok) throw new Error(`Voice API ${voiceRes.status}`)

          const blob = await voiceRes.blob()
          const url  = URL.createObjectURL(blob)

          if (!audioRef.current) audioRef.current = new Audio()
          audioRef.current.src = url

          audioRef.current.onended = () => {
            URL.revokeObjectURL(url)
            setOrbState('idle')
            if (autoListenRef.current) startListening()
          }
          audioRef.current.onerror = () => {
            URL.revokeObjectURL(url)
            setOrbState('idle')
          }

          setOrbState('speaking')
          await audioRef.current.play()
        } catch (voiceErr) {
          console.error('[NestVoiceChat] voice error (silent)', voiceErr)
          setOrbState('idle')
          if (autoListenRef.current) startListening()
        }
      } else {
        // Voice off — go idle, then auto-listen if enabled
        setOrbState('idle')
        if (autoListenRef.current) startListening()
      }
    } catch (err) {
      console.error('[NestVoiceChat]', err)
      setError('Nest is unavailable right now. Please try again.')
      setOrbState('idle')
    }
  }, [messages, selectedVoice, startListening])

  // ── Orb tap ──────────────────────────────────────────────────────────────────
  function handleOrbClick() {
    if (limitReached) return
    const current = orbStateRef.current

    if (current === 'speaking') {
      audioRef.current?.pause()
      if (audioRef.current) audioRef.current.src = ''
      setOrbState('idle')
      return
    }
    if (current === 'thinking')  return
    if (current === 'listening') {
      recognitionRef.current?.abort()
      setOrbState('idle')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SpeechRecognition = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Use the text input below.')
      return
    }
    startListening()
  }

  // ── Text fallback ────────────────────────────────────────────────────────────
  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!textInput.trim() || orbState === 'thinking' || orbState === 'speaking' || limitReached) return
    handleSend(textInput)
    setTextInput('')
  }

  const selectedVoiceName = VOICES.find(v => v.id === selectedVoice)?.name ?? 'Sarah'
  const usagePercent      = Math.min(100, (localMessagesUsed / messageLimit) * 100)
  const nearLimit         = !isPremium && localMessagesUsed >= messageLimit - 4

  // ── Toggle button styles ─────────────────────────────────────────────────────
  function toggleStyle(active: boolean) {
    return {
      background:    active ? 'rgba(157,224,157,0.12)' : 'transparent',
      border:        `1px solid ${active ? 'rgba(157,224,157,0.3)' : 'rgba(240,237,224,0.12)'}`,
      borderRadius:  50,
      padding:       '4px 11px',
      fontFamily:    "'DM Sans', sans-serif",
      fontSize:      11,
      color:         active ? '#9de09d' : 'rgba(240,237,224,0.3)',
      cursor:        'pointer',
      transition:    'all 0.2s',
      letterSpacing: '0.03em',
      display:       'flex',
      alignItems:    'center',
      gap:           5,
    } as React.CSSProperties
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1c2e1c' }}>

      {/* ── Header ── */}
      <header style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 0',
      }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22, fontWeight: 400, fontStyle: 'italic',
          color: '#f0ede0', margin: 0,
        }}>Nest</p>

        {/* Voice + Auto toggles */}
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <button onClick={() => setVoiceEnabled(v => !v)} style={toggleStyle(voiceEnabled)} title={voiceEnabled ? 'Mute voice' : 'Unmute voice'}>
            {voiceEnabled ? '🔊' : '🔇'}
            <span>{voiceEnabled ? 'Voice' : 'Muted'}</span>
          </button>
          <button onClick={() => setAutoListen(v => !v)} style={toggleStyle(autoListen)} title={autoListen ? 'Switch to manual tap' : 'Switch to auto-listen'}>
            <span>Auto</span>
          </button>
        </div>
      </header>

      {/* ── Orb + controls ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 24px 16px',
      }}>
        <NestOrb
          size={180}
          state={limitReached ? 'idle' : orbState}
          onClick={handleOrbClick}
        />

        {/* Status */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, letterSpacing: '0.04em',
          color: (orbState === 'idle' || limitReached) ? 'rgba(240,237,224,0.4)' : '#9de09d',
          marginTop: 14, marginBottom: 4,
          transition: 'color 0.3s ease',
        }}>
          {limitReached ? 'Monthly limit reached' : STATUS[orbState]}
        </p>

        {/* Active voice name */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 13, fontStyle: 'italic',
          color: (voiceEnabled && !limitReached) ? 'rgba(240,237,224,0.3)' : 'rgba(240,237,224,0.15)',
          marginBottom: 14,
          textDecoration: voiceEnabled ? 'none' : 'line-through',
        }}>
          {selectedVoiceName}
        </p>

        {/* Voice selector pills */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center', opacity: (voiceEnabled && !limitReached) ? 1 : 0.4, transition: 'opacity 0.2s' }}>
          {VOICES.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVoice(v.id)}
              title={v.label}
              disabled={!voiceEnabled || limitReached}
              style={{
                background:    selectedVoice === v.id ? 'rgba(240,237,224,0.14)' : 'transparent',
                border:        `1px solid ${selectedVoice === v.id ? 'rgba(240,237,224,0.38)' : 'rgba(240,237,224,0.1)'}`,
                borderRadius:  50,
                padding:       '5px 14px',
                fontFamily:    "'DM Sans', sans-serif",
                fontSize:      11,
                color:         selectedVoice === v.id ? '#f0ede0' : 'rgba(240,237,224,0.38)',
                cursor:        (voiceEnabled && !limitReached) ? 'pointer' : 'default',
                transition:    'all 0.2s',
                letterSpacing: '0.03em',
              }}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Transcript or upgrade prompt ── */}
      {limitReached ? (
        /* ── Upgrade prompt ─────────────────────────────────────────────── */
        <div style={{
          flex:            1,
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          padding:         '32px 28px',
          gap:             16,
          textAlign:       'center',
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize:   22,
            fontStyle:  'italic',
            color:      '#f0ede0',
            lineHeight: 1.5,
            margin:     0,
          }}>
            You&apos;ve used all {messageLimit} of your free messages this month.
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize:   13,
            color:      'rgba(240,237,224,0.5)',
            lineHeight: 1.7,
            margin:     0,
            maxWidth:   280,
          }}>
            Upgrade to keep the conversation going — unlimited Nest, every feature, all stages.
          </p>
          <button
            onClick={handleUpgrade}
            disabled={upgradePending}
            style={{
              background:    'rgba(240,237,224,0.1)',
              border:        '1px solid rgba(240,237,224,0.28)',
              borderRadius:  50,
              padding:       '12px 32px',
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:      13,
              color:         '#f0ede0',
              cursor:        upgradePending ? 'wait' : 'pointer',
              letterSpacing: '0.04em',
              marginTop:     8,
              opacity:       upgradePending ? 0.5 : 1,
              transition:    'opacity 0.2s',
            }}
          >
            {upgradePending ? 'Redirecting…' : 'Upgrade to Premium'}
          </button>
        </div>
      ) : (
        /* ── Transcript ─────────────────────────────────────────────────── */
        <div
          ref={transcriptRef}
          style={{
            flex:          1,
            overflowY:     'auto',
            padding:       '4px 18px 12px',
            display:       'flex',
            flexDirection: 'column',
            gap:           10,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display:        'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                maxWidth:     '78%',
                background:   msg.role === 'user'
                  ? 'rgba(240,237,224,0.09)'
                  : 'rgba(255,255,255,0.04)',
                border:       `1px solid ${msg.role === 'user' ? 'rgba(240,237,224,0.14)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding:      '9px 13px',
                fontFamily:   "'DM Sans', sans-serif",
                fontSize:     13,
                lineHeight:   1.65,
                color:        msg.role === 'user'
                  ? 'rgba(240,237,224,0.75)'
                  : 'rgba(240,237,224,0.65)',
              }}>
                {msg.role === 'assistant' ? stripMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {error && (
            <p style={{
              textAlign:  'center',
              fontFamily: "'DM Sans', sans-serif",
              fontSize:   12,
              color:      '#f08080',
              padding:    '4px 0',
            }}>
              {error}
            </p>
          )}
        </div>
      )}

      {/* ── Usage counter (free users only) ── */}
      {!isPremium && !limitReached && (
        <div style={{ flexShrink: 0, padding: '6px 18px 0' }}>
          {/* Progress bar */}
          <div style={{
            height:       2,
            background:   'rgba(240,237,224,0.08)',
            borderRadius: 1,
            overflow:     'hidden',
          }}>
            <div style={{
              height:       '100%',
              width:        `${usagePercent}%`,
              background:   nearLimit ? 'rgba(240,140,100,0.5)' : 'rgba(157,224,157,0.35)',
              borderRadius: 1,
              transition:   'width 0.4s ease, background 0.4s ease',
            }} />
          </div>
          <p style={{
            fontFamily:  "'DM Sans', sans-serif",
            fontSize:    10,
            color:       nearLimit ? 'rgba(240,140,100,0.65)' : 'rgba(240,237,224,0.2)',
            textAlign:   'right',
            marginTop:   4,
            letterSpacing: '0.02em',
          }}>
            {localMessagesUsed} of {messageLimit} free messages this month
          </p>
        </div>
      )}

      {/* ── Text fallback ── */}
      <form
        onSubmit={handleTextSubmit}
        style={{
          flexShrink:  0,
          display:     'flex',
          gap:         10,
          alignItems:  'center',
          padding:     '10px 16px 28px',
          borderTop:   '1px solid rgba(240,237,224,0.07)',
        }}
      >
        <input
          type="text"
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          placeholder={limitReached ? 'Upgrade to continue…' : 'Or type a message…'}
          disabled={limitReached}
          style={{
            flex:         1,
            background:   'rgba(240,237,224,0.06)',
            border:       '1px solid rgba(240,237,224,0.1)',
            borderRadius: 50,
            padding:      '10px 16px',
            fontFamily:   "'DM Sans', sans-serif",
            fontSize:     13,
            color:        '#f0ede0',
            outline:      'none',
            opacity:      limitReached ? 0.4 : 1,
            cursor:       limitReached ? 'not-allowed' : 'text',
          }}
        />
        <button
          type="submit"
          disabled={!textInput.trim() || orbState === 'thinking' || orbState === 'speaking' || limitReached}
          style={{
            flexShrink:     0,
            width:          38,
            height:         38,
            borderRadius:   '50%',
            background:     'rgba(240,237,224,0.1)',
            border:         '1px solid rgba(240,237,224,0.18)',
            color:          '#f0ede0',
            fontSize:       16,
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            opacity:        (!textInput.trim() || orbState === 'thinking' || orbState === 'speaking' || limitReached) ? 0.35 : 1,
            transition:     'opacity 0.2s',
          }}
        >
          →
        </button>
      </form>

    </div>
  )
}
