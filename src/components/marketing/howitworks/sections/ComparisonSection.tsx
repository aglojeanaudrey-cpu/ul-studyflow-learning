import React from 'react';
import {X, Check, ArrowLeftRight, CircleCheck, CircleX,} from 'lucide-react';
import { Container } from '../../ui/Container';

interface ProblemItem {
  text: string;
}

interface SolutionItem {
  text: string;
}

const PROBLEMS: ProblemItem[] = [
  {
    text: "Débout à 5h du matin pour avoir une place assise dans un amphi de 1500 personnes.",
  },
  {
    text: "Dépenser des milliers de francs en photocopies de cour long ou imprimé.",
  },
  {
    text: "Forfaits data internet qui s'épuisent rapidement à cause des fichiers lourds inaccessibles en zone 2G/3G.",
  },
  {
    text: "Découvrir le format de l'examen le jour J et finir aux rattrapages.",
  },
];

const SOLUTIONS: SolutionItem[] = [
  {
    text: 'Révise à ton rythme depuis ta chambre ou en zémidjan avec des podcasts audios ultra-clairs.',
  },
  {
    text: "Fiches PDF synthétiques condensées à l'essentiel du syllabus officiel de l'Université de Lomé.",
  },
  {
    text: 'Consommation de data quasi-nulle (< 2 Mo par leçon), PDF consultable hors connexion.',
  },
  {
    text: "QCM d'entraînement calibrés sur les vraies questions des examens précédents pour viser la mention.",
  },
];

export const ComparisonSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#111B21] transition-colors">
      <Container>
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1 text-[#075E54] dark:text-[#25D366] text-xs font-bold uppercase tracking-wider mb-2">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Pourquoi changer tes habitudes ?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-white tracking-tight">
            La galère de l'Amphi vs. La méthode Ul-StudyFlow-Learning
          </h2>

          <p className="text-base text-[#667781] dark:text-[#8696A0] mt-3">
            Constaté sur le terrain à l'Université de Lomé, du nord au sud et en tant qu'étudiants de l'universitaires.
          </p>
        </div>

        {/* Grille comparative */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
          {/* Card Problème */}
          <div className="bg-white dark:bg-[#111B21] border border-rose-400/20 rounded-2xl p-7 shadow-sm space-y-6">
            {/* En-tête card */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#E9EDEF] dark:border-[#222E35]">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center font-bold">
                <X className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111B21] dark:text-white">
                  La galère habituelle à Lomé
                </h3>
                <span className="text-xs text-[#8696A0]">
                  Amphis 1000 & photocopies super long
                </span>
              </div>
            </div>

            {/* Liste */}
            <ul className="space-y-4">
              {PROBLEMS.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CircleX className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-[#667781] dark:text-[#8696A0]">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card Solution */}
          <div className="relative bg-[#25D366]/5 dark:bg-[#25D366]/5 border-2 border-[#25D366]/40 rounded-2xl p-7 shadow-lg space-y-6 overflow-hidden">
            {/* Badge flottant */}
            <div className="absolute -top-3 -right-3 bg-[#25D366] text-[#075E54] text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-sm uppercase tracking-wider">
              Recommandé campus
            </div>

            {/* En-tête card */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#25D366]/30">
              <div className="w-10 h-10 rounded-full bg-[#25D366] text-[#075E54] flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#075E54] dark:text-[#25D366]">
                  La méthode UL STUDY FLOW
                </h3>
                <span className="text-xs text-[#25D366] font-semibold">
                  Révision ciblée &amp; Sérénité LMD
                </span>
              </div>
            </div>

            {/* Liste */}
            <ul className="space-y-4">
              {SOLUTIONS.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#111B21] dark:text-slate-300">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
};