import React, { useState } from "react";
import {
  Smartphone,
  Download,
  ShieldAlert,
  Settings,
  Lock,
  CheckCircle2,
  Share,
  Plus,
  Chrome,
  MoreVertical,
  Wifi,
  WifiOff,
} from "lucide-react";

export const InstallAppSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");

  return (
    <section
      id="install"
      className="py-16 md:py-20 bg-white dark:bg-[#111B21] border-y border-[#E9EDEF] dark:border-[#222E35]"
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] mb-4">
            <Smartphone className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">
              Nouveau · Application mobile
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-white tracking-tight">
            Installe l'application UL Study Flow
          </h2>
          <p className="text-base text-[#667781] dark:text-[#8696A0] mt-3 max-w-2xl mx-auto">
            Accès instantané depuis ton écran d'accueil, mode plein écran, et
            tes chapitres déjà consultés restent disponibles même sans
            connexion.
          </p>
        </div>

        {/* Bénéfices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] text-center">
            <WifiOff className="w-6 h-6 text-[#25D366] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#111B21] dark:text-white">
              Mode hors ligne
            </p>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
              Dashboard et chapitres déjà consultés
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] text-center">
            <Smartphone className="w-6 h-6 text-[#25D366] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#111B21] dark:text-white">
              Plein écran
            </p>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
              Pas de barre d'adresse, comme une vraie app
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] text-center">
            <Wifi className="w-6 h-6 text-[#25D366] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#111B21] dark:text-white">
              Léger
            </p>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
              Économise ton forfait data
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("android")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "android"
                ? "bg-[#075E54] text-white"
                : "bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Android
          </button>
          <button
            onClick={() => setActiveTab("ios")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "ios"
                ? "bg-[#075E54] text-white"
                : "bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]"
            }`}
          >
            <Share className="w-4 h-4" />
            iPhone / iPad
          </button>
        </div>

        {/* Contenu de l'onglet */}
        {activeTab === "android" ? (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-300">
                    Un avertissement va apparaître — c'est normal
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                    Android affiche un message de sécurité parce que l'app ne
                    vient pas du Play Store. Ce n'est PAS un virus. Suis les 3
                    étapes ci-dessous.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Étape 1 */}
              <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111B21] dark:text-white">
                    1. Télécharge l'APK
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                    Appuie sur « Télécharger l'APK » ci-dessous. Le fichier
                    arrive dans tes téléchargements.
                  </p>
                  <a
                    href="/ul-studyflow-learning.apk"
                    download
                    className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1faa54] rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger l'APK
                  </a>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111B21] dark:text-white">
                    2. Autorise l'installation
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                    Sur l'avertissement, appuie sur « Paramètres » → active «
                    Autoriser depuis cette source ».
                  </p>
                </div>
              </div>

              {/* Étape 3 */}
              <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111B21] dark:text-white">
                    3. Retourne et installe
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                    Fais retour, appuie sur « Installer ». L'app apparaît sur
                    ton écran d'accueil.
                  </p>
                </div>
              </div>

              {/* Étape 4 */}
              <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111B21] dark:text-white">
                    4. C'est prêt !
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                    Ouvre l'app, connecte-toi, et révise même hors ligne sur les
                    chapitres déjà consultés.
                  </p>
                </div>
              </div>
            </div>

            {/* Alternative PWA */}
            <div className="mt-6 p-4 rounded-2xl bg-[#075E54]/5 dark:bg-[#075E54]/20 border border-[#128C7E]/20">
              <p className="text-xs text-[#075E54] dark:text-[#25D366] font-semibold mb-2 flex items-center gap-2">
                <Chrome className="w-4 h-4" />
                Alternative sans APK (via Chrome)
              </p>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] leading-relaxed">
                Ouvre le site dans Chrome → appuie sur le menu{" "}
                <MoreVertical className="inline w-3 h-3" /> en haut à droite →
                choisis « Installer l'application » ou « Ajouter à l'écran
                d'accueil ».
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0">
                  <Share className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111B21] dark:text-white">
                    1. Ouvre le site dans Safari
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                    Sur iPhone, l'installation ne fonctionne QUE depuis Safari
                    (pas Chrome).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0">
                  <Share className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111B21] dark:text-white">
                    2. Appuie sur « Partager »
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                    L'icône Partager (carré avec flèche) est en bas de l'écran
                    Safari.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111B21] dark:text-white">
                    3. « Sur l'écran d'accueil »
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                    Fais défiler le menu vers le bas, choisis cette option.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111B21] dark:text-white">
                    4. Confirme avec « Ajouter »
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                    L'app s'ajoute à ton écran d'accueil avec l'icône UL Study
                    Flow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
