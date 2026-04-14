'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ParentTypeSelector } from '@/components/auth/ParentTypeSelector'
import { NestOrb } from '@/components/ui/NestOrb'
import { createClient } from '@/lib/supabase/client'
import type { ParentType } from '@/types'

type Journey = 'expecting' | 'parent'
type Step = 'journey' | 'detail'

export default function OnboardingPage() {
  const [step, setStep]               = useState<Step>('journey')
  const [journey, setJourney]         = useState<Journey | null>(null)
  const [pregnancyWeek, setPregnancyWeek] = useState<string>('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // ── Shared save helper ────────────────────────────────────────────────────
  async function saveProfile(updates: Record<string, unknown>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Session expired. Please log in again.')
      setSaving(false)
      return false
    }
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ ...updates, onboarding_complete: true })
      .eq('id', user.id)
    if (updateError) {
      setError('Something went wrong. Please try again.')
      setSaving(false)
      return false
    }
    return true
  }

  // ── Step 1: journey selection ─────────────────────────────────────────────
  function handleJourneySelect(type: Journey) {
    setJourney(type)
    setStep('detail')
  }

  // ── Step 2a: expecting ────────────────────────────────────────────────────
  async function handleExpectingSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const week = parseInt(pregnancyWeek, 10)
    if (!week || week < 1 || week > 42) {
      setError('Please enter a week between 1 and 42.')
      setSaving(false)
      return
    }
    const ok = await saveProfile({ parent_type: 'expecting', pregnancy_week: week })
    if (ok) router.push('/dashboard')
  }

  // ── Step 2b: already a parent ─────────────────────────────────────────────
  async function handleParentTypeSelect(type: ParentType) {
    setSaving(true)
    setError(null)
    const ok = await saveProfile({ parent_type: type })
    if (ok) router.push('/dashboard')
  }

  // ── Shared styles ──────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: 'rgba(240,237,224,0.05)',
    border: '1px solid rgba(240,237,224,0.12)',
    borderRadius: 20,
    padding: '28px 24px',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(240,237,224,0.6)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(240,237,224,0.07)',
    border: '1px solid rgba(240,237,224,0.15)',
    borderRadius: 10,
    padding: '12px 14px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: '#f0ede0',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const btnPrimary = (disabled: boolean): React.CSSProperties => ({
    width: '100%',
    background: disabled ? 'rgba(240,237,224,0.15)' : '#f0ede0',
    color: disabled ? 'rgba(240,237,224,0.4)' : '#1c2e1c',
    border: 'none',
    borderRadius: 50,
    padding: '13px 24px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.04em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
  })

  const errorBox: React.CSSProperties = {
    background: 'rgba(220,80,80,0.12)',
    border: '1px solid rgba(220,80,80,0.25)',
    borderRadius: 10,
    padding: '10px 14px',
    marginBottom: 18,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: '#f08080',
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: '100vh', background: '#1c2e1c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ margin: '0 auto 16px', width: 'fit-content' }}>
            <NestOrb size={90} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(26px, 5vw, 34px)',
            fontWeight: 400,
            color: '#f0ede0',
            margin: '0 0 8px',
            letterSpacing: '0.01em',
          }}>
            {step === 'journey' && 'Welcome to MindNest'}
            {step === 'detail' && journey === 'expecting' && 'How far along are you?'}
            {step === 'detail' && journey === 'parent' && 'How do you identify as a parent?'}
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(240,237,224,0.5)', margin: 0 }}>
            {step === 'journey' && "I'm Nest — let's get you set up."}
            {step === 'detail' && journey === 'expecting' && 'Enter your current week of pregnancy.'}
            {step === 'detail' && journey === 'parent' && 'No wrong answers here.'}
          </p>
        </div>

        {/* ── Step 1: Journey cards ── */}
        {step === 'journey' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Expecting card */}
            <button
              onClick={() => handleJourneySelect('expecting')}
              style={{
                ...card,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 14, cursor: 'pointer', textAlign: 'center',
                transition: 'border-color 0.2s, background 0.2s',
                border: '1px solid rgba(240,237,224,0.18)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(240,237,224,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(240,237,224,0.18)')}
            >
              {/* Moon icon */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" stroke="rgba(240,237,224,0.2)" strokeWidth="1" />
                <path d="M22 10a9 9 0 1 0 0 16 7 7 0 0 1 0-16z" fill="rgba(240,237,224,0.55)" />
                <circle cx="24" cy="13" r="1.2" fill="rgba(240,237,224,0.3)" />
                <circle cx="26" cy="17" r="0.8" fill="rgba(240,237,224,0.2)" />
              </svg>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 500, color: '#f0ede0', marginBottom: 4 }}>
                  I&apos;m expecting
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(240,237,224,0.45)', lineHeight: 1.5 }}>
                  Currently pregnant
                </div>
              </div>
            </button>

            {/* Already a parent card */}
            <button
              onClick={() => handleJourneySelect('parent')}
              style={{
                ...card,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 14, cursor: 'pointer', textAlign: 'center',
                transition: 'border-color 0.2s, background 0.2s',
                border: '1px solid rgba(240,237,224,0.18)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(240,237,224,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(240,237,224,0.18)')}
            >
              {/* Leaf icon */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" stroke="rgba(240,237,224,0.2)" strokeWidth="1" />
                <path d="M10 26c0 0 2-10 10-12 4-1 8 0 8 0s-1 4-5 7c-3 2-7 3-7 3l-6 2z" fill="rgba(240,237,224,0.55)" />
                <path d="M18 14c0 0-4 5-4 10" stroke="rgba(240,237,224,0.3)" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 500, color: '#f0ede0', marginBottom: 4 }}>
                  I&apos;m a parent
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(240,237,224,0.45)', lineHeight: 1.5 }}>
                  My baby is here
                </div>
              </div>
            </button>

          </div>
        )}

        {/* ── Step 2a: Expecting — week input ── */}
        {step === 'detail' && journey === 'expecting' && (
          <form onSubmit={handleExpectingSubmit} style={card}>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Week of pregnancy</label>
              <input
                type="number"
                min={1}
                max={42}
                value={pregnancyWeek}
                onChange={e => setPregnancyWeek(e.target.value)}
                required
                placeholder="e.g. 20"
                style={inputStyle}
              />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(240,237,224,0.35)', marginTop: 8, marginBottom: 0 }}>
                Week 1–42
              </p>
            </div>

            {error && <div style={errorBox}>{error}</div>}

            <button type="submit" disabled={saving} style={btnPrimary(saving)}>
              {saving ? 'Saving…' : 'Continue'}
            </button>
          </form>
        )}

        {/* ── Step 2b: Parent — type selector ── */}
        {step === 'detail' && journey === 'parent' && (
          <div style={card}>
            {error && <div style={errorBox}>{error}</div>}
            <ParentTypeSelector
              onSelect={handleParentTypeSelect}
              isLoading={saving}
            />
          </div>
        )}

        {/* Back link */}
        {step === 'detail' && (
          <p style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => { setStep('journey'); setError(null) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                color: 'rgba(240,237,224,0.4)', textDecoration: 'underline',
              }}
            >
              ← Back
            </button>
          </p>
        )}

        <p style={{
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: 'rgba(240,237,224,0.25)',
          marginTop: step === 'detail' ? 16 : 24,
          fontStyle: 'italic',
        }}>
          Every age. Every stage. Nest has you covered.
        </p>

      </div>
    </main>
  )
}
