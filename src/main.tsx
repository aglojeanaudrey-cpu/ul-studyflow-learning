import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LoadingProvider } from "./context/LoadingContext";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  // 10% des transactions sont tracées
  tracesSampleRate: 0.1,
  // Actif uniquement en prod
  enabled: import.meta.env.PROD,
  environment: import.meta.env.MODE,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error }: any) => (
        <div
          style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}
        >
          <h1>😕 Une erreur est survenue</h1>
          <p>L'équipe UL Study Flow a été notifiée.</p>
          <button onClick={() => window.location.reload()}>
            Recharger la page
          </button>
          <pre style={{ fontSize: 10, color: "#999", marginTop: 20 }}>
            {error.message}
          </pre>
        </div>
      )}
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
