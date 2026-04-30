-- ── Community categories ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_categories (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL,
  icon       text NOT NULL,
  slug       text UNIQUE NOT NULL,
  sort_order int  DEFAULT 0
);

ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "community_categories_read" ON community_categories
  FOR SELECT TO authenticated USING (true);

-- Seed 9 categories
INSERT INTO community_categories (name, icon, slug, sort_order) VALUES
  ('Pregnancy',     '🤰', 'pregnancy',     1),
  ('Newborn',       '👶', 'newborn',        2),
  ('Baby',          '🍼', 'baby',           3),
  ('Toddler',       '🧒', 'toddler',        4),
  ('Sleep',         '😴', 'sleep',          5),
  ('Feeding',       '🌱', 'feeding',        6),
  ('Development',   '🧠', 'development',    7),
  ('Mental Health', '💚', 'mental_health',  8),
  ('Milestones',    '⭐', 'milestones',     9)
ON CONFLICT (slug) DO NOTHING;

-- ── Add category_id and comment_count to community_posts ──────────────────────
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS category_id   uuid REFERENCES community_categories(id),
  ADD COLUMN IF NOT EXISTS comment_count int  DEFAULT 0;

-- ── Community comments ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_comments (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     uuid    REFERENCES community_posts(id)    ON DELETE CASCADE NOT NULL,
  user_id     uuid    REFERENCES profiles(id)           ON DELETE CASCADE NOT NULL,
  parent_id   uuid    REFERENCES community_comments(id) ON DELETE CASCADE,
  content     text    NOT NULL CHECK (char_length(content) <= 500),
  reactions   jsonb   DEFAULT '{"heart":0,"me_too":0,"sending_love":0}',
  is_approved boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "community_comments_select_approved" ON community_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY IF NOT EXISTS "community_comments_insert_own" ON community_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── Comment reactions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comment_reactions (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id    uuid REFERENCES community_comments(id) ON DELETE CASCADE NOT NULL,
  user_id       uuid REFERENCES profiles(id)           ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL,
  UNIQUE (comment_id, user_id, reaction_type)
);

ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "comment_reactions_read" ON comment_reactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "comment_reactions_insert_own" ON comment_reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "comment_reactions_delete_own" ON comment_reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
