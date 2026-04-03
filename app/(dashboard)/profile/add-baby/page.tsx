'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SpinnerIcon } from '@/components/ui/icons'

type Gender = 'male' | 'female' | 'prefer_not_to_say'

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male',              label: 'Boy'          },
  { value: 'female',            label: 'Girl'         },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export default function AddBabyPage() {
  const router = useRouter()
  const [name, setName]               = useState('')
  const [dob, setDob]                 = useState('')
  const [gender, setGender]           = useState<Gender | ''>('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !dob || saving) return

    setSaving(true)
    setError(null)

    const res = await fetch('/api/babies', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:        name.trim(),
        dateOfBirth: dob,
        gender:      gender || undefined,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      setSaving(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  // Max DOB = today, min DOB = 36 months ago
  const today    = new Date().toISOString().split('T')[0]
  const minDate  = new Date()
  minDate.setMonth(minDate.getMonth() - 36)
  const minDob   = minDate.toISOString().split('T')[0]

  return (
    <div className="max-w-md mx-auto px-5 pt-10 pb-28 lg:pb-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <Link
          href="/profile"
          className="text-[10px] uppercase tracking-[0.2em] text-sage-400 hover:text-brand-600 transition-colors mb-4 inline-flex items-center gap-1.5"
        >
          ← Back
        </Link>
        <h1 className="font-display text-[2rem] italic text-brand-900 leading-tight">
          Add a child
        </h1>
        <p className="text-sm text-sage-400 mt-2">
          We'll use this to match age-perfect activities and milestones.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <div className="bg-white rounded-2xl border border-sage-200 px-6 py-5">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-2">
            Baby's name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Amara"
            maxLength={50}
            required
            className="
              w-full text-base text-brand-900 placeholder-sage-300
              bg-transparent border-none outline-none
            "
          />
        </div>

        {/* Date of birth */}
        <div className="bg-white rounded-2xl border border-sage-200 px-6 py-5">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-2">
            Date of birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            min={minDob}
            max={today}
            required
            className="
              w-full text-base text-brand-900
              bg-transparent border-none outline-none
            "
          />
        </div>

        {/* Gender */}
        <div className="bg-white rounded-2xl border border-sage-200 px-6 py-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400 mb-3">
            Gender <span className="normal-case tracking-normal text-sage-300">(optional)</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {GENDER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGender(g => g === opt.value ? '' : opt.value)}
                className={`
                  px-4 py-1.5 rounded-full text-[11px] font-medium border transition-all
                  ${gender === opt.value
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-sage-500 border-sage-200 hover:border-brand-300 hover:text-brand-700'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 px-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={!name.trim() || !dob || saving}
          className="
            w-full py-4 rounded-2xl bg-brand-600 text-white
            text-[11px] uppercase tracking-[0.2em] font-medium
            hover:bg-brand-700 transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          "
        >
          {saving ? (
            <>
              <SpinnerIcon size={15} />
              <span>Saving…</span>
            </>
          ) : (
            'Add child'
          )}
        </button>

      </form>
    </div>
  )
}
