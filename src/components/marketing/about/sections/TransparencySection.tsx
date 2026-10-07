import React from 'react';
import { Shield } from 'lucide-react';
import { Container } from '../../ui/Container';
import { RULES } from '../data/rulesData';

export const TransparencySection: React.FC = () => {
  return (
    <section
      id="transparence"
      className="py-16 md:py-20 bg-white dark:bg-[#111B21] transition-colors"
    >
      <Container>
        {/* En-tête */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] mb-3">
            <Shield className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">
              Transparence Totale
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-white tracking-tight">
            Les Règles Clés de Fonctionnement
          </h2>

          <p className="text-base text-[#667781] dark:text-[#8696A0] mt-2">
            Chez UL STUDY FLOW, nous nous engageons à la clarté la plus absolue.
            Voici exactement comment fonctionne la plateforme au quotidien.
          </p>
        </div>

        {/* Grille 3 règles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RULES.map((rule, index) => {
            const Icon = rule.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#111B21] p-6 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-7 h-7 ${rule.iconColor}`} />
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${rule.badgeColor}`}
                    >
                      {rule.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#075E54] dark:text-[#25D366] mb-2">
                    {rule.title}
                  </h3>

                  <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center gap-2 text-xs font-bold text-[#075E54] dark:text-[#25D366]">
                  <span>{rule.footer.icon}</span>
                  <span>{rule.footer.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};