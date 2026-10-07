import React from 'react';
import { BookOpen, Smartphone, Sparkles, ArrowRight } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionBadge } from '../ui/SectionBadge';
import { SectionHeader } from '../ui/SectionHeader';

interface PillarItem {
  icon: React.ElementType;
  title: string;
  description: string;
  footerLabel: string;
}

const PILLARS: PillarItem[] = [
  {
    icon: BookOpen,
    title: '1. Des cours ultra-clairs',
    description:
      "Fini les pavés indigestes. Retrouve l'essentiel de chaque chapitre avec les définitions clés, formules et exemples adaptés aux examens togolais.",
    footerLabel: 'Fiches synthétiques en PDF',
  },
  {
    icon: Smartphone,
    title: '2. Expérience mobile & tablette',
    description:
      "Une navigation fluide comme WhatsApp : lisible, rapide et légère pour consommer un minimum de forfait internet sur smartphone ou tablette.",
    footerLabel: 'Économiseur de données data',
  },
  {
    icon: Sparkles,
    title: '3. Évaluation immédiate & IA',
    description:
      "Teste-toi sur des QCM réels et pose tes questions à l'assistant IA spécialisé dans tes matières pour éclaircir le moindre doute.",
    footerLabel: 'Correction & explications pas à pas',
  },
];

export const FeaturesPillarsSection: React.FC = () => {
  return (
    <section id="fonctionnalites" className="py-20 bg-white dark:bg-[#111B21]">
      <Container>
        <SectionHeader
          badge={<SectionBadge>Fonctionnalités clés</SectionBadge>}
          title="Conçu pour le quotidien des étudiants de Lomé"
          subtitle="Des outils d'apprentissage taillés pour vos examens réels."
        />

        <div className="grid md:grid-cols-3 gap-8">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="bg-[#F0F2F5]/60 dark:bg-[#0B141A]/60 rounded-3xl p-8 border border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]/60 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-[#075E54] transition-colors duration-200">
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-[#111B21] dark:text-white group-hover:text-[#075E54] dark:group-hover:text-[#25D366] transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-[#667781] dark:text-[#8696A0] leading-relaxed text-sm">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center text-[#075E54] dark:text-[#25D366] font-bold text-xs gap-1">
                  <span>{pillar.footerLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};