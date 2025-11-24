// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

export async function ensureUserSession() {
  // Check current session
  const {
    data: { session }
  } = await supabase.auth.getSession();

  // If none, create an anonymous user
  if (!session?.user) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }

  // Return authenticated user object
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;  // has stable .id
}
