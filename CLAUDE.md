# MindNest — Claude Code Project Context

## Project Overview
MindNest is an AI-powered parenting companion app for new parents. It combines
a conversational AI coach (Nest), baby activity tracking, developmental milestone
guidance, parent wellness check-ins, and a community feed — all wrapped in a
subscription SaaS product.

- **Live URL:** https://mindnest-delta.vercel.app
- **GitHub:** FTD-minds/mindnest
- **Supabase Project Ref:** sbaqdbqcyabpvbldkouh
- **Deployment:** Vercel (auto-deploy on push to `main`)

---

## Tech Stack

| Layer | Library / Service | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^3.4.0 |
| Animation | Framer Motion | ^12.38.0 |
| Database / Auth | Supabase (SSR) | ^0.5.0 / ^2.45.0 |
| AI — Nest chat | Anthropic SDK (Claude) | ^0.36.0 |
| Voice synthesis | ElevenLabs | ^1.59.0 |
| Payments | Stripe + stripe-js | ^16.0.0 / ^4.0.0 |
| React | React + React DOM | ^18 |
| Node types | @types/node | ^20 |

### Claude Model
**claude-haiku-4-5-20251001** — used for all Nest AI responses (chat, mood,
community replies, activity generation, wellness check-ins).
Always use this model ID when modifying or adding Claude API calls.

---

## Architecture Overview

```
mindnest-app/
├── app/
│   ├── (auth)/               — Login, Signup, Onboarding flows
│   ├── (dashboard)/          — Protected app routes (layout with DashboardNav)
│   │   ├── dashboard/        — Home dashboard
│   │   ├── nest/             — AI companion chat + voice
│   │   ├── activities/       — Daily activity library
│   │   ├── checkin/          — Baby activity log (feeding/sleep/diaper/mood)
│   │   ├── milestones/       — Developmental milestone tracker
│   │   ├── community/        — Parent community feed
│   │   ├── wellness/         — Parent mental health check-in (via /checkin)
│   │   └── profile/          — User profile + add-baby flow
│   ├── api/                  — Route handlers (all server-side)
│   │   ├── nest/             — POST /api/nest (chat), /api/nest/mood
│   │   ├── nest-voice/       — POST /api/nest-voice (ElevenLabs TTS)
│   │   ├── activities/       — generate + complete
│   │   ├── babies/           — CRUD, select active baby, link-twins
│   │   ├── community/        — post + like
│   │   ├── milestones/       — note completions
│   │   ├── wellness/         — checkin
│   │   ├── stripe/           — checkout + webhook
│   │   └── auth/callback/    — Supabase OAuth callback
│   ├── layout.tsx            — Root layout
│   └── page.tsx              — Landing page (renders MindNestLanding)
├── components/
│   ├── MindNestLanding.tsx   — ⚠️ TWO-FILE RULE (see below)
│   ├── nest/                 — NestChat, NestInput, NestMessage, NestVoiceChat
│   ├── dashboard/            — ActivityCard, ActivityFeed, BabySwitcher,
│   │                           DashboardNav, TwinsPanel
│   ├── auth/                 — ParentTypeSelector
│   ├── community/            — CommunityFeed
│   ├── milestones/           — MilestoneCard
│   ├── profile/              — AddBabyForm, LinkTwinsButton
│   ├── wellness/             — WellnessCheckin
│   └── ui/                   — badge, button, card, icons, NestOrb
├── lib/
│   ├── claude/index.ts       — Anthropic client singleton
│   ├── stripe/index.ts       — Stripe client
│   ├── supabase/             — client.ts, server.ts, middleware.ts
│   └── utils.ts              — shared utilities
├── types/index.ts            — All shared TypeScript types
├── supabase/migrations/      — All DB migrations (chronological)
├── public/
│   └── mindnest-preview.html — ⚠️ TWO-FILE RULE (see below)
└── middleware.ts             — Supabase session refresh on every request
```

---

## ⚠️ Two-File Rule — ALWAYS Update Together

Whenever the landing page UI is modified, **both files must be updated in the
same commit**:

1. `components/MindNestLanding.tsx` — the live Next.js landing component
2. `public/mindnest-preview.html` — the standalone HTML preview (used for
   sharing designs, Vercel preview links, and stakeholder reviews)

These two files must remain visually in sync at all times. Never update one
without the other.

---

## Database Schema

### Supabase Tables (in migration order)

| Table | Purpose |
|---|---|
| `profiles` | User account — name, email, avatar, parent_type, pregnancy_week, selected_baby_id |
| `babies` | Baby profiles — name, DOB, gender, is_twin, twin_sibling_id (max 6 per user) |
| `subscriptions` | Stripe subscription state — plan, status, period_end |
| `chat_sessions` | Nest AI conversation threads |
| `chat_messages` | Individual messages per session |
| `activity_logs` | Baby daily tracker — feeding, sleep, diaper, mood, notes, milestones |
| `wellness_checkins` | Parent mental health check-ins — mood, energy, sleep, symptoms, journal |
| `daily_activities` | Curated activity library — age-ranged, brain-area tagged, premium flagged |
| `activity_completions` | Which activities a user has completed |
| `community_posts` | Parent community feed — content, likes, Nest AI reply |
| `community_post_likes` | Join table — one row per user per liked post |
| `developmental_milestones` | Age 0–36 month milestones by brain area |
| `milestone_completions` | Which milestones a baby has reached |

### Key ENUMs
- `subscription_plan`: monthly | annual | lifetime
- `subscription_status`: trialing | active | past_due | canceled | unpaid | paused
- `feeding_type`: breast | bottle_breast_milk | bottle_formula | solid | mixed
- `diaper_type`: wet | dirty | both | dry
- `sleep_type`: nap | night
- `parent_type` (CHECK): mom | dad | partner | expecting
- `brain_area` (CHECK): Language | Motor | Social-Emotional | Cognitive | Sensory

### Migration History
```
20260331000000_initial_schema.sql       — Core tables + enums + RLS
20260401000000_add_parent_type.sql      — parent_type on profiles
20260402000000_add_community_posts.sql  — community_posts + likes
20260403000000_multi_child_profiles.sql — selected_baby_id, max 6 babies trigger
20260403010000_twins_mode.sql           — is_twin, twin_sibling_id, activity tags
20260403020000_milestone_tracking.sql   — developmental_milestones + completions
20260412000000_add_pregnancy_fields.sql — pregnancy_week, 'expecting' parent_type
```

---

## Key Features Built

- **Auth** — Email/password signup, login, Supabase OAuth callback, protected
  routes via middleware
- **Onboarding** — Parent type selection (mom/dad/partner/expecting), baby
  profile creation, pregnancy week input
- **Nest AI Chat** — Conversational parenting companion using Claude Haiku,
  streamed responses, persistent sessions in Supabase
- **Nest Voice** — Voice toggle + auto-listen mode; ElevenLabs TTS; full
  response sent (no character truncation)
- **Baby Profiles** — Multi-child support (up to 6), baby switcher in dashboard
- **Twins Mode** — Bidirectional twin linking, twin-specific activity tags
- **Activity Logs** — Feeding (type + duration/amount), sleep (nap/night +
  duration), diapers, mood score, freeform notes, milestone photo logs
- **Daily Activities** — Age-appropriate activity library with brain-area tags,
  AI-generated suggestions, completion tracking, premium gating
- **Developmental Milestones** — 0–36 month milestones across 5 brain areas,
  completion noting, parent guidance text
- **Wellness Check-ins** — Parent mood, energy, sleep, symptom tags, journal
  entry, AI response from Nest
- **Community Feed** — Post sharing, likes, Nest AI encouragement reply on
  each post
- **Subscriptions** — Stripe checkout for monthly/annual/lifetime plans,
  webhook handler for status sync, premium content gating

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY          # server-only, never expose to client

# Anthropic
ANTHROPIC_API_KEY

# ElevenLabs
ELEVENLABS_API_KEY

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

---

## Development Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run build        # production build
npm run type-check   # tsc --noEmit (run before committing)
npm run lint         # ESLint
```

---

## Coding Conventions

- All Supabase calls in API routes use the **server client** (`lib/supabase/server.ts`)
- All Supabase calls in client components use the **browser client** (`lib/supabase/client.ts`)
- All shared types live in `types/index.ts` — add new types there, never inline
- API routes are all in `app/api/` — no logic in page components
- Tailwind only for styling — no CSS modules, no inline styles
- Framer Motion for animations — keep them subtle and purposeful

---

## Global Knowledge Base
See ~/claude-knowledge/AI_STARTUP_PLAYBOOK.md for build strategy and guidelines.
