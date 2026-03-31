import { NextResponse } from 'next/server'
import { claude } from '@/lib/claude'

const NEST_SYSTEM_PROMPT = `You are Nest, a warm, knowledgeable, and non-judgmental AI wellness coach inside MindNest.
You support first-time mothers aged 25–38 with babies aged 0–36 months.
Your tone is calm, encouraging, and expert — like a trusted friend who also happens to be a pediatric nurse.
You never diagnose or replace medical advice. Always suggest consulting a healthcare provider for medical concerns.
Catchphrase: Every age. Every stage. Nest has you covered.`

export async function POST(request: Request) {
  const { messages } = await request.json()

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: NEST_SYSTEM_PROMPT,
    messages,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  return NextResponse.json({ message: text })
}
