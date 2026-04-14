import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { claude } from '@/lib/claude'
import type { MoodLevel, WellnessSymptom } from '@/types'

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    mood,
    energy_level,
    sleep_hours,
    symptoms,
    journal_text,
    checkin_date,
  }: {
    mood: MoodLevel
    energy_level: number
    sleep_hours: number | null
    symptoms: WellnessSymptom[]
    journal_text: string | null
    checkin_date: string
  } = await request.json()

  const moodLabel     = mood.replace('_', ' ')
  const symptomList   = symptoms.length > 0 ? symptoms.join(', ') : 'none'
  const sleepNote     = sleep_hours != null ? `${sleep_hours} hours` : 'not tracked'
  const journalNote   = journal_text || '(nothing shared today)'

  const prompt = `A mother's daily wellness check-in:
- Mood: ${moodLabel}
- Energy: ${energy_level}/5
- Sleep: ${sleepNote}
- Feeling: ${symptomList}
- Journal: ${journalNote}

Write a warm, personal 2-3 sentence response as Nest. Acknowledge how she's actually feeling today based on her inputs. Offer one specific, practical piece of support or encouragement. Close with something uplifting. Avoid clichés and generic advice.`

  const aiResult = await claude.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system:
      'You are Nest, a warm, non-judgmental AI wellness coach for first-time mothers. ' +
      'Every age. Every stage. Nest has you covered. ' +
      'Keep responses concise (2-3 sentences), personal, and specific to what the mother shared.',
    messages: [{ role: 'user', content: prompt }],
  })

  const aiResponse =
    aiResult.content[0].type === 'text' ? aiResult.content[0].text : ''

  const { data, error } = await supabase
    .from('wellness_checkins')
    .upsert(
      {
        user_id:             user.id,
        checkin_date,
        mood,
        energy_level,
        sleep_hours:         sleep_hours ?? null,
        symptoms,
        journal_text:        journal_text ?? null,
        ai_response:         aiResponse,
        ai_response_sent_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,checkin_date' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ checkin: data, ai_response: aiResponse })
}
