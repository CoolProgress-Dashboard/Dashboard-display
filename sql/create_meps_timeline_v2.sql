-- MEPS Level Timeline v2 Table
-- Source-verified MEPS values from the July 2026 review (presentation/meps-review-2026/).
-- Replaces the bundled meps_timeline.json data for the MEPS Stringency chart.
-- The v1 table (meps_level_timeline) and the v1 JSON fallback are intentionally
-- left untouched.
-- Data source: /src/lib/data/meps_timeline_v2.json
-- Calculations and references: /presentation/meps-review-2026/MEPS_Review_2026_Calculations.xlsx

CREATE TABLE IF NOT EXISTS meps_level_timeline_v2 (
  id SERIAL PRIMARY KEY,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  appliance_type TEXT NOT NULL,
  year INTEGER NOT NULL,
  meps_level_national NUMERIC,
  metric_name TEXT,
  meps_level_cspf_equiv NUMERIC,
  standard_version TEXT,
  is_projected BOOLEAN DEFAULT false,
  source TEXT,
  status TEXT,
  conversion TEXT,
  conversion_source TEXT,
  source_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_meps_v2_country ON meps_level_timeline_v2 (country_code);
CREATE INDEX IF NOT EXISTS idx_meps_v2_appliance ON meps_level_timeline_v2 (appliance_type);
CREATE INDEX IF NOT EXISTS idx_meps_v2_country_appliance ON meps_level_timeline_v2 (country_code, appliance_type);

-- Enable RLS but allow anonymous reads (dashboard uses the anon key)
ALTER TABLE meps_level_timeline_v2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon reads" ON meps_level_timeline_v2;
CREATE POLICY "Allow anon reads" ON meps_level_timeline_v2 FOR SELECT USING (true);
