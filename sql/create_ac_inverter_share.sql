-- AC Inverter vs Non-Inverter Share Table
-- Tracks inverter penetration of SPLIT AC markets by country and year
-- Source: AC_SplitInverter_Share.py (v2 Deep Research Update)
--
-- country_code uses ISO Alpha-3 codes.
-- Soft reference to countries(country_code); no hard FK because:
--   (a) regional aggregates have no ISO code (country_code = NULL)
--   (b) the countries table may not exist yet when this runs

CREATE TABLE IF NOT EXISTS ac_inverter_share (
  id                   SERIAL      PRIMARY KEY,
  region               TEXT        NOT NULL,          -- e.g. 'Asia – Advanced', 'Europe', 'Global'
  country_code         TEXT,                          -- ISO Alpha-3; NULL for regional aggregates
  country_name         TEXT        NOT NULL,          -- clean display name
  year_label           TEXT        NOT NULL,          -- human label e.g. '2022–23', 'pre-2022'
  year_start           INTEGER,                       -- first year of period (NULL if unknown)
  year_end             INTEGER,                       -- last year of period (NULL = open-ended)
  inverter_pct         NUMERIC(5,2),                  -- numeric midpoint e.g. 67.00
  inverter_label       TEXT,                          -- original label e.g. '~67% (est.)'
  non_inverter_pct     NUMERIC(5,2),
  non_inverter_label   TEXT,
  confidence           TEXT,                          -- 'High','Medium','Low-Medium','Low','Forecast','Estimate'
  is_estimate          BOOLEAN     DEFAULT FALSE,     -- TRUE if derived / approximate
  scope_notes          TEXT,                          -- methodology notes from source
  source_name          TEXT,
  source_url           TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ac_inv_country  ON ac_inverter_share (country_code);
CREATE INDEX IF NOT EXISTS idx_ac_inv_region   ON ac_inverter_share (region);
CREATE INDEX IF NOT EXISTS idx_ac_inv_year     ON ac_inverter_share (year_start);
CREATE INDEX IF NOT EXISTS idx_ac_inv_conf     ON ac_inverter_share (confidence);

-- Enable RLS — allow anonymous reads (same pattern as other dashboard tables)
ALTER TABLE ac_inverter_share ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon reads" ON ac_inverter_share FOR SELECT USING (true);
