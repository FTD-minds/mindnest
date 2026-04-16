import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const FREE_TIER_DAILY_LIMIT = 3

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

  // Check subscription status
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', user.id)
    .single()

  const isPremium =
    sub?.status === 'active' || sub?.status === 'trialing' || sub?.plan === 'lifetime'

  if (!isPremium) {
    // Count distinct activities completed today (ignore re-ratings of the same activity)
    const { count } = await supabase
      .from('activity_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed_date', today)

    const completedToday = count ?? 0

    // Allow re-rating an already-completed activity without consuming another slot
    const { data: existing } = await supabase
      .from('activity_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('activity_id', activityId)
      .eq('completed_date', today)
      .maybeSingle()

    if (!existing && completedToday >= FREE_TIER_DAILY_LIMIT) {
      return NextResponse.json(
        { error: 'Daily limit reached. Upgrade to complete more activities.' },
        { status: 403 }
      )
    }
  }

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
