/**
 * setup_new_tables.mjs
 * Creates 5 new Supabase tables and populates them with all data.
 * Run with: node scripts/setup_new_tables.mjs
 */

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const PROJECT_REF  = 'hcpmdkkavtadgugrqohl';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcG1ka2thdnRhZGd1Z3Jxb2hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NzAzMCwiZXhwIjoyMDc3ODYzMDMwfQ.IXva9FwJXRewZ3n0DGq10gw44zGip7CDB7V-yUUX6Zw';

// ─── SQL helpers ─────────────────────────────────────────────────────────────

async function execSQL(sql) {
  // Try Supabase Management API first (supports service role key)
  const mgmtRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (mgmtRes.ok) {
    return { ok: true, via: 'management-api' };
  }

  const mgmtErr = await mgmtRes.text();

  // Fall back: Supabase internal pg endpoint
  const pgRes = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (pgRes.ok) {
    return { ok: true, via: 'pg-endpoint' };
  }

  const pgErr = await pgRes.text();
  return { ok: false, mgmtErr, pgErr };
}

async function createTable(name, ddl) {
  process.stdout.write(`  Creating ${name}... `);
  const result = await execSQL(ddl);
  if (result.ok) {
    console.log(`✓ (via ${result.via})`);
    return true;
  }
  // If table already exists that's fine — check by trying to SELECT from it
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/${name}?limit=1`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  );
  if (checkRes.ok) {
    console.log(`✓ (already exists)`);
    return true;
  }
  console.log(`✗ FAILED`);
  console.error(`    Management API: ${result.mgmtErr?.slice(0, 200)}`);
  console.error(`    PG endpoint:    ${result.pgErr?.slice(0, 200)}`);
  return false;
}

// ─── INSERT helper ────────────────────────────────────────────────────────────

async function insertBatch(table, rows, batchSize = 50) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Insert into ${table} failed (batch ${Math.floor(i/batchSize)+1}): ${res.status} ${err}`);
    }
    inserted += batch.length;
  }
  return inserted;
}

// ─── DDL statements ───────────────────────────────────────────────────────────

const DDL = {
  ac_growth_data: `
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
  `,
  cooling_milestones: `
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
  `,
  appliance_timeseries: `
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
  `,
  peak_load_data: `
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
  `,
  country_spotlights: `
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
  `,
};

// ─── Row data ─────────────────────────────────────────────────────────────────

const AC_GROWTH = [
  { year: 1990, stock_millions: 573,  is_projected: false, source: 'CCC / IEA: 573.49M units in 1990' },
  { year: 1995, stock_millions: 700,  is_projected: false, source: 'IEA Future of Cooling, interpolated' },
  { year: 2000, stock_millions: 850,  is_projected: false, source: 'IEA Future of Cooling' },
  { year: 2005, stock_millions: 1050, is_projected: false, source: 'IEA Future of Cooling, interpolated' },
  { year: 2010, stock_millions: 1200, is_projected: false, source: 'IEA Future of Cooling' },
  { year: 2015, stock_millions: 1500, is_projected: false, source: 'IEA Future of Cooling' },
  { year: 2020, stock_millions: 2000, is_projected: false, source: 'IEA: "1.6 billion" circa 2018, ~2B by 2020' },
  { year: 2025, stock_millions: 3100, is_projected: false, source: 'CCC: ~3.1B units (2024/25 boundary)' },
  { year: 2030, stock_millions: 4000, is_projected: true,  source: 'IEA baseline scenario' },
  { year: 2035, stock_millions: 4500, is_projected: true,  source: 'IEA baseline scenario, interpolated' },
  { year: 2040, stock_millions: 5000, is_projected: true,  source: 'IEA baseline scenario' },
  { year: 2045, stock_millions: 5800, is_projected: true,  source: 'IEA baseline scenario, interpolated' },
  { year: 2050, stock_millions: 6542, is_projected: true,  source: 'CCC: 6,542.38M units projected for 2050' },
];

const COOLING_MILESTONES = [
  { year: 1987, label: 'Montreal Protocol',         appliance_type: null, description: 'International treaty to phase out ozone-depleting substances (CFCs, HCFCs) used as refrigerants. Ratified by 198 parties.' },
  { year: 2016, label: 'Kigali Amendment',           appliance_type: null, description: 'Amendment to the Montreal Protocol to phase down hydrofluorocarbons (HFCs) by 80-85% by 2047. Could avoid 0.5 degrees C warming by 2100.' },
  { year: 2018, label: 'IEA Future of Cooling',      appliance_type: 'AC', description: 'Landmark IEA report projecting global AC stock to reach 5.6 billion by 2050, warning cooling energy demand could triple without action.' },
  { year: 2023, label: 'COP28 Global Cooling Pledge',appliance_type: null, description: '66 nations signed the Global Cooling Pledge at COP28 Dubai, committing to reduce cooling-related emissions 68% by 2050 and raise AC efficiency 50%.' },
  { year: 2025, label: '3 Billion ACs',              appliance_type: 'AC', description: 'Global AC stock surpassed 3 billion units — 3,099 million units installed worldwide.' },
];

const APPLIANCE_TIMESERIES = [
  // ── AC BAU ──────────────────────────────────────────────────────────────────
  { year:1990, appliance_type:'AC', scenario:'BAU', stock_millions:573,  energy_twh:230,  indirect_emission_mt:200,  direct_emission_mt:180, total_emission_mt:380,  is_projected:false, source:'IEA + IPCC SROC',                                         source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:1995, appliance_type:'AC', scenario:'BAU', stock_millions:700,  energy_twh:290,  indirect_emission_mt:280,  direct_emission_mt:200, total_emission_mt:480,  is_projected:false, source:'IEA + IPCC SROC',                                         source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:2000, appliance_type:'AC', scenario:'BAU', stock_millions:850,  energy_twh:350,  indirect_emission_mt:350,  direct_emission_mt:220, total_emission_mt:570,  is_projected:false, source:'IEA + IPCC SROC',                                         source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:2005, appliance_type:'AC', scenario:'BAU', stock_millions:1050, energy_twh:429,  indirect_emission_mt:446,  direct_emission_mt:240, total_emission_mt:686,  is_projected:false, source:'IEA stock / CLASP energy+indirect / Velders direct',      source_url:'https://www.clasp.ngo/' },
  { year:2010, appliance_type:'AC', scenario:'BAU', stock_millions:1200, energy_twh:645,  indirect_emission_mt:617,  direct_emission_mt:270, total_emission_mt:887,  is_projected:false, source:'IEA stock / CLASP energy+indirect / Purohit direct',      source_url:'https://www.clasp.ngo/' },
  { year:2015, appliance_type:'AC', scenario:'BAU', stock_millions:1500, energy_twh:990,  indirect_emission_mt:880,  direct_emission_mt:290, total_emission_mt:1170, is_projected:false, source:'IEA stock / CLASP energy+indirect / HEAT direct',         source_url:'https://www.clasp.ngo/' },
  { year:2020, appliance_type:'AC', scenario:'BAU', stock_millions:2000, energy_twh:1422, indirect_emission_mt:972,  direct_emission_mt:314, total_emission_mt:1286, is_projected:false, source:'IEA stock / HEAT model BAU (indirect 972 + direct 314)',   source_url:'https://ourworldindata.org/air-conditioning-causes-around-greenhouse-gas-emissions-will-change-future' },
  { year:2025, appliance_type:'AC', scenario:'BAU', stock_millions:3100, energy_twh:1972, indirect_emission_mt:1338, direct_emission_mt:403, total_emission_mt:1741, is_projected:false, source:'CLASP / HEAT model BAU',                                   source_url:'https://www.clasp.ngo/' },
  { year:2030, appliance_type:'AC', scenario:'BAU', stock_millions:4000, energy_twh:2629, indirect_emission_mt:2156, direct_emission_mt:538, total_emission_mt:2694, is_projected:true,  source:'IEA stock / CLASP energy / HEAT model BAU',               source_url:'https://www.clasp.ngo/' },
  { year:2035, appliance_type:'AC', scenario:'BAU', stock_millions:4500, energy_twh:3339, indirect_emission_mt:3299, direct_emission_mt:664, total_emission_mt:3963, is_projected:true,  source:'IEA stock / CLASP energy / HEAT model BAU',               source_url:'https://www.clasp.ngo/' },
  { year:2040, appliance_type:'AC', scenario:'BAU', stock_millions:5000, energy_twh:4402, indirect_emission_mt:3686, direct_emission_mt:634, total_emission_mt:4320, is_projected:true,  source:'IEA stock / CLASP energy / HEAT model BAU',               source_url:'https://www.clasp.ngo/' },
  { year:2045, appliance_type:'AC', scenario:'BAU', stock_millions:5800, energy_twh:5188, indirect_emission_mt:4045, direct_emission_mt:551, total_emission_mt:4596, is_projected:true,  source:'IEA stock / CLASP energy / HEAT model BAU',               source_url:'https://www.clasp.ngo/' },
  { year:2050, appliance_type:'AC', scenario:'BAU', stock_millions:6542, energy_twh:6095, indirect_emission_mt:4359, direct_emission_mt:581, total_emission_mt:4940, is_projected:true,  source:'CLASP / HEAT model BAU',                                   source_url:'https://www.clasp.ngo/' },
  // ── AC DECARB ───────────────────────────────────────────────────────────────
  { year:1990, appliance_type:'AC', scenario:'DECARB', stock_millions:573,  energy_twh:230,  indirect_emission_mt:200,  direct_emission_mt:180, total_emission_mt:380,  is_projected:false, source:'IEA + IPCC SROC',          source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:1995, appliance_type:'AC', scenario:'DECARB', stock_millions:700,  energy_twh:290,  indirect_emission_mt:280,  direct_emission_mt:200, total_emission_mt:480,  is_projected:false, source:'IEA + IPCC SROC',          source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:2000, appliance_type:'AC', scenario:'DECARB', stock_millions:850,  energy_twh:350,  indirect_emission_mt:350,  direct_emission_mt:220, total_emission_mt:570,  is_projected:false, source:'IEA + IPCC SROC',          source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:2005, appliance_type:'AC', scenario:'DECARB', stock_millions:1050, energy_twh:429,  indirect_emission_mt:446,  direct_emission_mt:240, total_emission_mt:686,  is_projected:false, source:'IEA stock / CLASP / HEAT', source_url:'https://www.clasp.ngo/' },
  { year:2010, appliance_type:'AC', scenario:'DECARB', stock_millions:1200, energy_twh:645,  indirect_emission_mt:617,  direct_emission_mt:270, total_emission_mt:887,  is_projected:false, source:'IEA stock / CLASP / HEAT', source_url:'https://www.clasp.ngo/' },
  { year:2015, appliance_type:'AC', scenario:'DECARB', stock_millions:1500, energy_twh:990,  indirect_emission_mt:880,  direct_emission_mt:290, total_emission_mt:1170, is_projected:false, source:'IEA stock / CLASP / HEAT', source_url:'https://www.clasp.ngo/' },
  { year:2020, appliance_type:'AC', scenario:'DECARB', stock_millions:2000, energy_twh:1422, indirect_emission_mt:972,  direct_emission_mt:314, total_emission_mt:1286, is_projected:false, source:'IEA stock / HEAT model BAU',source_url:'https://ourworldindata.org/air-conditioning-causes-around-greenhouse-gas-emissions-will-change-future' },
  { year:2025, appliance_type:'AC', scenario:'DECARB', stock_millions:3100, energy_twh:1972, indirect_emission_mt:1271, direct_emission_mt:323, total_emission_mt:1594, is_projected:false, source:'CLASP / HEAT model DECARB', source_url:'https://www.clasp.ngo/' },
  { year:2030, appliance_type:'AC', scenario:'DECARB', stock_millions:4000, energy_twh:2222, indirect_emission_mt:1440, direct_emission_mt:341, total_emission_mt:1781, is_projected:true,  source:'CLASP / HEAT model DECARB', source_url:'https://www.clasp.ngo/' },
  { year:2035, appliance_type:'AC', scenario:'DECARB', stock_millions:4500, energy_twh:2584, indirect_emission_mt:1640, direct_emission_mt:368, total_emission_mt:2008, is_projected:true,  source:'CLASP / HEAT model DECARB', source_url:'https://www.clasp.ngo/' },
  { year:2040, appliance_type:'AC', scenario:'DECARB', stock_millions:5000, energy_twh:3297, indirect_emission_mt:1507, direct_emission_mt:60,  total_emission_mt:1567, is_projected:true,  source:'CLASP / HEAT model DECARB', source_url:'https://www.clasp.ngo/' },
  { year:2045, appliance_type:'AC', scenario:'DECARB', stock_millions:5800, energy_twh:3849, indirect_emission_mt:1401, direct_emission_mt:43,  total_emission_mt:1444, is_projected:true,  source:'CLASP / HEAT model DECARB', source_url:'https://www.clasp.ngo/' },
  { year:2050, appliance_type:'AC', scenario:'DECARB', stock_millions:6542, energy_twh:4498, indirect_emission_mt:1282, direct_emission_mt:30,  total_emission_mt:1312, is_projected:true,  source:'CLASP / HEAT model DECARB', source_url:'https://www.clasp.ngo/' },
  // ── DomRef BAU ──────────────────────────────────────────────────────────────
  { year:1990, appliance_type:'DomRef', scenario:'BAU', stock_millions:650,  energy_twh:360,  indirect_emission_mt:250, direct_emission_mt:25, total_emission_mt:275, is_projected:false, source:'IEA/LBNL + IPCC SROC',         source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:1995, appliance_type:'DomRef', scenario:'BAU', stock_millions:800,  energy_twh:380,  indirect_emission_mt:280, direct_emission_mt:20, total_emission_mt:300, is_projected:false, source:'IEA/LBNL + IPCC SROC',         source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:2000, appliance_type:'DomRef', scenario:'BAU', stock_millions:950,  energy_twh:400,  indirect_emission_mt:310, direct_emission_mt:18, total_emission_mt:328, is_projected:false, source:'IEA/LBNL + IPCC SROC',         source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:2005, appliance_type:'DomRef', scenario:'BAU', stock_millions:1065, energy_twh:437,  indirect_emission_mt:330, direct_emission_mt:16, total_emission_mt:346, is_projected:false, source:'CLASP + IPCC/IEA',             source_url:'https://www.clasp.ngo/' },
  { year:2010, appliance_type:'DomRef', scenario:'BAU', stock_millions:1403, energy_twh:561,  indirect_emission_mt:350, direct_emission_mt:15, total_emission_mt:365, is_projected:false, source:'CLASP + IEA/HEAT',             source_url:'https://www.clasp.ngo/' },
  { year:2015, appliance_type:'DomRef', scenario:'BAU', stock_millions:1855, energy_twh:718,  indirect_emission_mt:365, direct_emission_mt:15, total_emission_mt:380, is_projected:false, source:'CLASP + HEAT model',           source_url:'https://www.clasp.ngo/' },
  { year:2020, appliance_type:'DomRef', scenario:'BAU', stock_millions:2284, energy_twh:868,  indirect_emission_mt:381, direct_emission_mt:17, total_emission_mt:397, is_projected:false, source:'CLASP + HEAT Global Model BAU',source_url:'https://www.clasp.ngo/' },
  { year:2025, appliance_type:'DomRef', scenario:'BAU', stock_millions:2684, energy_twh:1012, indirect_emission_mt:421, direct_emission_mt:19, total_emission_mt:440, is_projected:false, source:'CLASP + HEAT model BAU',       source_url:'https://www.clasp.ngo/' },
  { year:2030, appliance_type:'DomRef', scenario:'BAU', stock_millions:3059, energy_twh:1151, indirect_emission_mt:477, direct_emission_mt:23, total_emission_mt:500, is_projected:true,  source:'CLASP + HEAT model BAU',       source_url:'https://www.clasp.ngo/' },
  { year:2035, appliance_type:'DomRef', scenario:'BAU', stock_millions:3287, energy_twh:1236, indirect_emission_mt:501, direct_emission_mt:23, total_emission_mt:524, is_projected:true,  source:'CLASP + HEAT model BAU',       source_url:'https://www.clasp.ngo/' },
  { year:2040, appliance_type:'DomRef', scenario:'BAU', stock_millions:3470, energy_twh:1305, indirect_emission_mt:530, direct_emission_mt:21, total_emission_mt:551, is_projected:true,  source:'CLASP + HEAT model BAU',       source_url:'https://www.clasp.ngo/' },
  { year:2045, appliance_type:'DomRef', scenario:'BAU', stock_millions:3667, energy_twh:1379, indirect_emission_mt:578, direct_emission_mt:21, total_emission_mt:599, is_projected:true,  source:'CLASP + HEAT model BAU',       source_url:'https://www.clasp.ngo/' },
  { year:2050, appliance_type:'DomRef', scenario:'BAU', stock_millions:3876, energy_twh:1458, indirect_emission_mt:629, direct_emission_mt:20, total_emission_mt:649, is_projected:true,  source:'CLASP + HEAT model BAU',       source_url:'https://www.clasp.ngo/' },
  // ── DomRef DECARB ───────────────────────────────────────────────────────────
  { year:1990, appliance_type:'DomRef', scenario:'DECARB', stock_millions:650,  energy_twh:360,  indirect_emission_mt:250, direct_emission_mt:25, total_emission_mt:275, is_projected:false, source:'IEA/LBNL + IPCC SROC',       source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:1995, appliance_type:'DomRef', scenario:'DECARB', stock_millions:800,  energy_twh:380,  indirect_emission_mt:280, direct_emission_mt:20, total_emission_mt:300, is_projected:false, source:'IEA/LBNL + IPCC SROC',       source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:2000, appliance_type:'DomRef', scenario:'DECARB', stock_millions:950,  energy_twh:400,  indirect_emission_mt:310, direct_emission_mt:18, total_emission_mt:328, is_projected:false, source:'IEA/LBNL + IPCC SROC',       source_url:'https://www.iea.org/reports/the-future-of-cooling' },
  { year:2005, appliance_type:'DomRef', scenario:'DECARB', stock_millions:1065, energy_twh:437,  indirect_emission_mt:330, direct_emission_mt:16, total_emission_mt:346, is_projected:false, source:'CLASP + IPCC/IEA',           source_url:'https://www.clasp.ngo/' },
  { year:2010, appliance_type:'DomRef', scenario:'DECARB', stock_millions:1403, energy_twh:561,  indirect_emission_mt:350, direct_emission_mt:15, total_emission_mt:365, is_projected:false, source:'CLASP + IEA/HEAT',           source_url:'https://www.clasp.ngo/' },
  { year:2015, appliance_type:'DomRef', scenario:'DECARB', stock_millions:1855, energy_twh:718,  indirect_emission_mt:365, direct_emission_mt:15, total_emission_mt:380, is_projected:false, source:'CLASP + HEAT model',         source_url:'https://www.clasp.ngo/' },
  { year:2020, appliance_type:'DomRef', scenario:'DECARB', stock_millions:2284, energy_twh:868,  indirect_emission_mt:381, direct_emission_mt:17, total_emission_mt:397, is_projected:false, source:'CLASP + HEAT Global Model BAU',source_url:'https://www.clasp.ngo/' },
  { year:2025, appliance_type:'DomRef', scenario:'DECARB', stock_millions:2684, energy_twh:1012, indirect_emission_mt:400, direct_emission_mt:19, total_emission_mt:419, is_projected:false, source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  { year:2030, appliance_type:'DomRef', scenario:'DECARB', stock_millions:3059, energy_twh:1046, indirect_emission_mt:347, direct_emission_mt:21, total_emission_mt:368, is_projected:true,  source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  { year:2035, appliance_type:'DomRef', scenario:'DECARB', stock_millions:3287, energy_twh:1036, indirect_emission_mt:274, direct_emission_mt:20, total_emission_mt:294, is_projected:true,  source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  { year:2040, appliance_type:'DomRef', scenario:'DECARB', stock_millions:3470, energy_twh:1021, indirect_emission_mt:230, direct_emission_mt:17, total_emission_mt:247, is_projected:true,  source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  { year:2045, appliance_type:'DomRef', scenario:'DECARB', stock_millions:3667, energy_twh:1020, indirect_emission_mt:203, direct_emission_mt:2,  total_emission_mt:205, is_projected:true,  source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  { year:2050, appliance_type:'DomRef', scenario:'DECARB', stock_millions:3876, energy_twh:1037, indirect_emission_mt:182, direct_emission_mt:1,  total_emission_mt:183, is_projected:true,  source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  // ── Fans BAU ────────────────────────────────────────────────────────────────
  { year:1990, appliance_type:'Fans', scenario:'BAU', stock_millions:1600, energy_twh:150, indirect_emission_mt:80,  direct_emission_mt:0, total_emission_mt:80,  is_projected:false, source:'LBNL/DOE estimate',           source_url:'https://www.osti.gov/biblio/1172246' },
  { year:1995, appliance_type:'Fans', scenario:'BAU', stock_millions:1900, energy_twh:175, indirect_emission_mt:95,  direct_emission_mt:0, total_emission_mt:95,  is_projected:false, source:'LBNL/DOE estimate',           source_url:'https://www.osti.gov/biblio/1172246' },
  { year:2000, appliance_type:'Fans', scenario:'BAU', stock_millions:2150, energy_twh:200, indirect_emission_mt:110, direct_emission_mt:0, total_emission_mt:110, is_projected:false, source:'LBNL/DOE estimate',           source_url:'https://www.osti.gov/biblio/1172246' },
  { year:2005, appliance_type:'Fans', scenario:'BAU', stock_millions:2434, energy_twh:232, indirect_emission_mt:130, direct_emission_mt:0, total_emission_mt:130, is_projected:false, source:'CLASP + LBNL/DOE',            source_url:'https://www.clasp.ngo/' },
  { year:2010, appliance_type:'Fans', scenario:'BAU', stock_millions:2720, energy_twh:261, indirect_emission_mt:150, direct_emission_mt:0, total_emission_mt:150, is_projected:false, source:'CLASP + LBNL/DOE',            source_url:'https://www.clasp.ngo/' },
  { year:2015, appliance_type:'Fans', scenario:'BAU', stock_millions:3044, energy_twh:298, indirect_emission_mt:175, direct_emission_mt:0, total_emission_mt:175, is_projected:false, source:'CLASP + IEA/LBNL',            source_url:'https://www.clasp.ngo/' },
  { year:2020, appliance_type:'Fans', scenario:'BAU', stock_millions:3415, energy_twh:344, indirect_emission_mt:190, direct_emission_mt:0, total_emission_mt:190, is_projected:false, source:'CLASP + IEA/LBNL',            source_url:'https://www.iea.org/energy-system/buildings/space-cooling' },
  { year:2025, appliance_type:'Fans', scenario:'BAU', stock_millions:3819, energy_twh:396, indirect_emission_mt:220, direct_emission_mt:0, total_emission_mt:220, is_projected:false, source:'CLASP + IEA/LBNL projection', source_url:'https://www.clasp.ngo/' },
  { year:2030, appliance_type:'Fans', scenario:'BAU', stock_millions:4146, energy_twh:439, indirect_emission_mt:260, direct_emission_mt:0, total_emission_mt:260, is_projected:true,  source:'CLASP + IEA/LBNL projection', source_url:'https://www.clasp.ngo/' },
  { year:2035, appliance_type:'Fans', scenario:'BAU', stock_millions:4378, energy_twh:469, indirect_emission_mt:300, direct_emission_mt:0, total_emission_mt:300, is_projected:true,  source:'CLASP + IEA/LBNL projection', source_url:'https://www.clasp.ngo/' },
  { year:2040, appliance_type:'Fans', scenario:'BAU', stock_millions:4545, energy_twh:489, indirect_emission_mt:340, direct_emission_mt:0, total_emission_mt:340, is_projected:true,  source:'CLASP + IEA/LBNL projection', source_url:'https://www.clasp.ngo/' },
  { year:2045, appliance_type:'Fans', scenario:'BAU', stock_millions:4708, energy_twh:509, indirect_emission_mt:380, direct_emission_mt:0, total_emission_mt:380, is_projected:true,  source:'CLASP + IEA/LBNL projection', source_url:'https://www.clasp.ngo/' },
  { year:2050, appliance_type:'Fans', scenario:'BAU', stock_millions:4871, energy_twh:529, indirect_emission_mt:420, direct_emission_mt:0, total_emission_mt:420, is_projected:true,  source:'CLASP + IEA/LBNL projection', source_url:'https://www.clasp.ngo/' },
  // ── Fans DECARB ─────────────────────────────────────────────────────────────
  { year:1990, appliance_type:'Fans', scenario:'DECARB', stock_millions:1600, energy_twh:150, indirect_emission_mt:80,  direct_emission_mt:0, total_emission_mt:80,  is_projected:false, source:'LBNL/DOE estimate',          source_url:'https://www.osti.gov/biblio/1172246' },
  { year:1995, appliance_type:'Fans', scenario:'DECARB', stock_millions:1900, energy_twh:175, indirect_emission_mt:95,  direct_emission_mt:0, total_emission_mt:95,  is_projected:false, source:'LBNL/DOE estimate',          source_url:'https://www.osti.gov/biblio/1172246' },
  { year:2000, appliance_type:'Fans', scenario:'DECARB', stock_millions:2150, energy_twh:200, indirect_emission_mt:110, direct_emission_mt:0, total_emission_mt:110, is_projected:false, source:'LBNL/DOE estimate',          source_url:'https://www.osti.gov/biblio/1172246' },
  { year:2005, appliance_type:'Fans', scenario:'DECARB', stock_millions:2434, energy_twh:232, indirect_emission_mt:103, direct_emission_mt:0, total_emission_mt:103, is_projected:false, source:'CLASP + LBNL/DOE',           source_url:'https://www.clasp.ngo/' },
  { year:2010, appliance_type:'Fans', scenario:'DECARB', stock_millions:2720, energy_twh:261, indirect_emission_mt:112, direct_emission_mt:0, total_emission_mt:112, is_projected:false, source:'CLASP + LBNL/DOE',           source_url:'https://www.clasp.ngo/' },
  { year:2015, appliance_type:'Fans', scenario:'DECARB', stock_millions:3044, energy_twh:298, indirect_emission_mt:126, direct_emission_mt:0, total_emission_mt:126, is_projected:false, source:'CLASP + IEA/LBNL',           source_url:'https://www.clasp.ngo/' },
  { year:2020, appliance_type:'Fans', scenario:'DECARB', stock_millions:3415, energy_twh:344, indirect_emission_mt:147, direct_emission_mt:0, total_emission_mt:147, is_projected:false, source:'CLASP + IEA/LBNL',           source_url:'https://www.iea.org/energy-system/buildings/space-cooling' },
  { year:2025, appliance_type:'Fans', scenario:'DECARB', stock_millions:3819, energy_twh:396, indirect_emission_mt:164, direct_emission_mt:0, total_emission_mt:164, is_projected:false, source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  { year:2030, appliance_type:'Fans', scenario:'DECARB', stock_millions:4146, energy_twh:392, indirect_emission_mt:134, direct_emission_mt:0, total_emission_mt:134, is_projected:true,  source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  { year:2035, appliance_type:'Fans', scenario:'DECARB', stock_millions:4378, energy_twh:395, indirect_emission_mt:107, direct_emission_mt:0, total_emission_mt:107, is_projected:true,  source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  { year:2040, appliance_type:'Fans', scenario:'DECARB', stock_millions:4545, energy_twh:400, indirect_emission_mt:87,  direct_emission_mt:0, total_emission_mt:87,  is_projected:true,  source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  { year:2045, appliance_type:'Fans', scenario:'DECARB', stock_millions:4708, energy_twh:413, indirect_emission_mt:72,  direct_emission_mt:0, total_emission_mt:72,  is_projected:true,  source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
  { year:2050, appliance_type:'Fans', scenario:'DECARB', stock_millions:4871, energy_twh:428, indirect_emission_mt:59,  direct_emission_mt:0, total_emission_mt:59,  is_projected:true,  source:'CLASP / HEAT model DECARB',  source_url:'https://www.clasp.ngo/' },
];

const PEAK_LOAD = [
  { country:'Saudi Arabia',   country_code:'SA', baseline_year:2016, baseline_percent:50, projected_year:2050, projected_percent:60, source:'IEA Future of Cooling; PMC/ASME research',      is_global_avg:false },
  { country:'India',          country_code:'IN', baseline_year:2016, baseline_percent:10, projected_year:2050, projected_percent:45, source:'IEA Future of Cooling',                          is_global_avg:false },
  { country:'Indonesia',      country_code:'ID', baseline_year:2016, baseline_percent:7,  projected_year:2050, projected_percent:41, source:'IEA Future of Cooling',                          is_global_avg:false },
  { country:'China',          country_code:'CN', baseline_year:2017, baseline_percent:16, projected_year:2050, projected_percent:30, source:'IEA Future of Cooling',                          is_global_avg:false },
  { country:'Brazil',         country_code:'BR', baseline_year:2016, baseline_percent:12, projected_year:2050, projected_percent:31, source:'IEA Future of Cooling',                          is_global_avg:false },
  { country:'USA',            country_code:'US', baseline_year:2016, baseline_percent:23, projected_year:2050, projected_percent:28, source:'IEA Future of Cooling',                          is_global_avg:false },
  { country:'Mexico',         country_code:'MX', baseline_year:2016, baseline_percent:10, projected_year:2050, projected_percent:24, source:'IEA Future of Cooling',                          is_global_avg:false },
  { country:'Japan',          country_code:'JP', baseline_year:2016, baseline_percent:14, projected_year:2050, projected_percent:18, source:'IEA Future of Cooling',                          is_global_avg:false },
  { country:'Nigeria',        country_code:'NG', baseline_year:2016, baseline_percent:3,  projected_year:2050, projected_percent:22, source:'IEA Future of Cooling; SE4ALL',                  is_global_avg:false },
  { country:'Middle East (avg)',country_code:'ME',baseline_year:2016, baseline_percent:40, projected_year:2050, projected_percent:50, source:'IEA Future of Cooling; IEA MENA analysis',      is_global_avg:false },
  { country:'Global Average', country_code:null, baseline_year:2016, baseline_percent:14, projected_year:null, projected_percent:null,source:'IEA: averaged across all countries, space cooling accounted for 14% of peak demand in 2016', is_global_avg:true },
];

const COUNTRY_SPOTLIGHTS = [
  {
    spotlight_id: 'china', name: 'China', region: 'East Asia', flag_emoji: 'CN',
    meps_status: 'advanced', dominant_refrigerant: 'R-32 (transitioning from R-410A)',
    key_challenge: 'Reducing peak load stress while maintaining export leadership',
    source: 'IEA; CLASP; en.cheaa.org',
    narrative: "China is the world's largest AC market and manufacturer, producing over 200 million units annually. Following stringent MEPS updates, variable-speed technology rose from 60% to 98% of the market in just two years, demonstrating the transformative power of efficiency standards.",
    stats: [
      { label:'AC stock',               value:'730M+',      detail:'Largest AC market globally' },
      { label:'Annual production',      value:'208M units', detail:'2024, surging 1.6% YoY' },
      { label:'Domestic shipments',     value:'100M+ units',detail:'2024, slight dip of 1.5% YoY' },
      { label:'Exports',                value:'85M units',  detail:'2024, up 29.1% YoY' },
      { label:'Household AC ownership', value:'~80%',       detail:'Urban areas near saturation' },
      { label:'Peak load from cooling', value:'~16%',       detail:'2017 baseline; IEA' },
    ],
  },
  {
    spotlight_id: 'india', name: 'India', region: 'South Asia', flag_emoji: 'IN',
    meps_status: 'developing', dominant_refrigerant: 'R-32 and R-290 (emerging)',
    key_challenge: 'Scaling access while ensuring efficiency in a market growing 16% annually',
    source: 'IEA Future of Cooling; Renub Research; GlobeNewswire',
    narrative: "India represents the largest untapped cooling market. With only 10% AC penetration and temperatures regularly exceeding 45 degrees C, demand will surge as incomes rise. The IEA projects cooling will account for 45% of India's peak electricity load by 2050, up from just 10% today.",
    stats: [
      { label:'AC penetration',            value:'~10%',       detail:'Only 8-10% of households own AC' },
      { label:'Annual sales',              value:'13.3M units',detail:'2024; 15.4M projected for 2025' },
      { label:'Market value',              value:'$5.4B',      detail:'2024; $8.1B projected by 2030' },
      { label:'Projected peak load share', value:'45%',        detail:'2050; up from 10% today' },
      { label:'Growth rate',               value:'16% CAGR',   detail:'Revenue projected to 2030' },
    ],
  },
  {
    spotlight_id: 'southeast-asia', name: 'Southeast Asia', region: 'Southeast Asia', flag_emoji: 'ASEAN',
    meps_status: 'developing', dominant_refrigerant: 'R-32 (transitioning); R-290 (emerging in Indonesia)',
    key_challenge: 'Bridging efficiency gaps while cooling demand grows 7%+ annually',
    source: 'IEA; Meticulous Research',
    narrative: 'Southeast Asia is one of the fastest-growing cooling markets, driven by hot humid climates and a rapidly expanding middle class. Indonesia alone is projected to see AC ownership jump from 14% to 85% by 2050. Heat-related mortality in the region has already risen 91% between 2004 and 2018.',
    stats: [
      { label:'Market growth',               value:'7.3% CAGR', detail:'2023-2028 for residential AC' },
      { label:'Indonesia AC ownership',       value:'14%',       detail:'2023; projected 85% by 2050' },
      { label:'Indonesia peak load (2050)',   value:'40.7%',     detail:'IEA projection for cooling share' },
      { label:'Heat mortality increase',      value:'+91%',      detail:'SE Asia 2004-2018' },
      { label:'Market size (2032)',           value:'$8.66B',    detail:'SE Asia AC market projected' },
    ],
  },
  {
    spotlight_id: 'africa', name: 'Africa', region: 'Africa', flag_emoji: 'AF',
    meps_status: 'minimal', dominant_refrigerant: 'R-22 (phasing out); R-410A',
    key_challenge: 'Providing cooling access where electricity is absent or unreliable',
    source: 'SE4ALL Chilling Prospects 2025; IEA Energy Efficiency 2024',
    narrative: 'Africa faces the deepest cooling access crisis. With only 5% of households owning an AC and the largest share of the 1.2 billion people at high risk from heat, the region needs cooling solutions that work within severe electricity constraints. Vaccines degrade, food spoils, and heat waves grow deadlier.',
    stats: [
      { label:'AC ownership',           value:'~5%',         detail:'Of households; lowest globally' },
      { label:'Population at risk',     value:'Largest share',detail:'Of the 1.2B people globally at high risk' },
      { label:'Without electricity',    value:'309M rural',  detail:'Plus 695M in unreliable urban areas' },
      { label:'Residential market share',value:'61.6%',      detail:'Of total AC installations in 2024' },
    ],
  },
  {
    spotlight_id: 'latin-america', name: 'Latin America', region: 'Latin America', flag_emoji: 'LATAM',
    meps_status: 'developing', dominant_refrigerant: 'R-410A (transitioning to R-32)',
    key_challenge: 'Accelerating the Kigali Amendment HFC phasedown while expanding access',
    source: 'IEA; CLASP; IGSD',
    narrative: "Brazil and Mexico lead Latin America's cooling market. Mexico pioneered AC efficiency standards in 1994 and later harmonized them with US standards under NAFTA. Brazil's growing middle class drives demand, with cooling projected to account for 31% of peak electricity by 2050.",
    stats: [
      { label:'Brazil AC ownership',     value:'~30%',     detail:'Of households' },
      { label:'Brazil peak load (2050)', value:'30.8%',    detail:'IEA projection for cooling share' },
      { label:'Mexico peak load (2050)', value:'24.3%',    detail:'IEA projection for cooling share' },
      { label:'Mexico MEPS history',     value:'Since 1994',detail:'Harmonized with US standards via NAFTA' },
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== CoolProgress: Create Tables & Populate ===\n');

  // ── Step 1: Create tables ──────────────────────────────────────────────────
  console.log('Step 1: Creating tables...');
  const tableResults = {};
  for (const [name, ddl] of Object.entries(DDL)) {
    tableResults[name] = await createTable(name, ddl);
  }

  const failedTables = Object.entries(tableResults).filter(([,ok]) => !ok).map(([n]) => n);
  if (failedTables.length > 0) {
    console.log('\n⚠️  Could not auto-create tables. Run the SQL manually in Supabase SQL Editor:');
    console.log('   Dashboard → SQL Editor → New query\n');
    for (const t of failedTables) {
      console.log(`   sql/create_${t}.sql`);
    }
    console.log('\nThen re-run this script.\n');
    process.exit(1);
  }

  // ── Step 2: Insert data ────────────────────────────────────────────────────
  console.log('\nStep 2: Inserting data...');

  const tables = [
    { name: 'ac_growth_data',      rows: AC_GROWTH },
    { name: 'cooling_milestones',  rows: COOLING_MILESTONES },
    { name: 'appliance_timeseries',rows: APPLIANCE_TIMESERIES },
    { name: 'peak_load_data',      rows: PEAK_LOAD },
    { name: 'country_spotlights',  rows: COUNTRY_SPOTLIGHTS },
  ];

  for (const { name, rows } of tables) {
    process.stdout.write(`  Inserting ${rows.length} rows → ${name}... `);
    try {
      const n = await insertBatch(name, rows);
      console.log(`✓ (${n} rows)`);
    } catch (err) {
      // Check if it's a duplicate key error (already populated)
      if (err.message.includes('duplicate') || err.message.includes('unique') || err.message.includes('23505')) {
        console.log(`⚠ skipped (data already exists)`);
      } else {
        console.log(`✗ FAILED`);
        console.error(`  ${err.message}`);
      }
    }
  }

  console.log('\n✅ Done!\n');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
