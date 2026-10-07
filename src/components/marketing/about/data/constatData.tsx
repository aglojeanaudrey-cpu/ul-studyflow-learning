import React from 'react';

export interface ConstatItem {
  title: string;
  description: string;
}

export const CONSTAT_PROBLEMS: ConstatItem[] = [
  {
    title: 'Amphis surchargés (Amphi 1500, 1000, 600)',
    description:
      "Arriver à 5h du matin pour une place assise, sono défaillante, bruits ambiants rendant la prise de notes quasi impossible.",
  },
  {
    title: 'Polycopiés incomplets & photocopies onéreuses',
    description:
      "Des centaines de pages photocopiées mal reliées, illisibles, coûtant des milliers de francs CFA sans corrigés d'examens fiables.",
  },
  {
    title: 'Coût prohibitif de la connexion internet',
    description:
      'Des vidéos de 2 heures impossibles à charger avec des forfaits data limités ou des réseaux instables.',
  },
  {
    title: 'Paiements inaccessibles par carte bancaire',
    description:
      "Les plateformes étrangères exigent Visa ou Mastercard, excluant 98% des étudiants togolais n'ayant que T-Money ou Flooz.",
  },
];

export const CONSTAT_SOLUTIONS: ConstatItem[] = [
  {
    title: "Fiches d'U.E. rédigées avec les Majors",
    description:
      "Synthèses ultra-denses de 10 à 15 pages par chapitre, contenant exactement ce que les professeurs posent aux examens.",
  },
  {
    title: 'Mode ultra-économique en data Internet',
    description:
      "Seuls les PDF condensés (< 2 Mo) sont téléchargeables hors-ligne. Quiz interactifs et podcasts audio optimisés pour consommer un minimum de mégaoctets.",
  },
  {
    title: 'Tarifs solidaires dès 300 F CFA via Mobile Money',
    description:
      'Paiement 100% togolais par simple dépôt manuel T-Money ou Flooz. Pas de carte bancaire, pas de frais cachés.',
  },
  {
    title: 'Garantie Semestre Sérénité (6 mois et 10 jours)',
    description:
      'Chaque UE achetée reste accessible pendant les 6 mois officiels + 10 jours supplémentaires pour couvrir les rattrapages sans repayer.',
  },
];