'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function PhoneEditor({ initialPhone }: { initialPhone: string | null }) {
  const [editing, setEditing] = useState(false)
  const [phone,   setPhone]   = useState(initialPhone ?? '')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const supabase = createClient()

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ phone: phone.trim() || null })
        .eq('id', user.id)
    }
    setSaving(false)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleCancel() {
    setPhone(initialPhone ?? '')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="(555) 123-4567"
          autoFocus
          className="flex-1 text-sm text-brand-900 bg-sage-50 border border-sage-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-300 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-2 text-[11px] bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-40"
        >
          {saving ? '…' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-2 text-[11px] text-sage-400 hover:text-sage-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-2 mt-2 group text-left"
    >
      <span className={`text-sm ${phone ? 'text-sage-500' : 'text-sage-300 italic'}`}>
        {phone || 'Add phone number'}
      </span>
      {saved ? (
        <span className="text-[10px] text-brand-500 italic">Saved</span>
      ) : (
        <span className="text-[10px] text-sage-300 group-hover:text-sage-400 transition-colors">
          {phone ? 'Edit' : '+'}
        </span>
      )}
    </button>
  )
}
