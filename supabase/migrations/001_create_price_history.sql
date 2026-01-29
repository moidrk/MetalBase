-- Create price_history table for storing historical metal prices
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  gold_usd DECIMAL(10, 2) NOT NULL,
  gold_pkr DECIMAL(12, 2) NOT NULL,
  silver_usd DECIMAL(10, 2) NOT NULL,
  silver_pkr DECIMAL(12, 2) NOT NULL,
  exchange_rate DECIMAL(10, 4) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date DESC);

-- Enable RLS on price_history
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- RLS policy: Anyone can read price history (public data)
CREATE POLICY "Anyone can read price history" ON price_history
  FOR SELECT USING (true);

-- RLS policy: Only authenticated users can insert price history
CREATE POLICY "Authenticated users can insert price history" ON price_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS policy: Only authenticated users can update price history
CREATE POLICY "Authenticated users can update price history" ON price_history
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS policy: Only authenticated users can delete price history
CREATE POLICY "Authenticated users can delete price history" ON price_history
  FOR DELETE USING (auth.role() = 'authenticated');
