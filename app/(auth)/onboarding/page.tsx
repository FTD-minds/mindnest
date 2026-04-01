'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ParentTypeSelector } from '@/components/auth/ParentTypeSelector'
import { createClient } from '@/lib/supabase/client'
import type { ParentType } from '@/types'

export default function OnboardingPage() {
  const [selected, setSelected] = useState<ParentType | null>(null)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSelect(type: ParentType) {
    setSelected(type)
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Session expired. Please log in again.')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ parent_type: type, onboarding_complete: true })
      .eq('id', user.id)

    if (updateError) {
      setError('Something went wrong. Please try again.')
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-md">
        {/* Nest avatar + welcome */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 font-bold text-2xl mx-auto mb-4">
            N
          </div>
          <h1 className="text-2xl font-bold text-brand-700 mb-2">Welcome to MindNest</h1>
          <p className="text-gray-500 leading-relaxed">
            I&apos;m Nest — your personal wellness coach. Quick question before we begin.
          </p>
        </div>

        {/* Selector card */}
        <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6">
          <p className="text-center font-medium text-gray-700 mb-1">
            How do you identify as a parent?
          </p>
          <p className="text-center text-sm text-gray-400 mb-6">No wrong answers here.</p>

          <ParentTypeSelector
            selected={selected}
            onSelect={handleSelect}
            isLoading={saving}
          />

          {error && (
            <p className="text-center text-sm text-red-400 mt-4">{error}</p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 italic">
          Every age. Every stage. Nest has you covered.
        </p>
      </div>
    </main>
  )
}
