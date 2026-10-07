import React from 'react';

export interface TeamMember {
  name: string;
  role: string;
  description: string;
  badge: string;
  badgeColor: 'default' | 'featured';
  image?: string;         // si undefined → avatar par défaut
  isScientific?: boolean; // pour le 3ᵉ membre (Dr. Elom S.)
  footer: {
    icon: string;
    label: string;
  };
  footerRight: string;
}

// Avatars par défaut (tu remplaceras par les vraies photos)
const DEFAULT_AVATARS = {
  koffi: 'https://i.pravatar.cc/400?img=12',
  afiwa: 'https://i.pravatar.cc/400?img=47',
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Koffi Mensah',
    role: 'Co-fondateur & Responsable Pédagogique',
    description:
      "Ancien major de la Faculté des Sciences Économiques et de Gestion (FASEG). Passionné par la vulgarisation des statistiques, de la microéconomie et des sciences de gestion.",
    badge: 'FASEG • Major 2023',
    badgeColor: 'default',
    image: DEFAULT_AVATARS.koffi,
    footer: {
      icon: '📍',
      label: 'Amphi 1000 / FASEG',
    },
    footerRight: '600+ fiches auditées',
  },
  {
    name: 'Afiwa Dossou',
    role: 'Responsable Contenus & Qualité LMD',
    description:
      "Excellente oratrice et juriste rigoureuse, Afiwa supervise la standardisation des synthèses de Droit Constitutionnel, Droit Civil et Méthodologie des cas pratiques pour la FDD.",
    badge: 'FDD • Droit Privé',
    badgeColor: 'default',
    image: DEFAULT_AVATARS.afiwa,
    footer: {
      icon: '📍',
      label: 'Faculté de Droit (FDD)',
    },
    footerRight: 'Coordination LMD',
  },
  {
    name: 'Dr. Elom S.',
    role: 'Conseiller Scientifique & Coordination Tutorat',
    description:
      "Garant de la pertinence pédagogique des UEs scientifiques. Il veille à ce que les corrigés détaillés respectent strictement le barème d'évaluation appliqué par les jurys de l'UL.",
    badge: 'FDS • Enseignant-Chercheur',
    badgeColor: 'featured',
    isScientific: true,
    footer: {
      icon: '🎓',
      label: 'Campus Nord Sciences',
    },
    footerRight: 'Validation Scientifique',
  },
];