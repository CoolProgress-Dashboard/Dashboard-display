<script lang="ts">
  // ME-25: country x appliance MEPS lookup. Pick a country and an appliance,
  // see its standards and labels (CLASP Policy Resource Center records in the
  // `meps` table) and, where we hold one, the verified MEPS level from the
  // July 2026 review (meps_level_timeline_v2, JSON fallback).
  import mepsTimelineJson from '$lib/data/meps_timeline_v2.json';
  import type { Meps, MepsTimelineRecord } from '$lib/services/dashboard-types';

  export let mepsData: Meps[] = [];
  export let mepsTimeline: MepsTimelineRecord[] = [];

  $: effectiveTimeline = mepsTimeline.length > 0 ? mepsTimeline : (mepsTimelineJson as MepsTimelineRecord[]);

  const APPLIANCES = [
    { value: 'Air Conditioning', label: 'Air conditioners', timeline: 'AC' },
    { value: 'Domestic Refrigeration', label: 'Refrigerators', timeline: 'Refrigerator' },
    { value: 'Fans', label: 'Fans', timeline: null }
  ];

  // The `meps` table uses ISO alpha-3 (EU as EUN); the timeline uses alpha-2.
  const TIMELINE_CODES: Record<string, string[]> = {
    BRA: ['BR'], CHE: ['CH'], CHN: ['CN'], IND: ['IN'], JPN: ['JP'], KOR: ['KR'],
    NGA: ['NG'], SAU: ['SA'], SGP: ['SG'], TUR: ['TR'], GBR: ['UK'], USA: ['US', 'US_N'],
    ZAF: ['ZA'], EUN: ['EU']
  };

  let selectedCountry = 'NGA';
  let selectedAppliance = 'Air Conditioning';

  $: countryOptions = [...new Map(
    mepsData
      .filter(m => m.country_code && m.country_name)
      .map(m => [m.country_code, m.country_name as string])
  ).entries()]
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // If the default country is missing from the data, fall back to the first one
  $: if (countryOptions.length && !countryOptions.some(c => c.code === selectedCountry)) {
    selectedCountry = countryOptions[0].code;
  }

  const isMeps = (r: Meps) => !!(r.policy_instrument?.includes('MEPS') || r.policy_instrument?.includes('Minimum Performance Standard'));
  const isLabel = (r: Meps) => !!r.policy_instrument?.includes('Label');

  // Deduplicate records that differ only by source row
  $: records = [...new Map(
    mepsData
      .filter(m => m.country_code === selectedCountry && m.equipment_type === selectedAppliance)
      .map(m => [`${m.policy_name}|${m.policy_instrument}|${m.requirement_type}`, m])
  ).values()]
    .sort((a, b) => (b.year_revised ?? b.year_adopted ?? 0) - (a.year_revised ?? a.year_adopted ?? 0));

  $: mandatoryMeps = records.some(r => isMeps(r) && r.requirement_type !== 'Voluntary');
  $: anyMeps = records.some(isMeps);
  $: anyLabel = records.some(isLabel);
  $: latestYear = records.reduce((y, r) => Math.max(y, r.year_revised ?? 0, r.year_adopted ?? 0), 0);

  $: countryName = countryOptions.find(c => c.code === selectedCountry)?.name ?? selectedCountry;
  $: applianceMeta = APPLIANCES.find(a => a.value === selectedAppliance)!;
  $: applianceLabel = applianceMeta.label.toLowerCase();

  $: summary = records.length === 0
    ? `No standards or labels for ${applianceLabel} in ${countryName} are recorded in the database.`
    : `${countryName} has ${mandatoryMeps ? 'a mandatory' : anyMeps ? 'a voluntary' : 'no'} minimum energy performance standard (MEPS) for ${applianceLabel}${anyLabel ? ' and an energy label' : ''}${latestYear ? `, last adopted or revised in ${latestYear}` : ''}.`;

  // MEPS level(s) from the July 2026 review. "Current" = latest record whose
  // status is in force; its start year is the first year of that unchanged
  // level (the dataset repeats flat continuation points). "Next" = the first
  // adopted-but-not-yet-effective step after it.
  $: levelRows = (() => {
    const codes = TIMELINE_CODES[selectedCountry];
    if (!codes || !applianceMeta.timeline) return [];
    return codes.flatMap(code => {
      const recs = effectiveTimeline
        .filter(t => t.country_code === code && t.appliance_type === applianceMeta.timeline && t.meps_level_national != null)
        .sort((a, b) => a.year - b.year);
      if (!recs.length) return [];
      const inForce = recs.filter(t => t.status === 'in_force');
      const current = inForce.length ? inForce[inForce.length - 1] : null;
      let since = current?.year ?? null;
      if (current) {
        for (const t of [...inForce].reverse()) {
          if (t.meps_level_national === current.meps_level_national && t.metric_name === current.metric_name) since = t.year;
          else break;
        }
      }
      const next = recs.find(t => (t.status ?? '').startsWith('adopted_future') && (!current || t.year > current.year)) ?? null;
      return [{ name: recs[0].country_name, current, since, next, nextEstimated: (next?.status ?? '').includes('estimated') }];
    });
  })();

  const isUrl = (s?: string | null) => !!s && /^https?:\/\//.test(s);
</script>

<div class="ml-card">
  <div class="ml-head">
    <div class="ml-title"><i class="fa-solid fa-magnifying-glass"></i> Look up a country's standards</div>
    <p class="ml-sub">Pick a country and an appliance to see which energy performance standards and labels apply.</p>
  </div>

  <div class="ml-controls">
    <label class="ml-field">
      <span>Country</span>
      <select bind:value={selectedCountry}>
        {#each countryOptions as c (c.code)}
          <option value={c.code}>{c.name}</option>
        {/each}
      </select>
    </label>
    <label class="ml-field">
      <span>Appliance</span>
      <select bind:value={selectedAppliance}>
        {#each APPLIANCES as a (a.value)}
          <option value={a.value}>{a.label}</option>
        {/each}
      </select>
    </label>
  </div>

  {#if countryOptions.length === 0}
    <p class="ml-empty">Loading policy data…</p>
  {:else}
    <p class="ml-summary">{summary}</p>

    {#each levelRows as row}
      <div class="ml-level">
        <div class="ml-level-label">MEPS level on record{levelRows.length > 1 ? ` (${row.name})` : ''}</div>
        {#if row.current}
          <div class="ml-level-value">
            {row.current.meps_level_national} <span class="ml-metric">{row.current.metric_name ?? ''}</span>
            <span class="ml-year">in force since {row.since}</span>
          </div>
          {#if row.current.standard_version}<div class="ml-std">{row.current.standard_version}</div>{/if}
        {:else}
          <div class="ml-std">No national level in force on record.</div>
        {/if}
        {#if row.next}
          <div class="ml-next">
            Next step: {row.next.meps_level_national} {row.next.metric_name ?? ''}, effective {row.next.year}{row.nextEstimated ? ' (CoolProgress estimate: the official threshold is not yet published)' : ''}
          </div>
        {/if}
        {#if row.current?.source_url || row.next?.source_url}
          <a class="ml-link" href={row.current?.source_url ?? row.next?.source_url} target="_blank" rel="noopener noreferrer">Source <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
        {/if}
      </div>
    {/each}

    {#if records.length}
      <ul class="ml-list">
        {#each records as r}
          <li>
            <div class="ml-rec-name">{r.policy_name ?? r.policy_instrument}</div>
            <div class="ml-rec-meta">
              {#if r.policy_instrument}<span class="ml-tag">{r.policy_instrument}</span>{/if}
              {#if r.requirement_type && r.requirement_type !== 'Not applicable'}<span class="ml-tag">{r.requirement_type}</span>{/if}
              {#if r.year_adopted}<span>Adopted {r.year_adopted}</span>{/if}
              {#if r.year_revised}<span>Revised {r.year_revised}</span>{/if}
              {#if r.status}<span>{r.status}</span>{/if}
              {#if isUrl(r.notes)}<a class="ml-link" href={r.notes} target="_blank" rel="noopener noreferrer">CLASP record <i class="fa-solid fa-arrow-up-right-from-square"></i></a>{/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}

  <p class="ml-caveat">
    <i class="fa-solid fa-triangle-exclamation"></i>
    Countries test and rate appliances with different methods and metrics (for example CSPF, ISEER, NSEER or EER for air conditioners), so values cannot be compared one to one across countries. Policy records are from the CLASP Policy Resource Center; levels are from the CoolProgress MEPS review (July 2026); where the official threshold is not yet published, the value is marked as an estimate.
  </p>
</div>

<style>
  .ml-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem 1.4rem;
    margin-top: 1.25rem;
  }
  .ml-title { font-weight: 800; color: #0f172a; font-size: 1.05rem; }
  .ml-title i { color: #2d7d5a; margin-right: 0.4rem; }
  .ml-sub { margin: 0.25rem 0 0; color: #475569; font-size: 0.85rem; }
  .ml-controls { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; }
  .ml-field { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.75rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.04em; }
  .ml-field select {
    min-width: 14rem;
    padding: 0.5rem 0.6rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #0f172a;
    background: #f8fafc;
    text-transform: none;
    letter-spacing: normal;
    font-weight: 600;
  }
  .ml-field select:focus-visible { outline: 2px solid #2d7d5a; outline-offset: 1px; }
  .ml-summary { font-size: 0.95rem; color: #0f172a; font-weight: 600; margin: 0 0 0.75rem; }
  .ml-empty { color: #64748b; font-size: 0.85rem; }
  .ml-level { background: #ecf6f0; border-left: 4px solid #2d7d5a; border-radius: 0 8px 8px 0; padding: 0.75rem 1rem; margin-bottom: 0.75rem; }
  .ml-level-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #2d7d5a; }
  .ml-level-value { font-size: 1.3rem; font-weight: 800; color: #0f172a; }
  .ml-metric { font-size: 0.85rem; font-weight: 700; color: #334155; }
  .ml-year { font-size: 0.8rem; font-weight: 600; color: #475569; margin-left: 0.4rem; }
  .ml-std, .ml-next { font-size: 0.8rem; color: #334155; margin-top: 0.15rem; }
  .ml-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .ml-list li { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.6rem 0.8rem; }
  .ml-rec-name { font-weight: 700; font-size: 0.88rem; color: #0f172a; }
  .ml-rec-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; font-size: 0.75rem; color: #475569; margin-top: 0.25rem; }
  .ml-tag { background: #f1f5f9; color: #334155; padding: 1px 6px; border-radius: 4px; font-weight: 600; }
  .ml-link { color: #0369a1; font-weight: 600; font-size: 0.75rem; text-decoration: none; }
  .ml-link i { font-size: 0.6rem; }
  .ml-caveat { margin: 1rem 0 0; font-size: 0.78rem; color: #475569; display: flex; gap: 0.45rem; align-items: flex-start; }
  .ml-caveat i { color: #b45309; margin-top: 0.15rem; }
</style>
