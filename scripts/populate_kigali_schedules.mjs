/**
 * Populate kigali_group_schedules and kigali_country_schedule_overrides
 *
 * Source: Kigali Amendment Decision XXVIII/1, Annex F
 * Run:    node scripts/populate_kigali_schedules.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_KEY — check your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Table 1: 4 default group schedules ────────────────────────────────────────
// step_pct = cumulative % REDUCTION from baseline (10 = 10% below baseline = 90% allowed)

const GROUP_SCHEDULES = [
  {
    group_type:           'Non-Article 5',
    group_display_name:   'Non-Article 5 (Developed countries)',
    baseline_description: 'Average HFC 2011–2013 + 15% of HCFC baseline',
    freeze_year:          null,
    step1_year: 2019, step1_pct: 10,
    step2_year: 2024, step2_pct: 40,
    step3_year: 2029, step3_pct: 70,
    step4_year: 2034, step4_pct: 80,
    step5_year: 2036, step5_pct: 85,
  },
  {
    // Belarus, Kazakhstan, Russian Federation, Tajikistan, Uzbekistan
    // Different HCFC baseline component (25%) and delayed/different first two steps
    group_type:           'Non-Article 5*',
    group_display_name:   'Non-Article 5* (Belarus, Kazakhstan, Russia, Tajikistan, Uzbekistan)',
    baseline_description: 'Average HFC 2011–2013 + 25% of HCFC baseline',
    freeze_year:          null,
    step1_year: 2020, step1_pct:  5,
    step2_year: 2025, step2_pct: 35,
    step3_year: 2029, step3_pct: 70,
    step4_year: 2034, step4_pct: 80,
    step5_year: 2036, step5_pct: 85,
  },
  {
    group_type:           'Article 5 Group 1',
    group_display_name:   'Article 5 Group 1 (Most developing countries)',
    baseline_description: 'Average HFC 2020–2022 + 65% of HCFC baseline',
    freeze_year:          2024,
    step1_year: 2029, step1_pct: 10,
    step2_year: 2035, step2_pct: 30,
    step3_year: 2040, step3_pct: 50,
    step4_year: 2045, step4_pct: 80,
    step5_year: null, step5_pct: null,
  },
  {
    // Bahrain, India, Iran, Iraq, Kuwait, Oman, Pakistan, Qatar, Saudi Arabia, UAE
    group_type:           'Article 5 Group 2',
    group_display_name:   'Article 5 Group 2 (Bahrain, India, Iran, Iraq, Kuwait, Oman, Pakistan, Qatar, Saudi Arabia, UAE)',
    baseline_description: 'Average HFC 2024–2026 + 65% of HCFC baseline',
    freeze_year:          2028,
    step1_year: 2032, step1_pct: 10,
    step2_year: 2037, step2_pct: 20,
    step3_year: 2042, step3_pct: 30,
    step4_year: 2047, step4_pct: 85,
    step5_year: null, step5_pct: null,
  },
];

// ── Table 2: Country-level overrides ──────────────────────────────────────────
// Only countries whose schedule deviates from their group default.
// TODO: populate from KIP table data once schema is confirmed.
// Format: same columns as kigali_group_schedules + country_code + notes
//
// Example entry (replace with real data from KIP table):
// {
//   country_code: 'IND',
//   group_type:   'Article 5 Group 2',
//   freeze_year:  2028,
//   step1_year: 2032, step1_pct: 10,   // same as default
//   step2_year: 2037, step2_pct: 20,   // override if different
//   step3_year: 2042, step3_pct: 30,
//   step4_year: 2047, step4_pct: 85,
//   step5_year: null, step5_pct: null,
//   notes: 'Source: KIP table override'
// },

const COUNTRY_OVERRIDES = [
  // ← paste country-specific rows here once KIP table data is confirmed
];

async function upsert(table, rows, label) {
  if (!rows.length) {
    console.log(`⏭  ${label}: no rows to insert`);
    return;
  }
  const { error } = await supabase.from(table).upsert(rows);
  if (error) {
    console.error(`✗ ${label}:`, error.message);
  } else {
    console.log(`✓ ${label}: ${rows.length} rows upserted`);
  }
}

async function main() {
  console.log('Populating Kigali schedule tables...\n');
  await upsert('kigali_group_schedules',             GROUP_SCHEDULES,   'kigali_group_schedules');
  await upsert('kigali_country_schedule_overrides',  COUNTRY_OVERRIDES, 'kigali_country_schedule_overrides');
  console.log('\nDone.');
}

main().catch(console.error);
