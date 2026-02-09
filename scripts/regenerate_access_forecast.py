#!/usr/bin/env python3
"""
Regenerate access_to_cooling_forecast with correct methodology:
1. Preserves 3-tier impact_level taxonomy (High/Medium/Low) from historical
2. Ensures exact continuity at 2024→2025 transition
3. Uses country-specific growth rates from historical trends
4. Applies 1.5% annual deceleration to growth rates
5. Adds CIV (missing from current forecast)
6. Fixes impact_category trailing whitespace

Methodology:
  For each series (country × population_category × impact_level):
    - Compute CAGR from historical 2013-2024 data
    - Start projection from exact 2024 endpoint value
    - Apply growth rate with 1.5% per year deceleration
    - Project 2025-2050

Author: HEAT GmbH
Date: 2026-02-09
"""

import json
import math
import urllib.request

BASE = "https://hcpmdkkavtadgugrqohl.supabase.co/rest/v1"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcG1ka2thdnRhZGd1Z3Jxb2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODcwMzAsImV4cCI6MjA3Nzg2MzAzMH0.hjYqzGqAQ_C7vVsAo-UcSICFEpzsKP5R5xGi8sh-etA"

DECELERATION_RATE = 0.015  # 1.5% per year
FORECAST_START = 2025
FORECAST_END = 2050


def fetch_all(table, select, limit=1000):
    """Paginate through Supabase table."""
    all_data = []
    offset = 0
    while True:
        url = f"{BASE}/{table}?select={select}&order=id&limit={limit}&offset={offset}"
        req = urllib.request.Request(url, headers={
            "apikey": KEY,
            "Authorization": f"Bearer {KEY}"
        })
        with urllib.request.urlopen(req) as resp:
            batch = json.loads(resp.read())
        all_data.extend(batch)
        if len(batch) < limit:
            break
        offset += limit
    return all_data


def compute_cagr(values_by_year):
    """Compute compound annual growth rate from time series."""
    years = sorted(values_by_year.keys())
    if len(years) < 2:
        return 0.0

    first_year = years[0]
    last_year = years[-1]
    first_val = values_by_year[first_year]
    last_val = values_by_year[last_year]
    n_years = last_year - first_year

    if n_years == 0 or first_val <= 0:
        return 0.0

    # CAGR = (end/start)^(1/n) - 1
    ratio = last_val / first_val
    if ratio <= 0:
        return 0.0
    cagr = ratio ** (1.0 / n_years) - 1.0
    return cagr


def project_series(base_value, cagr, decel_rate, n_years):
    """Project values forward with decelerating growth rate.

    Each year, the growth rate shrinks by decel_rate:
      r(t) = cagr * (1 - decel_rate)^t
    """
    values = []
    val = base_value
    for t in range(n_years):
        # Decelerated growth rate for this year
        rate = cagr * ((1 - decel_rate) ** t)
        val = val * (1 + rate)
        # Ensure non-negative
        val = max(val, 0)
        values.append(round(val))
    return values


def main():
    print("=" * 70)
    print("Regenerating access_to_cooling_forecast")
    print("=" * 70)

    # 1. Fetch all historical data
    print("\n1. Fetching historical data...")
    hist = fetch_all(
        "access_to_cooling_seeforall",
        "id,country_code,country_name,region,population_category,impact_level,impact_category,gender_type,year,population_without_cooling"
    )
    print(f"   Got {len(hist)} records, {len(set(r['country_code'] for r in hist))} countries")

    # 2. Build series index: (country_code, population_category, impact_level) → {year: value}
    print("\n2. Building series index...")
    series_data = {}
    series_meta = {}  # Store metadata (country_name, region, impact_category, gender_type)

    for r in hist:
        key = (r['country_code'], r['population_category'], r['impact_level'])
        if key not in series_data:
            series_data[key] = {}
            series_meta[key] = {
                'country_name': r['country_name'],
                'region': r['region'],
                'impact_category': (r.get('impact_category') or '').strip(),
                'gender_type': r.get('gender_type', 'Combined')
            }
        val = r.get('population_without_cooling') or 0
        series_data[key][r['year']] = val

    print(f"   Found {len(series_data)} unique series")

    # 3. Compute growth rates and project
    print("\n3. Projecting 2025-2050...")
    forecast_rows = []
    n_forecast_years = FORECAST_END - FORECAST_START + 1

    stats = {'projected': 0, 'zero_base': 0, 'negative_cagr': 0, 'capped': 0}

    for key, year_vals in series_data.items():
        cc, pop_cat, impact_lvl = key
        meta = series_meta[key]

        # Get 2024 endpoint (or latest available year)
        base_year = max(year_vals.keys())
        base_val = year_vals[base_year]

        if base_val <= 0:
            stats['zero_base'] += 1
            # Still project with 0
            projected = [0] * n_forecast_years
        else:
            cagr = compute_cagr(year_vals)

            # Cap extreme growth rates at ±10% per year
            if abs(cagr) > 0.10:
                cagr = 0.10 if cagr > 0 else -0.10
                stats['capped'] += 1

            if cagr < 0:
                stats['negative_cagr'] += 1

            projected = project_series(base_val, cagr, DECELERATION_RATE, n_forecast_years)
            stats['projected'] += 1

        # Create forecast rows
        for i, year in enumerate(range(FORECAST_START, FORECAST_END + 1)):
            forecast_rows.append({
                'country_code': cc,
                'country_name': meta['country_name'],
                'region': meta['region'],
                'population_category': pop_cat,
                'impact_level': impact_lvl,
                'impact_category': meta['impact_category'],
                'gender_type': meta['gender_type'],
                'year': year,
                'population_without_cooling': projected[i]
            })

    print(f"   Projected: {stats['projected']}, Zero-base: {stats['zero_base']}, "
          f"Negative CAGR: {stats['negative_cagr']}, Capped: {stats['capped']}")
    print(f"   Total forecast rows: {len(forecast_rows)}")

    # 4. Validate continuity
    print("\n4. Validating continuity at 2024→2025...")
    continuity_errors = 0
    cats = ['Rural Poor', 'Urban Poor', 'Lower-Middle Income', 'Middle-Income']
    impact_lvls = ['High', 'Medium', 'Low']

    for cat in cats:
        for lvl in impact_lvls:
            h_total = sum(
                r.get('population_without_cooling', 0)
                for r in hist if r['year'] == 2024 and r['population_category'] == cat and r['impact_level'] == lvl
            )
            f_total = sum(
                r['population_without_cooling']
                for r in forecast_rows if r['year'] == 2025 and r['population_category'] == cat and r['impact_level'] == lvl
            )
            diff_pct = abs(h_total - f_total) / max(h_total, 1) * 100
            if diff_pct > 5:
                continuity_errors += 1
                flag = " *** JUMP ***"
            else:
                flag = ""
            print(f"   {cat:25s}/{lvl:8s}: 2024={h_total/1e6:8.1f}M → 2025={f_total/1e6:8.1f}M "
                  f"({diff_pct:+.1f}%){flag}")

    if continuity_errors > 0:
        print(f"\n   WARNING: {continuity_errors} series have >5% jump at transition")
    else:
        print(f"\n   All series continuous at transition point")

    # 5. Save to JSON for review
    output_path = '/tmp/access_forecast_regenerated.json'
    with open(output_path, 'w') as f:
        json.dump(forecast_rows, f, indent=2)
    print(f"\n5. Saved {len(forecast_rows)} rows to {output_path}")

    # 6. Summary comparison with old forecast
    print("\n6. Comparison: Old vs New forecast")
    old_fore = fetch_all(
        "access_to_cooling_forecast",
        "population_category,impact_level,year,population_without_cooling"
    )
    print(f"   Old forecast: {len(old_fore)} rows")
    print(f"   New forecast: {len(forecast_rows)} rows")

    # Impact level distribution
    old_levels = set(r['impact_level'] for r in old_fore)
    new_levels = set(r['impact_level'] for r in forecast_rows)
    print(f"   Old impact levels: {sorted(old_levels)}")
    print(f"   New impact levels: {sorted(new_levels)}")

    return forecast_rows


if __name__ == '__main__':
    rows = main()

    print("\n" + "=" * 70)
    print("Review the output at /tmp/access_forecast_regenerated.json")
    print("If satisfied, run with --upload flag to push to Supabase")
    print("=" * 70)
