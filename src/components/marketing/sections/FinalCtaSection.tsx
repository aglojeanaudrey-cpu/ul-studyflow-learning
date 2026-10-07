import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { Container } from '../ui/Container';
import { PRICING } from '@/src/lib/constants';

interface FinalCtaSectionProps {
  onGetStarted: () => void;
onExploreCourses: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onGetStarted,
  onExploreCourses,
}) => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#075E54] dark:from-[#111B21] dark:to-[#075E54]">
      <Container>
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-[#075E54] via-[#0a6b5f] to-[#0d7a6b] text-white p-8 sm:p-12 md:p-16 text-center shadow-2xl border border-emerald-700/50">
          {/* Halos décoratifs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#25D366] bg-emerald-900/90 border border-emerald-500/40 px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Rentrée &amp; Semestres UL 2026
            </span>

            {/* Titre */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Prêt à valider ton semestre avec mention ?
            </h2>

            {/* Sous-titre */}
            <p className="text-emerald-100 text-base sm:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
              Rejoins dès maintenant plus de 4 800 étudiants sur la platforme. Démarre ta
              première séance gratuite, teste ta
              compréhension et réussis tes examens.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1faa54] text-[#075E54] font-black text-base px-8 py-4 rounded-2xl shadow-xl shadow-[#25D366]/30 hover:scale-105 transition-all active:scale-95"
              >
                <span>Commencer ma 1ère séance gratuite</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreCourses}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-900/80 hover:bg-emerald-800 text-white font-bold text-base px-7 py-4 rounded-2xl border border-emerald-600/50 transition-colors"
              >
                <span>Voir les packs (dès {PRICING.packUe} F)</span>
              </button>
            </div>

            {/* Réassurance */}
            <div className="pt-6 border-t border-emerald-800/60 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-100/90 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                0 engagement, sans carte bancaire
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#25D366]" />
                Paiement par Flooz ou T-Money/Mix Togo sécurisé
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                100% de réussite
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};