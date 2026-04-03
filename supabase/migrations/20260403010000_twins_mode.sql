-- =============================================================================
-- MindNest — Twins Mode
-- Migration: 20260403010000_twins_mode.sql
-- =============================================================================

-- ── Twins support on babies ───────────────────────────────────────────────────

ALTER TABLE public.babies
  ADD COLUMN is_twin         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN twin_sibling_id UUID    REFERENCES public.babies(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.babies.is_twin         IS 'True when this baby is part of a twin pair';
COMMENT ON COLUMN public.babies.twin_sibling_id IS 'FK to the other baby in the twin pair — set on both rows bidirectionally';

CREATE INDEX idx_babies_twin_sibling_id
  ON public.babies(twin_sibling_id)
  WHERE twin_sibling_id IS NOT NULL;

-- ── Tags on daily_activities ──────────────────────────────────────────────────

ALTER TABLE public.daily_activities
  ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.daily_activities.tags IS
  'Free-form tags for filtering — e.g. ARRAY[''twins''] for twin-specific activities';

CREATE INDEX idx_daily_activities_tags
  ON public.daily_activities USING GIN(tags)
  WHERE is_active = TRUE;
