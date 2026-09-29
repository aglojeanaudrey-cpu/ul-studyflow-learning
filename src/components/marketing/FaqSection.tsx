import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: "Qu'est-ce que UL STUDY FLOW ?",
    a: "UL STUDY FLOW LEARNING est une initiative EdTech indépendante conçue par des étudiants, pour les étudiants (Togo). Elle regroupe les cours sous forme de séances progressives accompagnées de résumés clairs, de podcasts audio, de vidéos, de polycopiés PDF, de questionnaires corrigés et d'un assistant IA pédagogique."
  },
  {
    q: "À qui s'adresse la plateforme ?",
    a: "Elle s'adresse à tous les étudiants universitaires (notamment les filières FASEG, FDS, FDD, FLLA), ainsi qu'aux bacheliers qui préparent leur entrée à l'université et souhaitent prendre de l'avance."
  },
  {
    q: "Comment créer un compte ?",
    a: "Cliquez sur 'Créer un compte'. Il vous suffit de renseigner votre numéro de téléphone (au format togolais), vos prénom et nom, ainsi que votre faculté, filière et niveau. L'inscription prend moins d'une minute."
  },
  {
    q: "Quels niveaux sont disponibles actuellement ?",
    a: "La plateforme couvre actuellement les programmes de Licence 1 (L1) et Licence 2 (L2). L'architecture est déjà prête pour accueillir la Licence 3 (L3) et les masters prochainement."
  },
  {
    q: "Comment accéder à une Unité d'Enseignement (UE) et quels sont les tarifs ?",
    a: "Dès votre inscription, les UE principales de votre filière vous sont automatiquement attribuées. Pour chaque UE, le premier chapitre explicatif est 100% gratuit ! Ensuite, le tarif d'une UE complète est de 500 FCFA. Dès 3 UE commandées, le prix passe automatiquement à seulement 300 FCFA l'unité."
  },
  {
    q: "Quels formats de cours sont disponibles ?",
    a: "Chaque séance propose : 1) une fiche synthétique rédigée, 2) un podcast audio léger, 3) une vidéo explicative, 4) le polycopié PDF conforme au programme, et 5) un questionnaire d'entraînement interactif."
  },
  {
    q: "Puis-je suivre ma progression ?",
    a: "Oui ! Votre espace 'Progression' enregistre chaque séance lue, chaque questionnaire validé et calcule automatiquement votre taux de complétion ainsi que votre moyenne par matière."
  },
  {
    q: "Comment fonctionnent les questionnaires ?",
    a: "Chaque séance est clôturée par un questionnaire type examen (choix unique, choix multiple, vrai/faux). Dès que vous soumettez vos réponses, vous recevez votre note sur 20 et une correction détaillée expliquant chaque question."
  },
  {
    q: "Comment fonctionne l'assistant IA pédagogique ?",
    a: "L'assistant IA est propulsé par Gemini 3.8 Flash. Il est scôpé uniquement à vos matières débloquées et aux questions d'utilisation de la plateforme. Il vous explique les théorèmes, formule des exemples concrets ou vous aide à comprendre vos erreurs de quiz."
  },
  {
    q: "Mes données personnelles sont-elles protégées ?",
    a: "Absolument. Vos mots de passe sont chiffrés avec les standards cryptographiques les plus stricts (PBKDF2 SHA-512). Aucune donnée n'est vendue ni partagée avec des tiers."
  },
  {
    q: "Puis-je utiliser la plateforme sur mon téléphone ?",
    a: "Oui, la plateforme est 'mobile-first'. Elle a été pensée pour fonctionner de façon ultra-fluide sur n'importe quel smartphone, avec une consommation de forfait internet minimale."
  },
  {
    q: "Que faire si j'ai un problème ou une question ?",
    a: "Vous pouvez nous joindre directement par WhatsApp ou appel au +228 99 70 59 20 / 71 67 69 45, par e-mail à ulstudyflow@gmail.com, ou via le formulaire de contact du site."
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#128C7E]/10 text-[#075E54] text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          Foire Aux Questions
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111B21]">
          Toutes les réponses à vos questions
        </h1>
        <p className="text-sm text-[#667781]">
          Retrouvez les réponses aux interrogations les plus fréquentes des étudiants.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#E9EDEF] overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="font-bold text-sm sm:text-base text-[#111B21]">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#667781] transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#25D366]' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#667781] leading-relaxed border-t border-[#F0F2F5] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
