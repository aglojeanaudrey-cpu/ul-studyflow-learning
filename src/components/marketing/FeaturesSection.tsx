import React, { useState } from 'react';
import { BookOpen, FileText, Video, Headphones, CheckSquare, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

interface FeaturesSectionProps {
  onStart: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onStart }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'ai'>('content');

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#128C7E]/10 text-[#075E54] text-xs font-semibold">
          Tout pour réussir tes semestres
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111B21]">
          Les Fonctionnalités de UL STUDY FLOW
        </h1>
        <p className="text-sm sm:text-base text-[#667781]">
          Chaque outil a été conçu pour simplifier ton quotidien d'étudiant à l'Université de Lomé.
        </p>
      </div>

      {/* Grid of 8 Core Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Cours organisés */}
        <div className="p-6 bg-white rounded-2xl border border-[#E9EDEF] shadow-sm hover:border-[#25D366] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-[#075E54]" />
          </div>
          <h3 className="font-bold text-base text-[#111B21]">Cours organisés par UE</h3>
          <p className="text-xs text-[#667781] leading-relaxed">
            Une arborescence académique limpide : Département, Filière, Semestre et Séances ordonnées avec estimation du temps d'étude.
          </p>
        </div>

        {/* 2. PDF & Polycopiés */}
        <div className="p-6 bg-white rounded-2xl border border-[#E9EDEF] shadow-sm hover:border-[#25D366] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5 text-[#075E54]" />
          </div>
          <h3 className="font-bold text-base text-[#111B21]">Supports PDF optimisés</h3>
          <p className="text-xs text-[#667781] leading-relaxed">
            Consulte directement dans l'application les polycopiés et fiches de synthèse officiels sans saturer la mémoire de ton téléphone.
          </p>
        </div>

        {/* 3. Vidéos */}
        <div className="p-6 bg-white rounded-2xl border border-[#E9EDEF] shadow-sm hover:border-[#25D366] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
            <Video className="w-5 h-5 text-[#075E54]" />
          </div>
          <h3 className="font-bold text-base text-[#111B21]">Vidéos explicatives</h3>
          <p className="text-xs text-[#667781] leading-relaxed">
            Comprends visuellement les graphiques de microéconomie, les schémas de compta et les théorèmes grâce à des capsules courtes.
          </p>
        </div>

        {/* 4. Audio Podcasts */}
        <div className="p-6 bg-white rounded-2xl border border-[#E9EDEF] shadow-sm hover:border-[#25D366] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
            <Headphones className="w-5 h-5 text-[#075E54]" />
          </div>
          <h3 className="font-bold text-base text-[#111B21]">Podcasts audio légers</h3>
          <p className="text-xs text-[#667781] leading-relaxed">
            Écoute les récapitulatifs des enseignants pendant tes trajets ou en faisant une pause. Réglage de vitesse de lecture 1x, 1.25x et 1.5x.
          </p>
        </div>

        {/* 5. Questionnaires */}
        <div className="p-6 bg-white rounded-2xl border border-[#E9EDEF] shadow-sm hover:border-[#25D366] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5 text-[#075E54]" />
          </div>
          <h3 className="font-bold text-base text-[#111B21]">Questionnaires d'évaluation</h3>
          <p className="text-xs text-[#667781] leading-relaxed">
            QCM à choix unique, choix multiple et vrai/faux calibrés selon les exigences des partiels de l'Université de Lomé.
          </p>
        </div>

        {/* 6. Corrections détaillées */}
        <div className="p-6 bg-white rounded-2xl border border-[#E9EDEF] shadow-sm hover:border-[#25D366] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5 text-[#075E54]" />
          </div>
          <h3 className="font-bold text-base text-[#111B21]">Corrections & explications</h3>
          <p className="text-xs text-[#667781] leading-relaxed">
            Ne reste plus dans l'incompréhension. Après chaque test, consulte la justification pédagogique de chaque bonne et mauvaise réponse.
          </p>
        </div>

        {/* 7. Suivi de progression */}
        <div className="p-6 bg-white rounded-2xl border border-[#E9EDEF] shadow-sm hover:border-[#25D366] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5 text-[#075E54]" />
          </div>
          <h3 className="font-bold text-base text-[#111B21]">Progression en temps réel</h3>
          <p className="text-xs text-[#667781] leading-relaxed">
            Visualise en un coup d'œil tes UE terminées, tes séances en cours et tes moyennes aux quiz pour cibler tes révisions d'examens.
          </p>
        </div>

        {/* 8. Assistant IA Pédagogique */}
        <div className="p-6 bg-white rounded-2xl border border-[#E9EDEF] shadow-sm hover:border-[#25D366] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-[#25D366]" />
          </div>
          <h3 className="font-bold text-base text-[#111B21]">Assistant IA Pédagogique</h3>
          <p className="text-xs text-[#667781] leading-relaxed">
            Propulsé par Gemini 3.8 Flash, il est strictement scôpé à tes matières autorisées pour répondre à tes questions 24h/24 sans déborder.
          </p>
        </div>
      </div>

      {/* Feature Spotlight Interactive Box */}
      <div className="bg-white rounded-2xl border border-[#E9EDEF] p-6 sm:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-[#E9EDEF] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#111B21]">
              Découvre l'interface de travail
            </h3>
            <p className="text-xs text-[#667781]">
              Chaque élément a une place précise et évite les distractions.
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-xl">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'content' ? 'bg-white text-[#075E54] shadow-sm' : 'text-[#667781]'
              }`}
            >
              Supports multimédias
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'quiz' ? 'bg-white text-[#075E54] shadow-sm' : 'text-[#667781]'
              }`}
            >
              Quiz & Corrections
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai' ? 'bg-white text-[#075E54] shadow-sm' : 'text-[#667781]'
              }`}
            >
              Assistant IA
            </button>
          </div>
        </div>

        {activeTab === 'content' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#25D366] uppercase tracking-wider">
                Séance d'apprentissage
              </span>
              <h4 className="text-xl font-bold text-[#111B21]">
                Un lecteur pensé pour la concentration
              </h4>
              <p className="text-xs sm:text-sm text-[#667781] leading-relaxed">
                Quand tu ouvres une séance, tu retrouves le résumé textuel en police ultra-lisible, un lecteur audio podcast pour écouter l'enseignant, la vidéo explicative et le polycopié PDF complet. Pas de pop-up gênante, juste le savoir.
              </p>
              <div className="pt-2">
                <button
                  onClick={onStart}
                  className="px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-lg hover:bg-[#1faa54]"
                >
                  Tester une séance gratuite
                </button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-[#E9EDEF] bg-[#F0F2F5] p-4">
              <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-[#667781]">
                  <span className="font-semibold text-[#075E54]">ECO 101 · Séance 01</span>
                  <span className="text-[#25D366] font-bold">14 min</span>
                </div>
                <p className="text-sm font-bold text-[#111B21]">
                  Les Fondements de l'Analyse Microéconomique
                </p>
                <div className="p-2.5 rounded bg-[#F0F2F5] text-xs text-[#111B21] border-l-2 border-[#25D366]">
                  "Le coût d'opportunité mesure la valeur de la meilleure alternative abandonnée."
                </div>
                <div className="flex items-center gap-2 pt-2 text-xs text-[#667781]">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#075E54] font-medium">🎧 Podcast audio 08:45</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#075E54] font-medium">📄 Polycopié PDF</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#25D366] uppercase tracking-wider">
                Validation & Corrections
              </span>
              <h4 className="text-xl font-bold text-[#111B21]">
                Des corrections pédagogiques immédiates
              </h4>
              <p className="text-xs sm:text-sm text-[#667781] leading-relaxed">
                Après avoir répondu aux questions, tu obtiens instantanément ta note sur 20, le détail de chaque réponse avec un retour explicatif pour comprendre pourquoi une réponse est exacte ou erronée.
              </p>
            </div>
            <div className="rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] p-4">
              <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Score : 20/20 (100%)
                  </span>
                  <span className="text-xs text-[#25D366] font-bold">Admis ✓</span>
                </div>
                <div className="text-xs text-[#111B21] border-b border-[#E9EDEF] pb-2">
                  <p className="font-semibold">Question 1 : Définition du coût d'opportunité</p>
                  <p className="text-emerald-700 font-medium mt-1">✓ Ta réponse : La meilleure alternative abandonnée.</p>
                  <p className="text-[11px] text-[#667781] mt-1 italic">
                    Explication : C'est la valeur de ce à quoi on renonce lors d'un choix rationnel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#25D366] uppercase tracking-wider">
                Assistant Virtuel Sécurisé
              </span>
              <h4 className="text-xl font-bold text-[#111B21]">
                Un tuteur IA dédié à tes cours de Lomé
              </h4>
              <p className="text-xs sm:text-sm text-[#667781] leading-relaxed">
                Pose n'importe quelle question sur tes cours ou sur la plateforme. L'assistant n'invente rien : il s'appuie sur le syllabus et le programme officiel de ta filière.
              </p>
            </div>
            <div className="rounded-xl border border-[#E9EDEF] bg-[#EFEAE2] p-4">
              <div className="space-y-2.5">
                <div className="bg-[#E7FFDB] p-2.5 rounded-lg rounded-tr-none text-xs text-[#111B21] max-w-[85%] ml-auto shadow-sm">
                  Comment calculer le TMS pour la fonction d'utilité U(x,y) = x*y ?
                </div>
                <div className="bg-white p-2.5 rounded-lg rounded-tl-none text-xs text-[#111B21] max-w-[85%] shadow-sm space-y-1">
                  <p className="font-semibold text-[#075E54]">Assistant UL Study Flow :</p>
                  <p>
                    Le TMS correspond au rapport des utilités marginales : Um_x / Um_y. Pour U(x,y) = x*y, Um_x = y et Um_y = x. Le TMS vaut donc <strong>y / x</strong> !
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
