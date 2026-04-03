import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { babyId } = body

  if (!babyId) {
    return NextResponse.json({ error: 'babyId is required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the baby belongs to this user
  const { data: baby } = await supabase
    .from('babies')
    .select('id')
    .eq('id', babyId)
    .eq('user_id', user.id)
    .single()

  if (!baby) {
    return NextResponse.json({ error: 'Baby not found' }, { status: 404 })
  }

  await supabase
    .from('profiles')
    .update({ selected_baby_id: babyId })
    .eq('id', user.id)

  return NextResponse.json({ ok: true })
}
