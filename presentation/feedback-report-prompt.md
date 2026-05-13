# Claude Prompt — Fill in the Feedback Report Presentation

Use this prompt (copy-paste into Claude) to retrieve feedback from Supabase and populate `presentation/feedback-report-2026.html`.

---

## PROMPT TO COPY

```
I need you to help me fill in a presentation template with real feedback data.

## Context

The CoolProgress dashboard has a feedback form that writes to a Supabase table called `feedback`.
The table has these columns:

| Column           | Type    | Description                                      |
|------------------|---------|--------------------------------------------------|
| id               | int     | Auto-incremented primary key                     |
| created_at       | timestamp | When the form was submitted                    |
| user_name        | text    | Optional — respondent's name                     |
| user_email       | text    | Optional — respondent's email                    |
| current_pillar   | text    | Which dashboard pillar they were on when they clicked Feedback |
| q1_rating        | text    | "Yes", "Partially", or "No"                     |
| q1_comment       | text    | Open comment after Q1 rating                     |
| q2_rating        | text    | "Yes", "Partially", or "No"                     |
| q2_comment       | text    | Open comment after Q2 rating (often names partners or regions) |
| q3_missing       | text    | Open answer: what's missing from the dashboard   |
| q4_incorrect     | text    | Open answer: data errors or outdated framing     |
| q5_useful_for    | text    | Open answer: what would make it most useful      |
| other_comments   | text    | Any other free-form comments                     |

## What I need

I have a Supabase project. Please help me:

1. Query all rows from the `feedback` table (I will provide you the data below).
2. Analyse the responses and extract:
   - Total response count
   - Date range of responses (earliest and latest `created_at`)
   - Breakdown of `current_pillar` values (count per pillar)
   - Any named respondents (user_name / user_email if not null)
   - Q1: count of Yes / Partially / No, and select the 2-3 most insightful q1_comment values
   - Q2: count of Yes / Partially / No, and identify partners or regions mentioned in q2_comment; select 2-3 quotes
   - Q3: read all q3_missing values, group into recurring themes (e.g. "district cooling", "Africa data"), rank by frequency; quote the 2-3 most specific ones
   - Q4: read all q4_incorrect values; if any specific data errors are named (section, chart, number), list each one; if none, note "No data errors flagged"
   - Q5: read all q5_useful_for values, group into recurring themes (e.g. "export options", "country drilldowns"), rank by frequency; quote the 2-3 most concrete ones
   - other_comments: quote all non-empty values
   - Propose the top 3 improvement priorities based on the overall feedback, and classify each as Quick Win / Medium-term / Long-term

3. Output a fill-in guide — for each placeholder in the presentation template below, tell me exactly what text to paste in.

## The data

[PASTE HERE: copy the raw JSON or CSV export from your Supabase table.
Go to Supabase → Table Editor → feedback table → click the download/export icon → paste the result below.]

## The presentation template

The template is at: presentation/feedback-report-2026.html

Every placeholder follows this pattern:
  <!-- FILL: description -->
  [text to replace]

For example:
  <!-- FILL: replace with date range, e.g. "12–15 May 2026" -->
  [DATE RANGE]

Please output a numbered list of every placeholder in order, with the exact replacement text.
For the rating bars, output the `width` percentage (as a CSS value like "67%") AND the count number.
For quote cards, output the exact quote text (keep it concise, trim to ~100 words if longer).
For theme tags, output the theme label for each tag and mark any that appear 2+ times as STRONG.
For the 3 priorities, write the title and 2-sentence description.
```

---

## How to export data from Supabase

1. Open [supabase.com](https://supabase.com) → your project → **Table Editor**
2. Click on the **feedback** table
3. Click the **CSV** download button (top-right of the table view), or use:
   ```
   SQL Editor → run:  SELECT * FROM feedback ORDER BY created_at;
   ```
4. Copy the output and paste into the `[PASTE HERE]` section of the prompt above.

---

## After Claude responds

For each fill-in instruction Claude gives you, open `presentation/feedback-report-2026.html` and:

1. Find the relevant `<!-- FILL: ... -->` comment
2. Replace the `[bracketed placeholder text]` below it with the real value
3. For rating bars: set `style="width:XX%"` on the `.rating-bar` div inside that row
4. For theme tags: change `class="theme-tag ph"` to `class="theme-tag"` for ordinary themes, or `class="theme-tag strong"` for themes mentioned by 2+ people
5. Save and open in a browser to review

---

## Quick reference — all placeholder locations

| Slide | Element | Placeholder |
|-------|---------|-------------|
| 1 — Cover | Date range | `[DATE RANGE]` |
| 1 — Cover | Total responses big number | `0` (first occurrence) |
| 1 — Cover | Event name | `[EVENT NAME]` |
| 3 — Snapshot | Big N | `N` |
| 3 — Snapshot | Per-pillar bar widths + counts | 6 rows, each with `width:0%` and `>0<` |
| 3 — Snapshot | Named respondents box | data-placeholder block |
| 4 — Q1 | Yes/Partially/No widths + counts | 3 rating rows |
| 4 — Q1 | Key takeaway sentence | `[Key takeaway from Q1…]` |
| 4 — Q1 | 3 quote cards | `[Quote from a Yes respondent]` etc. |
| 5 — Q2 | Yes/Partially/No widths + counts | 3 rating rows |
| 5 — Q2 | Under-represented partners/regions | 3 theme-tag.ph spans |
| 5 — Q2 | 3 quote cards | `[Quote from a Yes respondent]` etc. |
| 6 — Q3 | Theme tags | 6 theme-tag.ph spans |
| 6 — Q3 | Respondents-who-answered count | `[N] of [Total]…` |
| 6 — Q3 | 3 quote cards | `[Most specific or actionable response]` etc. |
| 7 — Q4 | Data placeholder (or specific flags) | data-placeholder block or quote cards |
| 7 — Q4 | Respondents-who-answered count | `[N] of [Total]…` |
| 7 — Q4 | 3 quote cards (if errors flagged) | `[Specific data point…]` etc. |
| 8 — Q5 | Theme tags | 5 theme-tag.ph spans |
| 8 — Q5 | Top ask box | `[Most frequently or most strongly requested…]` |
| 8 — Q5 | 3 quote cards | `[Most concrete feature request]` etc. |
| 9 — Other | 6 quote cards | `[other_comments value 1]` etc. |
| 10 — Priorities | Priority 1 title + text + tag | `[Priority 1…]` |
| 10 — Priorities | Priority 2 title + text + tag | `[Priority 2]` |
| 10 — Priorities | Priority 3 title + text + tag | `[Priority 3]` |
| 10 — Priorities | Closing line | `[Closing sentence…]` |

---

## Tips

- If a respondent left a field blank, skip that quote card or replace it with a soft note like "No response."
- Rating bar `width` = (count for that option ÷ total Q1 responses) × 100, rounded to nearest integer.
- The `current_pillar` field shows which pillar the user was browsing when they clicked "Feedback" — it may say `not specified` if they accessed the feedback page directly.
- Press **N** while viewing the presentation to see fill-in notes on each slide.
