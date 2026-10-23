/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

declare let self: ServiceWorkerGlobalScope
self.skipWaiting()

// Precache des assets statiques
precacheAndRoute(self.__WB_MANIFEST)

// ============ GET : NetworkFirst avec cache ============
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    /\/api\/(courses|sessions|progress|notifications|academic|quizzes|forms|payment-methods)/.test(url.pathname),
  new NetworkFirst({
    cacheName: 'ul-studyflow-api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// ============ POST : BackgroundSync pour les actions hors ligne ============
const bgSyncPlugin = new BackgroundSyncPlugin('ul-studyflow-offline-queue', {
  maxRetentionTime: 24 * 60, // 24 heures
})

// Endpoints qui doivent être rejoués en cas d'échec réseau
const offlineActionsPattern = /\/api\/(sessions\/.+\/complete|quizzes\/.+\/submit|progress)/

registerRoute(
  ({ url, request }) => request.method === 'POST' && offlineActionsPattern.test(url.pathname),
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
)