/**
 * populate_eu_fgas.mjs
 *
 * Adds all 27 EU member states to kigali_country_schedule_overrides with
 * key EU F-Gas Regulation (2024/573) milestones mapped into the 5 step columns:
 *
 *   step1: 2016 → 93%  (−7%)
 *   step2: 2018 → 63%  (−37%)
 *   step3: 2024 → 31%  (−69%)
 *   step4: 2030 →  5%  (−95%)
 *   step5: 2050 →  0%  (complete phase-out)
 *
 * group_type is set to 'Non-Article 5' (EU states are developed-country parties).
 * notes field is set to 'EU_FGAS' so the UI can detect and label them appropriately.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=eyJ... node scripts/populate_eu_fgas.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: Set SUPABASE_SERVICE_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// All 27 EU member states (ISO alpha-3)
const EU_MEMBER_STATES = [
  'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA',
  'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD',
  'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE'
];

// Key EU F-Gas milestones mapped to 5 step columns
// pct here = % of baseline ALLOWED (not reduction), matching Kigali convention
const EU_ROWS = EU_MEMBER_STATES.map(code => ({
  country_code: code,
  group_type:   'Non-Article 5',
  freeze_year:  null,
  step1_year:   2016, step1_pct:  7,   // 93% allowed → 7% reduction
  step2_year:   2018, step2_pct: 37,   // 63% allowed → 37% reduction
  step3_year:   2024, step3_pct: 69,   // 31% allowed → 69% reduction
  step4_year:   2030, step4_pct: 95,   // 5% allowed → 95% reduction
  step5_year:   2050, step5_pct: 100,  // 0% allowed → 100% reduction (phase-out)
  notes: 'EU_FGAS',
}));

async function upsertEuRows() {
  console.log(`\nUpserting ${EU_ROWS.length} EU member state rows into kigali_country_schedule_overrides...`);
  const { error } = await supabase
    .from('kigali_country_schedule_overrides')
    .upsert(EU_ROWS, { onConflict: 'country_code' });

  if (error) {
    console.error('  ERROR:', error.message);
    return false;
  }
  console.log(`  OK — ${EU_ROWS.length} EU rows upserted.`);
  return true;
}

async function main() {
  console.log('=== populate_eu_fgas ===');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  const ok = await upsertEuRows();
  if (!ok) {
    console.error('\nUpsert failed. Check errors above.');
    process.exit(1);
  }
  console.log('\nAll done. EU member states now appear in kigali_country_schedule_overrides with EU_FGAS notes.');
}

main();
