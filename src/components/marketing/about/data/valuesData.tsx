import React from 'react';
import { PiggyBank, ContactIcon, Calendar, BadgeCheck } from 'lucide-react';

export interface ValueItem {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: React.ReactNode;
  footer: string;
  footerColor: string;
}

export const VALUES: ValueItem[] = [
  {
    icon: PiggyBank,
    iconColor: 'text-[#25D366]',
    title: 'Accessibilité Financière',
    description: (
      <>
        Un module d'exercices ou une fiche de synthèse ne doit pas coûter le prix
        d'un repas. Accès démocratique dès <strong>300 F CFA</strong>, pensé
        pour la bourse de l'étudiant.
      </>
    ),
    footer: "Dès 300 F CFA l'UE",
    footerColor: 'text-[#25D366]',
  },
  {
    icon: ContactIcon,
    iconColor: 'text-amber-500',
    title: 'Paiement 100% Inclusif',
    description: (
      <>
        Zéro carte bancaire requise. Formulaire simplifié, transfert direct{' '}
        <strong>T-Money ou Flooz</strong>, et validation humaine manuelle par
        notre administration en moins de 12 heures.
      </>
    ),
    footer: 'T-Money & Flooz officiel',
    footerColor: 'text-[#075E54] dark:text-[#25D366]',
  },
  {
    icon: Calendar,
    iconColor: 'text-[#25D366]',
    title: 'Validité Sérénité',
    description: (
      <>
        Votre investissement est protégé : chaque cours reste ouvert pendant{' '}
        <strong>6 mois complets + 10 jours de grâce</strong> pour réviser la
        session de rattrapage sans supplément.
      </>
    ),
    footer: '6 mois + 10 jours de grâce',
    footerColor: 'text-[#25D366]',
  },
  {
    icon: BadgeCheck,
    iconColor: 'text-[#25D366]',
    title: 'Rigueur Syllabus LMD',
    description: (
      <>
        Pas de théorie superflue. 100% conforme aux programmes réels dispensés à
        l'Université de Lomé, révisé chaque semestre en lien direct avec les
        majors et délégués.
      </>
    ),
    footer: '100% conforme UL',
    footerColor: 'text-[#075E54] dark:text-[#25D366]',
  },
];