import React from "react";
import {
  X,
  Smartphone,
  MoreVertical,
  Share,
  Plus,
  Download,
  Chrome,
} from "lucide-react";

interface InstallInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: "android" | "ios" | "desktop";
}

export const InstallInstructionsModal: React.FC<
  InstallInstructionsModalProps
> = ({ isOpen, onClose, platform }) => {
  if (!isOpen) return null;

  const config = {
    android: {
      title: "Installer sur Android",
      subtitle: "3 étapes simples avec Chrome",
      icon: Chrome,
      steps: [
        {
          icon: MoreVertical,
          title: "Ouvre le menu Chrome",
          description:
            "Appuie sur les trois points ⋮ en haut à droite de la barre d'adresse.",
        },
        {
          icon: Download,
          title: "Choisis « Installer l'application »",
          description:
            "L'option apparaît dans le menu. Tu peux aussi choisir « Ajouter à l'écran d'accueil ».",
        },
        {
          icon: Smartphone,
          title: "Confirme l'installation",
          description:
            "L'app s'ajoute à ton écran d'accueil. Ouvre-la pour un accès plein écran, sans barre d'adresse.",
        },
      ],
    },
    ios: {
      title: "Installer sur iPhone / iPad",
      subtitle: "3 étapes simples avec Safari",
      icon: Share,
      steps: [
        {
          icon: Share,
          title: "Appuie sur « Partager »",
          description:
            "L'icône Partager (carré avec flèche vers le haut) se trouve en bas de l'écran Safari.",
        },
        {
          icon: Plus,
          title: "Choisis « Sur l'écran d'accueil »",
          description:
            "Fais défiler le menu vers le bas pour trouver cette option, puis appuie dessus.",
        },
        {
          icon: Smartphone,
          title: "Confirme avec « Ajouter »",
          description:
            "L'app s'ajoute à ton écran d'accueil. Ouvre-la pour un accès plein écran.",
        },
      ],
    },
    desktop: {
      title: "Installer sur ordinateur",
      subtitle: "1 clic dans Chrome ou Edge",
      icon: Chrome,
      steps: [
        {
          icon: Plus,
          title: "Cherche l'icône d'installation",
          description:
            "Une petite icône ⊕ apparaît dans la barre d'adresse, à droite de l'URL.",
        },
        {
          icon: Download,
          title: "Clique sur « Installer »",
          description:
            "Confirme dans la popup qui s'affiche. L'app s'installe comme un raccourci.",
        },
        {
          icon: Smartphone,
          title: "Lance depuis ton bureau",
          description:
            "Un raccourci est créé sur ton bureau et dans ton menu Démarrer / Launchpad.",
        },
      ],
    },
  }[platform];

  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111B21] rounded-3xl max-w-md w-full shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-br from-[#075E54] to-[#128C7E] p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/25 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-[#25D366]" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base leading-tight">
                {config.title}
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                {config.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {config.steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                {/* Numéro + icône */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#25D366]/15 flex items-center justify-center">
                    <StepIcon className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#25D366] text-[#075E54] text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-[#111B21]">
                    {index + 1}
                  </span>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-sm font-bold text-[#111B21] dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34]/40">
          <div className="flex items-start gap-2 text-[11px] text-[#667781] dark:text-[#8696A0] mb-3">
            <Download className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#25D366]" />
            <p>
              Une fois installée, l'app s'ouvre en plein écran comme une vraie
              application. Le dashboard et les chapitres déjà consultés restent
              accessibles hors ligne.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#25D366] text-[#075E54] text-sm font-bold hover:bg-[#1faa54] transition-colors active:scale-[0.98]"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};
