import React from 'react';
import { ArrowRight, UserPlus, Sparkles, BookOpen, BarChart3 } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionBadge } from '../ui/SectionBadge';
import { SectionHeader } from '../ui/SectionHeader';

interface SignupCtaSectionProps {
  onGetStarted: () => void;
}

const BENEFITS = [
  {
    icon: BookOpen,
    title: 'Accès à toutes tes UE',
    description:
      'Retrouve tes cours structurés par séance, avec fiches PDF, podcasts audio et vidéos explicatives.',
  },
  {
    icon: Sparkles,
    title: 'Assistant IA pédagogique',
    description:
      "Pose tes questions directement sur le contenu de tes cours, à tout moment, 24/24h.",
  },
  {
    icon: BarChart3,
    title: 'Suivi de progression',
    description:
      'Visualise ta progression, valide tes séances et prépare tes examens sereinement.',
  },
];

export const SignupCtaSection: React.FC<SignupCtaSectionProps> = ({
  onGetStarted,
}) => {
  return (
    <section
      id="inscription-cta"
      className="py-20 bg-gradient-to-b from-white via-[#F0F2F5]/50 to-[#25D366]/5 dark:from-[#111B21] dark:via-[#0B141A] dark:to-[#075E54]/10"
    >
      <Container>
        <SectionHeader
          badge={<SectionBadge>Ton espace étudiant t' attend</SectionBadge>}
          title="Crée ton compte et commence à réviser en 2 minutes"
          subtitle="Inscription gratuite. Première séance de chaque UE 100% offerte pour commencer."
        />

        {/* Grille des bénéfices */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#111B21] rounded-3xl p-7 border border-[#E9EDEF] dark:border-[#222E35] shadow-sm hover:shadow-xl hover:border-[#25D366]/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center mb-5 group-hover:bg-[#25D366] group-hover:text-[#075E54] transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#111B21] dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA central */}
        <div className="text-center space-y-4">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1faa54] active:bg-[#075E54] text-[#075E54] hover:text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-[#25D366]/30 transition-all duration-200 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            <span>Créer mon compte gratuitement</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-xs text-[#667781] dark:text-[#8696A0] font-medium">
            Aucune carte bancaire requise · Paiement via Flooz ou T-Money
          </p>
        </div>
      </Container>
    </section>
  );
};