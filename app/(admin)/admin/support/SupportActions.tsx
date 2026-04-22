'use client'

import { useState } from 'react'

interface Props {
  userId:     string
  email:      string
  adminNotes?: string | null
  showReset?:  boolean
}

export function SupportActions({ userId, email, adminNotes, showReset }: Props) {
  const [notes,        setNotes]        = useState(adminNotes ?? '')
  const [savedNotes,   setSavedNotes]   = useState(adminNotes ?? '')
  const [savingNotes,  setSavingNotes]  = useState(false)
  const [notesSaved,   setNotesSaved]   = useState(false)
  const [resetting,    setResetting]    = useState(false)
  const [resetMsg,     setResetMsg]     = useState<string | null>(null)

  const dirty = notes !== savedNotes

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      await fetch('/api/admin/notes', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId, adminNotes: notes }),
      })
      setSavedNotes(notes)
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    } finally {
      setSavingNotes(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    setResetMsg(null)
    try {
      const res = await fetch('/api/admin/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId, email }),
      })
      const data = await res.json()
      setResetMsg(res.ok ? 'Email sent ✓' : data.error ?? 'Failed')
    } finally {
      setResetting(false)
    }
  }

  // Notes textarea
  if (adminNotes !== undefined && !showReset) {
    return (
      <div className="flex flex-col gap-1">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add note…"
          rows={2}
          className="w-full text-[11px] text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#1c2e1c] resize-none"
        />
        {dirty && (
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="text-[10px] text-[#1c2e1c] hover:underline disabled:opacity-50 text-left"
          >
            {savingNotes ? 'Saving…' : notesSaved ? 'Saved ✓' : 'Save'}
          </button>
        )}
      </div>
    )
  }

  // Reset button
  if (showReset) {
    return (
      <div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="text-[11px] text-[#1c2e1c] hover:underline disabled:opacity-50"
        >
          {resetting ? 'Sending…' : 'Send reset email'}
        </button>
        {resetMsg && (
          <p className={`text-[10px] mt-0.5 ${resetMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
            {resetMsg}
          </p>
        )}
      </div>
    )
  }

  return null
}
