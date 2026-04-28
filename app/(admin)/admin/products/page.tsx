import { createAdminClient } from '@/lib/supabase/admin-client'
import { ProductActions } from './ProductActions'

export default async function AdminProductsPage() {
  const db = createAdminClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { data: products },
    { data: allClicks },
    { count: clicksThisMonth },
  ] = await Promise.all([
    db
      .from('affiliate_products')
      .select('id, title, description, image_url, affiliate_url, age_min_months, age_max_months, category, is_active, created_at')
      .order('created_at', { ascending: false }),
    db
      .from('affiliate_clicks')
      .select('product_id'),
    db
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .gte('clicked_at', startOfMonth.toISOString()),
  ])

  // Build per-product click totals
  const clicksMap: Record<string, number> = {}
  for (const c of allClicks ?? []) {
    clicksMap[c.product_id] = (clicksMap[c.product_id] ?? 0) + 1
  }

  // Find top clicked product
  let topProductName   = '—'
  let topProductClicks = 0
  for (const [pid, count] of Object.entries(clicksMap)) {
    if (count > topProductClicks) {
      topProductClicks = count
      topProductName   = products?.find(p => p.id === pid)?.title ?? '—'
    }
  }

  return (
    <div className="p-8">
      <ProductActions
        products={products ?? []}
        clicksMap={clicksMap}
        totalClicksThisMonth={clicksThisMonth ?? 0}
        topProductName={topProductName}
        topProductClicks={topProductClicks}
      />
    </div>
  )
}
