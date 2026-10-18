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
    "Étudiant en L3 Anglais (FLLA) à l'Université de Lomé, à l'origine du projet UL Study Flow Learning. Je conçois et développe la plateforme avec l'ambition de rendre les cours universitaires accessibles à tous, partout au Togo.",
  affiliation: "Université de Lomé · FLLA · L3 Anglais",
  status: "founder",
  accentColor: "emerald",
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    initials: "GA",
    name: "Gedeon Attaty",
    role: "Responsable Pédagogique & Communication",
    description:
      "Supervise la création, la vérification et la planification des Unités d'Enseignement (UE). Assure également la communication du projet et la modération des échanges au sein de la communauté.",
    affiliation: "Université de Lomé · FLLA · L3 Anglais",
    status: "active",
    accentColor: "amber",
  },
  {
    initials: "ZJ",
    name: "Joyce Zimaro",
    role: "Responsable Utilisateurs & Modération",
    description:
      "Gère l'accueil, le suivi et l'accompagnement des utilisateurs sur la plateforme. Veille à la qualité des interactions en assurant la modération et participe à la communication du projet.",
    affiliation: "Université de Lomé · FLLA · L3 Anglais",
    status: "active",
    accentColor: "amber",
  },
];

/** Appel à partenaires : les délégués de département, invités à rejoindre le projet */
export const PARTNERS_CALL = {
  title: "Nous cherchons des délégués de département",
  description:
    "Le projet est ouvert à tous les étudiants motivés. Si tu es délégué de ta filière et que tu veux rendre les cours plus accessibles à tes camarades, rejoins-nous.",
  ctaLabel: "Proposer ma filière / Nous rejoindre",
};
