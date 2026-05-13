-- AC Growth Data Table
-- Global AC stock 1990-2050 (historical + IEA baseline projection)

CREATE TABLE IF NOT EXISTS ac_growth_data (
  id             SERIAL      PRIMARY KEY,
  year           INTEGER     NOT NULL,
  stock_millions INTEGER     NOT NULL,
  is_projected   BOOLEAN     NOT NULL DEFAULT FALSE,
  source         TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ac_growth_year ON ac_growth_data (year);

ALTER TABLE ac_growth_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon reads" ON ac_growth_data FOR SELECT USING (true);
