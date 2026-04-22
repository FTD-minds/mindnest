import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses all RLS.
 * Only use in server components and API route handlers. Never import on the client.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
