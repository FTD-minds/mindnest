import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const ageMonthsParam = searchParams.get('ageMonths')
  const ageMonths = ageMonthsParam !== null ? parseInt(ageMonthsParam) : null

  let query = supabase
    .from('affiliate_products')
    .select('id, title, description, image_url, affiliate_url, age_min_months, age_max_months, category')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (ageMonths !== null && !isNaN(ageMonths)) {
    query = query.lte('age_min_months', ageMonths).gte('age_max_months', ageMonths)
  }

  const { data: products, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: products ?? [] })
}
