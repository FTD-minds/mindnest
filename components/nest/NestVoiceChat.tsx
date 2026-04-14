'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { NestOrb, type OrbState } from '@/components/ui/NestOrb'
import type { ChatMessage } from '@/types'

// ── Strip markdown from Nest responses ────────────────────────────────────────
function stripMarkdown(text: string): string {
  return text
    .split('\n')
    .filter(line => !/^#{1,6}\s/.test(line))         // remove ## headings
    .filter(line => !/^[\-\*]\s/.test(line.trimStart())) // remove bullet lines
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')                 // **bold**
    .replace(/\*(.+?)\*/g, '$1')                      // *italic*
    .replace(/`(.+?)`/g, '$1')                        // `code`
    .replace(/\n{3,}/g, '\n\n')                       // collapse excess newlines
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
      content: `Hi ${firstName}! I'm Nest, your personal wellness coach. I'm here to support you through every week of your pregnancy and beyond. How are you feeling today?`,
    }
  }
  return {
    role:    'assistant',
    content: `Hi ${firstName}! I'm Nest, your personal wellness coach. Every age. Every stage — I'm here for all of it. How are you and your little one doing today?`,
  }
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface NestVoiceChatProps {
  firstName?:  string
  parentType?: string | null
}

export function NestVoiceChat({ firstName = 'there', parentType = null }: NestVoiceChatProps) {
  const [orbState,      setOrbState]      = useState<OrbState>('idle')
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id)
  const [messages,      setMessages]      = useState<ChatMessage[]>(() => [buildInitialMessage(firstName, parentType)])
  const [textInput,     setTextInput]     = useState('')
  const [error,         setError]         = useState<string | null>(null)

  const audioRef       = useRef<HTMLAudioElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const transcriptRef  = useRef<HTMLDivElement>(null)
  const orbStateRef    = useRef<OrbState>('idle')

  // Keep ref in sync so event handlers see current value
  useEffect(() => { orbStateRef.current = orbState }, [orbState])

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
      if (!nestRes.ok) throw new Error(`Nest API ${nestRes.status}`)
      const { message: nestText } = await nestRes.json()

      const nestMsg: ChatMessage = { role: 'assistant', content: nestText }
      setMessages(prev => [...prev, nestMsg])

      // 2. Get ElevenLabs audio
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
          setOrbState('idle')
          URL.revokeObjectURL(url)
        }
        audioRef.current.onerror = () => {
          setOrbState('idle')
          URL.revokeObjectURL(url)
        }

        setOrbState('speaking')
        await audioRef.current.play()
      } catch (voiceErr) {
        console.error('[NestVoiceChat] voice error (silent)', voiceErr)
        setOrbState('idle')
      }
    } catch (err) {
      console.error('[NestVoiceChat]', err)
      setError('Nest is unavailable right now. Please try again.')
      setOrbState('idle')
    }
  }, [messages, selectedVoice])

  // ── Orb tap ──────────────────────────────────────────────────────────────────
  function handleOrbClick() {
    const current = orbStateRef.current

    // Tap while speaking → stop audio
    if (current === 'speaking') {
      audioRef.current?.pause()
      if (audioRef.current) audioRef.current.src = ''
      setOrbState('idle')
      return
    }

    // Tap while thinking → ignore
    if (current === 'thinking') return

    // Tap while listening → stop
    if (current === 'listening') {
      recognitionRef.current?.abort()
      setOrbState('idle')
      return
    }

    // Idle → start listening
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SpeechRecognition = w.SpeechRecognition ?? w.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Use the text input below.')
      return
    }

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
  }

  // ── Text fallback ────────────────────────────────────────────────────────────
  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!textInput.trim() || orbState === 'thinking' || orbState === 'speaking') return
    handleSend(textInput)
    setTextInput('')
  }

  const selectedVoiceName = VOICES.find(v => v.id === selectedVoice)?.name ?? 'Sarah'

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
      </header>

      {/* ── Orb + controls ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 24px 16px',
      }}>
        <NestOrb size={180} state={orbState} onClick={handleOrbClick} />

        {/* Status */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, letterSpacing: '0.04em',
          color: orbState === 'idle' ? 'rgba(240,237,224,0.4)' : '#9de09d',
          marginTop: 14, marginBottom: 4,
          transition: 'color 0.3s ease',
        }}>
          {STATUS[orbState]}
        </p>

        {/* Active voice name */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 13, fontStyle: 'italic',
          color: 'rgba(240,237,224,0.3)',
          marginBottom: 14,
        }}>
          {selectedVoiceName}
        </p>

        {/* Voice selector pills */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
          {VOICES.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVoice(v.id)}
              title={v.label}
              style={{
                background:    selectedVoice === v.id ? 'rgba(240,237,224,0.14)' : 'transparent',
                border:        `1px solid ${selectedVoice === v.id ? 'rgba(240,237,224,0.38)' : 'rgba(240,237,224,0.1)'}`,
                borderRadius:  50,
                padding:       '5px 14px',
                fontFamily:    "'DM Sans', sans-serif",
                fontSize:      11,
                color:         selectedVoice === v.id ? '#f0ede0' : 'rgba(240,237,224,0.38)',
                cursor:        'pointer',
                transition:    'all 0.2s',
                letterSpacing: '0.03em',
              }}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Transcript ── */}
      <div
        ref={transcriptRef}
        style={{
          flex: 1, overflowY: 'auto',
          padding: '4px 18px 12px',
          display: 'flex', flexDirection: 'column', gap: 10,
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
            textAlign:   'center',
            fontFamily:  "'DM Sans', sans-serif",
            fontSize:    12,
            color:       '#f08080',
            padding:     '4px 0',
          }}>
            {error}
          </p>
        )}
      </div>

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
          placeholder="Or type a message…"
          style={{
            flex:        1,
            background:  'rgba(240,237,224,0.06)',
            border:      '1px solid rgba(240,237,224,0.1)',
            borderRadius: 50,
            padding:     '10px 16px',
            fontFamily:  "'DM Sans', sans-serif",
            fontSize:    13,
            color:       '#f0ede0',
            outline:     'none',
          }}
        />
        <button
          type="submit"
          disabled={!textInput.trim() || orbState === 'thinking' || orbState === 'speaking'}
          style={{
            flexShrink:    0,
            width:         38,
            height:        38,
            borderRadius:  '50%',
            background:    'rgba(240,237,224,0.1)',
            border:        '1px solid rgba(240,237,224,0.18)',
            color:         '#f0ede0',
            fontSize:      16,
            cursor:        'pointer',
            display:       'flex',
            alignItems:    'center',
            justifyContent: 'center',
            opacity:       (!textInput.trim() || orbState === 'thinking' || orbState === 'speaking') ? 0.35 : 1,
            transition:    'opacity 0.2s',
          }}
        >
          →
        </button>
      </form>

    </div>
  )
}
