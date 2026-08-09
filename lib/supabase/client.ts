import { createBrowserClient } from "@supabase/ssr";

// Supabase renamed its dashboard key labels (anon key → "publishable key",
// service_role key → "secret key") on newer projects, but the env var
// names underneath vary by how the project was set up. Support both so a
// project created under either naming convention still works.
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_ANON_KEY
  );
}
