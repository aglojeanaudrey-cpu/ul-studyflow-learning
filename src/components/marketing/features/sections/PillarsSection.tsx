import React from 'react';
import {
  BookOpen,
  Podcast,
  ClipboardCheck,
  WifiOff,
  Brain,
  Smartphone,
  FileDown,
  Volume2,
  Timer,
  Save,
  ListOrdered,
} from 'lucide-react';
import { Container } from '../../ui/Container';
import { PillarCard, PillarFooter } from '../ui/PillarCard';

export const PillarsSection: React.FC = () => {
  return (
    <section
      id="piliers"
      className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
    >
      <Container>
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#25D366]/10 text-[#075E54] dark:text-[#25D366] text-xs font-bold border border-[#25D366]/30 mb-3">
            <span className="text-base">📱</span>
            Architecture pédagogique
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21] dark:text-white tracking-tight">
            6 fonctionnalités puissantes pour dompter votre cursus
          </h2>

          <p className="text-base text-[#667781] dark:text-[#8696A0] mt-3">
            Chaque outil a été conçu pour éliminer une situation concrète
            vécue sur le campus universitaire de Lomé.
          </p>
        </div>

        {/* Grille bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pilier 1 */}
          <PillarCard
            number="Pilier 01"
            subtitle="Format PDF ultra-léger"
            icon={<BookOpen className="w-7 h-7" />}
            title="Fiches de cours synthétiques & révision express"
            description="Résumés structurés de 5-15 minutes chrono par chapitre, conformes aux syllabus officiels de l'UL (FASEG, FDS, FDD, FLLA, etc...). Finis les pavés indigestes de 200 pages de photocopies long. Fichiers PDF ultra-légers (< 2 Mo) téléchargeables et imprimables."
            footer={{
              icon: <FileDown className="w-4 h-4" />,
              label: 'Téléchargement immédiat',
              badge: '5-15 min / chapitre',
            }}
          />

          {/* Pilier 2 */}
          <PillarCard
            number="Pilier 02"
            subtitle="Mobilité & Trajets"
            icon={<Podcast className="w-7 h-7" />}
            title="Podcasts audio & cours immersifs pour les trajets"
            description="Réécoute les explications claires des concepts même dans les taxis ou trajets. Zéro consommation de vidéo lourde, lecture fluide et adapter à tous les supports visuelles et d'audios."
            footer={{
              icon: <Volume2 className="w-4 h-4" />,
              label: 'Voix studio claire',
              badge: 'Mode Zémidjan',
            }}
          />

          {/* Pilier 3 */}
          <PillarCard
            number="Pilier 03"
            subtitle="Teste & Comprend"
            icon={<ClipboardCheck className="w-7 h-7" />}
            title="Entraîne toi avec QCM et Flashcard"
            description="Des quizs et flashcards à la fin de chaque lecture pour tester ta compréhension. Explications détaillées pour chaque mauvaise réponse afin de ne plus tomber dans les pièges classiques des épreuves de Lomé."
            footer={{
              icon: <Timer className="w-4 h-4" />,
              label: "Timer d'examen réel",
              badge: 'Corrigés détaillés',
            }}
          />

          {/* Pilier 4 */}
          <PillarCard
            number="Pilier 04"
            subtitle="Économie de forfait"
            icon={<WifiOff className="w-7 h-7" />}
            title="Mode Hors-Ligne & Économie Maximale de Data Internet"
            description="Télécharge tes séances PDF en une seule fois (en wifi ou avec 150 F) puis révise en chambre sans aucune connexion active requise. Zéro mauvaise surprise lors des coupures de réseau."
            footer={{
              icon: <Save className="w-4 h-4" />,
              label: 'Stockage local sécurisé',
              badge: '0 Ko consommé',
            }}
          />

          {/* Pilier 5 */}
          <PillarCard
            number="Pilier 05"
            subtitle="Rigueur académique"
            icon={<Brain className="w-7 h-7" />}
            title="Assistant Pédagogique Intelligent UL-StudyFlow Assistant"
            description="Professeur virtuelle qui t'explique tes UE selon ton niveau, t'aide à traiter tes exercices et à résoudre tes problèmes dans chaque UE."
            footer={{
              icon: <ListOrdered className="w-4 h-4" />,
              label: 'Apprentissage intelligent',
              badge: 'Disponible 24/24h',
            }}
          />

          {/* Pilier 6 — Featured */}
          <PillarCard
            number="Pilier 06"
            subtitle="100% Mobile Money"
            icon={<Smartphone className="w-7 h-7" />}
            title="Micro-Paiement Ultra-Flexible"
            description="Aucun abonnement bancaire mensuel obligatoire. Règle uniquement l'UE ou le semestre dont tu as besoin, dès 300 FCFA ou 500 FCFA directement par Flooz ou T-money/Mix Togo."
            featured
            footer={{
              icon: null,
              label: '',
              badge: '',
            }}
            badgeCustom={
              <>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-yellow-200/80 text-[#111B21] dark:text-amber-300 text-xs font-bold">
                    T-Money
                  </span>
                  <span className="px-2 py-1 rounded bg-sky-500/80 text-[#111B21] dark:text-sky-300 text-xs font-bold">
                    Moov Flooz
                  </span>
                </div>
                <span className="text-xs font-extrabold text-[#075E54] dark:text-[#25D366]">
                  Dès 300 FCFA
                </span>
              </>
            }
          />
        </div>
      </Container>
    </section>
  );
};