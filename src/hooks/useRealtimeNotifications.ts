import { useEffect, useRef, useState, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { api } from "../lib/api";
import {
  initSupabaseClient,
  getSupabaseClient,
  resetSupabaseClient,
  refreshRealtimeAuth,
} from "../lib/supabaseRealtime";
import type { AppNotification, User } from "../types";

const TOKEN_REFRESH_MS = 4 * 60 * 1000; // 4 min (< TTL 5 min)
const FALLBACK_POLL_MS = 5 * 60 * 1000; // 5 min
const BROADCAST_CHANNEL_NAME = "ulsf-notifications";

interface Options {
  user: User | null;
  onNewNotification?: (n: AppNotification) => void;
  onRefreshNeeded?: () => void;
}

export function useRealtimeNotifications({
  user,
  onNewNotification,
  onRefreshNeeded,
}: Options) {
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeAvailable, setRealtimeAvailable] = useState(true);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const globalChannelRef = useRef<RealtimeChannel | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);
  const fallbackIntervalRef = useRef<number | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // ⭐ Callbacks stables (évite les re-render en boucle)
  const onNewNotificationRef = useRef(onNewNotification);
  const onRefreshNeededRef = useRef(onRefreshNeeded);
  useEffect(() => {
    onNewNotificationRef.current = onNewNotification;
    onRefreshNeededRef.current = onRefreshNeeded;
  }, [onNewNotification, onRefreshNeeded]);

  // ⭐ Point d'attention n°3 : BroadcastChannel multi-onglets
  const setupBroadcastChannel = useCallback(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event.data?.type === "new_notification") {
        onNewNotificationRef.current?.(event.data.notification);
      } else if (event.data?.type === "refresh_needed") {
        onRefreshNeededRef.current?.();
      }
    };
    broadcastChannelRef.current = bc;
  }, []);

  const broadcastToOtherTabs = useCallback((n: AppNotification) => {
    broadcastChannelRef.current?.postMessage({
      type: "new_notification",
      notification: n,
    });
  }, []);

  const cleanup = useCallback(() => {
    const sb = getSupabaseClient();
    if (channelRef.current && sb) {
      sb.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (globalChannelRef.current && sb) {
      sb.removeChannel(globalChannelRef.current);
      globalChannelRef.current = null;
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    broadcastChannelRef.current?.close();
    broadcastChannelRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!user) {
      cleanup();
      resetSupabaseClient();
      return;
    }

    let cancelled = false;

    async function setup() {
      try {
        // 1. Récupère le JWT + credentials Supabase
        const creds = await api.getRealtimeToken();
        if (cancelled) return;

        // 2. Init client Supabase
        const sb = initSupabaseClient(creds);

        // 3. Canal user privé
        const userChannel = sb
          .channel(`notifications:user:${user?.id}`, {
            config: { private: true },
          })
          .on("broadcast", { event: "new_notification" }, (payload) => {
            const notif = payload.payload as AppNotification;
            onNewNotificationRef.current?.(notif);
            broadcastToOtherTabs(notif);
          })
          .subscribe((status, err) => {
            if (cancelled) return;
            if (status === "SUBSCRIBED") {
              setIsConnected(true);
              setRealtimeAvailable(true);
            } else if (
              status === "CHANNEL_ERROR" ||
              status === "TIMED_OUT" ||
              status === "CLOSED"
            ) {
              setIsConnected(false);
              if (status === "CHANNEL_ERROR") {
                // ⭐ Point d'attention n°1 : bascule en fallback si limite atteinte
                console.warn("[Realtime] Channel error → fallback", err);
                setRealtimeAvailable(false);
              }
            }
          });

        channelRef.current = userChannel;

        // 4. Canal global (notifs target_type='ALL')
        const globalChannel = sb
          .channel("notifications:global", {
            config: { private: true },
          })
          .on("broadcast", { event: "new_notification" }, (payload) => {
            const notif = payload.payload as AppNotification;
            onNewNotificationRef.current?.(notif);
            broadcastToOtherTabs(notif);
          })
          .subscribe();

        globalChannelRef.current = globalChannel;

        // 5. Renouvellement JWT toutes les 4 min
        refreshIntervalRef.current = window.setInterval(async () => {
          try {
            await refreshRealtimeAuth(() => api.getRealtimeToken());
          } catch (e) {
            console.warn("[Realtime] Token refresh failed", e);
          }
        }, TOKEN_REFRESH_MS);

        // 6. ⭐ Point d'attention n°2 : fallback polling toutes les 5 min
        //    Toujours actif, rattrape les notifs manquées pendant une déconnexion.
        fallbackIntervalRef.current = window.setInterval(() => {
          onRefreshNeededRef.current?.();
        }, FALLBACK_POLL_MS);
      } catch (err) {
        console.error("[Realtime] Setup failed → fallback polling only", err);
        setRealtimeAvailable(false);
        // Fallback pur : polling seul
        fallbackIntervalRef.current = window.setInterval(() => {
          onRefreshNeededRef.current?.();
        }, FALLBACK_POLL_MS);
      }
    }

    setupBroadcastChannel();
    setup();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [user?.id, cleanup, setupBroadcastChannel, broadcastToOtherTabs]);

  return { isConnected, realtimeAvailable };
}
