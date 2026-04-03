-- =============================================================================
-- MindNest — Milestone Tracking
-- Migration: 20260403020000_milestone_tracking.sql
-- =============================================================================

CREATE TABLE public.developmental_milestones (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  age_months  INT         NOT NULL CHECK (age_months >= 0 AND age_months <= 36),
  brain_area  TEXT        NOT NULL CHECK (brain_area IN ('Language','Motor','Social-Emotional','Cognitive','Sensory')),
  milestone_title TEXT    NOT NULL,
  description TEXT        NOT NULL,
  how_to_support TEXT     NOT NULL,
  is_emerging BOOLEAN     NOT NULL DEFAULT FALSE,
  is_premium  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.developmental_milestones                IS 'Age-referenced developmental milestones for 0–36 months';
COMMENT ON COLUMN public.developmental_milestones.age_months     IS 'The month at which this milestone typically becomes observable';
COMMENT ON COLUMN public.developmental_milestones.is_emerging    IS 'True = actively emerging this month; false = coming soon on the horizon';
COMMENT ON COLUMN public.developmental_milestones.how_to_support IS 'Warm, practical guidance for parents — never comparative';

CREATE INDEX idx_milestones_age  ON public.developmental_milestones(age_months);
CREATE INDEX idx_milestones_area ON public.developmental_milestones(brain_area);

-- RLS: public read (milestones are global content, not per-user)
ALTER TABLE public.developmental_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_select_all" ON public.developmental_milestones
  FOR SELECT USING (true);

-- milestone_completions — tracks which milestones a baby has reached
CREATE TABLE public.milestone_completions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id      UUID        NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  milestone_id UUID        NOT NULL REFERENCES public.developmental_milestones(id) ON DELETE CASCADE,
  noted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (baby_id, milestone_id)
);

ALTER TABLE public.milestone_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestone_completions_user" ON public.milestone_completions
  USING (baby_id IN (SELECT id FROM public.babies WHERE user_id = auth.uid()))
  WITH CHECK (baby_id IN (SELECT id FROM public.babies WHERE user_id = auth.uid()));

CREATE INDEX idx_milestone_completions_baby ON public.milestone_completions(baby_id);
