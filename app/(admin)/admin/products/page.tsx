import { createAdminClient } from '@/lib/supabase/admin-client'
import { ProductActions } from './ProductActions'

export default async function AdminProductsPage() {
  const db = createAdminClient()

  const { data: products } = await db
    .from('affiliate_products')
    .select('id, title, description, image_url, affiliate_url, age_min_months, age_max_months, category, is_active, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <ProductActions products={products ?? []} />
    </div>
  )
}
