import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for Server-Side Route Handlers / Server Components.
 * Uses SUPABASE_SERVICE_ROLE_KEY if available (bypasses RLS for administrative operations),
 * otherwise falls back to the public anon key.
 */
export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
