import React from 'react';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Container } from '../../ui/Container';
import { FaqAccordionItem } from '../../faq/ui/FaqAccordionItem';
import { FaqQuestion } from '../../faq/data/FaqData';

// FAQ courte dédiée à la page "Comment ça marche"
// (différente de la FAQ complète — 4 questions ciblées)
const MINI_FAQ: FaqQuestion[] = [
  {
    id: 'hiw-faq-1',
    category: 'cat-paiement',
    question: 'Comment se déroule le paiement par T-Money ou Flooz ?',
    answer: (
      <>
        <p className="mb-3">
          Le processus de déblocage est simple, clair et transparent :
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-[#25D366] shrink-0 mt-0.5">✓</span>
            <span>
              <strong>1. Formulaire de déblocage :</strong> Remplis le
              formulaire avec ton Nom & Prénom, numéro de téléphone et la
              sélection de tes UEs.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#25D366] shrink-0 mt-0.5">✓</span>
            <span>
              <strong>2. Dépôt Mobile Money :</strong> Effectue manuellement le
              transfert ou dépôt Mobile Money (T-Money/Mix Togo ou Moov Flooz)
              sur le numéro officiel affiché au bas du formulaire.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#25D366] shrink-0 mt-0.5">✓</span>
            <span>
              <strong>3. ID de transaction (Optionnel) :</strong> Tu peux
              renseigner l'ID de transaction / Référence du dépôt. Ce champ
              optionnel permet à l'équipe administrative de retrouver et
              valider ton accès encore plus vite.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#25D366] shrink-0 mt-0.5">✓</span>
            <span>
              <strong>4. Validation & Accès garanti :</strong> Valide ta
              demande. L'administration vérifie le dépôt et active tes UEs entre
              l'immédiat et 12h maximum (accès garanti pour 6 mois et 10 jours
              complets).
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'hiw-faq-2',
    category: 'cat-cours',
    question:
      'Puis-je réviser mes fiches et podcasts sans connexion Internet ?',
    answer: (
      <p>
        Oui, absolument ! Toutes les fiches mémo sont au format PDF ultra-léger
        (&lt; 2 Mo) et sont téléchargeables directement dans
        la mémoire de ton téléphone. Une fois le document téléchargé, tu peux réviser sans
        consommer un seul mégaoctet de data.
      </p>
    ),
  },
  {
    id: 'hiw-faq-3',
    category: 'cat-cours',
    question:
      "Les contenus sont-ils conformes au système LMD de l'Université de Lomé ?",
    answer: (
      <p>
        Oui, 100% conformes. Nos tuteurs et majors de promotion sont tous issus
        des facultés de Lomé (FASEG, FDS, FDD, FLLA, etc...). Les cours suivent
        scrupuleusement les découpages des semestres Harmattan (Semestres 1, 3,
        5) et Mousson (Semestres 2, 4, 6) selon les maquettes officielles
        validées par les départements.
      </p>
    ),
  },
  {
    id: 'hiw-faq-4',
    category: 'cat-cours',
    question: 'Dois-je créer un compte avant de tester la plateforme ?',
    answer: (
      <p>
        Oui ! Pour respecter la fluidité d'apprentissage, la première séance de
        chaque UE (fiche PDF résumé + podcast de synthèse + 5 QCM
        d'auto-évaluation) est accessible directement en un clic. Pas besoin de payer.
      </p>
    ),
  },
];

interface MiniFaqSectionProps {
  onContactClick?: () => void;
}

export const MiniFaqSection: React.FC<MiniFaqSectionProps> = ({
  onContactClick,
}) => {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#111B21] border-t border-[#E9EDEF] dark:border-[#222E35] transition-colors">
      <Container className="max-w-4xl">
        {/* En-tête */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1 text-[#25D366] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Questions fréquentes</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-white tracking-tight">
            Tout comprendre avant de commencer
          </h2>

          <p className="text-base text-[#667781] dark:text-[#8696A0]">
            Des réponses claires aux questions que se posent les étudiants de
            l'Université de Lomé à-propos de Ul-StudyFlow-Learning.
          </p>
        </div>

        {/* Accordéons */}
        <div className="space-y-3">
          {MINI_FAQ.map((item) => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              bulletColor="bg-[#25D366]"
            />
          ))}
        </div>

        {/* Note de contact */}
        <div className="text-center mt-8">
          <p className="text-sm text-[#667781] dark:text-[#8696A0] mb-2">
            Tu as une question spécifique sur ton UE ou un problème de paiement
            ?
          </p>
          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 text-[#075E54] dark:text-[#25D366] text-sm font-bold hover:underline transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contacter nos assistants via WhatsApp</span>
          </button>
        </div>
      </Container>
    </section>
  );
};