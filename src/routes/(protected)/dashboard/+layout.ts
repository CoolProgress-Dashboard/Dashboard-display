import { browser } from '$app/environment';
import { loadDashboardData } from '$lib/services/dashboard-data';
import { SUPABASE_URL, SUPABASE_KEY } from '$lib/components/shared/config';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async () => {
  if (!browser) {
    // Return empty data during SSR; client will hydrate with real data
    return {
      countries: [], pledge: [], kigali: [], meps: [], access: [],
      accessForecast: [], ndc: [], emissions: [], ndcTracker: [], ncap: [],
      claspEnergy: [], subcool: [], regions: [], refrigerants: [], acInverterShare: [],
      acGrowthData: [], coolingMilestones: [], applianceTimeseries: [], peakLoadData: [], countrySpotlights: [],
      mepsTimeline: [], mepsLevels: []
    };
  }
  return await loadDashboardData(SUPABASE_URL, SUPABASE_KEY);
};
