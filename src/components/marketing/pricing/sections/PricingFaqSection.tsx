import React, { useState } from 'react';
import {
  Plus,
  Minus,
  HelpCircle,
  Timer,
  Headset,
  WifiOff,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { Container } from '../../ui/Container';

interface FaqItem {
  question: React.ReactNode;
  answer: React.ReactNode;
  icon: React.ElementType;
  highlight?: boolean;
}

export const PricingFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQ_ITEMS: FaqItem[] = [
    {
      icon: CreditCard,
      question:
        'Comment fonctionne exactement le paiement par T-Money ou Moov Flooz ?',
      answer: (
        <>
          Lorsque tu choisis ton UE, ton Pack Semestre ou une séance de Tutorat,
          un pop-up te demande ton numéro de téléphone togolais (Togocom ou Moov
          Africa). Dès que tu cliques sur valider, une requête push USSD
          officielle apparaît directement sur ton écran de smartphone. Tu tapes
          simplement ton code PIN secret habituel. Aucun frais de transfert
          supplémentaire n'est facturé par rapport au prix affiché. Ton compte
          étudiant est crédité et débloqué immédiatement.
        </>
      ),
    },
    {
      icon: Timer,
      highlight: true,
      question:
        "Quelle est la durée exacte de validité d'une UE ou d'un Pack acheté ?",
      answer: (
        <>
          Chaque UE ou Pack Semestre acheté bénéficie d'une{' '}
          <strong>durée de validité stricte de 6 mois et 10 jours</strong>. Cette
          durée a été spécialement calculée pour couvrir l'intégralité du
          semestre universitaire de l'UL, la période des révisions intenses
          ainsi que la session officielle des rattrapages. Une fois ce délai de
          6 mois et 10 jours écoulé, l'accès à l'UE expire automatiquement. Si
          l'étudiant doit à nouveau consulter les cours pour une nouvelle année
          académique, il lui suffira de racheter l'UE pour la réactiver.
        </>
      ),
    },
    {
      icon: Headset,
      question:
        'Comment se passe une séance de tutorat individuel (1h30) ?',
      answer: (
        <>
          Le tutorat est assuré par des tuteurs majors de promotion sélectionnés
          dans chaque faculté de l'UL (FASEG, FDD, FDS, FLLA). Dès la
          réservation validée par T-Money ou Flooz (1 000 F CFA pour la formule
          audio/écrit WhatsApp ou 1 500 F CFA pour la visioconférence directe
          Google Meet/WhatsApp Vidéo), le tuteur te contacte sur WhatsApp pour
          confirmer les sujets précis à traiter. La séance dure 1h30 (90
          minutes) et permet de résoudre des exercices types, de débloquer des
          notions difficiles et de peaufiner la méthodologie requise pour
          réussir les examens.
        </>
      ),
    },
    {
      icon: WifiOff,
      question:
        "Si je n'ai plus de crédit internet après le paiement, est-ce que mes cours restent accessibles ?",
      answer: (
        <>
          <strong className="text-[#075E54] dark:text-[#25D366]">
            Oui, à 100%.
          </strong>{' '}
          C'est la force de l'application mobile et web UL STUDY FLOW : les
          fiches synthétiques PDF et les fichiers audios se téléchargent dans la
          mémoire locale de ton navigateur ou téléphone. Tu peux les consulter
          au village, dans les amphis sans wifi ou en coupure de réseau sans
          consommer le moindre méga-octet supplémentaire pendant toute la
          période de validité de 6 mois et 10 jours.
        </>
      ),
    },
    {
      icon: ShieldCheck,
      question:
        'Y a-t-il un prélèvement automatique ou un engagement caché ?',
      answer: (
        <>
          <strong className="text-[#111B21] dark:text-white">
            Absolument aucun.
          </strong>{' '}
          Nous refusons le modèle d'abonnement récurrent qui piège les
          étudiants. Tu réalises un paiement unique à l'acte. Une fois payée,
          ton Unité d'Enseignement ou ton Pack Semestre reste accessible
          pendant 6 mois et 10 jours consécutifs, sans jamais être prélevé
          automatiquement par la suite.
        </>
      ),
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#111B21] transition-colors">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F2F5] dark:bg-[#0B141A] text-[#667781] dark:text-[#8696A0] text-xs font-bold uppercase mb-3">
              <HelpCircle className="w-4 h-4" />
              <span>Foire aux questions</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21] dark:text-white tracking-tight mb-3">
              Questions fréquentes sur le paiement, la validité &amp; le
              tutorat
            </h2>

            <p className="text-base text-[#667781] dark:text-[#8696A0]">
              Tout ce que tu dois savoir avant d'activer ton semestre ou
              réserver un tuteur avec Moov Flooz ou T-Money.
            </p>
          </div>

          {/* Accordéon */}
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-all ${
                    item.highlight
                      ? 'border-[#25D366]/40 bg-[#25D366]/5'
                      : isOpen
                        ? 'border-[#25D366]/60 bg-white dark:bg-[#111B21] shadow-md'
                        : 'border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21]'
                  }`}
                >
                  <button
                    onClick={() => toggle(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <Icon
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          item.highlight
                            ? 'text-[#25D366]'
                            : 'text-[#075E54] dark:text-[#25D366]'
                        }`}
                      />
                      <span
                        className={`text-base font-bold ${
                          item.highlight
                            ? 'text-[#075E54] dark:text-[#25D366]'
                            : 'text-[#111B21] dark:text-white hover:text-[#075E54] dark:hover:text-[#25D366]'
                        } transition-colors`}
                      >
                        {item.question}
                      </span>
                    </div>

                    <span
                      className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm transition-all shrink-0 ${
                        isOpen
                          ? 'bg-[#25D366] text-[#075E54] border-[#25D366]'
                          : 'bg-white dark:bg-[#111B21] border-[#E9EDEF] dark:border-[#222E35] text-[#8696A0]'
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
                    <div className="px-5 pb-5 pt-0 text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed border-t border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21]">
                      <div className="pt-3">{item.answer}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Note de contact */}
          <div className="mt-8 p-4 rounded-xl bg-[#F0F2F5] dark:bg-[#0B141A] border border-[#E9EDEF] dark:border-[#222E35] text-center">
            <p className="text-sm text-[#667781] dark:text-[#8696A0]">
              Une autre question ? Contacte l'équipe UL STUDY FLOW sur WhatsApp
              Campus — nous répondons en moins de 24h.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};