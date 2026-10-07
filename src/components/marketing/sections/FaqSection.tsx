import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionBadge } from '../ui/SectionBadge';
import { SectionHeader } from '../ui/SectionHeader';
import { SUPPORT, PRICING } from '@/src/lib/constants';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const supportPhones = [SUPPORT.phone, SUPPORT.phoneAlt]
    .filter(Boolean)
    .join(' ou ');

  const FAQ_ITEMS: FaqItem[] = [
    {
      question:
        "Est-ce que les cours sont exactement conformes aux examens de l'UL ?",
      answer: (
        <>
          Oui, à 100%. Nos fiches et questions sont rédigées et validées en
          étroite collaboration avec des etudiants seniors diplômés de l'Université de Lomé, en suivant scrupuleusement
          les syllabus semestriels officiels du système de l'UL.
        </>
      ),
    },
    {
      question: 'Comment payer sans carte bancaire ? (Flooz / T-Money)',
      answer: (
        <>
          Aucune carte bancaire requise ! Le règlement s'effectue directement par
          envoie direct {' '}
          {supportPhones
            ? `sur nos numéros officiels : ${supportPhones}`
            : 'sur nos numéros officiels'}
          . L'activation de ton UE ce fait dans les prochaines minute après validation de l'administration.
        </>
      ),
    },
    {
      question:
        "Puis-je étudier hors-ligne si je n'ai plus de connexion internet ?",
      answer: (
        <>
          Absolument. Nos fiches synthétiques PDF ont été
          optimisés pour peser moins par leçon. Tu peux les
          télécharger une fois en Wi-Fi au campus ou avec un forfait de 150 F,
          puis les consulter en illimité sans aucune connexion active.
        </>
      ),
    },
    {
      question: `Est-ce vraiment ${PRICING.packUe} F CFA sans abonnement caché ?`,
      answer: (
        <>
          Tout à fait ! Il n'y a aucun prélèvement automatique ni abonnement
          récurrent. Le tarif unitaire est de {PRICING.singleUe} FCFA par UE + 100f comme frais de transction, et
          dès 3 UEs sélectionnées, le tarif solidaire passe à seulement{' '}
          {PRICING.packUe} F CFA par UE pour l'ensemble du semestre. Tu paies une
          fois, tu révises tout le semestre.
        </>
      ),
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-20 bg-white dark:bg-[#111B21] transition-colors"
    >
      <Container>
        <SectionHeader
          badge={
            <SectionBadge icon={<HelpCircle className="w-3.5 h-3.5" />}>
              Réponses à tes doutes
            </SectionBadge>
          }
          title="Foire Aux Questions"
          subtitle="Tout ce que tu dois savoir avant de commencer tes révisions avec nous."
        />

        <div className="max-w-4xl mx-auto space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-2xl overflow-hidden transition-all bg-[#F0F2F5]/50 dark:bg-[#0B141A]/50 ${
                  isOpen
                    ? 'border-[#25D366]/60 shadow-md'
                    : 'border-[#E9EDEF] dark:border-[#222E35]'
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[#111B21] dark:text-white text-base hover:text-[#075E54] dark:hover:text-[#25D366] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <span
                    className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm transition-all shrink-0 ${
                      isOpen
                        ? 'bg-[#25D366] text-[#075E54] border-[#25D366]'
                        : 'bg-white dark:bg-[#111B21] border-[#E9EDEF] dark:border-[#222E35] text-[#667781] dark:text-[#8696A0]'
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-3 text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed border-t border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};