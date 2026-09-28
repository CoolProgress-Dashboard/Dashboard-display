import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Validate the token with Supabase before granting access. A cookie-only
  // session (locals.getSession) can be stale or forged.
  const user = await locals.getUser();
  if (!user) {
    throw redirect(303, '/login');
  }

  const session = await locals.getSession();
  return { session };
};
