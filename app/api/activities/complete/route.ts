import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { activityId, babyId, rating } = body

  if (!activityId || !babyId) {
    return NextResponse.json({ error: 'activityId and babyId are required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('activity_completions')
    .upsert(
      {
        user_id:        user.id,
        baby_id:        babyId,
        activity_id:    activityId,
        completed_date: today,
        rating:         typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating : null,
      },
      { onConflict: 'user_id,activity_id,completed_date' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
