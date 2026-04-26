'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Plan = 'monthly' | 'annual' | 'lifetime'

const FREE_FEATURES = [
  '10 Nest messages / month',
  'Basic activities',
  'Basic milestones',
  'No voice',
  'No community',
]

const PLANS: {
  id:        Plan
  label:     string
  badge?:    string
  price:     string
  period:    string
  monthly:   string
  features:  string[]
  extras:    string[]   // items that are upgrades vs free tier
  highlight: boolean
}[] = [
  {
    id:       'monthly',
    label:    'Monthly',
    price:    '$9.99',
    period:   'per month',
    monthly:  '$9.99/mo',
    badge:    'Most flexible',
    features: [
      'Unlimited Nest conversations',
      'Voice — hear Nest speak',
      'All daily activities',
      'Milestone tracking',
      'Community feed',
      'Cancel any time',
    ],
    extras:    ['Unlimited Nest conversations', 'Voice — hear Nest speak', 'All daily activities', 'Community feed'],
    highlight: false,
  },
  {
    id:       'annual',
    label:    'Annual',
    price:    '$59.99',
    period:   'per year',
    monthly:  '$5/mo',
    badge:    'Best value · Save 50%',
    features: [
      'Unlimited Nest conversations',
      'Voice — hear Nest speak',
      'All daily activities',
      'Milestone tracking',
      'Community feed',
      'Billed once a year',
    ],
    extras:    ['Unlimited Nest conversations', 'Voice — hear Nest speak', 'All daily activities', 'Community feed'],
    highlight: true,
  },
  {
    id:       'lifetime',
    label:    'Lifetime',
    price:    '$149.99',
    period:   'one time',
    monthly:  'Pay once',
    badge:    'Pay once, yours forever',
    features: [
      'Unlimited Nest conversations',
      'Voice — hear Nest speak',
      'All daily activities',
      'Milestone tracking',
      'Community feed',
      'All future updates included',
    ],
    extras:    ['Unlimited Nest conversations', 'Voice — hear Nest speak', 'All daily activities', 'Community feed'],
    highlight: false,
  },
]

const CHECK = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function UpgradePage() {
  const router                  = useRouter()
  const [loading, setLoading]   = useState<Plan | null>(null)
  const [error,   setError]     = useState<string | null>(null)

  async function handleSelect(plan: Plan) {
    setLoading(plan)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Something went wrong. Please try again.')
        setLoading(null)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <main style={{
      minHeight:       '100vh',
      background:      '#1c2e1c',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '40px 20px',
    }}>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <p style={{
          fontFamily:    "'DM Sans', sans-serif",
          fontSize:      11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         'rgba(240,237,224,0.4)',
          marginBottom:  12,
        }}>
          MindNest Premium
        </p>
        <h1 style={{
          fontFamily:    "'Cormorant Garamond', serif",
          fontSize:      'clamp(28px, 5vw, 40px)',
          fontWeight:    400,
          fontStyle:     'italic',
          color:         '#f0ede0',
          margin:        '0 0 12px',
          letterSpacing: '0.01em',
        }}>
          Every age. Every stage.
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize:   15,
          color:      'rgba(240,237,224,0.55)',
          margin:     0,
          maxWidth:   420,
          lineHeight: 1.6,
        }}>
          Unlimited Nest conversations, voice, and every feature — for every milestone ahead.
        </p>
      </div>

      {/* ── Plan cards ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap:                 16,
        width:               '100%',
        maxWidth:            960,
      }}>

        {/* ── Free tier (current plan indicator) ── */}
        <div style={{
          background:    'rgba(240,237,224,0.03)',
          border:        '1px solid rgba(240,237,224,0.08)',
          borderRadius:  20,
          padding:       '28px 24px 24px',
          display:       'flex',
          flexDirection: 'column',
          opacity:       0.75,
        }}>
          <p style={{
            fontFamily:    "'DM Sans', sans-serif",
            fontSize:      10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         'rgba(240,237,224,0.3)',
            marginBottom:  14,
          }}>
            Your current plan
          </p>

          <p style={{
            fontFamily:   "'Cormorant Garamond', serif",
            fontSize:     22,
            fontWeight:   500,
            color:        'rgba(240,237,224,0.6)',
            marginBottom: 8,
          }}>
            Free
          </p>

          <div style={{ marginBottom: 6 }}>
            <span style={{
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:      32,
              fontWeight:    600,
              color:         'rgba(240,237,224,0.6)',
              letterSpacing: '-0.02em',
            }}>
              $0
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize:   13,
              color:      'rgba(240,237,224,0.25)',
              marginLeft: 6,
            }}>
              forever
            </span>
          </div>

          <p style={{
            fontFamily:   "'DM Sans', sans-serif",
            fontSize:     12,
            color:        'rgba(240,237,224,0.25)',
            marginBottom: 20,
          }}>
            Limited access
          </p>

          <div style={{ height: 1, background: 'rgba(240,237,224,0.06)', marginBottom: 18 }} />

          <ul style={{
            listStyle: 'none', padding: 0, margin: '0 0 24px',
            display: 'flex', flexDirection: 'column', gap: 10, flex: 1,
          }}>
            {FREE_FEATURES.map(f => (
              <li key={f} style={{
                display: 'flex', alignItems: 'flex-start', gap: 9,
                fontFamily: "'DM Sans', sans-serif",
                fontSize:   13,
                color:      'rgba(240,237,224,0.35)',
                lineHeight: 1.4,
              }}>
                <span style={{ color: 'rgba(240,237,224,0.2)', flexShrink: 0, marginTop: 1 }}>–</span>
                {f}
              </li>
            ))}
          </ul>

          <div style={{
            width:      '100%',
            border:     '1px solid rgba(240,237,224,0.08)',
            borderRadius: 50,
            padding:    '13px 24px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize:   13,
            color:      'rgba(240,237,224,0.25)',
            textAlign:  'center',
            letterSpacing: '0.04em',
          }}>
            Current plan
          </div>
        </div>

        {/* ── Paid plans ── */}
        {PLANS.map(plan => (
          <div
            key={plan.id}
            style={{
              position:      'relative',
              background:    plan.highlight
                ? 'rgba(157,224,157,0.08)'
                : 'rgba(240,237,224,0.04)',
              border:        `1px solid ${plan.highlight ? 'rgba(157,224,157,0.35)' : 'rgba(240,237,224,0.12)'}`,
              borderRadius:  20,
              padding:       '28px 24px 24px',
              display:       'flex',
              flexDirection: 'column',
            }}
          >
            {/* Badge */}
            {plan.badge && (
              <p style={{
                fontFamily:    "'DM Sans', sans-serif",
                fontSize:      10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         plan.highlight ? '#9de09d' : 'rgba(240,237,224,0.4)',
                marginBottom:  14,
              }}>
                {plan.badge}
              </p>
            )}

            {/* Plan name */}
            <p style={{
              fontFamily:   "'Cormorant Garamond', serif",
              fontSize:     22,
              fontWeight:   500,
              color:        '#f0ede0',
              marginBottom: 8,
            }}>
              {plan.label}
            </p>

            {/* Price */}
            <div style={{ marginBottom: 6 }}>
              <span style={{
                fontFamily:    "'DM Sans', sans-serif",
                fontSize:      32,
                fontWeight:    600,
                color:         '#f0ede0',
                letterSpacing: '-0.02em',
              }}>
                {plan.price}
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize:   13,
                color:      'rgba(240,237,224,0.4)',
                marginLeft: 6,
              }}>
                {plan.period}
              </span>
            </div>

            {/* Effective monthly */}
            <p style={{
              fontFamily:   "'DM Sans', sans-serif",
              fontSize:     12,
              color:        plan.highlight ? '#9de09d' : 'rgba(240,237,224,0.35)',
              marginBottom: 20,
            }}>
              {plan.monthly}
            </p>

            {/* Divider */}
            <div style={{
              height:       1,
              background:   plan.highlight ? 'rgba(157,224,157,0.15)' : 'rgba(240,237,224,0.08)',
              marginBottom: 18,
            }} />

            {/* Features — extras highlighted */}
            <ul style={{
              listStyle: 'none', padding: 0, margin: '0 0 24px',
              display: 'flex', flexDirection: 'column', gap: 10, flex: 1,
            }}>
              {plan.features.map(f => {
                const isExtra = plan.extras.includes(f)
                return (
                  <li key={f} style={{
                    display:    'flex',
                    alignItems: 'flex-start',
                    gap:        9,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize:   13,
                    color:      isExtra
                      ? (plan.highlight ? '#c5efc5' : 'rgba(240,237,224,0.9)')
                      : 'rgba(240,237,224,0.55)',
                    lineHeight:  1.4,
                    fontWeight:  isExtra ? 500 : 400,
                  }}>
                    <span style={{ color: plan.highlight ? '#9de09d' : 'rgba(240,237,224,0.45)', flexShrink: 0, marginTop: 1 }}>
                      {CHECK}
                    </span>
                    {f}
                  </li>
                )
              })}
            </ul>

            {/* CTA button */}
            <button
              onClick={() => handleSelect(plan.id)}
              disabled={loading !== null}
              style={{
                width:         '100%',
                background:    plan.highlight
                  ? (loading === plan.id ? 'rgba(157,224,157,0.3)' : 'rgba(157,224,157,0.18)')
                  : (loading === plan.id ? 'rgba(240,237,224,0.18)' : 'rgba(240,237,224,0.1)'),
                border:        `1px solid ${plan.highlight ? 'rgba(157,224,157,0.4)' : 'rgba(240,237,224,0.2)'}`,
                borderRadius:  50,
                padding:       '13px 24px',
                fontFamily:    "'DM Sans', sans-serif",
                fontSize:      13,
                fontWeight:    500,
                letterSpacing: '0.04em',
                color:         plan.highlight ? '#9de09d' : '#f0ede0',
                cursor:        loading !== null ? 'wait' : 'pointer',
                transition:    'all 0.2s',
                opacity:       loading !== null && loading !== plan.id ? 0.4 : 1,
              }}
            >
              {loading === plan.id ? 'Redirecting…' : `Get ${plan.label}`}
            </button>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize:   13,
          color:      '#f08080',
          marginTop:  20,
          textAlign:  'center',
        }}>
          {error}
        </p>
      )}

      {/* ── Back link ── */}
      <button
        onClick={() => router.back()}
        style={{
          marginTop:   28,
          background:  'none',
          border:      'none',
          cursor:      'pointer',
          fontFamily:  "'DM Sans', sans-serif",
          fontSize:    13,
          color:       'rgba(240,237,224,0.3)',
          textDecoration: 'underline',
          textDecorationColor: 'rgba(240,237,224,0.15)',
        }}
      >
        ← Back
      </button>

      {/* ── Footer note ── */}
      <p style={{
        fontFamily:  "'DM Sans', sans-serif",
        fontSize:    11,
        color:       'rgba(240,237,224,0.2)',
        marginTop:   20,
        textAlign:   'center',
      }}>
        Secure checkout via Stripe · Cancel any time on monthly or annual plans
      </p>

    </main>
  )
}
