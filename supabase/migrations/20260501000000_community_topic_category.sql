-- ── Add category_type to community_categories ────────────────────────────────
ALTER TABLE community_categories
  ADD COLUMN IF NOT EXISTS category_type TEXT NOT NULL DEFAULT 'stage';

-- Mark the 4 stage categories (already default 'stage', but explicit)
UPDATE community_categories SET category_type = 'stage'
  WHERE slug IN ('pregnancy', 'newborn', 'baby', 'toddler');

-- Rename and mark the 5 topic categories
UPDATE community_categories
  SET name = 'Sleep Help',               icon = '😴', category_type = 'topic'
  WHERE slug = 'sleep';

UPDATE community_categories
  SET name = 'Feeding & Nutrition',      icon = '🌱', category_type = 'topic'
  WHERE slug = 'feeding';

UPDATE community_categories
  SET name = 'Milestones & Development', icon = '🧠', category_type = 'topic'
  WHERE slug = 'development';

UPDATE community_categories
  SET name = 'Postpartum & Self-Care',   icon = '💚', category_type = 'topic'
  WHERE slug = 'mental_health';

UPDATE community_categories
  SET name = 'Wins & Celebrations',      icon = '🎉', category_type = 'topic'
  WHERE slug = 'milestones';

-- ── Add optional topic_category_id to community_posts ─────────────────────────
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS topic_category_id uuid REFERENCES community_categories(id);
