import { NextResponse } from 'next/server'
import { ElevenLabsClient } from 'elevenlabs'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY!,
  })

  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Premium / beta gate ───────────────────────────────────────────────────
  const [{ data: subscription }, { data: profile }] = await Promise.all([
    supabase.from('subscriptions').select('status').eq('user_id', user.id).single(),
    supabase.from('profiles').select('beta_access, beta_access_expires_at').eq('id', user.id).single(),
  ])

  const isPremium     = ['active', 'trialing'].includes(subscription?.status ?? '')
  const betaExpiry    = profile?.beta_access_expires_at ? new Date(profile.beta_access_expires_at) : null
  const hasBetaAccess = (profile?.beta_access ?? false) && (betaExpiry === null || betaExpiry > new Date())

  if (!isPremium && !hasBetaAccess) {
    return NextResponse.json({ error: 'voice_premium_only' }, { status: 403 })
  }

  const { text, voiceId } = await request.json()

  if (!text || !voiceId) {
    return NextResponse.json({ error: 'Missing text or voiceId' }, { status: 400 })
  }

  try {
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability:        0.5,
        similarity_boost: 0.75,
      },
    })

    // Consume async iterable into a buffer
    const chunks: Buffer[] = []
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    return new Response(buffer, {
      headers: {
        'Content-Type':   'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control':  'no-store',
      },
    })
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number; stack?: string }
    console.error('[Nest Voice API] ElevenLabs error:', {
      message: e?.message,
      status:  e?.status,
      stack:   e?.stack,
    })
    return NextResponse.json({ error: 'TTS error', detail: e?.message }, { status: 502 })
  }
}
