import React from 'react';
import { FileDown, SendToBack, Lock } from 'lucide-react';

export interface RuleItem {
  icon: React.ElementType;
  iconColor: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: React.ReactNode;
  footer: {
    icon: string;
    label: string;
  };
}

export const RULES: RuleItem[] = [
  {
    icon: FileDown,
    iconColor: 'text-[#25D366]',
    badge: 'Data Responsable',
    badgeColor: 'bg-[#25D366]/10 text-[#075E54] dark:text-[#25D366]',
    title: 'Téléchargement & Accès Hors-Ligne',
    description: (
      <>
        <strong>
          Seuls les résumés et fiches PDF condensés (&lt; 2 Mo) sont
          téléchargeables
        </strong>{' '}
        sur votre smartphone pour une révision 100% hors-ligne. Les podcasts
        audios, vidéos explicatives et quiz interactifs se consultent en
        streaming optimisé sur la plateforme pour préserver les droits d'auteurs
        de nos majors.
      </>
    ),
    footer: {
      icon: '📄',
      label: 'PDF téléchargeables à vie',
    },
  },
  {
    icon: SendToBack,
    iconColor: 'text-amber-500',
    badge: 'Validation Humaine',
    badgeColor: 'bg-amber-50 dark:bg-amber-950/20 text-[#111B21] dark:text-amber-300',
    title: 'Paiement Mobile Manuel Sécurisé',
    description: (
      <>
        Après avoir rempli le formulaire de commande, effectuez le transfert
        direct T-Money ou Flooz sur notre numéro officiel togolais affiché. Dès
        réception,{' '}
        <strong>
          notre administration valide manuellement vos accès sous un délai
          garanti de moins de 12 heures
        </strong>{' '}
        (instantané en journée).
      </>
    ),
    footer: {
      icon: '⏱️',
      label: 'Délai moyen de validation : 30 minutes',
    },
  },
  {
    icon: Lock,
    iconColor: 'text-[#25D366]',
    badge: 'Zéro Abonnement',
    badgeColor: 'bg-[#25D366]/10 text-[#075E54] dark:text-[#25D366]',
    title: "Achat à l'Unité & Sans Engagement",
    description: (
      <>
        Aucun prélèvement automatique bancaire, aucun abonnement récurrent
        sournois. Vous ne payez que ce que vous consommez :{' '}
        <strong>UE par UE ou pack semestriel</strong>. Vous conservez vos accès
        pendant 6 mois + 10 jours sans jamais être re-débité à votre insu.
      </>
    ),
    footer: {
      icon: '✓',
      label: 'Paiement unique et définitif',
    },
  },
];