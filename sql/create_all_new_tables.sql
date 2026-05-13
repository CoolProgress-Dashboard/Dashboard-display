-- ============================================================
-- CoolProgress: Create all 5 new tables
-- Run this in Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1. AC Growth Data
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ac_growth_data' AND policyname='Allow anon reads') THEN
    CREATE POLICY "Allow anon reads" ON ac_growth_data FOR SELECT USING (true);
  END IF;
END $$;

-- 2. Cooling Milestones
CREATE TABLE IF NOT EXISTS cooling_milestones (
  id             SERIAL      PRIMARY KEY,
  year           INTEGER     NOT NULL,
  label          TEXT        NOT NULL,
  description    TEXT,
  appliance_type TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cooling_milestones_year ON cooling_milestones (year);
ALTER TABLE cooling_milestones ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cooling_milestones' AND policyname='Allow anon reads') THEN
    CREATE POLICY "Allow anon reads" ON cooling_milestones FOR SELECT USING (true);
  END IF;
END $$;

-- 3. Appliance Timeseries
CREATE TABLE IF NOT EXISTS appliance_timeseries (
  id                   SERIAL      PRIMARY KEY,
  year                 INTEGER     NOT NULL,
  appliance_type       TEXT        NOT NULL,
  scenario             TEXT        NOT NULL,
  stock_millions       INTEGER     NOT NULL,
  energy_twh           INTEGER     NOT NULL,
  indirect_emission_mt INTEGER     NOT NULL,
  direct_emission_mt   INTEGER     NOT NULL,
  total_emission_mt    INTEGER     NOT NULL,
  is_projected         BOOLEAN     NOT NULL DEFAULT FALSE,
  source               TEXT,
  source_url           TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_ts_year     ON appliance_timeseries (year);
CREATE INDEX IF NOT EXISTS idx_app_ts_type     ON appliance_timeseries (appliance_type);
CREATE INDEX IF NOT EXISTS idx_app_ts_scenario ON appliance_timeseries (scenario);
ALTER TABLE appliance_timeseries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='appliance_timeseries' AND policyname='Allow anon reads') THEN
    CREATE POLICY "Allow anon reads" ON appliance_timeseries FOR SELECT USING (true);
  END IF;
END $$;

-- 4. Peak Load Data
CREATE TABLE IF NOT EXISTS peak_load_data (
  id                SERIAL      PRIMARY KEY,
  country           TEXT        NOT NULL,
  country_code      TEXT,
  baseline_year     INTEGER,
  baseline_percent  INTEGER     NOT NULL,
  projected_year    INTEGER,
  projected_percent INTEGER,
  source            TEXT,
  is_global_avg     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_peak_load_country ON peak_load_data (country_code);
ALTER TABLE peak_load_data ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='peak_load_data' AND policyname='Allow anon reads') THEN
    CREATE POLICY "Allow anon reads" ON peak_load_data FOR SELECT USING (true);
  END IF;
END $$;

-- 5. Country Spotlights
CREATE TABLE IF NOT EXISTS country_spotlights (
  id                   SERIAL      PRIMARY KEY,
  spotlight_id         TEXT        NOT NULL UNIQUE,
  name                 TEXT        NOT NULL,
  region               TEXT,
  flag_emoji           TEXT,
  narrative            TEXT,
  meps_status          TEXT,
  dominant_refrigerant TEXT,
  key_challenge        TEXT,
  source               TEXT,
  stats                JSONB,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_country_spotlights_id ON country_spotlights (spotlight_id);
ALTER TABLE country_spotlights ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='country_spotlights' AND policyname='Allow anon reads') THEN
    CREATE POLICY "Allow anon reads" ON country_spotlights FOR SELECT USING (true);
  END IF;
END $$;

-- Done!
SELECT 'All 5 tables created successfully' AS status;
