import React from 'react';
import { ArrowRight, Route } from 'lucide-react';
import { Container } from '../../ui/Container';
import { STEPS, StepData } from '../data/stepsData';

interface StepsSectionProps {
  onGetStarted: () => void;
}

// Styles selon le variant du badge
const BADGE_STYLES: Record<
  StepData['badgeVariant'],
  { classes: string; }
> = {
  default: {
    classes:
      'bg-[#075E54]/5 dark:bg-[#075E54]/10 text-[#075E54] dark:text-[#25D366] border border-[#075E54]/10 dark:border-[#075E54]/30',
  },
  mint: {
    classes:
      'bg-[#25D366]/30 text-[#075E54] dark:text-[#25D366] border border-[#25D366] font-bold',
  },
  amber: {
    classes:
      'bg-amber-500/15 text-[#111B21] dark:text-amber-300 border border-amber-500/30 font-bold',
  },
  success: {
    classes:
      'bg-[#25D366]/10 text-[#075E54] dark:text-[#25D366] border border-[#25D366]/30 font-bold',
  },
};

// Styles de card selon featured
const getCardClasses = (featured?: boolean) =>
  featured
    ? 'bg-[#25D366]/10 border border-[#25D366]/40 hover:border-[#25D366]'
    : 'bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]/60';

const getNumberClasses = (featured?: boolean) =>
  featured
    ? 'bg-[#25D366] text-[#075E54] shadow-sm'
    : 'bg-[#25D366]/15 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366]';

const getFooterBorderColor = (featured?: boolean) =>
  featured
    ? 'border-[#25D366]/40'
    : 'border-[#E9EDEF] dark:border-[#222E35]';

export const StepsSection: React.FC<StepsSectionProps> = ({ onGetStarted }) => {
  return (
    <section
      id="etapes"
      className="py-16 sm:py-20 bg-[#F0F2F5] dark:bg-[#0B141A] border-y border-[#E9EDEF] dark:border-[#222E35] transition-colors"
    >
      <Container>
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1 text-[#25D366] text-xs font-bold uppercase tracking-wider mb-2">
            <Route className="w-4 h-4" />
            <span>Feuille de route étudiante</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-white tracking-tight">
            Valider son UE en 4 étapes simples
          </h2>

          <p className="text-base text-[#667781] dark:text-[#8696A0] mt-3">
            Une interface intuitive conçue pour te faire gagner du temps dès le
            premier jour de cours.
          </p>
        </div>

        {/* Grille bento 2×2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {STEPS.map((step) => {
            const badgeStyle = BADGE_STYLES[step.badgeVariant].classes;
            const cardClasses = getCardClasses(step.featured);
            const numberClasses = getNumberClasses(step.featured);
            const footerBorder = getFooterBorderColor(step.featured);

            return (
              <div
                key={step.number}
                className={`rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${cardClasses}`}
              >
                <div className="space-y-5">
                  {/* Ligne numéro + badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-extrabold ${numberClasses}`}
                    >
                      {step.number}
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${badgeStyle}`}
                    >
                      {step.badge}
                    </span>
                  </div>

                  {/* Titre + description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#075E54] dark:text-[#25D366]">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Preview (contenu visuel de l'étape) */}
                  <div>{step.preview}</div>
                </div>

                {/* Footer */}
                <div
                  className={`mt-6 pt-4 border-t flex items-center justify-between text-[#075E54] dark:text-[#25D366] text-xs font-semibold ${footerBorder}`}
                >
                  <span className="flex items-center gap-1.5">
                    {step.footer.icon}
                    {step.footer.label}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA sous les étapes */}
        <div className="text-center mt-12">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1faa54] text-[#075E54] font-bold text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-95"
          >
            <span>Commencer la Séance 01 gratuite</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Container>
    </section>
  );
};