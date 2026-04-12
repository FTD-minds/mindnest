-- =============================================================================
-- MindNest — Add pregnancy fields to profiles
-- Migration: 20260412000000_add_pregnancy_fields.sql
-- =============================================================================
-- 1. Adds pregnancy_week column for users who are expecting
-- 2. Expands parent_type CHECK constraint to include 'expecting'
-- =============================================================================

-- Add pregnancy_week column
ALTER TABLE public.profiles
  ADD COLUMN pregnancy_week INTEGER
    CHECK (pregnancy_week BETWEEN 1 AND 42);

COMMENT ON COLUMN public.profiles.pregnancy_week IS
  'Current week of pregnancy (1–42). Only set when parent_type = ''expecting''. NULL for all other parent types.';

-- Drop the existing parent_type check constraint and replace with expanded version
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_parent_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_parent_type_check
    CHECK (parent_type IN ('mom', 'dad', 'partner', 'expecting'));
