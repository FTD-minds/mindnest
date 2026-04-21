-- =============================================================================
-- MindNest — Extend age range from 0–36 to 0–48 months (0–4 years)
-- Migration: 20260421000000_extend_age_to_48_months.sql
-- =============================================================================
-- 1. Raises max_age_months ceiling on daily_activities from 36 → 48
-- 2. Raises baby_age_months ceiling on community_posts from 36 → 48
-- 3. Raises age_months ceiling on developmental_milestones from 36 → 48
-- 4. Updates table comment on developmental_milestones
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. daily_activities.max_age_months — raise ceiling to 48
-- -----------------------------------------------------------------------------
ALTER TABLE public.daily_activities
  DROP CONSTRAINT IF EXISTS daily_activities_max_age_months_check;

ALTER TABLE public.daily_activities
  ADD CONSTRAINT daily_activities_max_age_months_check
    CHECK (max_age_months <= 48);

-- -----------------------------------------------------------------------------
-- 2. community_posts.baby_age_months — raise ceiling to 48
-- -----------------------------------------------------------------------------
ALTER TABLE public.community_posts
  DROP CONSTRAINT IF EXISTS community_posts_baby_age_months_check;

ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_baby_age_months_check
    CHECK (baby_age_months >= 0 AND baby_age_months <= 48);

-- -----------------------------------------------------------------------------
-- 3. developmental_milestones.age_months — raise ceiling to 48
-- -----------------------------------------------------------------------------
ALTER TABLE public.developmental_milestones
  DROP CONSTRAINT IF EXISTS developmental_milestones_age_months_check;

ALTER TABLE public.developmental_milestones
  ADD CONSTRAINT developmental_milestones_age_months_check
    CHECK (age_months >= 0 AND age_months <= 48);

-- -----------------------------------------------------------------------------
-- 4. Update table comment
-- -----------------------------------------------------------------------------
COMMENT ON TABLE public.developmental_milestones IS
  'Age-referenced developmental milestones for 0–48 months (0–4 years)';
