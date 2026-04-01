'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SendIcon } from '@/components/ui/icons'
import type { MoodLevel, WellnessSymptom, ParentType } from '@/types'

type Step = 'chat' | 'details' | 'journal' | 'response'

const SYMPTOMS: { value: WellnessSymptom; label: string }[] = [
  { value: 'anxious',      label: 'Anxious'      },
  { value: 'exhausted',    label: 'Exhausted'    },
  { value: 'overwhelmed',  label: 'Overwhelmed'  },
  { value: 'lonely',       label: 'Lonely'       },
  { value: 'tearful',      label: 'Tearful'      },
  { value: 'irritable',    label: 'Irritable'    },
  { value: 'disconnected', label: 'Disconnected' },
  { value: 'hopeful',      label: 'Hopeful'      },
  { value: 'supported',    label: 'Supported'    },
  { value: 'energized',    label: 'Energized'    },
]

function scoreToMoodLevel(score: number): MoodLevel {
  const clamped = Math.min(5, Math.max(1, Math.round(score)))
  const map: Record<number, MoodLevel> = {
    1: 'very_low',
    2: 'low',
    3: 'neutral',
    4: 'good',
    5: 'great',
  }
  return map[clamped]
}

function getOpeningMessage(parentType: ParentType | null, firstName: string): string {
  if (parentType === 'mom') {
    return "Hey mama. Before we check in on the little one \u2014 how are YOU feeling today? Tell me as much or as little as you\u2019d like."
  }
  if (parentType === 'dad') {
    return "Hey papa. Before we check in on the little one \u2014 how are YOU feeling today? Tell me as much or as little as you\u2019d like."
  }
  const name = firstName?.split(' ')[0] || 'you'
  return `Hey ${name}. Before we check in on the little one \u2014 how are YOU feeling today? Tell me as much or as little as you\u2019d like.`
}

interface WellnessCheckinProps {
  parentType: ParentType | null
  firstName: string
}

export function WellnessCheckin({ parentType, firstName }: WellnessCheckinProps) {
  // ── Step state
  const [step, setStep] = useState<Step>('chat')

  // ── Step 1: Chat
  const [chatInput, setChatInput]   = useState('')
  const [chatUserMsg, setChatUserMsg] = useState('')
  const [nestReply, setNestReply]   = useState<string | null>(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError]   = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Silently tracked — never shown to user
  const [moodScore, setMoodScore] = useState<number>(3)

  // ── Steps 2 & 3
  const [energy, setEnergy]         = useState<number>(0)
  const [sleepHours, setSleepHours] = useState('')
  const [symptoms, setSymptoms]     = useState<WellnessSymptom[]>([])
  const [journal, setJournal]       = useState('')

  // ── Step 4
  const [aiResponse, setAiResponse]   = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const openingMessage = getOpeningMessage(parentType, firstName)

  // ── Textarea auto-resize
  function handleTextareaInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  function handleChatKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendChat()
    }
  }

  async function sendChat() {
    const trimmed = chatInput.trim()
    if (!trimmed || chatLoading || chatUserMsg) return

    setChatUserMsg(trimmed)
    setChatInput('')
    setChatLoading(true)
    setChatError(null)

    try {
      const res = await fetch('/api/nest/mood', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:     trimmed,
          parent_type: parentType,
          first_name:  firstName,
        }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()
      setNestReply(data.nest_response)
      setMoodScore(data.mood_score ?? 3)
    } catch {
      // Still show a fallback so the user isn't blocked
      const fallbackName =
        parentType === 'mom' ? 'mama' :
        parentType === 'dad' ? 'papa' :
        (firstName?.split(' ')[0] || 'you')
      setNestReply(`Thank you for sharing that with me, ${fallbackName}. I\u2019m right here with you.`)
      setChatError('(Nest had a hiccup but we\u2019ve got you — continue below)')
    } finally {
      setChatLoading(false)
    }
  }

  function toggleSymptom(s: WellnessSymptom) {
    setSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  async function handleSubmit() {
    if (!energy) return
    setSubmitting(true)
    setSubmitError(null)

    const today = new Date().toISOString().split('T')[0]

    try {
      const res = await fetch('/api/wellness/checkin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          mood:         scoreToMoodLevel(moodScore),
          energy_level: energy,
          sleep_hours:  sleepHours ? parseFloat(sleepHours) : null,
          symptoms,
          journal_text: journal || null,
          checkin_date: today,
        }),
      })

      if (!res.ok) throw new Error('Submission failed')

      const data = await res.json()
      setAiResponse(data.ai_response)
      setStep('response')
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep('chat')
    setChatInput('')
    setChatUserMsg('')
    setNestReply(null)
    setChatLoading(false)
    setChatError(null)
    setMoodScore(3)
    setEnergy(0)
    setSleepHours('')
    setSymptoms([])
    setJournal('')
    setAiResponse('')
    setSubmitError(null)
  }

  // ── Step: Chat ─────────────────────────────────────────────────────────────
  if (step === 'chat') {
    return (
      <Card>
        {/* Nest's opening message */}
        <div className="flex items-end gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
            N
          </div>
          <div className="bg-sage-50 border border-sage-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-700 leading-relaxed">
            {openingMessage}
          </div>
        </div>

        {/* User's sent message */}
        {chatUserMsg && (
          <div className="flex justify-end mb-4">
            <div className="max-w-[80%] bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
              {chatUserMsg}
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {chatLoading && (
          <div className="flex items-end gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
              N
            </div>
            <div className="bg-sage-50 border border-sage-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Nest's reply */}
        {nestReply && !chatLoading && (
          <div className="flex items-end gap-2 mb-5">
            <div className="w-7 h-7 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
              N
            </div>
            <div className="bg-sage-50 border border-sage-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-700 leading-relaxed">
              {nestReply}
            </div>
          </div>
        )}

        {/* Input — shown only before the user has sent their message */}
        {!chatUserMsg && (
          <div className="flex items-end gap-3 mt-3">
            <textarea
              ref={textareaRef}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              onInput={handleTextareaInput}
              placeholder="I\u2019m feeling\u2026"
              rows={3}
              disabled={chatLoading}
              className="
                flex-1 resize-none rounded-xl border border-sage-200 bg-sage-50
                px-4 py-3 text-sm text-gray-700 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-brand-300
                disabled:opacity-60 transition-all
              "
            />
            <button
              onClick={sendChat}
              disabled={!chatInput.trim() || chatLoading}
              className="
                w-10 h-10 rounded-full bg-brand-600 text-white flex-shrink-0
                flex items-center justify-center transition-colors
                hover:bg-brand-700 disabled:bg-brand-200 disabled:cursor-not-allowed
              "
            >
              <SendIcon size={16} />
            </button>
          </div>
        )}

        {chatError && (
          <p className="text-xs text-sage-400 mt-2 italic">{chatError}</p>
        )}

        {/* Continue button — appears after Nest has responded */}
        {nestReply && !chatLoading && (
          <Button className="w-full mt-5" onClick={() => setStep('details')}>
            Continue to today&apos;s details
          </Button>
        )}
      </Card>
    )
  }

  // ── Step: Details ──────────────────────────────────────────────────────────
  if (step === 'details') {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-6">A little more about today</h2>

        {/* Energy */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-3">Energy level</label>
          <div className="flex gap-2 items-center flex-wrap">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setEnergy(n)}
                className={`
                  w-10 h-10 rounded-full text-sm font-semibold border-2 transition-all
                  ${energy === n
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-sage-200 text-gray-500 hover:border-sage-400'}
                `}
              >
                {n}
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-1">1 = exhausted, 5 = energized</span>
          </div>
        </div>

        {/* Sleep */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Hours of sleep?{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            placeholder="e.g. 5.5"
            value={sleepHours}
            onChange={e => setSleepHours(e.target.value)}
            className="
              w-32 rounded-xl border border-sage-200 bg-sage-50 px-3 py-2
              text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-300
            "
          />
        </div>

        {/* Symptoms */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-600 mb-3">
            Anything resonating today?{' '}
            <span className="text-gray-400 font-normal">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SYMPTOMS.map(s => (
              <button
                key={s.value}
                onClick={() => toggleSymptom(s.value)}
                className={`
                  text-left px-3 py-2 rounded-xl text-sm border-2 transition-all
                  ${symptoms.includes(s.value)
                    ? 'border-brand-400 bg-brand-50 text-brand-700 font-medium'
                    : 'border-sage-100 text-gray-500 hover:border-sage-300'}
                `}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setStep('chat')} className="flex-1">
            Back
          </Button>
          <Button
            className="flex-1"
            disabled={!energy}
            onClick={() => setStep('journal')}
          >
            Continue
          </Button>
        </div>
      </Card>
    )
  }

  // ── Step: Journal ──────────────────────────────────────────────────────────
  if (step === 'journal') {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Anything else on your mind?</h2>
        <p className="text-sm text-gray-400 mb-5">This is just for you. Write freely.</p>
        <textarea
          value={journal}
          onChange={e => setJournal(e.target.value)}
          placeholder="Whatever you want to get out\u2026"
          rows={5}
          className="
            w-full rounded-xl border border-sage-200 bg-sage-50 px-4 py-3
            text-sm text-gray-700 placeholder-gray-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-brand-300 mb-6
          "
        />
        {submitError && (
          <p className="text-red-400 text-sm mb-4">{submitError}</p>
        )}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setStep('details')} className="flex-1">
            Back
          </Button>
          <Button
            className="flex-1"
            loading={submitting}
            onClick={handleSubmit}
          >
            Send to Nest
          </Button>
        </div>
      </Card>
    )
  }

  // ── Step: Response ─────────────────────────────────────────────────────────
  return (
    <Card>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 font-bold">
          N
        </div>
        <div>
          <p className="font-semibold text-gray-800">Nest</p>
          <p className="text-xs text-sage-400">Just for you</p>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-8 whitespace-pre-wrap">
        {aiResponse}
      </p>
      <Button variant="secondary" className="w-full" onClick={reset}>
        Done for today
      </Button>
    </Card>
  )
}
