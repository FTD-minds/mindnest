import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('id')

  if (!productId) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  // Fetch product via admin client (bypasses RLS for inactive products too)
  const db = createAdminClient()
  const { data: product } = await db
    .from('affiliate_products')
    .select('affiliate_url')
    .eq('id', productId)
    .single()

  if (!product?.affiliate_url) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Log the click — fail silently so broken tracking never blocks the user
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await db.from('affiliate_clicks').insert({
        product_id: productId,
        user_id:    user.id,
      })
    }
  } catch {
    // Non-fatal
  }

  return NextResponse.redirect(product.affiliate_url)
}
