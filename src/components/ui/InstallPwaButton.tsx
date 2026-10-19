import React from "react";
import { Download } from "lucide-react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

export const InstallPwaButton: React.FC = () => {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();

  // Si déjà installé ou si le navigateur ne supporte pas, on n'affiche rien
  if (isInstalled || !canInstall) return null;

  return (
    <button
      onClick={promptInstall}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-[#075E54] font-bold text-sm shadow-2xl hover:bg-[#1faa54] transition-all animate-bounce"
    >
      <Download className="w-4 h-4" />
      Installer UL Study Flow
    </button>
  );
};
