-- Appliance Timeseries Table
-- Global stock, energy, and emissions by appliance type, scenario, and year

CREATE TABLE IF NOT EXISTS appliance_timeseries (
  id                   SERIAL      PRIMARY KEY,
  year                 INTEGER     NOT NULL,
  appliance_type       TEXT        NOT NULL,  -- 'AC', 'DomRef', 'Fans'
  scenario             TEXT        NOT NULL,  -- 'BAU', 'DECARB'
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
CREATE POLICY "Allow anon reads" ON appliance_timeseries FOR SELECT USING (true);
