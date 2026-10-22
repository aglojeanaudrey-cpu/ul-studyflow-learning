import { useEffect } from "react";

interface Options {
  /** Fonction appelée quand on appuie sur "retour". Doit renvoyer true si géré. */
  onBack: () => boolean;
  /** Si true, on empêche la fermeture de l'app. */
  enabled?: boolean;
}

export function useBackButton({ onBack, enabled = true }: Options) {
  useEffect(() => {
    if (!enabled) return;

    const handlePopState = (event: PopStateEvent) => {
      const handled = onBack();
      if (handled) {
        // On repousse une entrée dans l'historique pour rester dans l'app
        event.preventDefault();
        window.history.pushState({ backGuard: true }, "");
      }
    };

    // ⭐ Astuce : on pousse une entrée "sentinel" dans l'historique.
    // Chaque fois que l'utilisateur appuie sur "retour", on intercepte
    // et on re-pousse une entrée tant qu'on est dans une sous-vue.
    window.history.pushState({ backGuard: true }, "");

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onBack, enabled]);
}
