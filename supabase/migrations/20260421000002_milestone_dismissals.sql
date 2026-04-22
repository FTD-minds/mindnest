-- =============================================================================
-- MindNest — Milestone Dismissals
-- Migration: 20260421000002_milestone_dismissals.sql
-- =============================================================================
-- Allows parents to dismiss a flagged milestone as "not applicable" without
-- marking it as noted. Dismissed milestones are hidden from the
-- "Worth a closer look" section but never counted as completed.
-- =============================================================================

CREATE TABLE public.milestone_dismissals (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id      UUID        NOT NULL REFERENCES public.babies(id)                   ON DELETE CASCADE,
  milestone_id UUID        NOT NULL REFERENCES public.developmental_milestones(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (baby_id, milestone_id)
);

COMMENT ON TABLE  public.milestone_dismissals              IS 'Milestones a parent has dismissed as not applicable — hidden from the therapy flag section without counting as noted';
COMMENT ON COLUMN public.milestone_dismissals.dismissed_at IS 'When the parent dismissed this milestone';

ALTER TABLE public.milestone_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "milestone_dismissals_user" ON public.milestone_dismissals
  USING  (baby_id IN (SELECT id FROM public.babies WHERE user_id = auth.uid()))
  WITH CHECK (baby_id IN (SELECT id FROM public.babies WHERE user_id = auth.uid()));

CREATE INDEX idx_milestone_dismissals_baby ON public.milestone_dismissals(baby_id);
