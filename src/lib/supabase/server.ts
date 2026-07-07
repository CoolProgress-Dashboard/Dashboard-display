import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';
import type { Database } from '$lib/types/supabase';

export const createSupabaseServerClient = (event: RequestEvent) => {
  const isSecure = event.url.protocol === 'https:';

  return createServerClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(key: string) {
          return event.cookies.get(key);
        },
        set(key: string, value: string, options?: CookieOptions) {
          try {
            const { domain, ...rest } = options ?? {};
            event.cookies.set(key, value, {
              ...rest,
              path: '/',
              sameSite: rest.sameSite ?? 'lax',
              secure: isSecure
            } as any);
          } catch {
            // Supabase may attempt to refresh the session after the response
            // has already been sent; silently ignore those late cookie writes.
          }
        },
        remove(key: string, options?: CookieOptions) {
          try {
            const { domain, ...rest } = options ?? {};
            event.cookies.delete(key, {
              ...rest,
              path: '/',
              sameSite: rest.sameSite ?? 'lax',
              secure: isSecure
            } as any);
          } catch {
            // Same as above — ignore late cookie deletes.
          }
        }
      }
    }
  );
};
