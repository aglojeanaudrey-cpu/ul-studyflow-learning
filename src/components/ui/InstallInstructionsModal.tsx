import React from "react";
import {
  X,
  Smartphone,
  MoreVertical,
  Share,
  Plus,
  Download,
  Chrome,
  ShieldAlert,
  Settings,
  CheckCircle2,
  Lock,
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
      subtitle: "Suis ces étapes exactement",
      icon: Chrome,
      steps: [
        {
          icon: Download,
          title: "1. Télécharge l'application",
          description:
            "Appuie sur le bouton vert « Télécharger l'APK » en bas de cet écran. Le fichier se télécharge dans ton téléphone.",
        },
        {
          icon: ShieldAlert,
          title: "2. Un avertissement va apparaître — c'est NORMAL",
          description:
            "Android affichera : « Pour votre sécurité, votre téléphone n'est pas autorisé à installer des applications inconnues ». Ce n'est PAS un virus. C'est parce que l'app ne vient pas du Play Store.",
        },
        {
          icon: Settings,
          title: "3. Appuie sur « Paramètres »",
          description:
            "Sur l'écran d'avertissement, appuie sur le bouton « Paramètres » (ou « Configurer »). Tu arrives dans les réglages de Chrome.",
        },
        {
          icon: Lock,
          title: "4. Active « Autoriser depuis cette source »",
          description:
            "Cherche l'interrupteur à côté de « Autoriser l'installation d'applications » et active-le. Puis appuie sur la flèche retour.",
        },
        {
          icon: CheckCircle2,
          title: "5. Appuie sur « Installer »",
          description:
            "Retourne sur l'écran précédent, appuie sur « Installer ». L'app s'ajoute à ton écran d'accueil avec le logo UL Study Flow.",
        },
      ],
    },
    ios: {
      title: "Installer sur iPhone / iPad",
      subtitle: "Via Safari uniquement",
      icon: Share,
      steps: [
        {
          icon: Share,
          title: "1. Ouvre le site dans Safari",
          description:
            "Sur iPhone, l'installation ne fonctionne QUE depuis Safari (pas Chrome). Ouvre ul-studyflow-learning.pages.dev dans Safari.",
        },
        {
          icon: Share,
          title: "2. Appuie sur « Partager »",
          description:
            "L'icône Partager (carré avec flèche vers le haut) se trouve en bas de l'écran Safari.",
        },
        {
          icon: Plus,
          title: "3. Choisis « Sur l'écran d'accueil »",
          description:
            "Fais défiler le menu vers le bas pour trouver l'option << Sur l'écran d'accueil >>, puis appuie dessus.",
        },
        {
          icon: Smartphone,
          title: "4. Confirme avec « Ajouter »",
          description:
            "L'app s'ajoute à ton écran d'accueil. Ouvre-la pour un accès plein écran.",
        },
      ],
    },
    desktop: {
      title: "Installer sur ordinateur",
      subtitle: "Chrome ou Edge",
      icon: Chrome,
      steps: [
        {
          icon: Plus,
          title: "1. Cherche l'icône d'installation",
          description:
            "Une petite icône ⊕ apparaît dans la barre d'adresse, à droite de l'URL.",
        },
        {
          icon: Download,
          title: "2. Clique sur « Installer »",
          description:
            "Confirme dans la popup qui s'affiche. L'app s'installe comme un raccourci.",
        },
        {
          icon: Smartphone,
          title: "3. Lance depuis ton bureau",
          description:
            "Un raccourci est créé sur ton bureau et dans ton menu Démarrer.",
        },
      ],
    },
  }[platform];

  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111B21] rounded-3xl max-w-md w-full shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] p-5 text-white relative shrink-0">
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
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-2xl ${
                  index === 1 && platform === "android"
                    ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                    : "bg-transparent"
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-[#25D366]/15 flex items-center justify-center shrink-0">
                  <StepIcon className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
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

        {/* Footer avec bouton de téléchargement APK (Android uniquement) */}
        <div className="p-4 border-t border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34]/40 shrink-0">
          {platform === "android" && (
            <a
              href="/app-release-signed.apk"
              download
              className="w-full py-3 rounded-xl bg-[#25D366] text-[#075E54] text-sm font-bold hover:bg-[#1faa54] transition-colors flex items-center justify-center gap-2 mb-2 shadow-sm active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Télécharger l'APK (Android)
            </a>
          )}
          <div className="flex items-start gap-2 text-[11px] text-[#667781] dark:text-[#8696A0] mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#25D366]" />
            <p>
              Une fois installée, l'app s'ouvre en plein écran. Le dashboard et
              les chapitres déjà consultés restent accessibles hors ligne.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] text-[#111B21] dark:text-white text-sm font-bold hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
