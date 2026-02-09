#!/usr/bin/env python3
"""
Generate Kigali+ (KIP_PLUS) scenario data for the CoolProgress Dashboard.

Methodology:
- Kigali+ assumes ACCELERATED transition to natural refrigerants (GWP ~3) by 2050
- KIP follows Kigali Amendment schedule: Non-A5 85% by 2036, A5G1 80% by 2045
- KIP+ goes further: 100% natural refrigerants by 2050
- Indirect emissions: same as KIP (same energy efficiency assumptions)
- Direct emissions: KIP baseline, then linear phase-down to 3% of BAU by 2050
  (3% residual = servicing emissions from remaining legacy equipment)
- For years <= 2024: same as KIP
- For 2025-2050: direct_kip_plus = KIP_direct * reduction_factor
  where reduction_factor linearly decreases from 1.0 (2024) to ratio such that
  direct_kip_plus_2050 = 0.03 * BAU_direct_2050
"""
import json
import sys
import urllib.request
import urllib.error

SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcG1ka2thdnRhZGd1Z3Jxb2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODcwMzAsImV4cCI6MjA3Nzg2MzAzMH0.hjYqzGqAQ_C7vVsAo-UcSICFEpzsKP5R5xGi8sh-etA'

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
}

def fetch_all(scenario_name, offset=0, limit=5000):
    """Fetch all records for a scenario."""
    all_records = []
    while True:
        url = f'{SUPABASE_URL}/rest/v1/global_model_subcool?scenario_name=eq.{scenario_name}&order=id&offset={offset}&limit={limit}'
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
        if not data:
            break
        all_records.extend(data)
        offset += limit
        print(f'  Fetched {len(all_records)} {scenario_name} records...', flush=True)
    return all_records

def insert_batch(records, batch_size=500):
    """Insert records in batches."""
    total = len(records)
    inserted = 0
    for i in range(0, total, batch_size):
        batch = records[i:i+batch_size]
        url = f'{SUPABASE_URL}/rest/v1/global_model_subcool'
        data = json.dumps(batch).encode()
        req = urllib.request.Request(url, data=data, headers=HEADERS, method='POST')
        try:
            with urllib.request.urlopen(req) as resp:
                inserted += len(batch)
                print(f'  Inserted {inserted}/{total} records...', flush=True)
        except urllib.error.HTTPError as e:
            error_body = e.read().decode()
            print(f'  ERROR inserting batch {i//batch_size}: {e.code} - {error_body}', flush=True)
            # Try inserting one by one to find the problematic record
            for j, rec in enumerate(batch):
                try:
                    single_data = json.dumps([rec]).encode()
                    single_req = urllib.request.Request(url, data=single_data, headers=HEADERS, method='POST')
                    with urllib.request.urlopen(single_req) as resp2:
                        inserted += 1
                except urllib.error.HTTPError as e2:
                    print(f'    Failed record {i+j}: {rec["country_code"]} {rec["year"]} {rec["subsector"]} - {e2.read().decode()}', flush=True)
    return inserted

def main():
    print('=== Generating Kigali+ (KIP_PLUS) Scenario ===', flush=True)

    # Fetch BAU and KIP data
    print('Fetching BAU data...', flush=True)
    bau_data = fetch_all('BAU')
    print(f'Total BAU records: {len(bau_data)}', flush=True)

    print('Fetching KIP data...', flush=True)
    kip_data = fetch_all('KIP')
    print(f'Total KIP records: {len(kip_data)}', flush=True)

    # Index BAU by (country_code, subsector_id, year)
    bau_index = {}
    for r in bau_data:
        key = (r['country_code'], r['subsector_id'], r['year'])
        bau_index[key] = r

    # Generate KIP_PLUS from KIP
    kip_plus_records = []
    for kip_rec in kip_data:
        year = kip_rec['year']
        cc = kip_rec['country_code']
        sub_id = kip_rec['subsector_id']

        # Look up BAU for this country/subsector/year
        bau_key = (cc, sub_id, year)
        bau_rec = bau_index.get(bau_key)

        # Calculate KIP+ direct emissions
        kip_direct = kip_rec.get('direct_emission_mt') or 0
        bau_direct = bau_rec.get('direct_emission_mt', 0) if bau_rec else kip_direct

        if year <= 2024:
            # Before 2025: same as KIP
            new_direct = kip_direct
        else:
            # 2025-2050: accelerated phase-down
            # Target: 3% of BAU direct by 2050
            target_2050 = 0.03 * bau_direct
            # Linear interpolation from KIP(2024) to target(2050)
            progress = min(1.0, (year - 2024) / (2050 - 2024))
            # Use KIP as starting point, interpolate to 3% of BAU
            new_direct = kip_direct * (1 - progress) + target_2050 * progress
            new_direct = max(0, new_direct)

        new_rec = {
            'scenario_id': 4,
            'scenario_name': 'KIP_PLUS',
            'country_code': cc,
            'country_name': kip_rec.get('country_name', ''),
            'subsector_id': sub_id,
            'subsector': kip_rec.get('subsector', ''),
            'year': year,
            'indirect_emission_mt': kip_rec.get('indirect_emission_mt') or 0,
            'direct_emission_mt': round(new_direct, 6),
            'stock': kip_rec.get('stock') or 0,
            'unit_sales': kip_rec.get('unit_sales') or 0,
            'sales_value': kip_rec.get('sales_value') or 0,
            'ec_gwh': kip_rec.get('ec_gwh') or 0,
            'data_source_flag': 'computed',
        }
        kip_plus_records.append(new_rec)

    print(f'\nGenerated {len(kip_plus_records)} KIP_PLUS records', flush=True)

    # Validate: check 2050 global totals
    total_bau_direct_2050 = sum(r.get('direct_emission_mt', 0) for r in bau_data if r['year'] == 2050)
    total_kip_direct_2050 = sum(r.get('direct_emission_mt', 0) for r in kip_data if r['year'] == 2050)
    total_kipp_direct_2050 = sum(r['direct_emission_mt'] for r in kip_plus_records if r['year'] == 2050)

    print(f'\n2050 Global Direct Emissions (Mt CO2):')
    print(f'  BAU:     {total_bau_direct_2050:.1f}')
    print(f'  KIP:     {total_kip_direct_2050:.1f} ({(1-total_kip_direct_2050/total_bau_direct_2050)*100:.1f}% reduction)')
    print(f'  KIP+:    {total_kipp_direct_2050:.1f} ({(1-total_kipp_direct_2050/total_bau_direct_2050)*100:.1f}% reduction)')

    # Insert into Supabase
    print(f'\nInserting {len(kip_plus_records)} records into Supabase...', flush=True)
    inserted = insert_batch(kip_plus_records)
    print(f'\nDone! Inserted {inserted} KIP_PLUS records.', flush=True)

if __name__ == '__main__':
    main()
