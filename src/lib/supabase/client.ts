import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '$lib/types/supabase';
import { env } from '$env/dynamic/public';

export const supabaseBrowser = createBrowserClient<Database>(
  env.PUBLIC_SUPABASE_URL,
  env.PUBLIC_SUPABASE_ANON_KEY
);
