import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin-client'
import Stripe from 'stripe'

// Subscription statuses supported by our DB enum
type DbStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'

function mapStatus(stripeStatus: string): DbStatus {
  const supported: DbStatus[] = ['trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused']
  return supported.includes(stripeStatus as DbStatus)
    ? (stripeStatus as DbStatus)
    : 'active'
}

function toIso(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString()
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const db = createAdminClient()

  switch (event.type) {

    // ── New checkout completed ──────────────────────────────────────────────
    case 'checkout.session.completed': {
      const session  = event.data.object as Stripe.Checkout.Session
      const userId   = session.client_reference_id
      const plan     = session.metadata?.plan

      if (!userId || !plan) break

      const customerId = typeof session.customer === 'string'
        ? session.customer
        : (session.customer as Stripe.Customer | null)?.id ?? ''

      if (session.mode === 'subscription' && session.subscription) {
        // Monthly or annual — retrieve full subscription for period dates
        const subId = typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription as Stripe.Subscription).id

        const sub = await stripe.subscriptions.retrieve(subId)

        await db.from('subscriptions').upsert({
          user_id:                userId,
          stripe_customer_id:     customerId,
          stripe_subscription_id: subId,
          stripe_price_id:        sub.items.data[0]?.price.id ?? '',
          plan,
          status:                 mapStatus(sub.status),
          current_period_start:   toIso(sub.current_period_start),
          current_period_end:     toIso(sub.current_period_end),
          cancel_at_period_end:   sub.cancel_at_period_end,
          trial_start:            sub.trial_start ? toIso(sub.trial_start) : null,
          trial_end:              sub.trial_end   ? toIso(sub.trial_end)   : null,
        }, { onConflict: 'user_id' })
      } else if (session.mode === 'payment') {
        // Lifetime one-time purchase — no subscription object
        const priceId = session.line_items?.data[0]?.price?.id
          ?? process.env.STRIPE_PRICE_LIFETIME
          ?? ''

        await db.from('subscriptions').upsert({
          user_id:            userId,
          stripe_customer_id: customerId,
          stripe_price_id:    priceId,
          plan:               'lifetime',
          status:             'active',
        }, { onConflict: 'user_id' })
      }
      break
    }

    // ── Subscription renewed / modified / trial converted ──────────────────
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription

      await db.from('subscriptions')
        .update({
          status:               mapStatus(sub.status),
          current_period_start: toIso(sub.current_period_start),
          current_period_end:   toIso(sub.current_period_end),
          cancel_at_period_end: sub.cancel_at_period_end,
          canceled_at:          sub.canceled_at ? toIso(sub.canceled_at) : null,
          trial_start:          sub.trial_start ? toIso(sub.trial_start) : null,
          trial_end:            sub.trial_end   ? toIso(sub.trial_end)   : null,
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    // ── Subscription cancelled ─────────────────────────────────────────────
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await db.from('subscriptions')
        .update({
          status:      'canceled',
          canceled_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
