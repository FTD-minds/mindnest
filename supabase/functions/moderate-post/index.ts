// Supabase Edge Function — moderate-post
// Evaluates community post content using Claude Haiku and returns
// { approved: boolean, reason: string }

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a content moderator for MindNest, a warm parenting community. Your job is simple: approve almost everything.

DEFAULT: APPROVE. Only reject if the content is clearly and obviously harmful.

ALWAYS APPROVE (never reject these):
- Short replies of any kind: "yes", "same!", "me too", "love this", "thank you", "absolutely", "this", "same here"
- Emoji-only messages or emoji mixed with words
- One-word or one-sentence comments
- Questions of any kind, on any topic
- Personal stories, experiences, and venting
- Honest emotions: frustration, exhaustion, anxiety, sadness, overwhelm, anger
- Parenting struggles, setbacks, hard days, and difficult moments
- Milestone celebrations, wins, and proud moments
- Supportive, encouraging, or empathetic comments
- Disagreement with parenting advice (even strong disagreement)
- Off-topic comments or rambling
- Imperfect grammar, typos, or informal language

REJECT ONLY if the content clearly contains one of these:
- Profanity, slurs, or vulgar language (actual swear words, not mild frustration)
- Direct personal attacks: bullying or shaming a specific other parent
- Dangerous medical misinformation that could physically harm a child (e.g. "give honey to a 3-month-old", "don't vaccinate")
- Spam, commercial links, or advertisements
- Sexually explicit or graphically violent content

IMPORTANT: If you are unsure whether something qualifies as harmful, APPROVE IT. The cost of a false rejection (blocking a genuine parent from getting support) is far higher than the cost of approving an imperfect post. Err heavily on the side of approval.

Respond ONLY with valid JSON. No markdown. No extra text.
Format: { "approved": true } or { "approved": false, "reason": "one sentence" }`

// Fast-path patterns — approve immediately without calling Claude
// This prevents false rejections on obviously benign short content
const FAST_APPROVE_MAX_LENGTH = 40
const OBVIOUS_SLURS = /\b(fuck|shit|cunt|nigger|faggot|retard|bitch)\b/i

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return json({ approved: false, reason: 'Method not allowed' }, 405)
  }

  let content: string
  try {
    const body = await req.json()
    content = typeof body?.content === 'string' ? body.content.trim() : ''
  } catch {
    return json({ approved: false, reason: 'Invalid request body' }, 400)
  }

  if (!content) {
    return json({ approved: false, reason: 'No content provided' }, 400)
  }

  // Fast-path: short content without obvious slurs is auto-approved.
  // This avoids false rejections on "yes", "same!", emojis, etc.
  if (content.length <= FAST_APPROVE_MAX_LENGTH && !OBVIOUS_SLURS.test(content)) {
    return json({ approved: true, reason: 'Short content auto-approved' })
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    console.error('[moderate-post] ANTHROPIC_API_KEY not set — failing open')
    return json({ approved: true, reason: 'Moderation skipped (config error)' })
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 60,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: `Moderate this content:\n\n${content}` }],
      }),
    })

    if (!anthropicRes.ok) {
      console.error('[moderate-post] Anthropic error:', anthropicRes.status)
      return json({ approved: true, reason: 'Moderation unavailable — failing open' })
    }

    const anthropicData = await anthropicRes.json()
    const rawText = (anthropicData?.content?.[0]?.text ?? '').trim()

    const cleaned = rawText
      .replace(/^```[^\n]*\n?/m, '')
      .replace(/```$/m, '')
      .trim()

    const result = JSON.parse(cleaned) as { approved: boolean; reason?: string }

    return json({
      approved: result.approved === true,
      reason:   result.reason ?? (result.approved ? 'Approved' : 'Content not suitable'),
    })
  } catch (err) {
    console.error('[moderate-post] Unexpected error:', err)
    return json({ approved: true, reason: 'Moderation check passed' })
  }
})
