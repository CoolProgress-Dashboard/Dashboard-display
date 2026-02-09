#!/usr/bin/env python3
"""
Regenerate Kigali+ (KIP_PLUS) scenario data for CoolProgress Dashboard.

After migration removed incomplete KIP_PLUS and MIT data, this script:
1. Fetches BAU and KIP data for ALL 176 countries
2. Generates KIP_PLUS for 2025-2050 only (Kigali+ starts in 2025)
3. Methodology: accelerated transition to natural refrigerants
   - Starting point: KIP values at each year
   - Target: 3% of BAU direct emissions by 2050 (residual servicing)
   - Linear interpolation from KIP(year) to 3% BAU(2050) from 2025 to 2050
4. Deletes any existing KIP_PLUS data and inserts fresh

Result: 3 scenarios in DB: BAU (2016-2050), KIP (2016-2050), KIP_PLUS (2025-2050)
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


def fetch_all(filter_str):
    """Fetch all records matching a filter, with proper pagination."""
    all_records = []
    offset = 0
    batch_size = 1000  # Supabase default max per request
    while True:
        url = f'{SUPABASE_URL}/rest/v1/global_model_subcool?select=*&{filter_str}&order=id.asc&offset={offset}&limit={batch_size}'
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
        if not data:
            break
        all_records.extend(data)
        print(f'  Fetched {len(all_records)} records (batch of {len(data)})...', flush=True)
        if len(data) < batch_size:
            break  # Last page
        offset += len(data)  # Proper pagination: advance by actual count
    return all_records


def delete_rows(filter_str):
    """Delete rows matching a filter."""
    url = f'{SUPABASE_URL}/rest/v1/global_model_subcool?{filter_str}'
    req = urllib.request.Request(url, headers=HEADERS, method='DELETE')
    try:
        with urllib.request.urlopen(req) as resp:
            return True
    except urllib.error.HTTPError as e:
        print(f'  DELETE error: {e.code} - {e.read().decode()}', flush=True)
        return False


def insert_batch(records, batch_size=500):
    """Insert records in batches."""
    total = len(records)
    inserted = 0
    for i in range(0, total, batch_size):
        batch = records[i:i + batch_size]
        url = f'{SUPABASE_URL}/rest/v1/global_model_subcool'
        data = json.dumps(batch).encode()
        req = urllib.request.Request(url, data=data, headers=HEADERS, method='POST')
        try:
            with urllib.request.urlopen(req) as resp:
                inserted += len(batch)
                print(f'  Inserted {inserted}/{total} records...', flush=True)
        except urllib.error.HTTPError as e:
            error_body = e.read().decode()
            print(f'  INSERT error at batch {i // batch_size}: {e.code} - {error_body}', flush=True)
            # Try one-by-one
            for j, rec in enumerate(batch):
                try:
                    single_data = json.dumps([rec]).encode()
                    single_req = urllib.request.Request(url, data=single_data, headers=HEADERS, method='POST')
                    with urllib.request.urlopen(single_req) as resp2:
                        inserted += 1
                except urllib.error.HTTPError as e2:
                    print(f'    Failed: {rec["country_code"]} {rec["year"]} {rec["subsector"]} - {e2.read().decode()}', flush=True)
    return inserted


def count_rows(filter_str):
    """Count rows matching a filter."""
    url = f'{SUPABASE_URL}/rest/v1/global_model_subcool?{filter_str}&select=id&limit=1'
    headers = {**HEADERS, 'Prefer': 'count=exact'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        content_range = resp.headers.get('content-range', '*/0')
        total = int(content_range.split('/')[-1])
    return total


def main():
    print('=== Regenerating Kigali+ (KIP_PLUS) for ALL Countries ===\n', flush=True)

    # Current state
    print('Current state:', flush=True)
    for s in ['BAU', 'KIP', 'KIP_PLUS', 'MIT']:
        n = count_rows(f'scenario_name=eq.{s}')
        print(f'  {s}: {n} rows', flush=True)

    # Step 1: Fetch all BAU data
    print('\nStep 1: Fetching ALL BAU data...', flush=True)
    bau_data = fetch_all('scenario_name=eq.BAU')
    print(f'  Total BAU: {len(bau_data)} rows', flush=True)

    # Step 2: Fetch all KIP data
    print('\nStep 2: Fetching ALL KIP data...', flush=True)
    kip_data = fetch_all('scenario_name=eq.KIP')
    print(f'  Total KIP: {len(kip_data)} rows', flush=True)

    # Validate
    bau_countries = set(r['country_code'] for r in bau_data)
    kip_countries = set(r['country_code'] for r in kip_data)
    bau_years = sorted(set(r['year'] for r in bau_data))
    kip_years = sorted(set(r['year'] for r in kip_data))
    print(f'  BAU: {len(bau_countries)} countries, years {bau_years[0]}-{bau_years[-1]}', flush=True)
    print(f'  KIP: {len(kip_countries)} countries, years {kip_years[0]}-{kip_years[-1]}', flush=True)

    # Index BAU by (country_code, subsector_id, year)
    bau_index = {}
    for r in bau_data:
        key = (r['country_code'], r['subsector_id'], r['year'])
        bau_index[key] = r

    # Step 3: Generate KIP_PLUS for 2025-2050 only
    print('\nStep 3: Generating KIP_PLUS from KIP + BAU (2025-2050)...', flush=True)
    kip_plus_records = []

    for kip_rec in kip_data:
        year = kip_rec['year']
        if year < 2025:
            continue  # Kigali+ starts in 2025

        cc = kip_rec['country_code']
        sub_id = kip_rec['subsector_id']

        # Look up BAU for same country/subsector/year
        bau_key = (cc, sub_id, year)
        bau_rec = bau_index.get(bau_key)

        kip_direct = kip_rec.get('direct_emission_mt') or 0
        bau_direct = bau_rec.get('direct_emission_mt', 0) if bau_rec else kip_direct

        # Accelerated phase-down methodology:
        # Target: 3% of BAU direct by 2050 (residual servicing emissions)
        # Linear interpolation from KIP at year to 3% of BAU at 2050
        target_2050 = 0.03 * bau_direct
        progress = min(1.0, (year - 2024) / (2050 - 2024))
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
            'ec_gwh': kip_rec.get('ec_gwh') or 0,
        }
        kip_plus_records.append(new_rec)

    print(f'  Generated {len(kip_plus_records)} KIP_PLUS records', flush=True)
    kipp_countries = set(r['country_code'] for r in kip_plus_records)
    kipp_years = sorted(set(r['year'] for r in kip_plus_records))
    print(f'  Covering {len(kipp_countries)} countries, years {kipp_years[0]}-{kipp_years[-1]}', flush=True)

    # Validate totals
    print('\n  Year-by-year global totals:', flush=True)
    for y in sorted(set(r['year'] for r in kip_plus_records)):
        bau_total = sum(r.get('direct_emission_mt', 0) for r in bau_data if r['year'] == y)
        kip_total = sum(r.get('direct_emission_mt', 0) for r in kip_data if r['year'] == y)
        kipp_total = sum(r['direct_emission_mt'] for r in kip_plus_records if r['year'] == y)
        pct_bau = (1 - kipp_total / bau_total) * 100 if bau_total > 0 else 0
        print(f'    {y}: BAU={bau_total:.1f}, KIP={kip_total:.1f}, KIP+={kipp_total:.1f} Mt ({pct_bau:.1f}% reduction)', flush=True)

    # Step 4: Delete existing KIP_PLUS
    print('\nStep 4: Deleting existing KIP_PLUS data...', flush=True)
    old_count = count_rows('scenario_name=eq.KIP_PLUS')
    print(f'  Existing KIP_PLUS rows to delete: {old_count}', flush=True)
    if old_count > 0:
        delete_rows('scenario_name=eq.KIP_PLUS')
        remaining = count_rows('scenario_name=eq.KIP_PLUS')
        print(f'  After delete: {remaining} rows', flush=True)

    # Step 5: Insert new KIP_PLUS
    print(f'\nStep 5: Inserting {len(kip_plus_records)} new KIP_PLUS records...', flush=True)
    inserted = insert_batch(kip_plus_records)
    print(f'  Inserted {inserted} records', flush=True)

    # Step 6: Final validation
    print('\nFinal state:', flush=True)
    for s in ['BAU', 'KIP', 'KIP_PLUS', 'MIT']:
        n = count_rows(f'scenario_name=eq.{s}')
        print(f'  {s}: {n} rows', flush=True)

    print('\n=== Regeneration complete ===', flush=True)


if __name__ == '__main__':
    main()
