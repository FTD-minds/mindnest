import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { claude } from '@/lib/claude'
import type { ParentType } from '@/types'

export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, parent_type, first_name }: {
    message: string
    parent_type: ParentType | null
    first_name: string
  } = await request.json()

  const addressAs =
    parent_type === 'mom' ? 'mama' :
    parent_type === 'dad' ? 'papa' :
    (first_name?.split(' ')[0] || 'friend')

  const prompt =
    `A parent just told you how they're feeling today as part of a daily wellness check-in.

How they identify: ${parent_type ?? 'not specified'}
What they shared: "${message}"

Your job:
1. Respond warmly as Nest in 1-3 sentences. Address them as "${addressAs}". Acknowledge what they actually said — be specific, not generic. Do not give advice unless they asked for it. Simply be present with them.
2. Silently assign a mood_score from 1 to 5 based on the emotional tone of their message:
   1 = very low / struggling / distressed
   2 = low / tired / flat
   3 = okay / neutral / mixed
   4 = good / positive / coping well
   5 = great / energised / thriving

Respond with ONLY valid JSON — no markdown, no explanation, no other text:
{
  "response": "your warm response here",
  "mood_score": <integer 1-5>
}`

  const FALLBACK = {
    nest_response: `Thank you for sharing that with me, ${addressAs}. I\'m right here with you.`,
    mood_score: 3,
  }

  try {
    const aiResult = await claude.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 300,
      system:
        'You are Nest, a warm and non-judgmental AI wellness coach for parents. ' +
        'You respond with valid JSON only — never markdown, never plain text.',
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = aiResult.content[0].type === 'text'
      ? aiResult.content[0].text.trim()
      : ''

    // Strip markdown code fences if Claude wrapped the JSON
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()

    const parsed = JSON.parse(cleaned)

    return NextResponse.json({
      nest_response: typeof parsed.response === 'string'
        ? parsed.response
        : FALLBACK.nest_response,
      mood_score: typeof parsed.mood_score === 'number'
        ? Math.min(5, Math.max(1, Math.round(parsed.mood_score)))
        : FALLBACK.mood_score,
    })
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
