-- Peak Load Data Table
-- Share of cooling in peak electricity demand by country (baseline + 2050 projection)

CREATE TABLE IF NOT EXISTS peak_load_data (
  id               SERIAL      PRIMARY KEY,
  country          TEXT        NOT NULL,
  country_code     TEXT,
  baseline_year    INTEGER,
  baseline_percent INTEGER     NOT NULL,
  projected_year   INTEGER,
  projected_percent INTEGER,
  source           TEXT,
  is_global_avg    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peak_load_country ON peak_load_data (country_code);

ALTER TABLE peak_load_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon reads" ON peak_load_data FOR SELECT USING (true);
