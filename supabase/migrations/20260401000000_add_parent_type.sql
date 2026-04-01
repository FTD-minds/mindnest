-- =============================================================================
-- MindNest — Add parent_type to profiles
-- Migration: 20260401000000_add_parent_type.sql
-- =============================================================================
-- Adds a parent_type field to profiles so Nest can personalise its language.
-- Values: 'mom', 'dad', 'partner' | NULL until set during onboarding.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN parent_type TEXT
    CHECK (parent_type IN ('mom', 'dad', 'partner'));

COMMENT ON COLUMN public.profiles.parent_type IS
  'How the user identifies as a parent. NULL until confirmed during onboarding. '
  'Used by Nest to personalise greetings and language (mama / papa / first name).';
