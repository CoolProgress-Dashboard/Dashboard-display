-- Country Spotlights Table
-- Regional cooling market snapshots shown in the Overview pillar

CREATE TABLE IF NOT EXISTS country_spotlights (
  id                   SERIAL      PRIMARY KEY,
  spotlight_id         TEXT        NOT NULL UNIQUE,
  name                 TEXT        NOT NULL,
  region               TEXT,
  flag_emoji           TEXT,
  narrative            TEXT,
  meps_status          TEXT,       -- 'advanced', 'developing', 'minimal', 'none'
  dominant_refrigerant TEXT,
  key_challenge        TEXT,
  source               TEXT,
  stats                JSONB,      -- Array of {label, value, detail?}
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_country_spotlights_id ON country_spotlights (spotlight_id);

ALTER TABLE country_spotlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon reads" ON country_spotlights FOR SELECT USING (true);
