import React from 'react';
import { PlayCircle, Wallet, Check } from 'lucide-react';
import { Container } from '../../ui/Container';

interface FeaturesFinalCtaProps {
  onGetStarted: () => void;
}

export const FeaturesFinalCta: React.FC<FeaturesFinalCtaProps> = ({
  onGetStarted,
}) => {
  const goToPricing = () => {
    window.location.hash = '#tarifs';
    // Si la page Tarifs est un onglet, on peut plutôt rediriger via callback
  };

  return (
    <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <Container>
        <div className="relative bg-linear-to-r from-[#075E54] to-[#0a6b5f] text-white rounded-3xl p-8 sm:p-14 overflow-hidden shadow-2xl">
          {/* Halos décoratifs */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-xs font-bold uppercase tracking-wider">
              Test sans engagement
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-3 leading-tight">
              Prêt à tester toutes ces fonctionnalités gratuitement ?
            </h2>

            <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mb-8">
              Accède immédiatement à la Séance 01 gratuite sur l'UE de ton choix
              à l'Université de Lomé. Aucune carte bancaire requise, débloque en
              un clic.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onGetStarted}
                className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#1faa54] text-[#075E54] font-bold text-base shadow-md hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Découvrir mon premier cours offert</span>
                <PlayCircle className="w-5 h-5" />
              </button>

              <button
                onClick={goToPricing}
                className="inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 transition-all"
              >
                <Wallet className="w-5 h-5" />
                <span>Voir les forfaits (dès 300 F CFA)</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-emerald-100/90">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#25D366]" />
                Compatible Togocom T-Money
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#25D366]" />
                Compatible Moov Flooz
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};