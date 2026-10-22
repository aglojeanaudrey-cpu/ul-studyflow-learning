import React, { useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { InstallInstructionsModal } from "../ui/InstallInstructionsModal";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { APK_DOWNLOAD_URL } from "../../lib/constants";

interface DownloadApkButtonProps {
  variant?: "primary" | "secondary";
  className?: string;
}

export const DownloadApkButton: React.FC<DownloadApkButtonProps> = ({
  variant = "secondary",
  className = "",
}) => {
  const { platform } = useInstallPrompt();
  const [modalOpen, setModalOpen] = useState(false);

  const baseClass =
    "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95";
  const variants = {
    primary: "bg-[#075E54] text-white hover:bg-[#0a6b5f] shadow-md",
    secondary:
      "bg-white dark:bg-[#111B21] text-[#075E54] dark:text-[#25D366] border-2 border-[#075E54] dark:border-[#25D366] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]",
  };

  // Sur Android → téléchargement direct depuis GitHub Releases
  if (platform === "android") {
    return (
      <a
        href={APK_DOWNLOAD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} ${variants[variant]} ${className}`}
      >
        <Smartphone className="w-4 h-4" />
        Télécharger l'APK Android
      </a>
    );
  }

  // Sur iOS/desktop → ouvrir le modal d'instructions
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`${baseClass} ${variants[variant]} ${className}`}
      >
        <Download className="w-4 h-4" />
        Installer l'application
      </button>
      <InstallInstructionsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        platform={platform}
      />
    </>
  );
};
