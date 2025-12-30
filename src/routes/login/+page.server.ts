import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

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

    const { error: setSessionError } = await locals.supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });

    if (setSessionError) {
      return fail(400, { error: setSessionError.message });
    }

    throw redirect(303, '/dashboard');
  },
  'magic-link': async ({ request, locals, url }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '');

    if (!email) {
      return fail(400, { error: 'Email is required.' });
    }

    const { error } = await locals.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${url.origin}/auth/callback`
      }
    });

    if (error) {
      return fail(400, { error: error.message });
    }

    return { success: 'Check your email for the sign-in link.' };
  }
};
