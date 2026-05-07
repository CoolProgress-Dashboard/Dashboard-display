/**
 * populate_kigali_schedules.mjs
 *
 * Populates two Supabase tables with Kigali Amendment HFC phase-down schedules:
 *   - kigali_group_schedules          (4 rows: the four Annex F groups)
 *   - kigali_country_schedule_overrides (83 rows: countries with approved KIPs)
 *
 * Usage:
 *   node scripts/populate_kigali_schedules.mjs
 *
 * Requires SUPABASE_URL and SUPABASE_KEY in .env (see env resolution below).
 */

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase credentials — URL hard-coded, key from environment
// ---------------------------------------------------------------------------
const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: Set SUPABASE_SERVICE_KEY environment variable.\nUsage: SUPABASE_SERVICE_KEY=eyJ... node scripts/populate_kigali_schedules.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// TABLE 1: kigali_group_schedules
// Four Annex F groups.
// step_pct = cumulative % reduction FROM baseline (10 = 10% below baseline).
// ---------------------------------------------------------------------------
const GROUP_SCHEDULES = [
  {
    group_type: 'Non-Article 5',
    group_display_name: 'Non-Article 5 (Developed countries)',
    baseline_description: 'Average HFC 2011–2013 + 15% of HCFC baseline',
    freeze_year: null,
    step1_year: 2019, step1_pct: 10,
    step2_year: 2024, step2_pct: 40,
    step3_year: 2029, step3_pct: 70,
    step4_year: 2034, step4_pct: 80,
    step5_year: 2036, step5_pct: 85,
  },
  {
    group_type: 'Non-Article 5*',
    group_display_name: 'Non-Article 5* (Belarus, Kazakhstan, Russia, Tajikistan, Uzbekistan)',
    baseline_description: 'Average HFC 2011–2013 + 25% of HCFC baseline',
    freeze_year: null,
    step1_year: 2020, step1_pct: 5,
    step2_year: 2025, step2_pct: 35,
    step3_year: 2029, step3_pct: 70,
    step4_year: 2034, step4_pct: 80,
    step5_year: 2036, step5_pct: 85,
  },
  {
    group_type: 'Article 5 Group 1',
    group_display_name: 'Article 5 Group 1 (Most developing countries)',
    baseline_description: 'Average HFC 2020–2022 + 65% of HCFC baseline',
    freeze_year: 2024,
    step1_year: 2029, step1_pct: 10,
    step2_year: 2035, step2_pct: 30,
    step3_year: 2040, step3_pct: 50,
    step4_year: 2045, step4_pct: 80,
    step5_year: null,  step5_pct: null,
  },
  {
    group_type: 'Article 5 Group 2',
    group_display_name: 'Article 5 Group 2 (Bahrain, India, Iran, Iraq, Kuwait, Oman, Pakistan, Qatar, Saudi Arabia, UAE)',
    baseline_description: 'Average HFC 2024–2026 + 65% of HCFC baseline',
    freeze_year: 2028,
    step1_year: 2032, step1_pct: 10,
    step2_year: 2037, step2_pct: 20,
    step3_year: 2042, step3_pct: 30,
    step4_year: 2047, step4_pct: 85,
    step5_year: null,  step5_pct: null,
  },
];

// ---------------------------------------------------------------------------
// TABLE 2: kigali_country_schedule_overrides
// Countries with an approved KIP (Kigali Implementation Plan) target.
// All are Article 5 Group 1. Only step1 (and step2 for LBN) are overridden;
// steps 3–5 fall back to the group default at query time (stored as null here).
//
// Source: UNEP/OzL.Pro/ExCom/97/8 Annex III (unless noted otherwise).
// ---------------------------------------------------------------------------

// Helper to build a country row
const row = (country_code, step1_pct, step1_year, opts = {}) => ({
  country_code,
  group_type: 'Article 5 Group 1',
  step1_year,
  step1_pct,
  step2_year: opts.step2_year ?? null,
  step2_pct:  opts.step2_pct  ?? null,
  notes: opts.notes ?? 'UNEP/OzL.Pro/ExCom/97/8 Annex III',
});

const COUNTRY_OVERRIDES = [
  row('ALB',  10,    2029),
  row('ARM',  10,    2029),
  row('BEN',  10,    2029),
  row('BOL',  15,    2029),
  row('BIH',  10,    2029),
  row('BWA',  15,    2029),
  row('BFA',  30,    2029),
  row('KHM',  10,    2029),
  row('CMR',  30,    2030),
  row('TCD',  10,    2029),
  row('CHL',  10,    2029),
  row('COL',  18.3,  2029),
  row('COG',  48.7,  2029),
  row('COK',  10,    2029),
  row('CRI',  10,    2029),
  row('CUB',  10,    2029),
  row('DOM',  10,    2029),
  row('ECU',  14,    2029),
  row('EGY',  22,    2030),
  row('SLV',  10,    2029),
  row('ERI',  10,    2029),
  row('SWZ',  10,    2029),
  row('ETH',  10,    2029),
  row('FJI',  10,    2029),
  row('GMB',  10,    2029),
  row('GEO',  22.5,  2029),
  row('GHA',  58,    2030),
  row('GRD',  10,    2029),
  row('GTM',  15.9,  2029),
  row('GIN',  17.3,  2029),
  row('GNB',  10,    2029),
  row('HND',  15.5,  2029),
  row('JOR',  54,    2030),
  row('KIR',  10,    2029),
  row('KGZ',  10,    2029),
  row('LAO',  10,    2029),
  // Lebanon: approved second step (40% by 2032) in addition to step1
  row('LBN',  15,    2029, { step2_year: 2032, step2_pct: 40 }),
  row('LSO',  51.6,  2029),
  row('LBR',  32,    2029),
  row('MWI',  54,    2030),
  row('MYS',  10,    2029),
  row('MHL',  10,    2029),
  row('MUS',  10,    2029),
  row('MEX',  10,    2029),
  row('FSM',  10,    2029),
  row('MNG',  10,    2029),
  row('MNE',  19.43, 2029),
  row('MAR',  30,    2030),
  row('MOZ',  10,    2029),
  row('NRU',  10,    2029),
  row('NIC',  10,    2029),
  row('NER',  35.2,  2029),
  row('NGA',  10.13, 2029),
  row('NIU',  10,    2029),
  row('MKD',  18.7,  2029),
  row('PLW',  10,    2029),
  row('PAN',  10,    2029),
  row('PRY',  10,    2029),
  row('PER',  10,    2029),
  row('MDA',  10,    2029),
  row('RWA',  25,    2029),
  row('LCA',  10,    2029),
  row('WSM',  10,    2029),
  row('SEN',  20.5,  2029),
  row('SRB',  10,    2029),
  row('SYC',  10,    2029),
  row('SLE',  10,    2029),
  row('SLB',  30,    2029),
  row('SOM',  10,    2029),
  row('ZAF',  14.6,  2029),
  row('LKA',  10,    2029),
  row('TGO',  15,    2029),
  row('TON',  10,    2029),
  row('TTO',  10,    2029),
  row('TUN',  23.8,  2030),
  row('TUR',  14.4,  2029),
  row('TKM',  10,    2029),
  row('TUV',  10,    2029),
  row('TZA',  10,    2029),
  row('URY',  10,    2029),
  row('VUT',  10,    2029),
  row('VNM',  10,    2029),
  row('ZWE',  37,    2029),
];

// ---------------------------------------------------------------------------
// Upsert helpers
// ---------------------------------------------------------------------------

async function upsertGroupSchedules() {
  console.log(`\nUpserting ${GROUP_SCHEDULES.length} rows into kigali_group_schedules...`);
  const { error } = await supabase
    .from('kigali_group_schedules')
    .upsert(GROUP_SCHEDULES, { onConflict: 'group_type' });

  if (error) {
    console.error('  ERROR:', error.message);
    return false;
  }
  console.log(`  OK — ${GROUP_SCHEDULES.length} rows upserted.`);
  return true;
}

async function upsertCountryOverrides() {
  console.log(`\nUpserting ${COUNTRY_OVERRIDES.length} rows into kigali_country_schedule_overrides...`);

  // Upsert in batches of 50 to stay well within Supabase request limits
  const BATCH_SIZE = 50;
  let successCount = 0;

  for (let i = 0; i < COUNTRY_OVERRIDES.length; i += BATCH_SIZE) {
    const chunk = COUNTRY_OVERRIDES.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('kigali_country_schedule_overrides')
      .upsert(chunk, { onConflict: 'country_code' });

    if (error) {
      console.error(`  ERROR on batch starting at index ${i}:`, error.message);
      return false;
    }
    successCount += chunk.length;
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${successCount}/${COUNTRY_OVERRIDES.length} rows upserted.`);
  }

  console.log(`  OK — all ${successCount} country override rows upserted.`);
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== populate_kigali_schedules ===');
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  const ok1 = await upsertGroupSchedules();
  const ok2 = await upsertCountryOverrides();

  console.log('\n--- Summary ---');
  console.log(`kigali_group_schedules:             ${ok1 ? 'SUCCESS' : 'FAILED'}`);
  console.log(`kigali_country_schedule_overrides:  ${ok2 ? 'SUCCESS' : 'FAILED'}`);

  if (!ok1 || !ok2) {
    console.error('\nOne or more upserts failed. Check errors above.');
    process.exit(1);
  }
  console.log('\nAll done.');
}

main();
