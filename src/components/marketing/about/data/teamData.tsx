export interface TeamMember {
  /** Initiales affichées dans l'avatar (ex: "AKJ") */
  initials: string;
  /** Nom complet (ou rôle générique si anonyme) */
  name: string;
  /** Rôle fonctionnel court */
  role: string;
  /** Description honnête et incarnée */
  description: string;
  /** Filière / faculté (ex: "FASEG • L3") */
  affiliation: string;
  /** Statut du membre : pilote / actif / en réflexion / partenaire */
  status: "founder" | "active" | "reflecting" | "partner";
  /** Couleur thématique de la carte */
  accentColor: "emerald" | "amber" | "sky" | "violet";
}

export const TEAM_FOUNDER: TeamMember = {
  initials: "KA",
  name: "Kokou Jean-Audrey Aglo",
  role: "Initiateur & Développeur principal",
  description:
    "Étudiant à l'Université de Lomé, à l'origine du projet Ul Study Flow Learning. Je construis la plateforme avec l'ambition de rendre les cours universitaires accessibles à tous, partout au Togo.",
  affiliation: "Université de Lomé · Étudiant",
  status: "founder",
  accentColor: "emerald",
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    initials: "É1",
    name: "Membre actif #1",
    role: "Contributeur technique",
    description:
      "Contribue activement au développement et à la structuration du projet depuis sa phase initiale.",
    affiliation: "Université de Lomé",
    status: "active",
    accentColor: "amber",
  },
  {
    initials: "É2",
    name: "Membre actif #2",
    role: "Contributeur pédagogique",
    description:
      "Participe à la relecture des contenus, au test de la plateforme et à la structuration des cours.",
    affiliation: "Université de Lomé",
    status: "active",
    accentColor: "amber",
  },
  {
    initials: "R1",
    name: "Membre en réflexion #1",
    role: "Soutien potentiel",
    description:
      "A manifesté son intérêt pour le projet et réfléchit encore à sa contribution.",
    affiliation: "Université de Lomé",
    status: "reflecting",
    accentColor: "sky",
  },
  {
    initials: "R2",
    name: "Membre en réflexion #2",
    role: "Soutien potentiel",
    description:
      "A manifesté son intérêt pour le projet et réfléchit encore à sa contribution.",
    affiliation: "Université de Lomé",
    status: "reflecting",
    accentColor: "sky",
  },
  {
    initials: "R3",
    name: "Membre en réflexion #3",
    role: "Soutien potentiel",
    description:
      "A manifesté son intérêt pour le projet et réfléchit encore à sa contribution.",
    affiliation: "Université de Lomé",
    status: "reflecting",
    accentColor: "sky",
  },
];

/** Appel à partenaires : les délégués de département, invités à rejoindre le projet */
export const PARTNERS_CALL = {
  title: "Nous cherchons des délégués de département",
  description:
    "Le projet est ouvert à tous les étudiants motivés. Si tu es délégué de ta filière et que tu veux rendre les cours plus accessibles à tes camarades, rejoins-nous.",
  ctaLabel: "Proposer ma filière",
};