import { NextResponse } from 'next/server'
import { ElevenLabsClient } from 'elevenlabs'
import { createServerClient } from '@/lib/supabase/server'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
})

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
