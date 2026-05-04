'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const VOICES = [
  {
    name:        'Sarah',
    id:          'EXAVITQu4vr4xnSDxMaL',
    description: 'Warm & reassuring',
    emoji:       '🌿',
  },
  {
    name:        'Matilda',
    id:          'XrExE9yKIg1WjnnlVkGX',
    description: 'Clear & professional — calm and articulate',
    emoji:       '✨',
  },
  {
    name:        'Bella',
    id:          'hpp4J3VqNfWAUOO0d1Us',
    description: 'Warm & natural — the default Nest voice',
    emoji:       '🌸',
  },
  {
    name:        'Brian',
    id:          'nPczCjzI2devNBz1zQrb',
    description: 'Deep & comforting — steady and grounding',
    emoji:       '🌙',
  },
]

interface VoiceSelectorProps {
  initialVoice: string
  isPremium:    boolean
}

export function VoiceSelector({ initialVoice, isPremium }: VoiceSelectorProps) {
  const [selected, setSelected] = useState(initialVoice || 'Bella')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const supabase = createClient()

  async function handleSelect(name: string) {
    if (!isPremium || name === selected) return
    setSelected(name)
    setSaving(true)
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ preferred_voice: name })
        .eq('id', user.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section className="bg-white rounded-2xl border border-sage-200 px-6 py-5 mb-5">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400">Voice Settings</p>
        {saving && (
          <span className="text-[10px] text-sage-400 italic">Saving…</span>
        )}
        {saved && !saving && (
          <span className="text-[10px] text-brand-500 italic">Saved</span>
        )}
      </div>
      <p className="text-xs text-sage-400 mb-4 leading-relaxed">
        Choose the voice Nest speaks in.{' '}
        {!isPremium && (
          <span className="text-brand-500">Voice is a Premium feature.</span>
        )}
      </p>

      <div className="space-y-2">
        {VOICES.map(voice => {
          const isActive = selected === voice.name
          return (
            <button
              key={voice.name}
              onClick={() => handleSelect(voice.name)}
              disabled={!isPremium}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                ${isActive
                  ? 'border-brand-300 bg-brand-50 ring-1 ring-brand-200'
                  : isPremium
                    ? 'border-sage-200 hover:border-brand-200 hover:bg-brand-50/40'
                    : 'border-sage-100 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <span className="text-xl leading-none flex-shrink-0">{voice.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isActive ? 'text-brand-700' : 'text-brand-900'}`}>
                  {voice.name}
                </p>
                <p className="text-[11px] text-sage-400 leading-snug mt-0.5">
                  {voice.description}
                </p>
              </div>
              {isActive && (
                <span className="text-[10px] uppercase tracking-wider text-brand-500 font-medium flex-shrink-0">
                  Active
                </span>
              )}
              {!isPremium && (
                <span className="text-[10px] text-sage-400 flex-shrink-0">🔒</span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
