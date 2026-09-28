import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { EmailOtpType } from '@supabase/supabase-js';

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  let authenticated = false;
  let errorMessage: string | null = null;

  if (code) {
    // PKCE flow (magic link / OAuth style)
    const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
    if (error) errorMessage = error.message;
    else authenticated = true;
  } else if (tokenHash && type) {
    // Token-hash flow used by Supabase's default confirmation/recovery emails
    const { error } = await locals.supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType
    });
    if (error) errorMessage = error.message;
    else authenticated = true;
  } else {
    errorMessage = 'The sign-in link is missing its token.';
  }

  if (!authenticated) {
    const params = new URLSearchParams({
      error:
        errorMessage ??
        'This sign-in link is invalid or has expired. Please request a new one.'
    });
    throw redirect(303, `/login?${params.toString()}`);
  }

  if (type === 'recovery') {
    throw redirect(303, '/reset-password');
  }

  throw redirect(303, '/dashboard');
};
