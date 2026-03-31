-- =============================================================================
-- MindNest — Initial Database Schema
-- Migration: 20260331000000_initial_schema.sql
-- =============================================================================
-- Tables:
--   1. profiles              — mother's account profile
--   2. babies                — baby profile(s)
--   3. subscriptions         — Stripe subscription state
--   4. chat_sessions         — Nest AI conversation threads
--   5. chat_messages         — individual messages per session
--   6. activity_logs         — baby daily tracker (feeding/sleep/diaper/mood)
--   7. wellness_checkins      — mother's daily mental health check-in
--   8. daily_activities      — curated activity library (team-seeded content)
--   9. activity_completions  — tracks which activities a user has completed
-- =============================================================================


-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE subscription_plan AS ENUM (
  'monthly',
  'annual',
  'lifetime'
);

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused'
);

CREATE TYPE feeding_type AS ENUM (
  'breast',
  'bottle_breast_milk',
  'bottle_formula',
  'solid',
  'mixed'
);

CREATE TYPE diaper_type AS ENUM (
  'wet',
  'dirty',
  'both',
  'dry'
);

CREATE TYPE sleep_type AS ENUM (
  'nap',
  'night'
);

CREATE TYPE mood_level AS ENUM (
  'very_low',
  'low',
  'neutral',
  'good',
  'great'
);

CREATE TYPE wellness_symptom AS ENUM (
  'anxious',
  'exhausted',
  'overwhelmed',
  'lonely',
  'tearful',
  'irritable',
  'disconnected',
  'hopeful',
  'supported',
  'energized'
);

CREATE TYPE chat_role AS ENUM (
  'user',
  'assistant'
);

CREATE TYPE activity_log_type AS ENUM (
  'feeding',
  'sleep',
  'diaper',
  'mood',
  'note',
  'milestone'
);


-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles
-- One row per authenticated user. Auto-created on signup via trigger.
-- id matches auth.users.id exactly — no separate surrogate key.
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT        NOT NULL,
  full_name           TEXT        NOT NULL DEFAULT '',
  avatar_url          TEXT,
  onboarding_complete BOOLEAN     NOT NULL DEFAULT FALSE,
  timezone            TEXT        NOT NULL DEFAULT 'America/New_York',
  push_token          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.profiles                    IS 'Mother''s app profile — extends auth.users';
COMMENT ON COLUMN public.profiles.email              IS 'Denormalized from auth.users for query convenience';
COMMENT ON COLUMN public.profiles.timezone           IS 'IANA timezone string — used to resolve calendar dates for daily activity and check-in resets';
COMMENT ON COLUMN public.profiles.push_token         IS 'FCM/APNs push notification token — nullable until user grants permission';


-- -----------------------------------------------------------------------------
-- 2. babies
-- Baby profile. MVP targets one baby per user, but schema supports multiples.
-- -----------------------------------------------------------------------------
CREATE TABLE public.babies (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT    NOT NULL,
  date_of_birth DATE    NOT NULL,
  gender        TEXT    CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.babies               IS 'Baby profile — linked to a parent user';
COMMENT ON COLUMN public.babies.date_of_birth IS 'Used to compute baby age in months for activity age-gating';
COMMENT ON COLUMN public.babies.gender        IS 'Optional — CHECK constraint rather than enum because set is small and stable';


-- -----------------------------------------------------------------------------
-- 3. subscriptions
-- One row per user. All mutations via Stripe webhook (service_role key only).
-- -----------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
  id                      UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID                NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT                NOT NULL UNIQUE,
  stripe_subscription_id  TEXT                UNIQUE,
  stripe_price_id         TEXT                NOT NULL,
  plan                    subscription_plan   NOT NULL,
  status                  subscription_status NOT NULL DEFAULT 'active',
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN             NOT NULL DEFAULT FALSE,
  canceled_at             TIMESTAMPTZ,
  trial_start             TIMESTAMPTZ,
  trial_end               TIMESTAMPTZ,
  created_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.subscriptions                     IS 'Stripe subscription state — mutated only by webhook handler via service_role';
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'NULL for lifetime plan — lifetime is a one-time PaymentIntent, not a Stripe Subscription';
COMMENT ON COLUMN public.subscriptions.current_period_end  IS 'Access check: status = active AND (plan = lifetime OR current_period_end > NOW())';


-- -----------------------------------------------------------------------------
-- 4. chat_sessions
-- A conversation thread between the mother and Nest.
-- -----------------------------------------------------------------------------
CREATE TABLE public.chat_sessions (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count   INTEGER     NOT NULL DEFAULT 0,
  is_archived     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.chat_sessions                  IS 'Nest AI conversation threads';
COMMENT ON COLUMN public.chat_sessions.title            IS 'Auto-set from first message content after AI response; user-editable';
COMMENT ON COLUMN public.chat_sessions.last_message_at  IS 'Denormalized — updated by trigger on chat_messages insert; used for session list ordering';
COMMENT ON COLUMN public.chat_sessions.message_count    IS 'Denormalized counter — updated by trigger; avoids COUNT(*) on every session list render';


-- -----------------------------------------------------------------------------
-- 5. chat_messages
-- Individual messages within a session. Immutable after insert.
-- -----------------------------------------------------------------------------
CREATE TABLE public.chat_messages (
  id             UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID      NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id        UUID      NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role           chat_role NOT NULL,
  content        TEXT      NOT NULL,
  input_tokens   INTEGER,
  output_tokens  INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.chat_messages               IS 'Immutable message log for Nest AI conversations';
COMMENT ON COLUMN public.chat_messages.user_id       IS 'Denormalized from session — enables RLS without a join to chat_sessions';
COMMENT ON COLUMN public.chat_messages.input_tokens  IS 'Claude API usage — populated for assistant role messages only; NULL for user messages';
COMMENT ON COLUMN public.chat_messages.output_tokens IS 'Claude API usage — used for per-user cost monitoring';


-- -----------------------------------------------------------------------------
-- 6. activity_logs
-- Polymorphic daily baby tracker. Single table covers feeding, sleep, diaper,
-- mood, notes, and milestones. Sparse columns discriminated by log_type.
-- Append-only — corrections are new entries, not updates.
-- -----------------------------------------------------------------------------
CREATE TABLE public.activity_logs (
  id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID              NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  baby_id     UUID              NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  log_type    activity_log_type NOT NULL,
  logged_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  -- Feeding (log_type = 'feeding')
  feeding_type         feeding_type,
  feeding_duration_min INTEGER      CHECK (feeding_duration_min > 0),
  feeding_amount_ml    NUMERIC(6,1) CHECK (feeding_amount_ml > 0),

  -- Sleep (log_type = 'sleep')
  sleep_type          sleep_type,
  sleep_start         TIMESTAMPTZ,
  sleep_end           TIMESTAMPTZ,
  sleep_duration_min  INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN sleep_start IS NOT NULL AND sleep_end IS NOT NULL
      THEN EXTRACT(EPOCH FROM (sleep_end - sleep_start))::INTEGER / 60
      ELSE NULL
    END
  ) STORED,

  -- Diaper (log_type = 'diaper')
  diaper_type diaper_type,

  -- Mood / Note (log_type = 'mood' or 'note')
  mood_score  INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  note_text   TEXT,

  -- Milestone (log_type = 'milestone')
  milestone_title     TEXT,
  milestone_photo_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_sleep_order CHECK (sleep_end IS NULL OR sleep_start IS NULL OR sleep_end >= sleep_start)
);

COMMENT ON TABLE  public.activity_logs                  IS 'Polymorphic daily baby tracking log — feeding, sleep, diaper, mood, notes, milestones';
COMMENT ON COLUMN public.activity_logs.logged_at        IS 'Semantic event time (when it happened); created_at is insert time (when it was logged)';
COMMENT ON COLUMN public.activity_logs.sleep_duration_min IS 'Computed column — derived from sleep_start and sleep_end; never written directly';
COMMENT ON COLUMN public.activity_logs.note_text        IS 'Used as note body for log_type=note and as optional annotation for log_type=mood';


-- -----------------------------------------------------------------------------
-- 7. wellness_checkins
-- One check-in per mother per calendar day. Tracks maternal wellbeing.
-- UNIQUE (user_id, checkin_date) enforces the one-per-day constraint.
-- App layer uses INSERT ... ON CONFLICT DO UPDATE for same-day re-submissions.
-- -----------------------------------------------------------------------------
CREATE TABLE public.wellness_checkins (
  id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID              NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date        DATE              NOT NULL,
  mood                mood_level        NOT NULL,
  energy_level        INTEGER           NOT NULL CHECK (energy_level BETWEEN 1 AND 5),
  sleep_hours         NUMERIC(4,1)      CHECK (sleep_hours BETWEEN 0 AND 24),
  symptoms            wellness_symptom[] NOT NULL DEFAULT '{}',
  journal_text        TEXT,
  ai_response         TEXT,
  ai_response_sent_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, checkin_date)
);

COMMENT ON TABLE  public.wellness_checkins                   IS 'Mother''s daily mental health and wellbeing check-in — one row per user per day';
COMMENT ON COLUMN public.wellness_checkins.checkin_date      IS 'Calendar date in user''s local timezone — resolved on app layer before insert';
COMMENT ON COLUMN public.wellness_checkins.symptoms          IS 'Multi-select symptom array — wellness_symptom enum[]';
COMMENT ON COLUMN public.wellness_checkins.sleep_hours       IS 'Mother''s own sleep — distinct from baby sleep logs in activity_logs';
COMMENT ON COLUMN public.wellness_checkins.ai_response       IS 'Nest''s personalized reply stored here — avoids re-calling Claude API on re-read';


-- -----------------------------------------------------------------------------
-- 8. daily_activities
-- Curated baby development activity library. Team-seeded, not user-generated.
-- Read-only for all clients. Mutations via Supabase dashboard or server scripts.
-- -----------------------------------------------------------------------------
CREATE TABLE public.daily_activities (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT    NOT NULL,
  description      TEXT    NOT NULL,
  instructions     TEXT    NOT NULL,
  min_age_months   INTEGER NOT NULL CHECK (min_age_months >= 0),
  max_age_months   INTEGER NOT NULL CHECK (max_age_months <= 36),
  duration_min     INTEGER NOT NULL CHECK (duration_min > 0),
  brain_area       TEXT    NOT NULL,
  materials_needed TEXT[]  NOT NULL DEFAULT '{}',
  is_premium       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_age_range CHECK (min_age_months <= max_age_months)
);

COMMENT ON TABLE  public.daily_activities               IS 'Curated baby development activity library — seeded by team, read-only for all clients';
COMMENT ON COLUMN public.daily_activities.brain_area    IS 'Development domain (e.g. Language, Motor, Social-Emotional) — TEXT not enum to allow taxonomy evolution';
COMMENT ON COLUMN public.daily_activities.is_premium    IS 'Premium-gated activities — free tier limited to is_premium = FALSE';
COMMENT ON COLUMN public.daily_activities.instructions  IS 'Full step-by-step activity instructions shown to the user';


-- -----------------------------------------------------------------------------
-- 9. activity_completions
-- Tracks which activities a user has completed and when.
-- Drives the free tier gate (3 per day) and recommendation recency filter.
-- -----------------------------------------------------------------------------
CREATE TABLE public.activity_completions (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  baby_id         UUID    NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  activity_id     UUID    NOT NULL REFERENCES public.daily_activities(id) ON DELETE CASCADE,
  completed_date  DATE    NOT NULL,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, activity_id, completed_date)
);

COMMENT ON TABLE  public.activity_completions                IS 'Activity completion log — drives free tier gate and recommendation recency filter';
COMMENT ON COLUMN public.activity_completions.completed_date IS 'Calendar date in user''s timezone — resolved on app layer; used for daily count gate';
COMMENT ON COLUMN public.activity_completions.rating         IS 'Optional 1–5 post-activity rating — nullable';


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.babies               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_checkins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_completions ENABLE ROW LEVEL SECURITY;


-- profiles: read + update own row only
-- INSERT is handled by the handle_new_user trigger — no client INSERT policy
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- babies: full access to own rows
CREATE POLICY "babies: all own"
  ON public.babies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- subscriptions: read own row only
-- All INSERT/UPDATE/DELETE goes through Stripe webhook handler using service_role (bypasses RLS)
CREATE POLICY "subscriptions: select own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);


-- chat_sessions: full access to own rows
CREATE POLICY "chat_sessions: all own"
  ON public.chat_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- chat_messages: full access to own rows
CREATE POLICY "chat_messages: all own"
  ON public.chat_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- activity_logs: full access to own rows
CREATE POLICY "activity_logs: all own"
  ON public.activity_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- wellness_checkins: full access to own rows
CREATE POLICY "wellness_checkins: all own"
  ON public.wellness_checkins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- daily_activities: any authenticated user can READ active activities
-- No client INSERT/UPDATE/DELETE — managed via Supabase dashboard or server scripts
CREATE POLICY "daily_activities: authenticated read"
  ON public.daily_activities FOR SELECT
  TO authenticated
  USING (is_active = TRUE);


-- activity_completions: full access to own rows
CREATE POLICY "activity_completions: all own"
  ON public.activity_completions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- INDEXES
-- =============================================================================

-- babies: look up all babies for a user
CREATE INDEX idx_babies_user_id
  ON public.babies(user_id);

-- subscriptions: subscription check on every authenticated page load
CREATE INDEX idx_subscriptions_user_id
  ON public.subscriptions(user_id);

-- subscriptions: Stripe webhook handler lookups
CREATE INDEX idx_subscriptions_stripe_customer_id
  ON public.subscriptions(stripe_customer_id);

CREATE INDEX idx_subscriptions_stripe_subscription_id
  ON public.subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- chat_sessions: session list sorted by most recent message, excluding archived
CREATE INDEX idx_chat_sessions_user_id_last_message
  ON public.chat_sessions(user_id, last_message_at DESC)
  WHERE is_archived = FALSE;

-- chat_messages: load all messages in a session in chronological order
CREATE INDEX idx_chat_messages_session_id_created
  ON public.chat_messages(session_id, created_at ASC);

-- activity_logs: daily tracker view — all logs for a baby ordered by event time
CREATE INDEX idx_activity_logs_baby_id_logged_at
  ON public.activity_logs(baby_id, logged_at DESC);

-- activity_logs: user-level analytics and export
CREATE INDEX idx_activity_logs_user_id_logged_at
  ON public.activity_logs(user_id, logged_at DESC);

-- wellness_checkins: check-in history in reverse chronological order
CREATE INDEX idx_wellness_checkins_user_id_date
  ON public.wellness_checkins(user_id, checkin_date DESC);

-- daily_activities: age-range query — find activities matching baby's current age
CREATE INDEX idx_daily_activities_age_range
  ON public.daily_activities(min_age_months, max_age_months)
  WHERE is_active = TRUE;

-- activity_completions: free tier gate — count completions for a user today
CREATE INDEX idx_activity_completions_user_date
  ON public.activity_completions(user_id, completed_date DESC);

-- activity_completions: recency filter — avoid repeating activities completed in last 7 days
CREATE INDEX idx_activity_completions_baby_date
  ON public.activity_completions(baby_id, completed_date DESC);


-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger function: set_updated_at
-- Automatically updates updated_at on any row update.
-- Applied to all tables with an updated_at column.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_babies_updated_at
  BEFORE UPDATE ON public.babies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_wellness_checkins_updated_at
  BEFORE UPDATE ON public.wellness_checkins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_daily_activities_updated_at
  BEFORE UPDATE ON public.daily_activities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------------------
-- Trigger function: handle_new_user
-- Auto-creates a profiles row immediately after a new auth.users row is inserted.
-- SECURITY DEFINER: required to write to public schema from auth schema trigger.
-- SET search_path = public: prevents search path injection.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- -----------------------------------------------------------------------------
-- Trigger function: sync_chat_session_on_message
-- On every new message insert, updates the parent session's:
--   - last_message_at (for session list ordering in UI)
--   - message_count   (avoids COUNT(*) on session list queries)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_chat_session_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.chat_sessions
  SET
    last_message_at = NEW.created_at,
    message_count   = message_count + 1,
    updated_at      = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_chat_messages_sync_session
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.sync_chat_session_on_message();
