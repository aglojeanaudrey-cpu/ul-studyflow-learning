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
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        injectManifest: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
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
              src: "/ul_studyflow_icon.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/ul_studyflow_icon_maskable.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      })
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
