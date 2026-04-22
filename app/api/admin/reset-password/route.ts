import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

// POST /api/admin/reset-password
// Sends a password reset email to the specified user via Supabase Admin auth API.
export async function POST(req: Request) {
  // Verify caller is an admin
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, email } = await req.json()
  if (!userId && !email) {
    return NextResponse.json({ error: 'userId or email is required' }, { status: 400 })
  }

  const db = createAdminClient()

  // generateLink type 'recovery' generates a password reset link.
  // Supabase sends the recovery email automatically via the configured SMTP.
  const targetEmail = email ?? (
    await db.auth.admin.getUserById(userId).then(r => r.data.user?.email)
  )

  if (!targetEmail) {
    return NextResponse.json({ error: 'User email not found' }, { status: 404 })
  }

  const { data, error } = await db.auth.admin.generateLink({
    type:  'recovery',
    email: targetEmail,
  })

  if (error) {
    console.error('[admin/reset-password]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, email: targetEmail, link: data.properties?.action_link })
}
