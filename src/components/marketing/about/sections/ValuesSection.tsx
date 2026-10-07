import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { Container } from '../../ui/Container';
import { VALUES } from '../data/valuesData';

export const ValuesSection: React.FC = () => {
  return (
    <section
      id="valeurs"
      className="py-16 md:py-20 bg-white dark:bg-[#111B21] transition-colors"
    >
      <Container>
        {/* En-tête */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] mb-3">
            <Shield className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">
              Éthique &amp; Pédagogie Togolaise
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-white tracking-tight">
            Nos 4 Piliers Inébranlables pour chaque Étudiant
          </h2>

          <p className="text-base text-[#667781] dark:text-[#8696A0] mt-2">
            Nous ne sommes pas une multinationale déconnectée. Nos principes
            reposent sur le vécu des amphis du Campus Nord et Sud de Lomé.
          </p>
        </div>

        {/* Grille 4 valeurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="group bg-white dark:bg-[#111B21] p-6 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Icon className={`w-5 h-5 ${value.iconColor}`} />
                  </div>

                  <h3 className="text-base font-bold text-[#075E54] dark:text-[#25D366] mb-2">
                    {value.title}
                  </h3>

                  <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed">
                    {value.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center text-xs font-bold">
                  <span className={`flex items-center gap-1 ${value.footerColor}`}>
                    <span>{value.footer}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};