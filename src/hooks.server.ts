import { createSupabaseServerClient } from '$lib/supabase/server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient(event);
  event.locals.getSession = async () => {
    const { data, error } = await event.locals.supabase.auth.getSession();
    if (error) return null;
    return data.session;
  };

  // Validates the JWT against the Supabase auth server (getSession only reads
  // the unverified cookie). Use this for access-control decisions.
  event.locals.getUser = async () => {
    const { data, error } = await event.locals.supabase.auth.getUser();
    if (error) return null;
    return data.user;
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    }
  });
};
