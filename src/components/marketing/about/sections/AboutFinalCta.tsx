import React from 'react';
import { Rocket, ArrowRight, List, Smartphone, Verified, RefreshCw } from 'lucide-react';
import { Container } from '../../ui/Container';

interface AboutFinalCtaProps {
  onGetStarted: () => void;
  onExploreCourses?: () => void;
}

export const AboutFinalCta: React.FC<AboutFinalCtaProps> = ({
  onGetStarted,
  onExploreCourses,
}) => {
  const handleExplore = () => {
    if (onExploreCourses) {
      onExploreCourses();
    } else {
      window.location.hash = '#valeurs';
    }
  };

  return (
    <section
      id="cta"
      className="py-16 md:py-24 bg-gradient-to-br from-[#075E54] via-[#043427] to-[#075E54] text-white relative overflow-hidden"
    >
      {/* Halos décoratifs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <Container className="max-w-5xl text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#075E54]/80 border border-[#25D366]/30 text-[#25D366] text-xs font-bold mb-6">
          <Rocket className="w-3.5 h-3.5" />
          <span>REJOINS PLUS DE 4 800 ÉTUDIANTS DE LOMÉ DÈS AUJOURD'HUI</span>
        </div>

        {/* Titre */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
          Prêt à transformer tes révisions à l'Université de Lomé ?
        </h2>

        {/* Sous-titre */}
        <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-8">
          Ne laisse plus les amphis bondés ou le manque de supports dicter tes
          résultats. Valide tes crédits LMD avec sérénité et mention dès ce
          semestre.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#25D366] text-[#075E54] hover:bg-[#1faa54] font-bold text-base shadow-xl hover:shadow-2xl transition-all active:scale-95"
          >
            <span>Tester la Séance 01 gratuite</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleExplore}
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-[#075E54]/60 hover:bg-[#075E54] border border-[#25D366]/30 text-white font-semibold text-base transition-colors"
          >
            <List className="w-4 h-4 text-[#25D366]" />
            <span>Découvrir nos cours (dès 300 F CFA)</span>
          </button>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t border-emerald-800/60 text-emerald-100/80 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Paiement manuel T-Money &amp; Flooz</span>
          </div>
          <div className="flex items-center gap-2">
            <Verified className="w-4 h-4 text-[#25D366]" />
            <span>Validation sous 12h maximum</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#25D366]" />
            <span>Accès 6 mois et 10 jours garantis</span>
          </div>
        </div>
      </Container>
    </section>
  );
};