-- =============================================================================
-- MindNest — Prenatal Activities Support
-- Migration: 20260416000000_add_prenatal_activities.sql
-- =============================================================================
-- 1. Adds content_type column to daily_activities ('baby' | 'prenatal')
--    Default 'baby' so all existing rows are unaffected.
-- 2. Adds trimester column (1, 2, or 3) — nullable, only set for prenatal rows.
-- 3. Adds index on (content_type, trimester) for fast prenatal feed queries.
-- =============================================================================

ALTER TABLE public.daily_activities
  ADD COLUMN content_type TEXT NOT NULL DEFAULT 'baby'
    CHECK (content_type IN ('baby', 'prenatal')),
  ADD COLUMN trimester INTEGER
    CHECK (trimester IN (1, 2, 3));

COMMENT ON COLUMN public.daily_activities.content_type IS
  'baby = postnatal activity for 0–36 month olds; prenatal = activity for expecting parents';

COMMENT ON COLUMN public.daily_activities.trimester IS
  'Trimester (1, 2, or 3) — only populated when content_type = ''prenatal''. NULL for all baby activities.';

CREATE INDEX idx_daily_activities_content_type_trimester
  ON public.daily_activities(content_type, trimester)
  WHERE is_active = TRUE;
