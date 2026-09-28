import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  // Surface any error passed back via the URL (e.g. a stale email link).
  return { error: url.searchParams.get('error') };
};

export const actions: Actions = {
  'sign-in': async ({ request, locals }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required.' });
    }

    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return fail(400, { error: error.message });
    }

    if (!data.session) {
      return fail(400, { error: 'No session returned from Supabase.' });
    }

    // signInWithPassword already persists the session cookies through the
    // server client's cookie handlers; no second setSession call needed.
    throw redirect(303, '/dashboard');
  }
};
