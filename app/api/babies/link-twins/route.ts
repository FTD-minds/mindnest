import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { baby1Id, baby2Id } = body

  if (!baby1Id || !baby2Id) {
    return NextResponse.json({ error: 'baby1Id and baby2Id are required' }, { status: 400 })
  }
  if (baby1Id === baby2Id) {
    return NextResponse.json({ error: 'A baby cannot be linked as their own twin' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify both babies belong to this user
  const { data: babies } = await supabase
    .from('babies')
    .select('id')
    .eq('user_id', user.id)
    .in('id', [baby1Id, baby2Id])

  if (!babies || babies.length !== 2) {
    return NextResponse.json({ error: 'One or both babies not found' }, { status: 404 })
  }

  // Link bidirectionally
  const { error: e1 } = await supabase
    .from('babies')
    .update({ is_twin: true, twin_sibling_id: baby2Id })
    .eq('id', baby1Id)

  const { error: e2 } = await supabase
    .from('babies')
    .update({ is_twin: true, twin_sibling_id: baby1Id })
    .eq('id', baby2Id)

  if (e1 || e2) {
    return NextResponse.json({ error: 'Failed to link twins' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
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

  const { data: baby } = await supabase
    .from('babies')
    .select('id, twin_sibling_id')
    .eq('id', babyId)
    .eq('user_id', user.id)
    .single()

  if (!baby) {
    return NextResponse.json({ error: 'Baby not found' }, { status: 404 })
  }

  // Unlink both sides
  await supabase
    .from('babies')
    .update({ is_twin: false, twin_sibling_id: null })
    .eq('id', babyId)

  if (baby.twin_sibling_id) {
    await supabase
      .from('babies')
      .update({ is_twin: false, twin_sibling_id: null })
      .eq('id', baby.twin_sibling_id)
  }

  return NextResponse.json({ ok: true })
}
