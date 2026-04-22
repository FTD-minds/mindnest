-- =============================================================================
-- MindNest — Beta Access + Nest Usage Logs
-- Migration: 20260422000002_add_beta_access_to_profiles.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add beta_access to profiles
--    Granted when a user redeems a beta invite code — bypasses free-tier limits.
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN beta_access BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.beta_access IS 'Granted via beta invite code — bypasses free-tier Nest monthly message limits';

-- ---------------------------------------------------------------------------
-- 2. Nest usage logs
--    Lightweight one-row-per-API-call log used for free-tier limit enforcement.
--    Separate from chat_messages (which requires session management) so it
--    works with the current stateless Nest architecture.
-- ---------------------------------------------------------------------------
CREATE TABLE public.nest_usage_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.nest_usage_logs IS 'One row per Nest AI API call — used to count monthly messages for free-tier limit enforcement';

ALTER TABLE public.nest_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can read and insert their own logs; server uses user JWT
CREATE POLICY "nest_usage_logs: read own"
  ON public.nest_usage_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "nest_usage_logs: insert own"
  ON public.nest_usage_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Index for efficient monthly count queries (user_id + date range)
CREATE INDEX idx_nest_usage_logs_user_month
  ON public.nest_usage_logs(user_id, created_at DESC);
