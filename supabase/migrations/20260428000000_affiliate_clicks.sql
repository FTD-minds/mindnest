-- Track clicks on affiliate products for analytics
CREATE TABLE affiliate_clicks (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES affiliate_products(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES profiles(id)           ON DELETE CASCADE NOT NULL,
  clicked_at timestamptz DEFAULT now()
);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Authenticated users can log their own clicks
CREATE POLICY "affiliate_clicks_insert_own" ON affiliate_clicks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only admins can read click data
CREATE POLICY "affiliate_clicks_admin_read" ON affiliate_clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
