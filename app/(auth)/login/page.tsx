'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main style={{ minHeight: '100vh', background: '#1c2e1c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo / wordmark */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(240,237,224,0.1)',
            border: '1px solid rgba(240,237,224,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 22, color: '#f0ede0', fontFamily: "'Cormorant Garamond', serif",
          }}>N</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(28px, 5vw, 36px)',
            fontWeight: 400,
            color: '#f0ede0',
            margin: '0 0 6px',
            letterSpacing: '0.01em',
          }}>Welcome back</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(240,237,224,0.55)', margin: 0 }}>
            Sign in to your MindNest account
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(240,237,224,0.05)',
            border: '1px solid rgba(240,237,224,0.12)',
            borderRadius: 20,
            padding: '32px 28px',
          }}
        >
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(240,237,224,0.6)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
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
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(240,237,224,0.6)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
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
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(220,80,80,0.12)',
              border: '1px solid rgba(220,80,80,0.25)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 18,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: '#f08080',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'rgba(240,237,224,0.15)' : '#f0ede0',
              color: loading ? 'rgba(240,237,224,0.4)' : '#1c2e1c',
              border: 'none',
              borderRadius: 50,
              padding: '13px 24px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.04em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Footer link */}
        <p style={{
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'rgba(240,237,224,0.4)',
          marginTop: 20,
        }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ color: 'rgba(240,237,224,0.75)', textDecoration: 'underline' }}>
            Sign up
          </a>
        </p>

      </div>
    </main>
  )
}
