# MindNest

> *Every age. Every stage. Nest has you covered.*

MindNest is an AI-powered wellness coaching app built for first-time mothers with babies aged 0–36 months. At its core is **Nest** — a warm, knowledgeable AI coach that guides mothers through every stage of early parenthood.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth + DB | Supabase (Auth, Postgres, Storage) |
| Payments | Stripe (subscriptions + one-time lifetime) |
| AI Coach | Anthropic Claude API |
| Deployment | Vercel |

---

## Pricing

- **Monthly** — $9.99/month
- **Annual** — $59.99/year (save 50%)
- **Lifetime** — $149.99 one-time

---

## Target Audience

First-time mothers aged 25–38 with babies 0–36 months who want personalized, judgment-free support navigating early motherhood.

---

## Project Structure

```
mindnest/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Login & signup pages
│   ├── (dashboard)/          # Protected app pages
│   │   ├── dashboard/        # Home dashboard
│   │   └── nest/             # AI coach chat interface
│   └── api/                  # API routes
│       ├── auth/             # Supabase auth callbacks
│       ├── stripe/           # Checkout + webhooks
│       └── nest/             # Claude API proxy
├── components/
│   ├── ui/                   # Reusable UI primitives
│   ├── auth/                 # Auth forms
│   ├── dashboard/            # Dashboard components
│   └── nest/                 # Nest chat components
├── lib/
│   ├── supabase/             # Supabase client (browser + server)
│   ├── stripe/               # Stripe helpers
│   ├── claude/               # Claude API helpers
│   └── utils.ts              # Shared utilities
├── supabase/
│   ├── migrations/           # Database migrations
│   └── seed.sql              # Seed data
├── types/                    # Global TypeScript types
└── public/                   # Static assets
```

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/FTD-minds/mindnest.git
cd mindnest
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in your Supabase, Stripe, and Anthropic API keys.

### 4. Run locally
```bash
npm run dev
```

---

## Lovable.dev

This repo is connected to Lovable.dev via the **FTD-minds** GitHub account. To open in Lovable, import this repository directly from the Lovable dashboard.

---

## Environment Variables

See `.env.example` for all required variables.

---

*Built with love for mothers everywhere.*
