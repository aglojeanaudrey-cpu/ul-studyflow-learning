import React from "react";
import {
  ArrowDown,
  GitCompare,
  Zap,
  CloudOff,
  Wallet,
  Headphones,
  Verified,
  FileDown,
} from "lucide-react";
import { Container } from "../../ui/Container";
import heroImage from "@/src/assets/images/hero_ul_student_fonctionnalite.webp";

interface FeaturesHeroProps {
  onGetStarted: () => void;
}

export const FeaturesHero: React.FC<FeaturesHeroProps> = ({ onGetStarted }) => {
  const scrollToPillars = () => {
    const el = document.getElementById("piliers");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToReality = () => {
    const el = document.getElementById("campus-reality");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative pt-12 pb-16 md:py-20 bg-linear-to-b from-[#25D366]/5 via-white to-white dark:from-[#25D366]/5 dark:via-[#111B21] dark:to-[#111B21] border-b border-[#E9EDEF] dark:border-[#222E35] overflow-hidden transition-colors">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Colonne gauche : Contenu */}
          <div className="lg:col-span-7 flex flex-col items-start gap-5">
            {/* Badge institutionnel */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366]">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Conçu pour les etudiants de l'Université de Lomé • 100% adapté
                au système LMD
              </span>
            </div>

            {/* Titre principal */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#111B21] dark:text-white tracking-tight leading-tight">
              Toutes les fonctionnalités pour réussir ton semestre{" "}
              <span className="text-[#075E54] dark:text-[#25D366] underline decoration-[#25D366] decoration-wavy decoration-2 underline-offset-4">
                sans stress
              </span>
              .
            </h1>

            {/* Sous-titre */}
            <p className="text-base sm:text-lg text-[#667781] dark:text-[#8696A0] max-w-2xl leading-relaxed">
              Des outils pédagogiques pensés pour les réalités du campus de Lomé
              : révision hors-connexion, fiches ultra-condensées, cours audio
              podcast, QCM corrigés et micro-paiement T-Money / Flooz.
            </p>

            {/* Badges réassurance */}
            <div className="w-full flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111B21] border border-[#25D366]/30 shadow-sm">
                <Zap className="w-5 h-5 text-[#25D366]" />
                <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366]">
                  Économe en forfaits data
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111B21] border border-[#25D366]/30 shadow-sm">
                <CloudOff className="w-5 h-5 text-[#25D366]" />
                <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366]">
                  Accès hors-ligne garanti
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111B21] border border-[#25D366]/30 shadow-sm">
                <Wallet className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366]">
                  Déblocage de 3 UE dès 300 FCFA
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 w-full sm:w-auto">
              <button
                onClick={scrollToPillars}
                className="inline-flex justify-center items-center gap-2 px-7 py-3.5 rounded-xl bg-[#075E54] hover:bg-[#0a6b5f] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span>Explorer les 6 outils clés</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={scrollToReality}
                className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] hover:bg-[#25D366]/5 text-[#075E54] dark:text-[#25D366] font-semibold text-sm transition-all"
              >
                <GitCompare className="w-4 h-4" />
                <span>Voir la comparaison terrain</span>
              </button>
            </div>
          </div>

          {/* Colonne droite : Visuel + badges flottants */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Halo décoratif */}
              <div className="absolute -inset-2 bg-linear-to-tr from-[#25D366]/30 to-[#075E54]/10 rounded-3xl blur-2xl -z-10" />

              {/* Image principale */}
              <div className="rounded-2xl overflow-hidden border-2 border-[#25D366]/30 shadow-2xl bg-white dark:bg-[#111B21] relative">
                <img
                  src={heroImage}
                  alt="Groupe d'étudiants de l'Université de Lomé révisant ensemble"
                  className="w-full h-80 sm:h-96 object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#075E54]/80 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-xs bg-[#062e24]/90 text-[#25D366] px-2.5 py-0.5 rounded-md backdrop-blur font-bold">
                    Conçu par et pour les étudiants de l'UL
                  </span>
                </div>
              </div>

              {/* Badge flottant haut-gauche : Podcast */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 dark:bg-[#111B21]/95 backdrop-blur-md p-3.5 rounded-xl border border-[#25D366]/30 shadow-2xl flex items-center gap-3 max-w-60">
                <div className="w-10 h-10 rounded-lg bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
                    <span className="text-[10px] font-bold text-[#25D366] tracking-wide">
                      PODCAST 10 MIN
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8696A0]">
                    Écoute sans data 4G
                  </p>
                </div>
              </div>

              {/* Badge flottant bas-droite : Score QCM */}
              <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-white/95 dark:bg-[#111B21]/95 backdrop-blur-md p-3.5 rounded-xl border border-[#25D366]/30 shadow-2xl flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#075E54] dark:text-[#25D366] shrink-0">
                  <Verified className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#25D366]">
                    Quiz & flashcard
                  </p>
                  <p className="text-xs font-bold text-[#111B21] dark:text-white">
                    Teste ta comprehension
                  </p>
                </div>
              </div>

              {/* Chip mode hors-ligne */}
              <div className="absolute top-1/2 -right-4 bg-[#062e24] text-[#25D366] text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-[#25D366]/30">
                <FileDown className="w-3.5 h-3.5" />
                Fiche PDF &lt; 2 Mo
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
