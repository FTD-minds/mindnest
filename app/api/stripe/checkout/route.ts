import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const PRICE_IDS: Record<string, string> = {
  monthly:  process.env.STRIPE_PRICE_MONTHLY!,
  annual:   process.env.STRIPE_PRICE_ANNUAL!,
  lifetime: process.env.STRIPE_PRICE_LIFETIME!,
}

export async function POST(request: Request) {
  const { plan, userId, email } = await request.json()

  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const isSubscription = plan !== 'lifetime'

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? 'subscription' : 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    metadata: { userId, plan },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
  })

  return NextResponse.json({ url: session.url })
}
