import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'

const PRICE_IDS: Record<string, string> = {
  monthly:  process.env.STRIPE_PRICE_MONTHLY!,
  annual:   process.env.STRIPE_PRICE_ANNUAL!,
  lifetime: process.env.STRIPE_PRICE_LIFETIME!,
}

export async function POST(request: Request) {
  // Auth — get user from server session, never trust client-supplied IDs
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await request.json()

  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const isSubscription = plan !== 'lifetime'

  const session = await stripe.checkout.sessions.create({
    mode:                 isSubscription ? 'subscription' : 'payment',
    payment_method_types: ['card'],
    line_items:           [{ price: priceId, quantity: 1 }],
    customer_email:       user.email,
    client_reference_id:  user.id,
    metadata:             { userId: user.id, plan },
    success_url:          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url:           `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
  })

  return NextResponse.json({ url: session.url })
}
