import React from 'react';
import { X, Check, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionBadge } from '../ui/SectionBadge';
import { SectionHeader } from '../ui/SectionHeader';

interface ProblemItem {
  title: string;
  description: string;
}

const PROBLEMS: ProblemItem[] = [
  {
    title: 'Amphis bondés',
    description:
      'où le tableau et le son sont parfois difficiles à capter depuis le fond avec manque de place.',
  },
  {
    title: 'Polycopiés photocopiés longs et denses',
    description:
      'sans supports vidéo ou audio de démonstration pour réviser à la maison.',
  },
  {
    title: 'Aucun moyen rapide de savoir',
    description:
      "si on a réellement compris et validé ses notions avant le jour décisif de l'examen sur table.",
  },
];

const SOLUTIONS: ProblemItem[] = [
  {
    title: 'Chaque UE découpée en séances courtes',
    description:
      'et progressives de 5-15 minutes avec fiches de révision claires et structurées.',
  },
  {
    title: 'Audios podcasts et vidéos concrètes',
    description:
      'pour réviser dans le bus, au campus de Lomé ou directement chez soi.',
  },
  {
    title: 'Séance 01 gratuite sur chaque UE',
    description:
      'et déblocage transparent dans les minutes qui suivent par paiement sécurisé T-Money/Mix Togo ou Flooz.',
  },
];

export const WhySection: React.FC = () => {
  return (
    <section
      id="methode"
      className="py-20 bg-white dark:bg-[#111B21] border-y border-[#E9EDEF] dark:border-[#222E35] transition-colors"
    >
      <Container>
        <SectionHeader
          badge={<SectionBadge>Comparatif exclusif</SectionBadge>}
          title="Pourquoi UL STUDY FLOW fait toute la différence ?"
          subtitle="Une réponse concrète aux réalités universitaires de Lomé : amphis bondés, polycopiés dispersés et manque de temps."
        />

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Carte Problème */}
          <div className="bg-gradient-to-br from-rose-50/50 to-orange-50/30 dark:from-rose-950/20 dark:to-orange-950/10 rounded-3xl p-8 border border-rose-200/70 dark:border-rose-900/40 relative flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                <h3 className="text-xl font-bold text-rose-950 dark:text-rose-200">
                  La galère habituelle de l'étudiant à Lomé
                </h3>
              </div>

              <ul className="space-y-5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                {PROBLEMS.map((item, index) => (
                  <li key={index} className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      <X className="w-3.5 h-3.5" />
                    </span>
                    <span>
                      <strong>{item.title}</strong> {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-rose-200/60 dark:border-rose-900/40 text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Résultat : stress accru aux rattrapages et confusions.
            </div>
          </div>

          {/* Carte Solution */}
          <div className="bg-gradient-to-br from-[#25D366]/10 to-emerald-50/40 dark:from-[#25D366]/5 dark:to-emerald-950/10 rounded-3xl p-8 border-2 border-[#25D366] relative flex flex-col justify-between shadow-lg shadow-[#25D366]/10">
            <div className="absolute -top-3.5 right-8 bg-[#25D366] text-[#075E54] font-extrabold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Recommandé
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3.5 h-3.5 rounded-full bg-[#25D366]" />
                <h3 className="text-xl font-bold text-[#075E54] dark:text-[#25D366]">
                  La méthode UL-STUDYFLOW-LEARNING
                </h3>
              </div>

              <ul className="space-y-5 text-sm sm:text-base text-slate-800 dark:text-slate-200">
                {SOLUTIONS.map((item, index) => (
                  <li key={index} className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-[#25D366]/30 text-[#075E54] dark:text-[#25D366] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>
                      <strong>{item.title}</strong> {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#25D366]/30 text-xs font-semibold text-[#075E54] dark:text-[#25D366] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Résultat : moyenne rehaussée et semestres validés sans stress.
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};