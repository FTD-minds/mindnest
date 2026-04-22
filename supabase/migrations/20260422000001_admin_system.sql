-- =============================================================================
-- MindNest — Admin System
-- Migration: 20260422000001_admin_system.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extend profiles with admin fields
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN is_admin    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN admin_notes TEXT;

COMMENT ON COLUMN public.profiles.is_admin    IS 'Grants access to the /admin dashboard — set manually via Supabase Studio';
COMMENT ON COLUMN public.profiles.admin_notes IS 'Internal admin notes about this user — never shown to the user';

-- ---------------------------------------------------------------------------
-- 2. Security-definer helper — used in RLS policies without recursion
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Add admin read-all policy on profiles
--    (existing "profiles: select own" policy stays — Postgres ORs permissive policies)
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. invite_codes table
-- ---------------------------------------------------------------------------
CREATE TABLE public.invite_codes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT        NOT NULL UNIQUE,
  created_by  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_by     UUID        REFERENCES public.profiles(id)           ON DELETE SET NULL,
  used_at     TIMESTAMPTZ,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  beta_access BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.invite_codes            IS 'Beta invite codes — only admins can generate and view';
COMMENT ON COLUMN public.invite_codes.is_active  IS 'False = manually deactivated by admin; independent of used_by';
COMMENT ON COLUMN public.invite_codes.beta_access IS 'Whether this code grants beta feature access';

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can read or write invite codes
CREATE POLICY "invite_codes: admin only"
  ON public.invite_codes
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX idx_invite_codes_code       ON public.invite_codes(code);
CREATE INDEX idx_invite_codes_created_by ON public.invite_codes(created_by);
