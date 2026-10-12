import { useEffect, useState, useCallback } from "react";

interface UseAntiCaptureOptions {
  /** Callback quand une tentative de capture est détectée */
  onCaptureDetected?: (reason: string) => void;
  /** Active/désactive le hook */
  enabled?: boolean;
}

interface UseAntiCaptureReturn {
  /** Vrai si l'utilisateur a changé d'onglet / minimisé la fenêtre */
  isTabHidden: boolean;
  /** Vrai si l'utilisateur a essayé de faire un clic droit */
  rightClickAttempts: number;
  /** Nombre de raccourcis bloqués */
  blockedShortcuts: number;
  /** Réinitialiser les compteurs */
  reset: () => void;
}

/**
 * Hook anti-capture : bloque les tentatives de téléchargement / capture.
 *
 * Protections :
 * - Blocage clic droit (contextmenu)
 * - Blocage Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12, Ctrl+P
 * - Détection changement d'onglet (visibilitychange)
 * - Détection perte de focus
 * - Blocage drag & drop de la vidéo
 * - Détection des outils de dev (taille de fenêtre anormale)
 */
export const useAntiCapture = (
  options: UseAntiCaptureOptions = {},
): UseAntiCaptureReturn => {
  const { onCaptureDetected, enabled = true } = options;

  const [isTabHidden, setIsTabHidden] = useState(false);
  const [rightClickAttempts, setRightClickAttempts] = useState(0);
  const [blockedShortcuts, setBlockedShortcuts] = useState(0);

  const reset = useCallback(() => {
    setRightClickAttempts(0);
    setBlockedShortcuts(0);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // ============ 1. Blocage clic droit ============
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setRightClickAttempts((prev) => prev + 1);
      onCaptureDetected?.("right_click");
      return false;
    };

    // ============ 2. Blocage raccourcis clavier ============
    const handleKeyDown = (e: KeyboardEvent) => {
      const isBlocked =
        // Ctrl+S (Save)
        (e.ctrlKey && e.key.toLowerCase() === "s") ||
        // Ctrl+U (View source)
        (e.ctrlKey && e.key.toLowerCase() === "u") ||
        // Ctrl+P (Print)
        (e.ctrlKey && e.key.toLowerCase() === "p") ||
        // Ctrl+Shift+I (DevTools)
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
        // Ctrl+Shift+J (Console)
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "j") ||
        // Ctrl+Shift+C (Inspect element)
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") ||
        // F12 (DevTools)
        e.key === "F12" ||
        // Ctrl+Shift+S (Save as)
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") ||
        // Ctrl+Shift+E (Network tab)
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e");

      if (isBlocked) {
        e.preventDefault();
        e.stopPropagation();
        setBlockedShortcuts((prev) => prev + 1);
        onCaptureDetected?.(`shortcut_${e.key}`);
      }
    };

    // ============ 3. Détection changement d'onglet ============
    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setIsTabHidden(hidden);
      if (hidden) {
        onCaptureDetected?.("tab_hidden");
      }
    };

    // ============ 4. Détection perte de focus ============
    const handleBlur = () => {
      onCaptureDetected?.("window_blur");
    };

    // ============ 5. Blocage drag & drop ============
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "VIDEO" ||
        target.tagName === "AUDIO" ||
        target.tagName === "IMG"
      ) {
        e.preventDefault();
        onCaptureDetected?.("drag_attempt");
      }
    };

    // ============ 6. Détection PrintScreen (tentative) ============
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.key === "Snapshot") {
        onCaptureDetected?.("printscreen_attempt");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [enabled, onCaptureDetected]);

  return {
    isTabHidden,
    rightClickAttempts,
    blockedShortcuts,
    reset,
  };
};
