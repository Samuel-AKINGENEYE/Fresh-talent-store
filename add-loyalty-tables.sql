-- Loyalty Points System
CREATE TABLE IF NOT EXISTS loyalty_points (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS points_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  points INTEGER NOT NULL,
  type TEXT CHECK (type IN ('earned', 'redeemed', 'expired')),
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add points earned on purchase
CREATE OR REPLACE FUNCTION add_points_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- 1 point per 1000 RWF spent
  INSERT INTO points_transactions (user_id, points, type, description)
  VALUES (NEW.user_id, FLOOR(NEW.total / 1000), 'earned', 'Purchase order');
  
  UPDATE loyalty_points 
  SET points = points + FLOOR(NEW.total / 1000),
      tier = CASE 
        WHEN points + FLOOR(NEW.total / 1000) >= 10000 THEN 'platinum'
        WHEN points + FLOOR(NEW.total / 1000) >= 5000 THEN 'gold'
        WHEN points + FLOOR(NEW.total / 1000) >= 1000 THEN 'silver'
        ELSE 'bronze'
      END
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_points_trigger ON orders;
CREATE TRIGGER add_points_trigger AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION add_points_on_purchase();
