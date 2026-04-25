-- =============================================================================
-- MindNest — Community redesign
-- Migration: 20260424000000_community_redesign.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extend community_posts
-- ---------------------------------------------------------------------------
ALTER TABLE public.community_posts
  ADD COLUMN age_group      TEXT,
  ADD COLUMN post_type      TEXT NOT NULL DEFAULT 'moment'
    CHECK (post_type IN ('moment', 'question', 'milestone')),
  ADD COLUMN reactions      JSONB NOT NULL
    DEFAULT '{"heart": 0, "me_too": 0, "sending_love": 0}',
  ADD COLUMN is_memory_card BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN milestone_id   UUID REFERENCES public.developmental_milestones(id)
    ON DELETE SET NULL,
  ADD COLUMN is_approved    BOOLEAN NOT NULL DEFAULT false;

-- Back-fill: approve all existing posts so nothing disappears
UPDATE public.community_posts SET is_approved = true;

CREATE INDEX idx_community_posts_age_group  ON public.community_posts(age_group);
CREATE INDEX idx_community_posts_is_approved ON public.community_posts(is_approved);
CREATE INDEX idx_community_posts_memory     ON public.community_posts(is_memory_card)
  WHERE is_memory_card = true;

-- ---------------------------------------------------------------------------
-- 2. community_reactions
-- ---------------------------------------------------------------------------
CREATE TABLE public.community_reactions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID        NOT NULL
    REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT        NOT NULL
    CHECK (reaction_type IN ('heart', 'me_too', 'sending_love')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, reaction_type)
);

ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_reactions: authenticated read"
  ON public.community_reactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "community_reactions: insert own"
  ON public.community_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_reactions: delete own"
  ON public.community_reactions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_community_reactions_post    ON public.community_reactions(post_id);
CREATE INDEX idx_community_reactions_user    ON public.community_reactions(user_id);

-- ---------------------------------------------------------------------------
-- 3. affiliate_products
-- ---------------------------------------------------------------------------
CREATE TABLE public.affiliate_products (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT        NOT NULL,
  description    TEXT,
  image_url      TEXT,
  affiliate_url  TEXT        NOT NULL,
  age_min_months INTEGER     NOT NULL DEFAULT 0,
  age_max_months INTEGER     NOT NULL DEFAULT 48,
  category       TEXT,
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active products
CREATE POLICY "affiliate_products: authenticated read"
  ON public.affiliate_products FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Admin can read all (including inactive) and write
CREATE POLICY "affiliate_products: admin all"
  ON public.affiliate_products FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX idx_affiliate_products_active ON public.affiliate_products(is_active, age_min_months, age_max_months);
