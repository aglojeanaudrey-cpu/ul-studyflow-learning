import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Container } from '../../ui/Container';

interface FaqHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FaqHero: React.FC<FaqHeroProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const quickSearches = [
    { label: '#paiement', value: 'paiement' },
    { label: '#12 heures', value: '12h' },
    { label: '#validité 6 mois', value: 'validité' },
    { label: '#tutorat', value: 'tutorat' },
  ];

  const handleQuickSearch = (value: string) => {
    onSearchChange(value);
    // Scroll vers la section FAQ
    const el = document.getElementById('faq-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative bg-gradient-to-b from-[#075E54] to-[#043427] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Halos décoratifs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#25D366]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      <Container className="relative z-10 text-center max-w-4xl">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
            ASSISTANCE &amp; QUESTIONS FRÉQUENTES • CAMPUS UNIVERSITÉ DE LOMÉ
          </span>
        </div>

        {/* Titre */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
          Toutes les réponses à tes questions pour réviser sereinement.
        </h1>

        {/* Sous-titre */}
        <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-3xl mx-auto mb-8">
          Formulaire de commande simple, transfert manuel T-Money &amp; Flooz
          avec activation administrative sous 12h max, validité de 6 mois et 10
          jours garantie, fiches PDF téléchargeables hors-ligne, audios et quiz
          interactifs en ligne.
        </p>

        {/* Barre de recherche live */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-emerald-600 pointer-events-none" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
              placeholder="Rechercher une question, un mot-clé (ex: paiement, 12h, validité, PDF, tutorat)..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white text-[#111B21] placeholder-[#8696A0] border-2 border-emerald-400/30 focus:border-[#25D366] focus:outline-none focus:ring-4 focus:ring-emerald-400/20 text-sm sm:text-base font-medium shadow-2xl transition"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-4 text-[#8696A0] hover:text-[#111B21] transition"
                aria-label="Effacer la recherche"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Chips de recherche rapide */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-emerald-200">
            <span className="text-emerald-300/80 font-medium">
              Recherches rapides :
            </span>
            {quickSearches.map((qs) => (
              <button
                key={qs.value}
                type="button"
                onClick={() => handleQuickSearch(qs.value)}
                className="px-2.5 py-1 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/30 transition"
              >
                {qs.label}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};