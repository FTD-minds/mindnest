// ─── Parent type ──────────────────────────────────────────────────────────────

export type ParentType = 'mom' | 'dad' | 'partner'

// ─── Subscriptions ────────────────────────────────────────────────────────────

export type Plan = 'monthly' | 'annual' | 'lifetime'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid' | 'paused'

// ─── Profiles ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  onboarding_complete: boolean
  timezone: string
  parent_type: ParentType | null
  created_at: string
}

// ─── Babies ───────────────────────────────────────────────────────────────────

export interface Baby {
  id: string
  user_id: string
  name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'prefer_not_to_say' | null
  avatar_url: string | null
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  plan: Plan
  status: SubscriptionStatus
  current_period_end: string | null
  cancel_at_period_end: boolean
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface NestSession {
  id: string
  user_id: string
  title: string | null
  messages: ChatMessage[]
  last_message_at: string
  message_count: number
  is_archived: boolean
  created_at: string
}

// ─── Activities ───────────────────────────────────────────────────────────────

export interface Activity {
  id: string
  title: string
  description: string
  instructions: string
  min_age_months: number
  max_age_months: number
  duration_min: number
  brain_area: string
  materials_needed: string[]
  is_premium: boolean
  is_active: boolean
}

export interface ActivityCompletion {
  id: string
  user_id: string
  baby_id: string
  activity_id: string
  completed_date: string
  rating: number | null
}

// ─── Activity Logs ────────────────────────────────────────────────────────────

export type ActivityLogType = 'feeding' | 'sleep' | 'diaper' | 'mood' | 'note' | 'milestone'
export type FeedingType     = 'breast' | 'bottle_breast_milk' | 'bottle_formula' | 'solid' | 'mixed'
export type DiaperType      = 'wet' | 'dirty' | 'both' | 'dry'
export type SleepType       = 'nap' | 'night'

export interface ActivityLog {
  id: string
  user_id: string
  baby_id: string
  log_type: ActivityLogType
  logged_at: string
  feeding_type?: FeedingType
  feeding_duration_min?: number
  feeding_amount_ml?: number
  sleep_type?: SleepType
  sleep_start?: string
  sleep_end?: string
  sleep_duration_min?: number
  diaper_type?: DiaperType
  mood_score?: number
  note_text?: string
  milestone_title?: string
  milestone_photo_url?: string
}

// ─── Wellness ─────────────────────────────────────────────────────────────────

export type MoodLevel = 'very_low' | 'low' | 'neutral' | 'good' | 'great'

export type WellnessSymptom =
  | 'anxious' | 'exhausted' | 'overwhelmed' | 'lonely'
  | 'tearful' | 'irritable' | 'disconnected'
  | 'hopeful' | 'supported' | 'energized'

export interface WellnessCheckin {
  id: string
  user_id: string
  checkin_date: string
  mood: MoodLevel
  energy_level: number
  sleep_hours: number | null
  symptoms: WellnessSymptom[]
  journal_text: string | null
  ai_response: string | null
  ai_response_sent_at: string | null
  created_at: string
}

// ─── Community ────────────────────────────────────────────────────────────────

export interface CommunityPost {
  id:               string
  user_id:          string
  content:          string
  baby_age_months:  number | null
  likes_count:      number
  liked_by_me:      boolean
  nest_reply:       string | null
  nest_replied_at:  string | null
  created_at:       string
  profiles:         { full_name: string } | null
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: string
}
