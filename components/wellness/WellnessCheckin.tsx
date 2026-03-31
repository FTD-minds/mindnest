'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MoodLevel, WellnessSymptom } from '@/types'

type Step = 'mood' | 'details' | 'journal' | 'response'

const MOODS: { value: MoodLevel; emoji: string; label: string }[] = [
  { value: 'very_low', emoji: '😔', label: 'Very Low'  },
  { value: 'low',      emoji: '😕', label: 'Low'       },
  { value: 'neutral',  emoji: '😐', label: 'Okay'      },
  { value: 'good',     emoji: '🙂', label: 'Good'      },
  { value: 'great',    emoji: '😊', label: 'Great'     },
]

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

export function WellnessCheckin() {
  const [step, setStep]               = useState<Step>('mood')
  const [mood, setMood]               = useState<MoodLevel | null>(null)
  const [energy, setEnergy]           = useState<number>(0)
  const [sleepHours, setSleepHours]   = useState<string>('')
  const [symptoms, setSymptoms]       = useState<WellnessSymptom[]>([])
  const [journal, setJournal]         = useState<string>('')
  const [aiResponse, setAiResponse]   = useState<string>('')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  function toggleSymptom(s: WellnessSymptom) {
    setSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  async function handleSubmit() {
    if (!mood || !energy) return
    setSubmitting(true)
    setError(null)

    const today = new Date().toISOString().split('T')[0]

    try {
      const res = await fetch('/api/wellness/checkin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          mood,
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
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep('mood')
    setMood(null)
    setEnergy(0)
    setSleepHours('')
    setSymptoms([])
    setJournal('')
    setAiResponse('')
    setError(null)
  }

  // ── Step: Mood ────────────────────────────────────────────────────────────
  if (step === 'mood') {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">How are you feeling?</h2>
        <p className="text-sm text-gray-400 mb-6">Choose what feels closest to your mood right now.</p>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`
                flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all
                ${mood === m.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-sage-100 hover:border-sage-300'}
              `}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-gray-500">{m.label}</span>
            </button>
          ))}
        </div>
        <Button
          className="w-full"
          disabled={!mood}
          onClick={() => setStep('details')}
        >
          Continue
        </Button>
      </Card>
    )
  }

  // ── Step: Details ────────────────────────────────────────────────────────
  if (step === 'details') {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-6">A little more about today</h2>

        {/* Energy */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-3">
            Energy level
          </label>
          <div className="flex gap-2">
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
            <span className="ml-1 self-center text-xs text-gray-400">1 = exhausted, 5 = energized</span>
          </div>
        </div>

        {/* Sleep */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            How many hours did you sleep? <span className="text-gray-400 font-normal">(optional)</span>
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
            Anything resonating today? <span className="text-gray-400 font-normal">(select all that apply)</span>
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
          <Button variant="ghost" onClick={() => setStep('mood')} className="flex-1">
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

  // ── Step: Journal ────────────────────────────────────────────────────────
  if (step === 'journal') {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Anything on your mind?</h2>
        <p className="text-sm text-gray-400 mb-5">This is just for you. Nest will read it and respond.</p>
        <textarea
          value={journal}
          onChange={e => setJournal(e.target.value)}
          placeholder="Write freely… there are no wrong answers here."
          rows={5}
          className="
            w-full rounded-xl border border-sage-200 bg-sage-50 px-4 py-3
            text-sm text-gray-700 placeholder-gray-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-brand-300 mb-6
          "
        />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
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

  // ── Step: Response ────────────────────────────────────────────────────────
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
