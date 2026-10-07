import React from 'react';
import { ArrowRight, CheckCircle2, Smartphone, Wallet, Verified } from 'lucide-react';
import { Container } from '../../ui/Container';
import heroImage from '@/src/assets/images/campus_university_lome_1790533866163.jpg';

interface HowItWorksHeroProps {
  onGetStarted: () => void;
}

export const HowItWorksHero: React.FC<HowItWorksHeroProps> = ({
  onGetStarted,
}) => {
  const scrollToSteps = () => {
    const el = document.getElementById('etapes');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative pt-16 pb-20 overflow-hidden bg-linear-to-b from-[#25D366]/5 via-white to-white dark:from-[#25D366]/5 dark:via-[#111B21] dark:to-[#111B21] transition-colors">
      {/* Halos décoratifs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#25D366]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#25D366]/10 rounded-full blur-2xl pointer-events-none -z-10" />

      <Container>
        {/* En-tête centré */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 px-3.5 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
            <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] tracking-wide uppercase">
              Méthode simple & 100% accessible
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#075E54] dark:text-white tracking-tight leading-tight">
            Réviser et valider son semestre à Lomé n'a jamais été aussi simple.
          </h1>

          <p className="text-base sm:text-lg text-[#667781] dark:text-[#8696A0] max-w-2xl mx-auto">
            De l'amphi bondé à la mention : découvre comment{' '}
            <strong className="text-[#075E54] dark:text-[#25D366]">
              Ul-StudyFlow-Learning
            </strong>{' '}
            transforme tes révisions en 4 étapes fluides, pensées pour les
            réalités du campus togolais (faible débit, forfait data,
            micro-paiement T-Money & Flooz).
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1faa54] text-[#075E54] font-bold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <span>Tester gratuitement une séance</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToSteps}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-[#111B21] border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] font-bold text-sm px-6 py-3 rounded-full hover:bg-[#25D366]/5 transition-all shadow-sm"
            >
              <span>✓</span>
              <span>Voir les étapes détaillées</span>
            </button>
          </div>

          {/* Badges trust */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[#667781] dark:text-[#8696A0]">
            <div className="flex items-center gap-1.5">
              <Verified className="w-4 h-4 text-[#25D366]" />
              <span className="text-xs font-semibold">
                Sans carte bancaire
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E9EDEF] dark:bg-[#222E35] hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#25D366]" />
              <span className="text-xs font-semibold">
                Compatible tous smartphones
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E9EDEF] dark:bg-[#222E35] hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold">Dès 300 FCFA</span>
            </div>
          </div>
        </div>

        {/* Card composite */}
        <div className="mt-12 relative rounded-2xl overflow-hidden border border-[#25D366]/30 bg-white dark:bg-[#111B21] max-w-4xl mx-auto shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            {/* Image */}
            <div className="md:col-span-7 relative h-72 md:h-96 w-full">
              <img
                src={heroImage}
                alt="Étudiants de l'Université de Lomé en train de réviser ensemble"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#075E54]/70 via-transparent to-transparent md:hidden" />
            </div>

            {/* Contenu droite */}
            <div className="md:col-span-5 p-8 space-y-4 bg-[#25D366]/5">
              <div className="inline-block bg-[#075E54] text-[#25D366] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Parcours LMD certifié
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#075E54] dark:text-[#25D366]">
                Fini le stress des 1500 étudiants par amphi
              </h2>

              <p className="text-sm text-[#667781] dark:text-[#8696A0]">
                À Lomé, trouver le calme pour se concentrer au milieu du brouhaha des amphis bondés relève souvent de l'exploit. Ul-StudyFlow-Learning synthétise 100% du programme officiel en modules de 5-15 minutes chrono pour vous isoler du bruit et travailler efficacement
              </p>

              <div className="space-y-2 pt-3 border-t border-[#25D366]/30">
                <div className="flex items-center gap-2 text-xs font-bold text-[#075E54] dark:text-[#25D366]">
                  <span>📶</span>
                  <span>Fiches PDF consultables hors ligne</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#075E54] dark:text-[#25D366]">
                  <span>⚡</span>
                  <span>Validation dans les minutes qui suivent (accès garanti 6 mois)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};