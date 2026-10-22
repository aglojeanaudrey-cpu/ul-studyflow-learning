import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { sitemapPlugin } from "vite-plugin-sitemap-from-routes";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Configuration du plugin Sitemap
      sitemapPlugin({
        baseUrl: "https://ul-studyflow-learning.pages.dev",
        // lister les routes directement si ce n'est pas un fichier TypeScript
        routesFile: "src/routes-list.js",
        outputFileName: "sitemap.xml",
      }),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
          runtimeCaching: [
            {
              // endpoints API pour les données de cours
              // Adapte l'URL si ton backend est sur un autre domaine en prod
              urlPattern:
                /^https:\/\/ul-studyflow-learning\.onrender\.com\/api\/(courses|sessions|progress|notifications).*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "ul-studyflow-api-cache",
                networkTimeoutSeconds: 10, // Si le réseau met > 10s, on sert le cache
                expiration: {
                  maxEntries: 100, // Garde les 100 dernières réponses
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semaine
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // mettre en cache les images des cours (pas les vidéos)
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "ul-studyflow-images",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
                },
              },
            },
          ],
        },
        includeAssets: [
          "ul_studyflow_icon.webp",
          "ul_studyflow_icon.png",
          "robots.txt",
        ],
        manifest: {
          name: "UL Study Flow Learning",
          short_name: "UL Study Flow",
          description: "La plateforme de révision pour les étudiants de Lomé",
          theme_color: "#075E54",
          background_color: "#F0F2F5",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "/ul_studyflow_icon.png", // Fond transparent
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/ul_studyflow_icon_maskable.png", // Fond blanc
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "."),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8000",
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
