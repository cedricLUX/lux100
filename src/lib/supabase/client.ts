import { createBrowserClient } from "@supabase/ssr";

// Le client navigateur est un singleton : on l'obtient à la demande, dans les
// effets et les gestionnaires d'événements, jamais pendant le rendu serveur.

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
