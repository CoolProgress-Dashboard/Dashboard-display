import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '$lib/types/supabase';

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcG1ka2thdnRhZGd1Z3Jxb2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODcwMzAsImV4cCI6MjA3Nzg2MzAzMH0.hjYqzGqAQ_C7vVsAo-UcSICFEpzsKP5R5xGi8sh-etA';

export const supabaseBrowser = createBrowserClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
