-- =============================================================================
-- MindNest — Beta Access Expiry
-- Migration: 20260423000000_add_beta_expiry.sql
-- =============================================================================

-- Nullable — NULL means no expiry (manually granted beta access).
-- Set to now() + 60 days when a user redeems an invite code.
ALTER TABLE public.profiles
  ADD COLUMN beta_access_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.beta_access_expires_at IS 'Set to redemption time + 60 days when an invite code is redeemed; NULL = no expiry (manually granted)';
