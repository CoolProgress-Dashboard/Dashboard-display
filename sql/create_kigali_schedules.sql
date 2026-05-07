-- ============================================================
-- Kigali Amendment HFC Phase-Down Schedules (Annex F)
-- ============================================================
-- Table 1: Default schedules for the 4 official groups
-- Table 2: Country-level overrides (where a country has a
--          different first step or negotiated deviation)
-- ============================================================

-- ── Table 1: Group default schedules ─────────────────────────
CREATE TABLE IF NOT EXISTS kigali_group_schedules (
  group_type            TEXT PRIMARY KEY,
  group_display_name    TEXT NOT NULL,
  baseline_description  TEXT,
  -- Freeze (Article 5 groups only — NULL for Non-Article 5)
  freeze_year           INT,
  -- Reduction steps: pct = cumulative % reduction FROM baseline
  -- e.g. step1_pct = 10 means "10% below baseline" (90% allowed)
  step1_year            INT,  step1_pct NUMERIC,
  step2_year            INT,  step2_pct NUMERIC,
  step3_year            INT,  step3_pct NUMERIC,
  step4_year            INT,  step4_pct NUMERIC,
  step5_year            INT,  step5_pct NUMERIC  -- NULL for A5 groups (4 steps only)
);

-- ── Table 2: Country-level schedule overrides ────────────────
-- Only rows that deviate from the group default.
-- The app looks here first; falls back to kigali_group_schedules.
CREATE TABLE IF NOT EXISTS kigali_country_schedule_overrides (
  country_code          TEXT PRIMARY KEY,
  group_type            TEXT NOT NULL REFERENCES kigali_group_schedules(group_type),
  freeze_year           INT,
  step1_year            INT,  step1_pct NUMERIC,
  step2_year            INT,  step2_pct NUMERIC,
  step3_year            INT,  step3_pct NUMERIC,
  step4_year            INT,  step4_pct NUMERIC,
  step5_year            INT,  step5_pct NUMERIC,
  notes                 TEXT
);

-- ── Row Level Security (required for browser / anon-key reads) ────────────────
ALTER TABLE kigali_group_schedules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kigali_group_schedules' AND policyname='Allow anon reads') THEN
    CREATE POLICY "Allow anon reads" ON kigali_group_schedules FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE kigali_country_schedule_overrides ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kigali_country_schedule_overrides' AND policyname='Allow anon reads') THEN
    CREATE POLICY "Allow anon reads" ON kigali_country_schedule_overrides FOR SELECT USING (true);
  END IF;
END $$;
