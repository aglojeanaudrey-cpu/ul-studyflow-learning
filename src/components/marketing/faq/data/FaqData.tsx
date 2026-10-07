import type { ReactNode } from 'react';

export type FaqCategoryId =
  | 'cat-paiement'
  | 'cat-validite'
  | 'cat-cours'
  | 'cat-tutorat';

export interface FaqQuestion {
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: ReactNode;
  /** Mots-clés pour la recherche (en plus du titre de la question) */
  keywords?: string[];
  openByDefault?: boolean;
}

export interface FaqCategory {
  id: FaqCategoryId | 'all';
  label: string;
  shortLabel: string;
  emoji?: string;
  iconBg: string;
  iconColor: string;
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'all',
    label: 'Toutes',
    shortLabel: 'Toutes',
    emoji: '📱',
    iconBg: 'bg-[#075E54]',
    iconColor: 'text-white',
  },
  {
    id: 'cat-paiement',
    label: 'Paiement & Activation (12h)',
    shortLabel: 'Paiement',
    emoji: '💳',
    iconBg: 'bg-amber-100 dark:bg-amber-950/30',
    iconColor: 'text-amber-600',
  },
  {
    id: 'cat-validite',
    label: 'Validité (6 mois et 10 jours)',
    shortLabel: 'Validité',
    emoji: '⏱️',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'cat-cours',
    label: 'Cours & Hors-ligne',
    shortLabel: 'Cours',
    emoji: '📚',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/30',
    iconColor: 'text-indigo-600',
  },
  {
    id: 'cat-tutorat',
    label: 'Tutorat & Réservations',
    shortLabel: 'Tutorat',
    emoji: '🎓',
    iconBg: 'bg-rose-100 dark:bg-rose-950/30',
    iconColor: 'text-rose-600',
  },
];

export const FAQ_QUESTIONS: FaqQuestion[] = [
  // ═══════════════════════════════════════════════════════════
  // SECTION 1 : PAIEMENT & ACTIVATION (4 questions)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'paiement-1',
    category: 'cat-paiement',
    openByDefault: true,
    question: 'Comment payer pour débloquer mes UEs (T-Money & Flooz) ?',
    keywords: [
      'paiement',
      'payer',
      't-money',
      'tmoney',
      'flooz',
      'mobile money',
      'dépôt',
      'débloquer',
      'ue',
      'activation',
      'formulaire',
      'commande',
      'transfert',
      'togocom',
      'mix',
      'mix by yas',
    ],
    answer: (
      <>
        <p className="mb-3">
          Le système est spécialement adapté au contexte togolais,{' '}
          <strong>sans carte bancaire et sans prélèvement automatique</strong>.
          Voici la procédure officielle en 3 étapes :
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 bg-[#F0F2F5] dark:bg-[#0B141A] rounded-xl border border-[#E9EDEF] dark:border-[#222E35]">
            <div className="flex items-center gap-2 text-[#075E54] dark:text-[#25D366] font-bold text-xs uppercase mb-1">
              <span className="w-5 h-5 rounded-full bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] flex items-center justify-center text-xs">
                1
              </span>
              Formulaire
            </div>

            <p className="text-xs text-[#667781] dark:text-[#8696A0]">
              Remplis le formulaire de commande avec ton{' '}
              <strong>Nom &amp; Prénom</strong>, ton{' '}
              <strong>numéro togolais/WhatsApp</strong>, ta{' '}
              <strong>Faculté</strong> et l’UE ou le Pack sélectionné.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase mb-1">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-xs">
                2
              </span>
              Dépôt Manuel
            </div>

            <p className="text-xs text-[#667781] dark:text-[#8696A0]">
              Effectue le transfert ou dépôt manuel via{' '}
              <strong>T-Money (Togocom)</strong> ou{' '}
              <strong>Moov Flooz</strong> vers le{' '}
              <strong>numéro officiel</strong> affiché au bas du bon de
              commande.
            </p>
          </div>

          <div className="p-3.5 bg-[#25D366]/10 rounded-xl border border-[#25D366]/30">
            <div className="flex items-center gap-2 text-[#075E54] dark:text-[#25D366] font-bold text-xs uppercase mb-1">
              <span className="w-5 h-5 rounded-full bg-[#25D366] text-[#075E54] flex items-center justify-center text-xs">
                3
              </span>
              Activation (≤ 12h)
            </div>

            <p className="text-xs text-[#667781] dark:text-[#8696A0]">
              L’administration vérifie ton versement et active manuellement
              l’accès à tes cours de <strong>quelques minutes à 12 heures maximum</strong>{' '}
              (garantie le jour même).
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#25D366]/10 rounded-xl border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] text-xs font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>
            Chaque UE débloquée reste accessible en illimité durant{' '}
            <strong>6 mois et 10 jours complets</strong>.
          </span>
        </div>
      </>
    ),
  },

  {
    id: 'paiement-2',
    category: 'cat-paiement',
    question: 'Quel est le délai d’activation de mes cours après le dépôt ?',
    keywords: [
      'délai',
      'activation',
      '12h',
      '12 heures',
      'dépôt',
      'attente',
      'validation',
      'combien de temps',
      'rapide',
      'immédiat',
    ],
    answer: (
      <>
        <p>
          L’activation de votre accès est effectuée après vérification humaine
          par l’équipe administrative UL STUDY FLOW :
        </p>

        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Délai moyen constaté :</strong> Souvent dans les minutes qui
            suivent pendant les heures d’ouverture de la permanence (07h00 -
            22h00).
          </li>

          <li>
            <strong>Délai maximal garanti :</strong> De{' '}
            <strong>quelques minutes à 12 heures maximum</strong>, 7j/7, y compris
            les week-ends et périodes de révision intensive.
          </li>

          <li>
            Tu reçois une notification de confirmation dès que le voyant vert
            d’accès est allumé sur ton compte étudiant.
          </li>
        </ul>
      </>
    ),
  },

  {
    id: 'paiement-3',
    category: 'cat-paiement',
    question: 'Que faire après avoir effectué le dépôt Mobile Money ?',
    keywords: [
      'après',
      'sms',
      'confirmation',
      'capture',
      'whatsapp',
      'transaction',
      'id',
      'preuve',
      'reçu',
      'valider',
    ],
    answer: (
      <>
        <p>Dès que le transfert T-Money ou Moov Flooz est finalisé :</p>

        <ol className="list-decimal pl-5 mt-2 space-y-1.5">
          <li>
            <strong>Conserve précieusement le SMS de confirmation</strong> reçu
            de Togocom ou Moov contenant l’ID de transaction et le montant.
          </li>

          <li>
            Assure-toi d’avoir validé le formulaire avec le{' '}
            <strong>même numéro de téléphone ou nom</strong> que celui utilisé
            pour le dépôt.
          </li>

          <li>
            Si tu souhaites une validation encore plus rapide, envoie la capture
            du SMS sur notre WhatsApp Campus. Notre équipe valide ton dossier
            immédiatement.
          </li>
        </ol>
      </>
    ),
  },

  {
    id: 'paiement-4',
    category: 'cat-paiement',
    question:
      'Est-ce un prélèvement automatique ou un abonnement récurrent masqué ?',
    keywords: [
      'prélèvement',
      'abonnement',
      'automatique',
      'récurrent',
      'caché',
      'masqué',
      'unique',
      'ponctuel',
      'sécurité',
      'arnaque',
    ],
    answer: (
      <>
        <div className="p-3 bg-[#25D366]/10 rounded-xl border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] text-sm font-semibold mb-2">
          🛡️ Zéro prélèvement automatique : achat ponctuel et transparent.
        </div>

        <p>
          Chez UL STUDY FLOW, nous refusons formellement les abonnements
          récurrents et les prélèvements masqués. Tout achat est{' '}
          <strong>strictement unique et volontaire</strong> par dépôt manuel.
          Ton compte Mobile Money ne sera <strong>JAMAIS</strong> prélevé sans
          que tu n’effectues toi-même un nouveau transfert.
        </p>
      </>
    ),
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 2 : VALIDITÉ & RÉACHAT (2 questions)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'validite-1',
    category: 'cat-validite',
    openByDefault: true,
    question:
      'Pourquoi la validité est-elle exactement de 6 mois et 10 jours ?',
    keywords: [
      'validité',
      '6 mois',
      '10 jours',
      'durée',
      'accès',
      'semestre',
      'harmattan',
      'mousson',
      'rattrapage',
      'combien de temps',
      'expiration',
    ],
    answer: (
      <>
        <p>
          À l’Université de Lomé, un semestre académique officiel (Harmattan ou
          Mousson) dure 6 mois. Nous avons spécialement ajouté{' '}
          <strong>10 jours de grâce supplémentaires</strong> afin de couvrir
          l’intégralité de la période des examens de rattrapage.
        </p>

        <p className="mt-2 font-semibold">
          Tu révises donc ta session normale ET tes rattrapages avec un seul et
          même paiement, sans aucun surcoût ni reconduction payante !
        </p>
      </>
    ),
  },

  {
    id: 'validite-2',
    category: 'cat-validite',
    question:
      'Que se passe-t-il après l’expiration des 6 mois et 10 jours ?',
    keywords: [
      'expiration',
      'expiré',
      'fin',
      'rachat',
      'racheter',
      'renouveler',
      'prolonger',
      'après',
      'réactivation',
    ],
    answer: (
      <p>
        Une fois les 6 mois et 10 jours révolus, l’accès à l’UE expire
        automatiquement. Si tu as besoin de reprendre cette UE l’année suivante,
        il te suffit de la{' '}
        <strong>racheter au tarif étudiant en vigueur (dès 300 F CFA)</strong>{' '}
        pour réactiver instantanément l’accès pour un nouveau cycle complet de
        6 mois et 10 jours.
      </p>
    ),
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 3 : COURS & HORS-LIGNE (3 questions)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'cours-1',
    category: 'cat-cours',
    question:
      'Comment réviser au campus ou à la maison sans connexion internet (Mode Hors-ligne) ?',
    keywords: [
      'hors-ligne',
      'offline',
      'sans internet',
      'sans connexion',
      'télécharger',
      'pdf',
      'réviser',
      'campus',
      'data',
      'forfait',
      'wifi',
      'streaming',
    ],
    answer: (
      <>
        <p>
          Pour réviser dans les meilleures conditions en tenant compte de votre
          consommation internet, voici la répartition exacte :
        </p>

        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Seul le format PDF est téléchargeable hors-ligne :</strong>{' '}
            Télécharge directement dans la mémoire de ton smartphone ou PC les
            fiches de synthèse et cours résumés au format PDF (ultra-légers,
            moins de 2 Mo). Tu pourras ensuite les ouvrir et les réviser partout
            sans aucune connexion internet.
          </li>

          <li>
            <strong>Audios, quiz et vidéos exclusivement en ligne :</strong> Les
            podcasts explicatifs en streaming, vidéos de démonstration,{' '}
            <strong>quiz</strong> d’auto-évaluation interactifs et flashcards
            nécessitent une connexion internet active et s’exécutent directement
            sur la plateforme pour préserver l’interactivité et le suivi de
            progression.
          </li>

          <li>
            Tu peux ainsi imprimer ou lire tes PDF hors-ligne au campus, puis te
            connecter ponctuellement avec un faible volume de data pour faire
            tes quiz et écouter les podcasts d’approfondissement !
          </li>
        </ul>
      </>
    ),
  },

  {
    id: 'cours-2',
    category: 'cat-cours',
    question:
      'Les cours sont-ils 100% conformes aux syllabus de l’Université de Lomé ?',
    keywords: [
      'conforme',
      'syllabus',
      'programme',
      'officiel',
      'lmd',
      'faség',
      'faseg',
      'fdd',
      'fds',
      'flla',
      'fshs',
      'iut',
      'examen',
      'corrigé',
      'annale',
    ],
    answer: (
      <>
        <p>
          <strong>Oui, absolument.</strong> Nos contenus sont élaborés et mis à
          jour conjointement avec les <strong>majors de promotion</strong> et
          relus par des enseignants des facultés de Lomé :
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs sm:text-sm font-bold">
          <span className="p-2 rounded bg-[#F0F2F5] dark:bg-[#0B141A] text-center">
            FASEG (Éco &amp; Gestion)
          </span>

          <span className="p-2 rounded bg-[#F0F2F5] dark:bg-[#0B141A] text-center">
            FDS (Sciences &amp; Maths)
          </span>

          <span className="p-2 rounded bg-[#F0F2F5] dark:bg-[#0B141A] text-center">
            FDD (Droit &amp; Sciences Po)
          </span>

          <span className="p-2 rounded bg-[#F0F2F5] dark:bg-[#0B141A] text-center">
            FLLA (Lettres &amp; Langues)
          </span>

          <span className="p-2 rounded bg-[#F0F2F5] dark:bg-[#0B141A] text-center">
            FSHS (Sciences Humaines)
          </span>

          <span className="p-2 rounded bg-[#F0F2F5] dark:bg-[#0B141A] text-center">
            IUT de Gestion / CIC
          </span>
        </div>

        <p className="mt-3">
          Chaque UE suit fidèlement la numérotation des chapitres, les travaux
          dirigés (TD) et les corrigés d’anciens examens officiels.
        </p>
      </>
    ),
  },

  {
    id: 'cours-3',
    category: 'cat-cours',
    question: 'Puis-je tester gratuitement avant de payer quoi que ce soit ?',
    keywords: [
      'gratuit',
      'essai',
      'tester',
      'découverte',
      'séance 1',
      'séance 01',
      'gratuite',
      'sans payer',
      'démo',
    ],
    answer: (
      <>
        <p className="font-semibold text-[#075E54] dark:text-[#25D366]">
          Oui ! La Séance 01 de chaque UE est 100% gratuite et ouverte à tous.
        </p>

        <p className="mt-1">
          Tu n’as même pas besoin d’ajouter un mode de paiement. Clique
          simplement sur l’UE qui t’intéresse pour écouter le podcast
          d’introduction, lire la fiche de synthèse et tester le premier QCM
          d’entraînement.
        </p>
      </>
    ),
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 4 : TUTORAT & COACHING (2 questions)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'tutorat-1',
    category: 'cat-tutorat',
    openByDefault: true,
    question: 'Quels sont les tarifs et formats des séances de tutorat ?',
    keywords: [
      'tutorat',
      'tarif',
      'prix',
      'coût',
      'séance',
      '1h30',
      'whatsapp',
      'meet',
      'visio',
      'vidéo',
      'audio',
      '1000',
      '1500',
      'major',
      'coaching',
    ],
    answer: (
      <>
        <p>
          Nous proposons 2 formules transparentes adaptées à tes besoins pour
          lever un blocage sur un exercice ou un TD compliqué :
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="border border-[#25D366]/40 bg-[#25D366]/5 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-[#075E54] dark:text-[#25D366]">
                Tutorat WhatsApp Express
              </span>

              <span className="font-extrabold text-[#075E54] dark:text-[#25D366] text-base">
                1 000 F CFA
              </span>
            </div>

            <p className="text-xs text-[#667781] dark:text-[#8696A0] mb-2">
              Durée : 1h30 d’échanges privés (messages vocaux, photos de
              corrigés et explications pas-à-pas).
            </p>

            <span className="text-[11px] font-semibold text-[#075E54] dark:text-[#25D366] bg-[#25D366]/15 px-2 py-0.5 rounded">
              Recommandé pour les TD de calcul
            </span>
          </div>

          <div className="border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-indigo-950 dark:text-indigo-300">
                Tutorat Vidéo Meet / WhatsApp
              </span>

              <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-base">
                1 500 F CFA
              </span>
            </div>

            <p className="text-xs text-[#667781] dark:text-[#8696A0] mb-2">
              Durée : 1h30 en visioconférence directe avec partage d’écran ou
              tableau blanc interactif.
            </p>

            <span className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
              Idéal pour les matières à démonstration
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-[#8696A0]">
          * Tu es directement mis en relation avec un étudiant major de ta
          faculté ayant obtenu au moins 15/20 dans l’UE concernée.
        </p>
      </>
    ),
  },

  {
    id: 'tutorat-2',
    category: 'cat-tutorat',
    question:
      'Comment réserver un tuteur et quand la séance se déroule-t-elle ?',
    keywords: [
      'réserver',
      'réservation',
      'rendez-vous',
      'créneau',
      'quand',
      'horaire',
      'disponibilité',
      'planning',
      'soir',
      'week-end',
    ],
    answer: (
      <p>
        Tu peux réserver un créneau directement depuis la section Tutorat ou via
        notre permanence WhatsApp Campus. La séance est planifiée selon tes
        disponibilités (en semaine de 18h à 22h ou le week-end) avec ton tuteur
        assigné.
      </p>
    ),
  },
];