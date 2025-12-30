import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase';

export type DateRange = {
  startDate: string;
  endDate: string;
};

export const getRevenueByMonth = async (
  supabase: SupabaseClient<Database>,
  range: DateRange
) => {
  const { data, error } = await supabase.rpc('revenue_by_month', {
    start_date: range.startDate,
    end_date: range.endDate
  });

  if (error) throw error;
  return data;
};

export const getUsersByCountry = async (
  supabase: SupabaseClient<Database>,
  range: DateRange
) => {
  const { data, error } = await supabase.rpc('users_by_country', {
    start_date: range.startDate,
    end_date: range.endDate
  });

  if (error) throw error;
  return data;
};
