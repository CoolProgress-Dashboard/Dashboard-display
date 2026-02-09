-- MEPS Level Timeline Table
-- Stores historical and projected MEPS levels for tracking progress over time
-- Source: /data/meps_timeline.json

CREATE TABLE IF NOT EXISTS meps_level_timeline (
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_meps_timeline_country ON meps_level_timeline (country_code);
CREATE INDEX idx_meps_timeline_appliance ON meps_level_timeline (appliance_type);
CREATE INDEX idx_meps_timeline_year ON meps_level_timeline (year);
CREATE INDEX idx_meps_timeline_country_appliance ON meps_level_timeline (country_code, appliance_type);

-- Enable RLS but allow anonymous reads
ALTER TABLE meps_level_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon reads" ON meps_level_timeline FOR SELECT USING (true);
