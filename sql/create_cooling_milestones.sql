-- Cooling Milestones Table
-- Key policy and market milestones in the history of cooling

CREATE TABLE IF NOT EXISTS cooling_milestones (
  id             SERIAL      PRIMARY KEY,
  year           INTEGER     NOT NULL,
  label          TEXT        NOT NULL,
  description    TEXT,
  appliance_type TEXT,       -- NULL = All, 'AC', 'DomRef', 'Fans'
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cooling_milestones_year ON cooling_milestones (year);

ALTER TABLE cooling_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon reads" ON cooling_milestones FOR SELECT USING (true);
