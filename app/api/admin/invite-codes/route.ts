import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

async function verifyAdmin() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin ? profile : null
}

// GET /api/admin/invite-codes — list all codes
export async function GET() {
  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('invite_codes')
    .select('*, creator:created_by (full_name), user:used_by (full_name, email)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ codes: data })
}

// POST /api/admin/invite-codes — generate a new unique code
export async function POST() {
  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const db = createAdminClient()

  // Derive next sequential number from existing codes matching NEST-BETA-NNN
  const { data: existing } = await db
    .from('invite_codes')
    .select('code')
    .like('code', 'NEST-BETA-%')
    .order('created_at', { ascending: false })

  let nextNum = 1
  if (existing && existing.length > 0) {
    const nums = existing
      .map(c => parseInt(c.code.replace('NEST-BETA-', ''), 10))
      .filter(n => !isNaN(n))
    nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1
  }

  const code = `NEST-BETA-${String(nextNum).padStart(3, '0')}`

  const { data, error } = await db
    .from('invite_codes')
    .insert({ code, created_by: admin.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ code: data }, { status: 201 })
}
