import React from 'react';
import { ArrowRight, Download, Sparkles } from 'lucide-react';
import { Container } from '../../ui/Container';

interface HowItWorksFinalCtaProps {
  onGetStarted: () => void;
  onDownloadSpecimen?: () => void;
}

export const HowItWorksFinalCta: React.FC<HowItWorksFinalCtaProps> = ({
  onGetStarted,
  onDownloadSpecimen,
}) => {
  const handleDownload = () => {
    if (onDownloadSpecimen) {
      onDownloadSpecimen();
    } else {
      // Placeholder : à brancher plus tard sur un vrai PDF
      console.log('📄 Téléchargement du spécimen PDF demandé');
    }
  };

  return (
    <section
      id="demo"
      className="py-16 sm:py-20 bg-[#075E54] text-white relative overflow-hidden"
    >
      {/* Halos décoratifs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#25D366]/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#25D366]/10 rounded-full blur-2xl pointer-events-none" />

      <Container className="max-w-4xl text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#25D366] text-[#075E54] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Accès libre • Séance 01 offerte
        </div>

        {/* Titre */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
          Prêt à valider ton semestre sans nuits blanches ?
        </h2>

        {/* Sous-titre */}
        <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-8">
          Rejoins plus de 3 800 étudiants de l'Université de Lomé qui révisent
          déjà avec méthode et sérénité.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1faa54] text-[#075E54] font-bold text-sm px-7 py-3.5 rounded-full shadow-lg transition-all active:scale-95"
          >
            <span>Accéder à ma première fiche gratuite</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-emerald-300/40 hover:border-[#25D366] text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-[#075E54]/40 transition-all"
          >
            <Download className="w-4 h-4 text-[#25D366]" />
            <span>Télécharger un spécimen PDF</span>
          </button>
        </div>

        {/* Réassurance */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-emerald-100/80 font-medium">
          <span>✓ Zéro carte bancaire requise</span>
          <span className="hidden sm:inline">•</span>
          <span>✓ Activation T-Money / Flooz</span>
          <span className="hidden sm:inline">•</span>
          <span>✓ Syllabus UL Togo 2025</span>
        </div>
      </Container>
    </section>
  );
};