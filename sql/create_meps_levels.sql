-- MEPS Levels Table
-- Stores current MEPS data for each country/appliance combination
-- Source: /data/meps_levels.json

CREATE TABLE IF NOT EXISTS meps_levels (
  id SERIAL PRIMARY KEY,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  appliance_type TEXT NOT NULL,        -- 'AC', 'Refrigerator', 'Fan'
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  cspf_equivalent NUMERIC,
  eei_equivalent NUMERIC,
  year_adopted INTEGER,
  year_revised INTEGER,
  year_planned_update INTEGER,
  is_mandatory BOOLEAN DEFAULT true,
  standard_name TEXT,
  requirement_level TEXT DEFAULT 'minimum',
  notes TEXT,
  u4e_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_meps_levels_country ON meps_levels (country_code);
CREATE INDEX idx_meps_levels_appliance ON meps_levels (appliance_type);
CREATE INDEX idx_meps_levels_country_appliance ON meps_levels (country_code, appliance_type);

-- Enable RLS but allow anonymous reads
ALTER TABLE meps_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon reads" ON meps_levels FOR SELECT USING (true);
