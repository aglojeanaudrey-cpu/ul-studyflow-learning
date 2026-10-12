import { useEffect } from "react";
import { useLoading } from "../context/LoadingContext";

/**
 * Hook utilitaire pour marquer une page comme "en chargement".
 * À utiliser dans chaque composant qui charge des données :
 *
 *   usePageLoading(loading);
 *
 * Le composant parent (App) affichera la barre de progression en haut.
 */
export function usePageLoading(loading: boolean) {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (loading) {
      startLoading();
      return () => stopLoading();
    }
  }, [loading, startLoading, stopLoading]);
}
