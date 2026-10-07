import React from 'react';
import { ArrowRight, BookOpen, Headphones, Wallet } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionBadge } from '../ui/SectionBadge';
import { SectionHeader } from '../ui/SectionHeader';

interface HowItWorksSectionProps {
  onGetStarted: () => void;
}

interface StepItem {
  number: string;
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
  hint: string;
}

const STEPS: StepItem[] = [
  {
    number: '01',
    icon: BookOpen,
    title: 'Choisis ton UE',
    description: (
      <>
        Sélectionne ta faculté (FASEG, FDS, FDD, FLLA, etc...) et explore le programme
        officiel. Commence directement avec la{' '}
        <strong>Séance 01 100% gratuite</strong>.
      </>
    ),
    hint: 'Accès immédiat sans paiement',
  },
  {
    number: '02',
    icon: Headphones,
    title: 'Révise à ton rythme',
    description: (
      <>
        Télécharge les fiches PDF ultra-légères, écoute les podcasts audio de 10
        min et entraîne-toi avec les QCM interactifs corrigés.
      </>
    ),
    hint: 'Boost ton apprentissage',
  },
  {
    number: '03',
    icon: Wallet,
    title: 'Débloque sans paiement',
    description: (
      <>
        Règle en toute sécurité via <strong>Flooz ou T-Money</strong> dès 300 F
        CFA a partir de 3 UE. Ton accès intégral au semestre est validé de façon instantanée.
      </>
    ),
    hint: 'Activation instantanée',
  },
];

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onGetStarted,
}) => {
  return (
    <section className="py-20 bg-[#F0F2F5] dark:bg-[#0B141A] border-b border-[#E9EDEF] dark:border-[#222E35] transition-colors">
      <Container>
        <SectionHeader
          badge={<SectionBadge>Simplicité absolue</SectionBadge>}
          title="Comment ça marche en 3 étapes simples"
          subtitle="Conçu pour être fluide, rapide et accessible à chaque étudiant de Lomé."
        />

        <div className="grid md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                key={step.number}
                onClick={onGetStarted}
                className="text-left bg-white dark:bg-[#111B21] rounded-3xl p-8 border border-[#E9EDEF] dark:border-[#222E35] shadow-sm relative group hover:border-[#25D366]/60 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-[#075E54] font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-[#25D366]/30">
                  {step.number}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-[#25D366]" />
                  <h3 className="text-xl font-bold text-[#111B21] dark:text-white">
                    {step.title}
                  </h3>
                </div>

                <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed">
                  {step.description}
                </p>

                <div className="mt-6 inline-flex items-center text-xs font-bold text-[#075E54] dark:text-[#25D366] gap-1 group-hover:gap-2 transition-all">
                  <span>{step.hint}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
};