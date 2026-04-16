import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { claude } from '@/lib/claude'
import { getAgeBand } from '@/lib/utils'

const BRAIN_AREAS = ['Language', 'Motor', 'Social-Emotional', 'Cognitive', 'Sensory'] as const
type BrainArea = typeof BRAIN_AREAS[number]

// Service-role client — bypasses RLS for inserts into daily_activities
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function extractJSON(raw: string): string {
  // Strip markdown code fences if Claude wraps the output
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  // Find the first '[' and last ']'
  const start = raw.indexOf('[')
  const end   = raw.lastIndexOf(']')
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1)
  return raw.trim()
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const ageMonths = Number(body.ageMonths)

  if (isNaN(ageMonths) || ageMonths < 0 || ageMonths > 36) {
    return NextResponse.json({ error: 'ageMonths must be a number between 0 and 36' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const band = getAgeBand(ageMonths)

  // Count existing active activities for this exact age band
  const { count } = await supabase
    .from('daily_activities')
    .select('*', { count: 'exact', head: true })
    .eq('min_age_months', band.min)
    .eq('max_age_months', band.max)
    .eq('is_active', true)

  const existing = count ?? 0

  if (existing >= 20) {
    const { data } = await supabase
      .from('daily_activities')
      .select('*')
      .eq('min_age_months', band.min)
      .eq('max_age_months', band.max)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    return NextResponse.json({ activities: data ?? [], generated: 0 })
  }

  // ── Ask Claude to generate 10 new activities ──────────────────────────────
  const prompt = `Generate 10 unique baby development activities for babies aged ${band.label} (${band.min}–${band.max} months).

Requirements:
- Cover a variety of brain areas from: ${BRAIN_AREAS.join(', ')}
- Make 6 activities free (is_premium: false) and 4 premium (is_premium: true)
- Do NOT repeat activities that are already common or obvious
- Each activity must be distinctly different from the others

Return ONLY a valid JSON array with no extra text, markdown, or explanation. Each object must have exactly these fields:
[
  {
    "title": "Short Activity Title",
    "description": "1–2 warm sentences on the developmental benefit, science-backed.",
    "instructions": "1. Step one.\\n2. Step two.\\n3. Step three.\\n4. Step four.\\n5. Step five.\\n6. Step six.",
    "min_age_months": ${band.min},
    "max_age_months": ${band.max},
    "duration_min": 10,
    "brain_area": "Language",
    "materials_needed": ["item one", "item two"],
    "is_premium": false
  }
]

MindNest brand voice: warm, encouraging, and science-backed — like a trusted friend who is also a pediatric expert.`

  const response = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : '[]'

  let candidates: Record<string, unknown>[] = []
  try {
    const parsed = JSON.parse(extractJSON(rawText))
    candidates = Array.isArray(parsed) ? parsed : []
  } catch {
    return NextResponse.json({ error: 'Claude returned unparseable JSON', raw: rawText }, { status: 500 })
  }

  // Sanitise and insert
  const rows = candidates
    .filter(a => a && typeof a === 'object')
    .map(a => ({
      title:            String(a.title           ?? 'Activity').slice(0, 120),
      description:      String(a.description     ?? '').slice(0, 500),
      instructions:     String(a.instructions    ?? ''),
      min_age_months:   band.min,
      max_age_months:   band.max,
      duration_min:     Math.max(1, Math.min(60, Number(a.duration_min) || 10)),
      brain_area:       BRAIN_AREAS.includes(a.brain_area as BrainArea)
                          ? (a.brain_area as string)
                          : 'Cognitive',
      materials_needed: Array.isArray(a.materials_needed)
                          ? (a.materials_needed as unknown[]).map(String).slice(0, 10)
                          : [],
      is_premium:       Boolean(a.is_premium),
      is_active:        true,
    }))

  if (rows.length > 0) {
    await supabase.from('daily_activities').insert(rows)
  }

  // Return full updated list for this band
  const { data: allActivities } = await supabase
    .from('daily_activities')
    .select('*')
    .eq('min_age_months', band.min)
    .eq('max_age_months', band.max)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  return NextResponse.json({
    activities: allActivities ?? [],
    generated: rows.length,
  })
}
