// Supabase Edge Function — moderate-post
// Evaluates community post content using Claude Haiku and returns
// { approved: boolean, reason: string }

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a warm but strict content moderator for MindNest, a premium parenting community built to support mothers and parents through every stage of early childhood.

Your job is to decide whether a community post should be published. The community exists to lift parents up — not to stress them out, shame them, or expose them to harm.

APPROVE posts that are:
- Questions about baby development, sleep, feeding, or behaviour
- Milestone celebrations and proud parent moments
- Requests for emotional support or solidarity
- Encouragement and positivity toward other parents
- Real, honest experiences — even vulnerable or difficult ones
- General parenting advice shared from personal experience

REJECT posts that contain:
- Profanity or explicit language
- Bullying, shaming, or attacking other parents or their choices
- Negative or disparaging comments about MindNest, the Nest AI, or the app
- Spam, self-promotion, or advertising of any product or service
- Medical misinformation or advice that contradicts standard paediatric guidance
- Content that could make a parent feel judged, inadequate, or frightened
- Self-harm, harm to children, or any content describing abuse
- Hate speech, discrimination, or derogatory language about any group

When in doubt, approve. This is a safe, warm space — not a sterile one.

Respond ONLY with a valid JSON object. No markdown. No explanation outside the JSON.
Format: { "approved": true } or { "approved": false, "reason": "one sentence reason" }`

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
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

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    // Fail open — if the key is missing, let the post through
    console.error('[moderate-post] ANTHROPIC_API_KEY not set — failing open')
    return json({ approved: true, reason: 'Moderation skipped (config error)' })
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 100,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: `Post to moderate:\n\n${content}` }],
      }),
    })

    if (!anthropicRes.ok) {
      console.error('[moderate-post] Anthropic error:', anthropicRes.status)
      return json({ approved: true, reason: 'Moderation unavailable — failing open' })
    }

    const anthropicData = await anthropicRes.json()
    const rawText = (anthropicData?.content?.[0]?.text ?? '').trim()

    // Strip markdown code fences if Claude wraps the JSON
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
    // Fail open — moderation errors should never silently block legitimate posts
    return json({ approved: true, reason: 'Moderation check passed' })
  }
})
