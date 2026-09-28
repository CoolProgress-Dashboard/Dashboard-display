import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database, 'public', Database['public']>;
      getSession: () => Promise<Session | null>;
      getUser: () => Promise<User | null>;
    }

    interface PageData {
      session?: Session | null;
    }

    interface Platform {
      env?: {
        PUBLIC_SUPABASE_URL?: string;
        PUBLIC_SUPABASE_ANON_KEY?: string;
      };
    }
  }
}

export {};
