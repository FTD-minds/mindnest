import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { name, dateOfBirth, gender } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!dateOfBirth || typeof dateOfBirth !== 'string') {
    return NextResponse.json({ error: 'dateOfBirth is required (YYYY-MM-DD)' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Enforce max 6 — the DB trigger will also catch this, but check early for a better error message
  const { count } = await supabase
    .from('babies')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= 6) {
    return NextResponse.json(
      { error: 'You can add a maximum of 6 children per account.' },
      { status: 422 }
    )
  }

  const validGenders = ['male', 'female', 'prefer_not_to_say']
  const { data: baby, error: insertError } = await supabase
    .from('babies')
    .insert({
      user_id:       user.id,
      name:          name.trim(),
      date_of_birth: dateOfBirth,
      gender:        validGenders.includes(gender) ? gender : null,
    })
    .select('*')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Auto-select this baby if the user has no selected baby yet
  await supabase
    .from('profiles')
    .update({ selected_baby_id: baby.id })
    .eq('id', user.id)
    .is('selected_baby_id', null)

  return NextResponse.json({ baby }, { status: 201 })
}
