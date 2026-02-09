import { json } from '@sveltejs/kit';
import { loadEmissionsData } from '$lib/services/dashboard-data';

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcG1ka2thdnRhZGd1Z3Jxb2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODcwMzAsImV4cCI6MjA3Nzg2MzAzMH0.hjYqzGqAQ_C7vVsAo-UcSICFEpzsKP5R5xGi8sh-etA';

export const GET = async ({ setHeaders }) => {
  try {
    const data = await loadEmissionsData(SUPABASE_URL, SUPABASE_KEY);

    setHeaders({
      'cache-control': 'public, max-age=300, stale-while-revalidate=600'
    });

    return json({ data });
  } catch (error) {
    console.error('[Dashboard] Failed to load emissions data:', error);
    return json({ error: 'Failed to load emissions data' }, { status: 500 });
  }
};
