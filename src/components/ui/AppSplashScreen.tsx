import React, { useEffect, useState } from "react";
import { UlStudyFlowLogo } from "../brand/UlStudyFlowLogo";

interface AppSplashScreenProps {
  visible: boolean;
}

/**
 * Splash screen initial au démarrage de l'app (1-2s max).
 * Affiche le logo + 3 dots animés.
 */
export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  visible,
}) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFadeOut(true);
      const t = setTimeout(() => setFadeOut(false), 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible && !fadeOut) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#075E54] dark:bg-[#0B141A] transition-opacity duration-300 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Logo */}
      <div className="mb-8 animate-in fade-in zoom-in-95 duration-500">
        <UlStudyFlowLogo size="lg" lightText showTagline />
      </div>

      {/* Dots animés */}
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-bounce"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-bounce delay-100"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-bounce delay-200"></span>
      </div>

      <p className="text-xs font-semibold text-emerald-200/90 tracking-wider uppercase">
        Chargement de votre espace...
      </p>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <p className="text-[10px] text-emerald-300/70">
          UL Study Flow · Apprendre · Comprendre · Progresser
        </p>
      </div>
    </div>
  );
};
