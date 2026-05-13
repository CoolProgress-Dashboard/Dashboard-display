/**
 * Populate Supabase access_country_pct table
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=eyJ... node scripts/populate_access_country_pct.mjs
 *
 * Prerequisites:
 *   - Table created via: sql/create_access_country_pct.sql
 *   - Service role key (anon key is read-only)
 *
 * Data source: SEforALL Chilling Prospects 2025 "SUMMARY 2024 BY GENDER" sheet
 *   national_pop  = col P  (total national population tracked by SEforALL)
 *   total_at_risk = D+E+F+G (Rural Poor High + Urban Poor High + Lower-Mid Medium + Middle-Income Low)
 *   pct_at_risk   = total_at_risk / national_pop
 */

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: Set SUPABASE_SERVICE_KEY environment variable');
  process.exit(1);
}

async function upsertBatch(table, rows, batchSize = 50) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  let upserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Upsert failed (batch ${i / batchSize + 1}): ${res.status} ${err}`);
    }
    upserted += batch.length;
    console.log(`  ${table}: ${upserted}/${rows.length}`);
  }
  return upserted;
}

// 77 rows — SEforALL Chilling Prospects 2025, SUMMARY 2024 BY GENDER sheet
// total_at_risk  = D+E+F+G (Rural Poor High Risk + Urban Poor High Risk + Lower-Mid Medium + Middle-Income Low, both sexes)
// pct_at_risk    = (D+E) / national_pop = col Q (HIGH RISK only: Rural Poor + Urban Poor)
// female_at_risk = H+I+J+K (all 4 risk groups, female)
// male_at_risk   = L+M+N+O (all 4 risk groups, male)
const ROWS = [
  { country_code: 'AFG', country_name: 'Afghanistan',               national_pop: 42647492,    total_at_risk: 1850654,     pct_at_risk: 0.043394, female_at_risk: 933511,    male_at_risk: 917142,    year: 2024 },
  { country_code: 'AGO', country_name: 'Angola',                    national_pop: 37885849,    total_at_risk: 37186435,    pct_at_risk: 0.789609, female_at_risk: 18785068,  male_at_risk: 18401367,  year: 2024 },
  { country_code: 'ARG', country_name: 'Argentina',                 national_pop: 45696159,    total_at_risk: 28267712,    pct_at_risk: 0.008828, female_at_risk: 14237389,  male_at_risk: 14030323,  year: 2024 },
  { country_code: 'BEN', country_name: 'Benin',                     national_pop: 14462724,    total_at_risk: 14306195,    pct_at_risk: 0.402321, female_at_risk: 7132124,   male_at_risk: 7174071,   year: 2024 },
  { country_code: 'BFA', country_name: 'Burkina Faso',              national_pop: 23548781,    total_at_risk: 23342046,    pct_at_risk: 0.345553, female_at_risk: 11714938,  male_at_risk: 11627107,  year: 2024 },
  { country_code: 'BGD', country_name: 'Bangladesh',                national_pop: 173562364,   total_at_risk: 169458783,   pct_at_risk: 0.184625, female_at_risk: 86132930,  male_at_risk: 83325853,  year: 2024 },
  { country_code: 'BLZ', country_name: 'Belize',                    national_pop: 417072,      total_at_risk: 39879,       pct_at_risk: 0.025565, female_at_risk: 19757,     male_at_risk: 20122,     year: 2024 },
  { country_code: 'BOL', country_name: 'Bolivia',                   national_pop: 12413315,    total_at_risk: 8086847,     pct_at_risk: 0.02083,  female_at_risk: 4035243,   male_at_risk: 4051605,   year: 2024 },
  { country_code: 'BRA', country_name: 'Brazil',                    national_pop: 211998573,   total_at_risk: 143915752,   pct_at_risk: 0.036568, female_at_risk: 73114755,  male_at_risk: 70800997,  year: 2024 },
  { country_code: 'BTN', country_name: 'Bhutan',                    national_pop: 791524,      total_at_risk: 40598,       pct_at_risk: 0.000000, female_at_risk: 18900,     male_at_risk: 21698,     year: 2024 },
  { country_code: 'CAF', country_name: 'Central African Republic',  national_pop: 5330690,     total_at_risk: 736902,      pct_at_risk: 0.111882, female_at_risk: 383295,    male_at_risk: 353607,    year: 2024 },
  { country_code: 'CHN', country_name: 'China',                     national_pop: 1407607424,  total_at_risk: 1060096769,  pct_at_risk: 0.049505, female_at_risk: 520067443, male_at_risk: 540029326, year: 2024 },
  { country_code: 'CIV', country_name: "Cote d'Ivoire",             national_pop: 31934230,    total_at_risk: 31387456,    pct_at_risk: 0.285923, female_at_risk: 15418949,  male_at_risk: 15968508,  year: 2024 },
  { country_code: 'CMR', country_name: 'Cameroon',                  national_pop: 29123744,    total_at_risk: 28486730,    pct_at_risk: 0.370516, female_at_risk: 14289856,  male_at_risk: 14196874,  year: 2024 },
  { country_code: 'COG', country_name: 'Congo, Rep.',               national_pop: 6332961,     total_at_risk: 6242500,     pct_at_risk: 0.76081,  female_at_risk: 3121630,   male_at_risk: 3120870,   year: 2024 },
  { country_code: 'COL', country_name: 'Colombia',                  national_pop: 52886363,    total_at_risk: 14868675,    pct_at_risk: 0.04325,  female_at_risk: 7532150,   male_at_risk: 7336525,   year: 2024 },
  { country_code: 'DJI', country_name: 'Djibouti',                  national_pop: 1168722,     total_at_risk: 1135907,     pct_at_risk: 0.237512, female_at_risk: 572860,    male_at_risk: 563047,    year: 2024 },
  { country_code: 'DOM', country_name: 'Dominican Republic',        national_pop: 11427557,    total_at_risk: 8892729,     pct_at_risk: 0.07407,  female_at_risk: 4471722,   male_at_risk: 4421008,   year: 2024 },
  { country_code: 'DZA', country_name: 'Algeria',                   national_pop: 46814308,    total_at_risk: 44321914,    pct_at_risk: 0.04618,  female_at_risk: 21718602,  male_at_risk: 22603312,  year: 2024 },
  { country_code: 'ECU', country_name: 'Ecuador',                   national_pop: 18135478,    total_at_risk: 5376290,     pct_at_risk: 0.016047, female_at_risk: 2696033,   male_at_risk: 2680257,   year: 2024 },
  { country_code: 'EGY', country_name: 'Egypt',                     national_pop: 116538258,   total_at_risk: 113196241,   pct_at_risk: 0.010705, female_at_risk: 56043480,  male_at_risk: 57152761,  year: 2024 },
  { country_code: 'ERI', country_name: 'Eritrea',                   national_pop: 3535603,     total_at_risk: 115704,      pct_at_risk: 0.032725, female_at_risk: 60783,     male_at_risk: 54921,     year: 2024 },
  { country_code: 'ETH', country_name: 'Ethiopia',                  national_pop: 132059767,   total_at_risk: 17279072,    pct_at_risk: 0.034269, female_at_risk: 8621557,   male_at_risk: 8657514,   year: 2024 },
  { country_code: 'GEO', country_name: 'Georgia',                   national_pop: 3715519,     total_at_risk: 949398,      pct_at_risk: 0.017506, female_at_risk: 506849,    male_at_risk: 442548,    year: 2024 },
  { country_code: 'GHA', country_name: 'Ghana',                     national_pop: 34427414,    total_at_risk: 33693388,    pct_at_risk: 0.393449, female_at_risk: 16865744,  male_at_risk: 16827644,  year: 2024 },
  { country_code: 'GIN', country_name: 'Guinea',                    national_pop: 14754785,    total_at_risk: 14721112,    pct_at_risk: 0.25754,  female_at_risk: 7436508,   male_at_risk: 7284604,   year: 2024 },
  { country_code: 'GMB', country_name: 'Gambia',                    national_pop: 2759988,     total_at_risk: 2716649,     pct_at_risk: 0.360834, female_at_risk: 1363895,   male_at_risk: 1352754,   year: 2024 },
  { country_code: 'GNB', country_name: 'Guinea-Bissau',             national_pop: 2201352,     total_at_risk: 2193274,     pct_at_risk: 0.481684, female_at_risk: 1109256,   male_at_risk: 1084017,   year: 2024 },
  { country_code: 'GTM', country_name: 'Guatemala',                 national_pop: 18406359,    total_at_risk: 5836889,     pct_at_risk: 0.073249, female_at_risk: 2941907,   male_at_risk: 2894982,   year: 2024 },
  { country_code: 'HND', country_name: 'Honduras',                  national_pop: 10825703,    total_at_risk: 3570319,     pct_at_risk: 0.047512, female_at_risk: 1772919,   male_at_risk: 1797400,   year: 2024 },
  { country_code: 'IDN', country_name: 'Indonesia',                 national_pop: 283487931,   total_at_risk: 270746197,   pct_at_risk: 0.089083, female_at_risk: 134738990, male_at_risk: 136007207, year: 2024 },
  { country_code: 'IND', country_name: 'India',                     national_pop: 1450935791,  total_at_risk: 1437334372,  pct_at_risk: 0.219711, female_at_risk: 696025908, male_at_risk: 741308464, year: 2024 },
  { country_code: 'IRN', country_name: 'Iran',                      national_pop: 91567738,    total_at_risk: 75863482,    pct_at_risk: 0.004717, female_at_risk: 37311871,  male_at_risk: 38551611,  year: 2024 },
  { country_code: 'IRQ', country_name: 'Iraq',                      national_pop: 46042015,    total_at_risk: 42645717,    pct_at_risk: 0.26629,  female_at_risk: 21239429,  male_at_risk: 21406288,  year: 2024 },
  { country_code: 'JOR', country_name: 'Jordan',                    national_pop: 11552876,    total_at_risk: 8476504,     pct_at_risk: 0.076507, female_at_risk: 4105494,   male_at_risk: 4371009,   year: 2024 },
  { country_code: 'KEN', country_name: 'Kenya',                     national_pop: 56432944,    total_at_risk: 36566578,    pct_at_risk: 0.287602, female_at_risk: 18387223,  male_at_risk: 18179355,  year: 2024 },
  { country_code: 'KHM', country_name: 'Cambodia',                  national_pop: 17638801,    total_at_risk: 1221600,     pct_at_risk: 0.069256, female_at_risk: 619638,    male_at_risk: 601963,    year: 2024 },
  { country_code: 'LAO', country_name: 'Laos',                      national_pop: 7769819,     total_at_risk: 7492323,     pct_at_risk: 0.10702,  female_at_risk: 3727720,   male_at_risk: 3764604,   year: 2024 },
  { country_code: 'LBN', country_name: 'Lebanon',                   national_pop: 5805962,     total_at_risk: 729159,      pct_at_risk: 0.000000, female_at_risk: 374545,    male_at_risk: 354615,    year: 2024 },
  { country_code: 'LBR', country_name: 'Liberia',                   national_pop: 5612817,     total_at_risk: 5597800,     pct_at_risk: 0.60028,  female_at_risk: 2803404,   male_at_risk: 2794395,   year: 2024 },
  { country_code: 'LKA', country_name: 'Sri Lanka',                 national_pop: 22159394,    total_at_risk: 20979478,    pct_at_risk: 0.015627, female_at_risk: 10829561,  male_at_risk: 10149917,  year: 2024 },
  { country_code: 'MAR', country_name: 'Morocco',                   national_pop: 38081173,    total_at_risk: 33928785,    pct_at_risk: 0.056198, female_at_risk: 16820560,  male_at_risk: 17108225,  year: 2024 },
  { country_code: 'MEX', country_name: 'Mexico',                    national_pop: 130861007,   total_at_risk: 72128446,    pct_at_risk: 0.077269, female_at_risk: 37150564,  male_at_risk: 34977882,  year: 2024 },
  { country_code: 'MLI', country_name: 'Mali',                      national_pop: 24478595,    total_at_risk: 24268090,    pct_at_risk: 0.336166, female_at_risk: 12023529,  male_at_risk: 12244561,  year: 2024 },
  { country_code: 'MMR', country_name: 'Myanmar',                   national_pop: 54500091,    total_at_risk: 53755640,    pct_at_risk: 0.176759, female_at_risk: 26997369,  male_at_risk: 26758271,  year: 2024 },
  { country_code: 'MOZ', country_name: 'Mozambique',                national_pop: 34631766,    total_at_risk: 34430686,    pct_at_risk: 0.905058, female_at_risk: 17726161,  male_at_risk: 16704525,  year: 2024 },
  { country_code: 'MRT', country_name: 'Mauritania',                national_pop: 5169395,     total_at_risk: 5090022,     pct_at_risk: 0.287037, female_at_risk: 2593230,   male_at_risk: 2496791,   year: 2024 },
  { country_code: 'MWI', country_name: 'Malawi',                    national_pop: 21655286,    total_at_risk: 21636845,    pct_at_risk: 0.803194, female_at_risk: 11078799,  male_at_risk: 10558045,  year: 2024 },
  { country_code: 'NAM', country_name: 'Namibia',                   national_pop: 3030131,     total_at_risk: 2574097,     pct_at_risk: 0.193568, female_at_risk: 1317001,   male_at_risk: 1257096,   year: 2024 },
  { country_code: 'NER', country_name: 'Niger',                     national_pop: 27032412,    total_at_risk: 26960268,    pct_at_risk: 0.48612,  female_at_risk: 13271570,  male_at_risk: 13688698,  year: 2024 },
  { country_code: 'NGA', country_name: 'Nigeria',                   national_pop: 232679478,   total_at_risk: 232081678,   pct_at_risk: 0.534741, female_at_risk: 114710235, male_at_risk: 117371443, year: 2024 },
  { country_code: 'NPL', country_name: 'Nepal',                     national_pop: 29651054,    total_at_risk: 30647864,    pct_at_risk: 0.06688,  female_at_risk: 15970203,  male_at_risk: 14677661,  year: 2024 },
  { country_code: 'PAK', country_name: 'Pakistan',                  national_pop: 251269164,   total_at_risk: 249167767,   pct_at_risk: 0.183078, female_at_risk: 122800104, male_at_risk: 126367663, year: 2024 },
  { country_code: 'PER', country_name: 'Peru',                      national_pop: 34217848,    total_at_risk: 29241010,    pct_at_risk: 0.031326, female_at_risk: 14698577,  male_at_risk: 14542433,  year: 2024 },
  { country_code: 'PHL', country_name: 'Philippines',               national_pop: 115843670,   total_at_risk: 111639593,   pct_at_risk: 0.172072, female_at_risk: 55952526,  male_at_risk: 55687067,  year: 2024 },
  { country_code: 'PNG', country_name: 'Papua New Guinea',          national_pop: 10576502,    total_at_risk: 10491695,    pct_at_risk: 0.360442, female_at_risk: 5096087,   male_at_risk: 5395608,   year: 2024 },
  { country_code: 'PRY', country_name: 'Paraguay',                  national_pop: 6929153,     total_at_risk: 4822488,     pct_at_risk: 0.06819,  female_at_risk: 2404605,   male_at_risk: 2417883,   year: 2024 },
  { country_code: 'PSE', country_name: 'West Bank and Gaza',        national_pop: 5250899,     total_at_risk: 708663,      pct_at_risk: 0.017317, female_at_risk: 356852,    male_at_risk: 351811,    year: 2024 },
  { country_code: 'SDN', country_name: 'Sudan',                     national_pop: 50448963,    total_at_risk: 50258120,    pct_at_risk: 0.64459,  female_at_risk: 25339992,  male_at_risk: 24918128,  year: 2024 },
  { country_code: 'SEN', country_name: 'Senegal',                   national_pop: 18501984,    total_at_risk: 18080982,    pct_at_risk: 0.189493, female_at_risk: 8889840,   male_at_risk: 9191142,   year: 2024 },
  { country_code: 'SLE', country_name: 'Sierra Leone',              national_pop: 8642022,     total_at_risk: 3010833,     pct_at_risk: 0.164576, female_at_risk: 1509263,   male_at_risk: 1501570,   year: 2024 },
  { country_code: 'SLV', country_name: 'El Salvador',               national_pop: 6338193,     total_at_risk: 223461,      pct_at_risk: 0.004873, female_at_risk: 117314,    male_at_risk: 106147,    year: 2024 },
  { country_code: 'SOM', country_name: 'Somalia',                   national_pop: 19009151,    total_at_risk: 580386,      pct_at_risk: 0.030532, female_at_risk: 290193,    male_at_risk: 290193,    year: 2024 },
  { country_code: 'SSD', country_name: 'South Sudan',               national_pop: 11943408,    total_at_risk: 11932138,    pct_at_risk: 0.805729, female_at_risk: 6063317,   male_at_risk: 5868821,   year: 2024 },
  { country_code: 'SWZ', country_name: 'Eswatini',                  national_pop: 1242822,     total_at_risk: 1170964,     pct_at_risk: 0.342641, female_at_risk: 596053,    male_at_risk: 574911,    year: 2024 },
  { country_code: 'SYR', country_name: 'Syria',                     national_pop: 24672760,    total_at_risk: 9618009,     pct_at_risk: 0.13126,  female_at_risk: 4807137,   male_at_risk: 4810872,   year: 2024 },
  { country_code: 'TCD', country_name: 'Chad',                      national_pop: 20299123,    total_at_risk: 20174351,    pct_at_risk: 0.487809, female_at_risk: 10055574,  male_at_risk: 10118776,  year: 2024 },
  { country_code: 'TGO', country_name: 'Togo',                      national_pop: 9515236,     total_at_risk: 9422408,     pct_at_risk: 0.370753, female_at_risk: 4679927,   male_at_risk: 4742482,   year: 2024 },
  { country_code: 'THA', country_name: 'Thailand',                  national_pop: 71668011,    total_at_risk: 50435618,    pct_at_risk: 0.020398, female_at_risk: 25878350,  male_at_risk: 24557268,  year: 2024 },
  { country_code: 'TKM', country_name: 'Turkmenistan',              national_pop: 7494498,     total_at_risk: 1920511,     pct_at_risk: 0.02156,  female_at_risk: 977970,    male_at_risk: 942541,    year: 2024 },
  { country_code: 'TLS', country_name: 'Timor-Leste',               national_pop: 1400638,     total_at_risk: 1399611,     pct_at_risk: 0.542362, female_at_risk: 694001,    male_at_risk: 705610,    year: 2024 },
  { country_code: 'TUR', country_name: 'Turkiye',                   national_pop: 85525744,    total_at_risk: 4643478,     pct_at_risk: 0.000462, female_at_risk: 2325741,   male_at_risk: 2317737,   year: 2024 },
  { country_code: 'UGA', country_name: 'Uganda',                    national_pop: 50015092,    total_at_risk: 49608056,    pct_at_risk: 0.516296, female_at_risk: 25004801,  male_at_risk: 24603255,  year: 2024 },
  { country_code: 'UZB', country_name: 'Uzbekistan',                national_pop: 36361859,    total_at_risk: 2345557,     pct_at_risk: 0.0018,   female_at_risk: 1162278,   male_at_risk: 1183279,   year: 2024 },
  { country_code: 'VEN', country_name: 'Venezuela',                 national_pop: 28405543,    total_at_risk: 0,           pct_at_risk: 0.000000, female_at_risk: 0,         male_at_risk: 0,         year: 2024 },
  { country_code: 'VNM', country_name: 'Vietnam',                   national_pop: 100987686,   total_at_risk: 80824517,    pct_at_risk: 0.021476, female_at_risk: 41238565,  male_at_risk: 39585952,  year: 2024 },
  { country_code: 'YEM', country_name: 'Yemen',                     national_pop: 40583164,    total_at_risk: 40479011,    pct_at_risk: 0.592821, female_at_risk: 19973734,  male_at_risk: 20505278,  year: 2024 },
];

async function main() {
  console.log(`Upserting ${ROWS.length} rows into access_country_pct...`);
  const n = await upsertBatch('access_country_pct', ROWS);
  console.log(`Done — ${n} rows upserted.`);
}

main().catch(err => { console.error(err); process.exit(1); });
