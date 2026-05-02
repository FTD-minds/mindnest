-- Update category icons to match the design spec
UPDATE community_categories SET icon = '🧸' WHERE slug = 'toddler';
UPDATE community_categories SET icon = '🌙' WHERE slug = 'sleep';
UPDATE community_categories SET icon = '🥄' WHERE slug = 'feeding';
UPDATE community_categories SET icon = '⭐' WHERE slug = 'development';
