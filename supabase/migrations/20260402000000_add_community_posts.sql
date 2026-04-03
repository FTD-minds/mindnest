-- =============================================================================
-- MindNest — Community Posts
-- Migration: 20260402000000_add_community_posts.sql
-- =============================================================================

CREATE TABLE public.community_posts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content          TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  baby_age_months  INTEGER     CHECK (baby_age_months >= 0 AND baby_age_months <= 36),
  likes_count      INTEGER     NOT NULL DEFAULT 0,
  nest_reply       TEXT,
  nest_replied_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.community_posts                  IS 'Parent community feed — wins, questions, and moments shared with the MindNest community';
COMMENT ON COLUMN public.community_posts.baby_age_months  IS 'Optional — age of baby when post was made, used for filtering and context';
COMMENT ON COLUMN public.community_posts.nest_reply       IS 'Nest AI encouragement reply — generated on post creation, stored to avoid re-calling Claude';
COMMENT ON COLUMN public.community_posts.likes_count      IS 'Denormalized like count — updated by trigger on community_post_likes insert/delete';

-- Likes join table
CREATE TABLE public.community_post_likes (
  user_id  UUID NOT NULL REFERENCES public.profiles(id)       ON DELETE CASCADE,
  post_id  UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

COMMENT ON TABLE public.community_post_likes IS 'One row per user per liked post — primary key prevents duplicate likes';

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.community_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_posts: authenticated read"
  ON public.community_posts FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "community_posts: insert own"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_posts: update own"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_posts: delete own"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "community_post_likes: all own"
  ON public.community_post_likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_post_likes: authenticated read"
  ON public.community_post_likes FOR SELECT
  TO authenticated
  USING (TRUE);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_community_posts_created_at
  ON public.community_posts(created_at DESC);

CREATE INDEX idx_community_posts_baby_age
  ON public.community_posts(baby_age_months)
  WHERE baby_age_months IS NOT NULL;

CREATE INDEX idx_community_post_likes_post_id
  ON public.community_post_likes(post_id);

-- ── Triggers ──────────────────────────────────────────────────────────────────

CREATE TRIGGER trg_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.sync_community_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_community_post_likes_sync
  AFTER INSERT OR DELETE ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_community_post_likes_count();
