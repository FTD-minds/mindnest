---
paths:
  - app/api/**
  - app/**/page.tsx
  - app/**/layout.tsx
  - components/**
  - middleware.ts
---

# Supabase Client Convention

## Rules

- **Server-side code** (API routes, Server Components, middleware) must import from `@/lib/supabase/server`:
  ```ts
  import { createClient } from '@/lib/supabase/server'
  ```

- **Client-side code** (Client Components with `'use client'`) must import from `@/lib/supabase/client`:
  ```ts
  import { createClient } from '@/lib/supabase/client'
  ```

- `SUPABASE_SERVICE_ROLE_KEY` is **server-only**. It must never appear in any file that runs in the browser or is exported to the client bundle. Never reference it in components or client utilities.

- Never instantiate a Supabase client inline (e.g. `createClient(url, key)` with raw env vars). Always use the singleton helpers in `lib/supabase/`.

- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe for browser use. The service role key bypasses RLS and must stay server-side.

## Why

Using the wrong client silently bypasses Row Level Security, leaks the service role key to the browser bundle, or causes session hydration errors in SSR. The lib helpers handle cookies, session refresh, and environment safely.
