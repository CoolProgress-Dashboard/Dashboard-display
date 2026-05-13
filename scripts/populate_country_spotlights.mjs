/**
 * Populate Supabase country_spotlights table
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=eyJ... node scripts/populate_country_spotlights.mjs
 *
 * Prerequisites:
 *   - Table created via: sql/create_country_spotlights.sql
 *   - Service role key (anon key is read-only)
 */

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: Set SUPABASE_SERVICE_KEY environment variable');
  process.exit(1);
}

async function insertBatch(table, rows, batchSize = 50) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Insert failed (batch ${i / batchSize + 1}): ${res.status} ${err}`);
    }
    inserted += batch.length;
    console.log(`  ${table}: ${inserted}/${rows.length}`);
  }
  return inserted;
}

const ROWS = [
  {
    spotlight_id: 'china',
    name: 'China',
    region: 'East Asia',
    flag_emoji: 'CN',
    meps_status: 'advanced',
    dominant_refrigerant: 'R-32 (transitioning from R-410A)',
    key_challenge: 'Reducing peak load stress while maintaining export leadership',
    source: 'IEA; CLASP; en.cheaa.org',
    narrative: "China is the world's largest AC market and manufacturer, producing over 200 million units annually. Following stringent MEPS updates, variable-speed technology rose from 60% to 98% of the market in just two years, demonstrating the transformative power of efficiency standards.",
    stats: [
      { label: 'AC stock', value: '730M+', detail: 'Largest AC market globally' },
      { label: 'Annual production', value: '208M units', detail: '2024, surging 1.6% YoY' },
      { label: 'Domestic shipments', value: '100M+ units', detail: '2024, slight dip of 1.5% YoY' },
      { label: 'Exports', value: '85M units', detail: '2024, up 29.1% YoY' },
      { label: 'Household AC ownership', value: '~80%', detail: 'Urban areas near saturation' },
      { label: 'Peak load from cooling', value: '~16%', detail: '2017 baseline; IEA' },
    ],
  },
  {
    spotlight_id: 'india',
    name: 'India',
    region: 'South Asia',
    flag_emoji: 'IN',
    meps_status: 'developing',
    dominant_refrigerant: 'R-32 and R-290 (emerging)',
    key_challenge: 'Scaling access while ensuring efficiency in a market growing 16% annually',
    source: 'IEA Future of Cooling; Renub Research; GlobeNewswire',
    narrative: "India represents the largest untapped cooling market. With only 10% AC penetration and temperatures regularly exceeding 45 degrees C, demand will surge as incomes rise. The IEA projects cooling will account for 45% of India's peak electricity load by 2050, up from just 10% today.",
    stats: [
      { label: 'AC penetration', value: '~10%', detail: 'Only 8-10% of households own AC' },
      { label: 'Annual sales', value: '13.3M units', detail: '2024; 15.4M projected for 2025' },
      { label: 'Market value', value: '$5.4B', detail: '2024; $8.1B projected by 2030' },
      { label: 'Projected peak load share', value: '45%', detail: '2050; up from 10% today' },
      { label: 'Growth rate', value: '16% CAGR', detail: 'Revenue projected to 2030' },
    ],
  },
  {
    spotlight_id: 'southeast-asia',
    name: 'Southeast Asia',
    region: 'Southeast Asia',
    flag_emoji: 'ASEAN',
    meps_status: 'developing',
    dominant_refrigerant: 'R-32 (transitioning); R-290 (emerging in Indonesia)',
    key_challenge: 'Bridging efficiency gaps while cooling demand grows 7%+ annually',
    source: 'IEA; Meticulous Research',
    narrative: 'Southeast Asia is one of the fastest-growing cooling markets, driven by hot humid climates and a rapidly expanding middle class. Indonesia alone is projected to see AC ownership jump from 14% to 85% by 2050. Heat-related mortality in the region has already risen 91% between 2004 and 2018.',
    stats: [
      { label: 'Market growth', value: '7.3% CAGR', detail: '2023-2028 for residential AC' },
      { label: 'Indonesia AC ownership', value: '14%', detail: '2023; projected 85% by 2050' },
      { label: 'Indonesia peak load (2050)', value: '40.7%', detail: 'IEA projection for cooling share' },
      { label: 'Heat mortality increase', value: '+91%', detail: 'SE Asia 2004-2018' },
      { label: 'Market size (2032)', value: '$8.66B', detail: 'SE Asia AC market projected' },
    ],
  },
  {
    spotlight_id: 'africa',
    name: 'Africa',
    region: 'Africa',
    flag_emoji: 'AF',
    meps_status: 'minimal',
    dominant_refrigerant: 'R-22 (phasing out); R-410A',
    key_challenge: 'Providing cooling access where electricity is absent or unreliable',
    source: 'SE4ALL Chilling Prospects 2025; IEA Energy Efficiency 2024',
    narrative: 'Africa faces the deepest cooling access crisis. With only 5% of households owning an AC and the largest share of the 1.2 billion people at high risk from heat, the region needs cooling solutions that work within severe electricity constraints. Vaccines degrade, food spoils, and heat waves grow deadlier.',
    stats: [
      { label: 'AC ownership', value: '~5%', detail: 'Of households; lowest globally' },
      { label: 'Population at risk', value: 'Largest share', detail: 'Of the 1.2B people globally at high risk' },
      { label: 'Without electricity', value: '309M rural', detail: 'Plus 695M in unreliable urban areas' },
      { label: 'Residential market share', value: '61.6%', detail: 'Of total AC installations in 2024' },
    ],
  },
  {
    spotlight_id: 'latin-america',
    name: 'Latin America',
    region: 'Latin America',
    flag_emoji: 'LATAM',
    meps_status: 'developing',
    dominant_refrigerant: 'R-410A (transitioning to R-32)',
    key_challenge: 'Accelerating the Kigali Amendment HFC phasedown while expanding access',
    source: 'IEA; CLASP; IGSD',
    narrative: "Brazil and Mexico lead Latin America's cooling market. Mexico pioneered AC efficiency standards in 1994 and later harmonized them with US standards under NAFTA. Brazil's growing middle class drives demand, with cooling projected to account for 31% of peak electricity by 2050.",
    stats: [
      { label: 'Brazil AC ownership', value: '~30%', detail: 'Of households' },
      { label: 'Brazil peak load (2050)', value: '30.8%', detail: 'IEA projection for cooling share' },
      { label: 'Mexico peak load (2050)', value: '24.3%', detail: 'IEA projection for cooling share' },
      { label: 'Mexico MEPS history', value: 'Since 1994', detail: 'Harmonized with US standards via NAFTA' },
    ],
  },
];

async function main() {
  console.log('Populating country_spotlights...');
  const count = await insertBatch('country_spotlights', ROWS);
  console.log(`Done: ${count} rows inserted into country_spotlights`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
