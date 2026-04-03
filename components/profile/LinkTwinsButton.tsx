'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SpinnerIcon } from '@/components/ui/icons'

interface Baby { id: string; name: string }

interface LinkTwinsButtonProps {
  babies: Baby[]
}

export function LinkTwinsButton({ babies }: LinkTwinsButtonProps) {
  const router = useRouter()
  const [open, setOpen]         = useState(false)
  const [baby1, setBaby1]       = useState(babies[0]?.id ?? '')
  const [baby2, setBaby2]       = useState(babies[1]?.id ?? '')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleLink() {
    if (!baby1 || !baby2 || baby1 === baby2 || saving) return
    setSaving(true)
    setError(null)

    const res = await fetch('/api/babies/link-twins', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ baby1Id: baby1, baby2Id: baby2 }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      setSaving(false)
      return
    }

    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="
          flex items-center justify-center gap-2 w-full
          py-3 rounded-2xl border-2 border-dashed border-warm-300
          text-[11px] uppercase tracking-[0.18em] text-warm-500
          hover:border-warm-400 hover:text-warm-600 transition-colors
        "
      >
        Link as twins
      </button>
    )
  }

  const available2 = babies.filter(b => b.id !== baby1)

  return (
    <div className="bg-white rounded-2xl border border-warm-300 px-5 py-4 space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-sage-400">Link twins</p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-sage-400 mb-1">Twin 1</p>
          <select
            value={baby1}
            onChange={e => setBaby1(e.target.value)}
            className="w-full text-sm text-brand-900 bg-sage-50 border border-sage-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-300"
          >
            {babies.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-[10px] text-sage-400 mb-1">Twin 2</p>
          <select
            value={baby2}
            onChange={e => setBaby2(e.target.value)}
            className="w-full text-sm text-brand-900 bg-sage-50 border border-sage-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-300"
          >
            {available2.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 py-2 rounded-xl border border-sage-200 text-[11px] uppercase tracking-wider text-sage-400 hover:text-sage-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleLink}
          disabled={!baby1 || !baby2 || baby1 === baby2 || saving}
          className="flex-1 py-2 rounded-xl bg-warm-400 text-white text-[11px] uppercase tracking-wider hover:bg-warm-500 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          {saving ? <SpinnerIcon size={13} /> : null}
          {saving ? 'Linking…' : 'Link twins'}
        </button>
      </div>
    </div>
  )
}
