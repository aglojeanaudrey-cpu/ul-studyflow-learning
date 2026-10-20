import React from "react";
import { ArrowRight, Play, CheckCircle2, GraduationCap } from "lucide-react";
import { Container } from "../ui/Container";
import { STATS, PRICING } from "@/src/lib/constants";
import heroImage from "@/src/assets/images/hero_ul_student_1790533845064.webp";
import { DownloadApkButton } from "../DownloadApkButton";

interface HeroBlockProps {
  onGetStarted: () => void;
  onExploreCourses: () => void;
}

export const HeroBlock: React.FC<HeroBlockProps> = ({
  onGetStarted,
  onExploreCourses,
}) => {
  return (
    <section className="relative pt-12 pb-16 md:py-20 overflow-hidden bg-linear-to-b from-[#F0F2F5] via-white to-[#25D366]/5 dark:from-[#0B141A] dark:via-[#111B21] dark:to-[#075E54]/10">
      {/* Motif de points décoratifs */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(37, 211, 102, 0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Colonne gauche */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] text-xs sm:text-sm font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
              <span className="w-2 h-2 rounded-full bg-[#25D366] -ml-3.5" />
              <span>
                Plateforme EdTech indépendante par et pour les étudiants de Lomé
              </span>
            </div>

            {/* Titre */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111B21] dark:text-white tracking-tight leading-[1.12]">
              Apprends mieux.
              <br />
              Comprends plus vite.
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#075E54] to-[#25D366] dark:from-[#25D366] dark:to-emerald-400">
                Progresse à ton rythme.
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="text-base sm:text-lg text-[#667781] dark:text-[#8696A0] leading-relaxed max-w-2xl">
              Retrouve tous tes cours universitaires conformes au système de
              l'UL. Première séance de chaque UE 100% gratuite, résumés PDF
              téléchargeables, vidéos, podcasts audio et questionnaires avec
              corrections détaillées.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1faa54] active:bg-[#075E54] text-[#075E54] hover:text-white font-bold text-base px-7 py-4 rounded-2xl shadow-xl shadow-[#25D366]/30 transition-all duration-200 active:scale-95"
              >
                <span>Commencer maintenant</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <DownloadApkButton variant="secondary" />

              <button
                onClick={onExploreCourses}
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-[#111B21] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] border border-[#E9EDEF] dark:border-[#222E35] text-[#111B21] dark:text-white font-bold text-base px-6 py-4 rounded-2xl shadow-sm transition-colors"
              >
                <Play className="w-5 h-5 text-[#25D366]" />
                <span>Tester un cours maintenant ?</span>
              </button>
            </div>

            {/* Métriques clés */}
            <div className="pt-8 border-t border-[#E9EDEF] dark:border-[#222E35] grid grid-cols-3 gap-4 sm:gap-6">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#111B21] dark:text-white tracking-tight">
                  + Facultés
                </p>
                <p className="text-xs sm:text-sm text-[#667781] dark:text-[#8696A0] font-medium mt-0.5">
                  FASEG, FDS, FDD, FLLA et plus...
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#111B21] dark:text-white tracking-tight">
                  100% Mobile
                </p>
                <p className="text-xs sm:text-sm text-[#667781] dark:text-[#8696A0] font-medium mt-0.5">
                  Fluide sur smartphone
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#25D366] tracking-tight">
                  Dès {PRICING.packUe} {PRICING.currency}
                </p>
                <p className="text-xs sm:text-sm text-[#667781] dark:text-[#8696A0] font-medium mt-0.5">
                  {PRICING.singleUe} F/UE (dès 3 UE)
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite : visuel */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 bg-linear-to-tr from-[#25D366]/20 to-emerald-400/20 rounded-3xl blur-2xl -z-10" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/80 dark:border-[#222E35] bg-white dark:bg-[#111B21] group">
              <img
                src={heroImage}
                alt="Étudiants de l'Université de Lomé révisant ensemble"
                className="w-full h-auto object-cover rounded-3xl aspect-4/3 transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-linear-to-t from-[#075E54]/70 via-transparent to-transparent pointer-events-none rounded-3xl" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
