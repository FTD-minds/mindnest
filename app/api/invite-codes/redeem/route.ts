import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

// POST /api/invite-codes/redeem
// Validates and redeems a beta invite code for the authenticated user.
export async function POST(req: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const normalized = code.trim().toUpperCase()

  // ── Look up the code (service role bypasses RLS on invite_codes) ──────────
  const db = createAdminClient()
  const { data: invite, error: lookupError } = await db
    .from('invite_codes')
    .select('id, is_active, used_by')
    .ilike('code', normalized)
    .single()

  if (lookupError || !invite) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  if (!invite.is_active) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  if (invite.used_by !== null) {
    return NextResponse.json({ error: 'already_used' }, { status: 400 })
  }

  // ── Redeem: mark code as used + grant beta access ─────────────────────────
  const [{ error: codeError }, { error: profileError }] = await Promise.all([
    db
      .from('invite_codes')
      .update({ used_by: user.id, used_at: new Date().toISOString() })
      .eq('id', invite.id),
    db
      .from('profiles')
      .update({ beta_access: true })
      .eq('id', user.id),
  ])

  if (codeError || profileError) {
    console.error('[invite-codes/redeem]', codeError, profileError)
    return NextResponse.json({ error: 'invalid' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
