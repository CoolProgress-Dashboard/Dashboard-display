import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import type { Database } from '$lib/types/supabase';
import { env } from '$env/dynamic/public';

export const createSupabaseServerClient = (event: RequestEvent) => {
  const isSecure = event.url.protocol === 'https:';

  return createServerClient<Database>(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
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
