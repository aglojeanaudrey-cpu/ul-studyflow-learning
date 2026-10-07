import React from 'react';
import { ArrowRight, Check, Zap, Headset } from 'lucide-react';
import { Container } from '../../ui/Container';

interface PricingFinalCtaProps {
  onGetStarted: () => void;
}

export const PricingFinalCta: React.FC<PricingFinalCtaProps> = ({
  onGetStarted,
}) => {
  const scrollToTutorat = () => {
    const el = document.getElementById('tutorat');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToOffres = () => {
    const el = document.getElementById('offres');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-[#F0F2F5] dark:bg-[#0B141A] transition-colors">
      <Container>
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-[#075E54] via-[#0a6b5f] to-[#075E54] p-8 md:p-16 text-center border border-emerald-700/50 shadow-xl">
          {/* Halos décoratifs */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#25D366]/30 via-transparent to-transparent opacity-40 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#062e24] border border-[#25D366]/40 text-[#25D366] text-xs font-bold uppercase mb-6 shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-[#25D366]" />
              <span>Activation immédiate • Séance 01 offerte</span>
            </span>

            {/* Titre */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Prêt à aborder les examens avec sérénité ?
            </h2>

            {/* Sous-titre */}
            <p className="text-base sm:text-lg text-emerald-100/90 mb-8 max-w-2xl mx-auto">
              Rejoins plus de 4 800 étudiants de l'Université de Lomé qui
              révisent déjà avec clarté, fiches synthétiques et tutorat
              sur-mesure.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={scrollToOffres}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-[#25D366] text-[#075E54] font-extrabold text-base hover:bg-[#1faa54] transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Commencer par la séance gratuite</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={scrollToTutorat}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-base hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Headset className="w-5 h-5 text-[#25D366]" />
                <span>Réserver un tuteur individuel</span>
              </button>
            </div>

            {/* Réassurance */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-emerald-100/80 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#25D366]" />
                Validité garantie 6 mois &amp; 10 jours
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#25D366]" />
                Validé par les tuteurs majors UL
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#25D366]" />
                Paiement local T-Money &amp; Flooz
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};