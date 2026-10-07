import React from 'react';
import { Rocket, PlayCircle, Eye, Check } from 'lucide-react';
import { Container } from '../../ui/Container';

interface FaqFinalCtaProps {
  onGetStarted: () => void;
}

export const FaqFinalCta: React.FC<FaqFinalCtaProps> = ({ onGetStarted }) => {
  return (
    <section className="bg-gradient-to-r from-[#075E54] via-[#043427] to-[#075E54] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-emerald-900">
      <Container className="max-w-5xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#25D366]/20 text-[#25D366] text-xs font-bold tracking-wider uppercase mb-4">
          <Rocket className="w-4 h-4" />
          Prêt à valider tes crédits ?
        </div>

        {/* Titre */}
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 max-w-2xl mx-auto leading-tight">
          Commence dès maintenant avec la Séance 01 gratuite de ton UE !
        </h2>

        {/* Sous-titre */}
        <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto mb-8">
          Rejoins plus de 3 500 étudiants de l'Université de Lomé. Accès
          instantané sans inscription contraignante, à partir de seulement 300 F
          CFA.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] transition-all duration-200 shadow-xl transform hover:-translate-y-0.5 active:scale-95"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Accéder à ma 1ère séance gratuite</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('offres');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-600/40 transition"
          >
            <Eye className="w-5 h-5" />
            <span>Voir le catalogue des UE (dès 300 F)</span>
          </button>
        </div>

        {/* Réassurance */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/80">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#25D366]" />
            Paiement manuel sans carte bancaire (T-Money &amp; Flooz)
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#25D366]" />
            Validation administrative garantie sous 12h max
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#25D366]" />
            Accès 6 mois et 10 jours
          </span>
        </div>
      </Container>
    </section>
  );
};