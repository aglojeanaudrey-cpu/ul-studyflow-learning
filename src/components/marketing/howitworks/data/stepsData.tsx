import React from 'react';

export interface StepData {
  number: string;
  badge: string;
  badgeVariant: 'default' | 'mint' | 'amber' | 'success';
  title: string;
  description: React.ReactNode;
  preview: React.ReactNode;
  footer: {
    icon: React.ReactNode;
    label: string;
  };
  featured?: boolean;
}

/**
 * Contenu des 4 étapes de la méthode UL Study Flow.
 * Le rendu visuel (bento grid) est géré par StepsSection.tsx.
 */
export const STEPS: StepData[] = [
  // ─────────────────────────────────────────────
  // ÉTAPE 01 — Choisir UE
  // ─────────────────────────────────────────────
  {
    number: '01',
    badge: "Étape d'orientation",
    badgeVariant: 'default',
    title: 'Choisis ta faculté et ton UE',
    description: (
      <>
        Sélectionne ton cursus parmi les facultés officielles de l'Université de
        Lomé (FASEG, FDS, FDD, FLLA, FSHS, etc...). Tous les semestres Harmattan et
        Mousson sont indexés selon les syllabus LMD en vigueur.
      </>
    ),
    preview: (
      <div className="p-4 bg-white dark:bg-[#111B21] rounded-xl border border-[#E9EDEF] dark:border-[#222E35] space-y-2 shadow-inner">
        <div className="text-xs text-[#8696A0] uppercase tracking-wider font-semibold">
          Facultés disponibles au Togo :
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] border border-[#25D366]/30 text-xs font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
            FASEG (Éco-Gestion)
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#F0F2F5] dark:bg-[#0B141A] text-[#111B21] dark:text-white text-xs border border-[#E9EDEF] dark:border-[#222E35]">
            FDD (Droit)
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#F0F2F5] dark:bg-[#0B141A] text-[#111B21] dark:text-white text-xs border border-[#E9EDEF] dark:border-[#222E35]">
            FDS (Sciences)
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#F0F2F5] dark:bg-[#0B141A] text-[#111B21] dark:text-white text-xs border border-[#E9EDEF] dark:border-[#222E35]">
            FLLA (Lettres)
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#F0F2F5] dark:bg-[#0B141A] text-[#111B21] dark:text-white text-xs border border-[#E9EDEF] dark:border-[#222E35]">
            Plus...
          </span>
        </div>
      </div>
    ),
    footer: {
      icon: <span>🔍</span>,
      label: 'Recherche par code UE (ex: ECO 101, DRT 204)',
    },
  },

  // ─────────────────────────────────────────────
  // ÉTAPE 02 — Séance 01 gratuite
  // ─────────────────────────────────────────────
  {
    number: '02',
    badge: 'Séance 01 • 100% Gratuite',
    badgeVariant: 'mint',
    title: 'Démarre sans payer : teste la Séance 01',
    description: (
      <>
        Aucun depot Flooz ou T-Money requis pour débuter. Tu as accès immédiat
        à la fiche synthèse condensée (&lt; 2 Mo) et au podcast audio explicatif
        de 5-15 minutes conçu pour tes trajets en taxi-moto ou zémidjan.
      </>
    ),
    preview: (
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#111B21] p-3 rounded-xl border border-[#25D366]/30 flex items-center gap-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center shrink-0">
            📄
          </div>
          <div>
            <div className="text-xs font-bold text-[#075E54] dark:text-[#25D366]">
              Fiche PDF 1.4 Mo
            </div>
            <div className="text-[10px] text-[#8696A0]">
              Téléchargement express
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111B21] p-3 rounded-xl border border-[#25D366]/30 flex items-center gap-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center shrink-0">
            🎧
          </div>
          <div>
            <div className="text-xs font-bold text-[#075E54] dark:text-[#25D366]">
              Podcast 09:42 min
            </div>
            <div className="text-[10px] text-[#8696A0]">Écoute hors-ligne</div>
          </div>
        </div>
      </div>
    ),
    footer: {
      icon: <span>🔓</span>,
      label: 'Zéro engagement, satisfaction garantie',
    },
    featured: true,
  },

  // ─────────────────────────────────────────────
  // ÉTAPE 03 — Paiement Mobile Money
  // ─────────────────────────────────────────────
  {
    number: '03',
    badge: 'T-Money & Flooz',
    badgeVariant: 'amber',
    title: 'Formulaire & Demande de déblocage des UE',
    description: (
      <>
        Renseigne tes coordonnées (Nom & Prénom, numéro de téléphone) et
        sélectionne les UEs à débloquer. Effectue ensuite ton dépôt T-Money/Mix Togo ou
        Moov Flooz vers le numéro officiel affiché au bas du formulaire.
      </>
    ),
    preview: (
      <div className="p-4 bg-white dark:bg-[#111B21] rounded-xl border border-[#E9EDEF] dark:border-[#222E35] space-y-2 shadow-inner">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F0F2F5] dark:bg-[#0B141A] border border-[#E9EDEF] dark:border-[#222E35]">
            <span className="w-6 h-6 rounded-full bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold text-xs shrink-0">
              1
            </span>
            <span className="text-[11px] font-semibold text-[#075E54] dark:text-[#25D366]">
              Formulaire + Choix UEs
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F0F2F5] dark:bg-[#0B141A] border border-[#E9EDEF] dark:border-[#222E35]">
            <span className="w-6 h-6 rounded-full bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold text-xs shrink-0">
              2
            </span>
            <span className="text-[11px] font-semibold text-[#075E54] dark:text-[#25D366]">
              Dépôt T-Money / Flooz
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F0F2F5] dark:bg-[#0B141A] border border-[#E9EDEF] dark:border-[#222E35]">
            <span className="w-6 h-6 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center font-bold text-xs shrink-0">
              3
            </span>
            <span className="text-[11px] font-semibold text-[#075E54] dark:text-[#25D366]">
              Réf. transaction accélérée
            </span>
          </div>
        </div>
        <p className="text-xs text-[#8696A0] pt-2 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-start gap-1">
          <span className="text-[#25D366] mt-0.5 shrink-0">ℹ️</span>
          <span>
            Renseigne l'ID de transaction / Référence du dépôt (optionnel mais
            permet une validation ultra-rapide côté administration). Accès
            activé dans les prochaines munites !
          </span>
        </p>
      </div>
    ),
    footer: {
      icon: <span>🔒</span>,
      label: 'Dépôt direct sécurisé • Validation rapide',
    },
  },

  // ─────────────────────────────────────────────
  // ÉTAPE 04 — QCM + validation
  // ─────────────────────────────────────────────
  {
    number: '04',
    badge: 'Validation & Mention',
    badgeVariant: 'success',
    title: 'Auto-évalue toi et valide sans rattrapage',
    description: (
      <>
        Teste tes réflexes sur des QCM & Flashcard après chaque lecture. Chaque question comporte un corrigé détaillé pas à pas pour
        combler définitivement les zones d'ombre laissées après tes réponses au QCM .
      </>
    ),
    preview: (
      <div className="p-4 bg-white dark:bg-[#111B21] rounded-xl border border-[#E9EDEF] dark:border-[#222E35] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8696A0]">
            Quiz d'évaluation express
          </span>
          <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366]">
            Score : 100% Validé
          </span>
        </div>
        <div className="w-full bg-[#F0F2F5] dark:bg-[#0B141A] h-2.5 rounded-full overflow-hidden">
          <div className="bg-[#25D366] h-full rounded-full w-full" />
        </div>
        <p className="text-xs text-[#8696A0] flex items-center gap-1">
          <span className="text-[#25D366]">✓</span>
          Bravo ! Les notions clés de l'épreuve sont acquises.
        </p>
      </div>
    ),
    footer: {
      icon: <span>🏆</span>,
      label: '94% de nos étudiants valident du premier coup',
    },
  },
];