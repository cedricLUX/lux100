import { createClient } from "@supabase/supabase-js";

// Client serveur avec la clé secrète : ignore la sécurité par ligne.
// À n'utiliser que dans des routes serveur (ex. la tâche de rappel).
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
