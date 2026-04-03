import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// POST /api/milestones/note  — toggle a milestone as noted / un-noted for the active baby
export async function POST(req: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { babyId, milestoneId } = await req.json()
  if (!babyId || !milestoneId) {
    return NextResponse.json({ error: 'babyId and milestoneId are required' }, { status: 400 })
  }

  // Verify the baby belongs to this user
  const { data: baby } = await supabase
    .from('babies')
    .select('id')
    .eq('id', babyId)
    .eq('user_id', user.id)
    .single()

  if (!baby) return NextResponse.json({ error: 'Baby not found' }, { status: 404 })

  // Check if already noted
  const { data: existing } = await supabase
    .from('milestone_completions')
    .select('id')
    .eq('baby_id', babyId)
    .eq('milestone_id', milestoneId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('milestone_completions')
      .delete()
      .eq('id', existing.id)
    return NextResponse.json({ noted: false })
  }

  await supabase
    .from('milestone_completions')
    .insert({ baby_id: babyId, milestone_id: milestoneId })

  return NextResponse.json({ noted: true })
}
