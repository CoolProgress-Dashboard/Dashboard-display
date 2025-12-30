# Cooling Dashboard (SvelteKit + Supabase)

This is a scalable SvelteKit skeleton for a Supabase-powered dashboard. It includes:
- Supabase SSR auth with cookie handling
- Protected route group for dashboard pages
- A data access layer for chart datasets via RPC
- Tailwind CSS setup for utility-first styling

## Getting started

1. Copy `.env.example` to `.env` and fill in your Supabase project values.
2. Install dependencies and run the dev server:

```
npm install
npm run dev
```

## Project structure

- `src/lib/supabase` – server/client Supabase clients
- `src/lib/data` – dataset access functions (RPC/views)
- `src/routes/(protected)` – authenticated pages
- `src/lib/styles` – extracted CSS from legacy pages (for migration)

## Next steps

- Generate types with `supabase gen types typescript --project-id <id>` and replace `src/lib/types/supabase.ts`.
- Add materialized views / RPCs for chart datasets.
- Wire charts and maps into `src/routes/(protected)/dashboard`.
