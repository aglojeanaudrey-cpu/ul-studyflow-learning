import React, { useState } from 'react';
import { Zap, Download, BadgeCheck, Clock } from 'lucide-react';
import { Container } from '../../ui/Container';

interface PricingHeroProps {
  onGetStarted: () => void;
}

type PricingMode = 'single' | 'pack';

export const PricingHero: React.FC<PricingHeroProps> = () => {
  const [mode, setMode] = useState<PricingMode>('pack');

  return (
    <section
      id="tarifs"
      className="relative overflow-hidden pt-16 pb-20 bg-linear-to-b from-[#075E54] via-[#0a6b5f] to-[#F0F2F5] dark:to-[#0B141A]"
    >
      {/* Halo décoratif */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-linear(ellipse_at_top,var(--tw-gradient-stops))] from-[#25D366] via-transparent to-transparent" />

      <Container className="relative text-center">
        {/* Badge solidarité */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#062e24] border border-[#25D366]/40 text-[#25D366] text-xs font-bold uppercase mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
          <span>
            Tarification transparente &amp; solidaire • Spécial campus de Lomé
          </span>
        </div>

        {/* Titre principal */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
          Valide ton semestre sans te ruiner. Des tarifs pensés pour la{' '}
          <span className="text-[#25D366] underline decoration-[#25D366]/50 decoration-wavy underline-offset-8">
            réalité étudiante togolaise.
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-8">
          Zéro abonnement récurrent imposé, zéro carte bancaire obligatoire.
          Paye uniquement les Unités d'Enseignement (UE) dont tu as besoin
          directement par T-Money ou Moov Flooz, dès{' '}
          <span className="text-[#25D366] font-bold">300 FCFA à partir de (3 UE)</span>.
        </p>

        {/* Badges réassurance */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto mb-10">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
            <Zap className="w-4 h-4 text-[#25D366]" />
            <span>Paiement instantané par (Moov / Mix Togo)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
            <Download className="w-4 h-4 text-[#25D366]" />
            <span>Mode 100% hors-ligne inclus</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
            <BadgeCheck className="w-4 h-4 text-[#25D366]" />
            <span>Séance 01 toujours 100% gratuite</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#062e24]/80 backdrop-blur-md border border-[#25D366]/30 text-[#25D366] text-xs font-bold">
            <Clock className="w-4 h-4" />
            <span>
              Validité : 6 mois et 10 jours (Semestre + Rattrapages inclus)
            </span>
          </div>
        </div>

        {/* Toggle À la carte / Packs */}
        <div className="inline-flex items-center bg-[#062e24]/80 p-1.5 rounded-full border border-[#25D366]/30 shadow-inner">
          <button
            onClick={() => setMode('single')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              mode === 'single'
                ? 'bg-[#25D366] text-[#075E54] font-bold shadow-md'
                : 'text-emerald-100/70 hover:text-white'
            }`}
          >
            Paiement à l'UE / À la carte
          </button>
          <button
            onClick={() => setMode('pack')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              mode === 'pack'
                ? 'bg-[#25D366] text-[#075E54] font-bold shadow-md'
                : 'text-emerald-100/70 hover:text-white'
            }`}
          >
            <span>Packs Semestre Économiques</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                mode === 'pack'
                  ? 'bg-[#075E54] text-[#25D366]'
                  : 'bg-[#075E54]/60 text-[#25D366]'
              }`}
            >
              Économise jusqu'à 40%
            </span>
          </button>
        </div>
      </Container>
    </section>
  );
};