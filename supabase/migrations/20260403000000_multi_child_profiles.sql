-- =============================================================================
-- MindNest — Multi-child profiles
-- Migration: 20260403000000_multi_child_profiles.sql
-- =============================================================================

-- Track which baby is currently "active" in the dashboard
ALTER TABLE public.profiles
  ADD COLUMN selected_baby_id UUID REFERENCES public.babies(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.selected_baby_id IS
  'The baby currently selected in the dashboard switcher. NULL = auto-select first baby.';

-- ── Enforce maximum of 6 babies per user ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.enforce_max_babies()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM public.babies
    WHERE user_id = NEW.user_id
  ) >= 6 THEN
    RAISE EXCEPTION 'You can add a maximum of 6 children per account.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_max_babies
  BEFORE INSERT ON public.babies
  FOR EACH ROW EXECUTE FUNCTION public.enforce_max_babies();
