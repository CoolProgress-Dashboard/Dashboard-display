import { loadDashboardData } from '$lib/services/dashboard-data';
import type { PageServerLoad } from './$types';

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcG1ka2thdnRhZGd1Z3Jxb2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODcwMzAsImV4cCI6MjA3Nzg2MzAzMH0.hjYqzGqAQ_C7vVsAo-UcSICFEpzsKP5R5xGi8sh-etA';

// Simple in-memory cache with TTL
let cachedData: any = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const load: PageServerLoad = async () => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedData && (now - cacheTimestamp) < CACHE_TTL_MS) {
    console.log('[Dashboard] Serving from cache');
    return { data: cachedData, cached: true };
  }

  // Fetch fresh data
  console.log('[Dashboard] Fetching fresh data from Supabase...');
  try {
    const data = await loadDashboardData(SUPABASE_URL, SUPABASE_KEY);
    
    // Update cache
    cachedData = data;
    cacheTimestamp = now;
    
    // Log table sizes for monitoring
    console.log('[Dashboard] Data loaded:', {
      countries: data.countries.length,
      pledge: data.pledge.length,
      kigali: data.kigali.length,
      meps: data.meps.length,
      access: data.access.length,
      accessForecast: data.accessForecast.length,
      emissions: data.emissions.length,
      ndcTracker: data.ndcTracker.length,
      ncap: data.ncap.length,
      claspEnergy: data.claspEnergy.length,
      subcool: data.subcool.length,
      regions: data.regions.length,
      refrigerants: data.refrigerants.length
    });
    
    return { data, cached: false };
  } catch (error) {
    console.error('[Dashboard] Failed to load data:', error);
    throw error;
  }
};
