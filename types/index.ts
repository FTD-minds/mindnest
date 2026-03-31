export type Plan = 'monthly' | 'annual' | 'lifetime'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  baby_dob: string | null
  plan: Plan | null
  subscription_status: SubscriptionStatus | null
  stripe_customer_id: string | null
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface NestSession {
  id: string
  user_id: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}
