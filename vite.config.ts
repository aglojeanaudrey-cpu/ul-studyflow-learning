import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { sitemapPlugin } from "vite-plugin-sitemap-from-routes";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Configuration du plugin Sitemap
      sitemapPlugin({
        baseUrl: "https://ul-studyflow-learning.pages.dev",
        // Tu peux pointer vers ton fichier de routes existant si tu en as un
        // Ou simplement lister les routes directement si ce n'est pas un fichier TypeScript
        routesFile: "src/routes-list.js",
        outputFileName: "sitemap.xml",
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
