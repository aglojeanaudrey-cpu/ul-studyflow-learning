import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Client singleton — créé une fois par session, réutilisé partout
let client: SupabaseClient | null = null;

export interface RealtimeCredentials {
  token: string;
  expiresIn: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

/**
 * Initialise le client Supabase avec les credentials renvoyés par le backend.
 * Doit être appelé APRÈS login (l'utilisateur doit être authentifié).
 */
export function initSupabaseClient(creds: RealtimeCredentials): SupabaseClient {
  // Si le client existe déjà, on met juste à jour le token
  if (client) {
    client.realtime.setAuth(creds.token);
    return client;
  }

  client = createClient(creds.supabaseUrl, creds.supabaseAnonKey, {
    auth: {
      persistSession: false, // Pas de session Supabase Auth (on a notre auth Django)
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        // ⭐ Le JWT custom est passé directement ici.
        //    Supabase Realtime l'utilisera pour valider auth.uid()
        //    dans les policies RLS.
        access_token: creds.token,
      },
    },
  });

  // Ceinture + bretelles : on le set aussi via l'API officielle
  client.realtime.setAuth(creds.token);

  return client;
}

export function getSupabaseClient(): SupabaseClient | null {
  return client;
}

export function resetSupabaseClient(): void {
  if (client) {
    client.removeAllChannels();
    client = null;
  }
}

/**
 * Rafraîchit le token Realtime (appelé toutes les 4 min par le hook).
 * Renouvelle côté backend puis pousse le nouveau JWT à Supabase.
 */
export async function refreshRealtimeAuth(
  fetcher: () => Promise<RealtimeCredentials>,
): Promise<void> {
  if (!client) return;
  const creds = await fetcher();
  client.realtime.setAuth(creds.token);
}
