import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import type { Database } from '$lib/types/supabase';

const SUPABASE_URL = 'https://hcpmdkkavtadgugrqohl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcG1ka2thdnRhZGd1Z3Jxb2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODcwMzAsImV4cCI6MjA3Nzg2MzAzMH0.hjYqzGqAQ_C7vVsAo-UcSICFEpzsKP5R5xGi8sh-etA';

export const createSupabaseServerClient = (event: RequestEvent) => {
  const isSecure = event.url.protocol === 'https:';
  const url = event.platform?.env?.PUBLIC_SUPABASE_URL || SUPABASE_URL;
  const key = event.platform?.env?.PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        get(key) {
          return event.cookies.get(key);
        },
        set(key, value, options) {
          const { domain, ...rest } = options ?? {};
          event.cookies.set(key, value, {
            ...rest,
            path: '/',
            sameSite: rest.sameSite ?? 'lax',
            secure: isSecure
          } as CookieOptions);
        },
        remove(key, options) {
          const { domain, ...rest } = options ?? {};
          event.cookies.delete(key, {
            ...rest,
            path: '/',
            sameSite: rest.sameSite ?? 'lax',
            secure: isSecure
          } as CookieOptions);
        }
      }
    }
  );
};
