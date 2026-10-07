import React from 'react';
import { AlertTriangle, X, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import { Container } from '../../ui/Container';
import { CONSTAT_PROBLEMS, CONSTAT_SOLUTIONS } from '../data/constatData';

export const ConstatSection: React.FC = () => {
  return (
    <section
      id="constat"
      className="py-16 md:py-20 bg-[#F0F2F5] dark:bg-[#0B141A] border-y border-[#E9EDEF] dark:border-[#222E35] transition-colors"
    >
      <Container>
        {/* En-tête */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-500 mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">
              Le constat du quotidien étudiant
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-white tracking-tight">
            Pourquoi avons-nous créé UL STUDY FLOW ?
          </h2>

          <p className="text-base text-[#667781] dark:text-[#8696A0] mt-3">
            Étudier à l'Université de Lomé exige un courage immense. Nous avons
            vécu les mêmes épreuves et refusé que la fatalité des conditions
            d'études brise les vocations.
          </p>
        </div>

        {/* 2 Cards comparatives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card Problème (galère) */}
          <div className="bg-white dark:bg-[#111B21] rounded-2xl p-6 md:p-8 border border-rose-400/20 shadow-sm relative flex flex-col justify-between">
            {/* Badge flottant */}
            <div className="absolute -top-3 left-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-500 text-xs font-bold">
                <X className="w-3.5 h-3.5" />
                La galère habituelle sur le campus
              </span>
            </div>

            <div className="mt-4 space-y-5">
              <h3 className="text-xl font-bold text-[#111B21] dark:text-white">
                Les obstacles qui pénalisent la réussite :
              </h3>

              {CONSTAT_PROBLEMS.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 shrink-0 flex items-center justify-center font-bold">
                    <X className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#111B21] dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#667781] dark:text-[#8696A0] mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center gap-2 text-rose-500 text-xs font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>
                Résultat : stress, échecs évitables et rattrapages massifs.
              </span>
            </div>
          </div>

          {/* Card Solution (UL STUDY FLOW) */}
          <div className="bg-[#25D366]/10 dark:bg-[#25D366]/5 rounded-2xl p-6 md:p-8 border-2 border-[#25D366]/40 shadow-md relative flex flex-col justify-between">
            {/* Badge flottant */}
            <div className="absolute -top-3 left-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#075E54] text-[#25D366] text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                La méthode UL STUDY FLOW
              </span>
            </div>

            <div className="mt-4 space-y-5">
              <h3 className="text-xl font-bold text-[#075E54] dark:text-[#25D366]">
                Notre réponse adaptée aux réalités de Lomé :
              </h3>

              {CONSTAT_SOLUTIONS.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#25D366] text-[#075E54] shrink-0 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#075E54] dark:text-[#25D366]">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#667781] dark:text-[#8696A0] mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#25D366]/40 flex items-center gap-2 text-[#075E54] dark:text-[#25D366] text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Résultat : Des révisions claires, 0 stress et la mention visée.
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};