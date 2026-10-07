import React from 'react';
import { ArrowRight, Wallet, Shield } from 'lucide-react';
import { Container } from '../ui/Container';
import { SUPPORT, PRICING } from '@/src/lib/constants';

interface PricingBannerSectionProps {
  onGetStarted: () => void;
}

export const PricingBannerSection: React.FC<PricingBannerSectionProps> = ({
  onGetStarted,
}) => {
  // Construit la mention des numéros de support (masquée si vides)
  const supportPhones = [SUPPORT.phone, SUPPORT.phoneAlt]
    .filter(Boolean)
    .join(' ou ');

  return (
    <section
      id="tarifs"
      className="py-16 bg-gradient-to-r from-[#075E54] via-[#0a6b5f] to-[#075E54] text-white"
    >
      <Container>
        <div className="bg-emerald-800/40 border border-emerald-700/60 rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur-sm">
          {/* Côté gauche : texte */}
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#25D366] bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-600/40">
              <Wallet className="w-3.5 h-3.5" />
              Tarifs solidaires & accessibles à Lomé
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Valide ton semestre à partir de {PRICING.packUe} {PRICING.currency}{' '}
              CFA seulement
            </h3>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Pas d'abonnement contraignant ni de carte bancaire requise. Règle
              facilement via{' '}
              <strong>Flooz{supportPhones ? ` (${supportPhones})` : ''}</strong>{' '}
              ou <strong>T-Money</strong> avec activation immédiate de tes cours.
            </p>
          </div>

          {/* Côté droit : prix + CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
            <div className="text-center bg-emerald-900/80 border border-emerald-600/50 p-4 rounded-2xl w-full sm:w-auto">
              <span className="text-xs text-[#25D366] font-semibold uppercase">
                Pack 1 UE
              </span>
              <p className="text-2xl font-black text-white">
                {PRICING.singleUe} {PRICING.currency}
              </p>
              <span className="text-[11px] text-emerald-200">
                Accès intégral semestre
              </span>
            </div>

            <div className="text-center bg-[#25D366] text-[#075E54] p-4 rounded-2xl w-full sm:w-auto shadow-lg shadow-[#25D366]/20">
              <span className="text-xs font-extrabold uppercase">
                Dès 3 UEs
              </span>
              <p className="text-2xl font-black">
                {PRICING.packUe} {PRICING.currency} / UE
              </p>
              <span className="text-[11px] font-bold">Économise 40%</span>
            </div>
          </div>
        </div>

        {/* CTA secondaire sous le bandeau */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-emerald-100/80">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1faa54] text-[#075E54] font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <span>Commencer ma 1ère séance gratuite</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#25D366]" />
            0 engagement · Paiement sécurisé
          </span>
        </div>
      </Container>
    </section>
  );
};