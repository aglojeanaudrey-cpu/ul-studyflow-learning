import React from 'react';
import { Star, BadgeCheck } from 'lucide-react';
import { Container } from '../../ui/Container';
import campusImage from '@/src/assets/images/campus_university_lome_1790533866163.jpg';

export const FeaturesTestimonial: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-[#F0F2F5] dark:bg-[#0B141A] border-y border-[#E9EDEF] dark:border-[#222E35] transition-colors">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-[#111B21] rounded-3xl p-6 sm:p-10 border border-[#25D366]/30 shadow-lg flex flex-col md:flex-row items-center gap-8">
            {/* Photo étudiante */}
            <div className="relative shrink-0">
              <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-[#25D366] shadow-md">
                <img
                  src={campusImage}
                  alt="Étudiante togolaise souriante sur le campus de l'Université de Lomé"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#075E54] text-[#25D366] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                Mention Bien • FASEG
              </span>
            </div>

            {/* Citation + impact */}
            <div className="flex-1">
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400" />
                ))}
                <span className="text-xs text-[#667781] dark:text-[#8696A0] font-bold ml-2">
                  Validation sans rattrapage
                </span>
              </div>

              <blockquote className="text-base sm:text-lg font-bold italic text-[#111B21] dark:text-white mb-3 leading-relaxed">
                « En L2 Économie à l'Université de Lomé, l'amphi était tellement
                plein que je ratais la moitié des formules au tableau. Avec les
                podcasts de 10 min que j'écoutais sur le chemin du retour et les
                PDF condensés, j'ai validé mes 30 crédits dès la première
                session ! En plus, payer 300 F par T-Money sans carte bancaire,
                c'est juste parfait pour notre budget. »
              </blockquote>

              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
                <div>
                  <p className="text-base font-bold text-[#075E54] dark:text-[#25D366]">
                    Afiwa M.
                  </p>
                  <p className="text-sm text-[#8696A0]">
                    Étudiante Licence 2 • FASEG Lomé
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-[#25D366]/15 px-3 py-1 rounded-full">
                  <BadgeCheck className="w-4 h-4" />
                  Étudiante vérifiée UL
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};