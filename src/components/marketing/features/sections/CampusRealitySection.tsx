import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Container } from '../../ui/Container';
import { ComparisonPair } from '../ui/ComparisonPair';

export const CampusRealitySection: React.FC = () => {
  return (
    <section
      id="campus-reality"
      className="py-16 sm:py-20 bg-[#F0F2F5] dark:bg-[#0B141A] border-y border-[#E9EDEF] dark:border-[#222E35] transition-colors"
    >
      <Container>
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-200 dark:border-rose-900/40 text-xs font-bold uppercase">
            <AlertCircle className="w-3.5 h-3.5" />
            La réalité du campus de Lomé
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21] dark:text-white tracking-tight mt-3">
            En quoi chaque outil résout la réalité du terrain
          </h2>

          <p className="text-base text-[#667781] dark:text-[#8696A0] mt-2">
            Comparaison directe entre la galère habituelle des amphis et la
            méthode simplifiée Ul-StudyFlow-Learning.
          </p>
        </div>

        {/* 4 paires comparatives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComparisonPair
            problemTitle="Amphi bondé 1000/1500 places"
            problemDescription="Micro qui grésille, places debout dès 6h du matin à l'Amphi 600, chaleur et notes de cours incomplètes."
            problemFooter="Stress & fatigue inutile"
            solutionTitle="Podcast audio studio clair"
            solutionDescription="Enregistrements limpides, structurés chapitre par chapitre, à écouter confortablement au calme en chambre."
            solutionFooter="100% du syllabus assimilé"
          />

          <ComparisonPair
            problemTitle="Photocopies floues ou trop long"
            problemDescription="Polycopiés manuscrits trop long à reviser, parfois avec pages manquantes ou des versions obsolète."
            problemFooter="Dépense excessive"
            solutionTitle="Fiches PDF numériques < 2 Mo"
            solutionDescription="Typographie dactylographiée parfaite, schémas vectoriels nets, lisibles sur n'importe quel smartphone basique."
            solutionFooter="Clarté visuelle absolue"
          />

          <ComparisonPair
            problemTitle="Panique la veille de l'examen"
            problemDescription="Nuit blanche à tenter d'avaler 500 pages pendant la période d'Harmattan, sans savoir quelles notions tomberont."
            problemFooter="Risque élevé de rattrapage"
            solutionTitle="Parcours guidé séance par séance"
            solutionDescription="Objectifs ciblés, jauges de complétion en pourcentage et QCM de validation pour mesurer sa maîtrise réelle."
            solutionFooter="Confiance et sérénité"
          />

          <ComparisonPair
            problemTitle="Pannes de courant & forfait data épuisé"
            problemDescription="Plus de crédit internet, plateforme inaccessible, impossible de rouvrir le document en pleine révision."
            problemFooter="Blocage total des études"
            solutionTitle="Disponibilité 100% hors-ligne"
            solutionDescription="Une fois synchronisé avec quelques mégas de data, tout le module PDF peut être téléchargé et disponible hors-ligne."
            solutionFooter="Continuité garantie"
          />
        </div>
      </Container>
    </section>
  );
};