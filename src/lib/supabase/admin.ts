/**
 * Supabase admin client for privileged server-side operations
 * Uses service role key - NEVER expose to client
 *
 * TODO: Implement in Phase 2 (Database setup)
 */

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  // TODO: Add proper admin client in Phase 2
  // WARNING: Only use on server-side, never in browser
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
