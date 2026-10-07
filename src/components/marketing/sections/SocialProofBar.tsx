import React from 'react';
import { Check } from 'lucide-react';
import { Container } from '../ui/Container';
import { STATS } from '@/src/lib/constants';

interface StatItem {
  value: string;
  label: string;
  prefix?: string;
  suffix?: React.ReactNode;
}

const STATS_ITEMS: StatItem[] = [
  {
    value: STATS.students,
    label: "Étudiants inscrits sur Ul-StudyFlow-Learning",
    suffix: (
      <span className="text-[#25D366] font-bold text-sm bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-700/50">
        UL
      </span>
    ),
  },
  {
    value: STATS.successRate,
    label: 'Taux de validation des semestres',
    suffix: <Check className="w-5 h-5 text-[#25D366]" />,
  },
  {
    value: STATS.rating,
    label: 'Note moyenne par les étudiants',
    prefix: '★★★★★',
  },
  {
    value: `${STATS.compliance} Conforme`,
    label: "Conforme aux syllabus officiels de l'UL",
    suffix: <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />,
  },
];

export const SocialProofBar: React.FC = () => {
  return (
    <section className="border-y border-emerald-800/10 bg-gradient-to-r from-[#075E54] via-[#0a6b5f] to-[#075E54] text-white py-8 shadow-inner">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center text-center divide-y md:divide-y-0 md:divide-x divide-emerald-800/60">
          {STATS_ITEMS.map((stat, index) => (
            <div
              key={index}
              className={`${index > 0 ? 'pt-4 md:pt-0' : 'pt-2 md:pt-0'} px-3`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                {stat.prefix && (
                  <div className="flex text-amber-300 text-base">{stat.prefix}</div>
                )}
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </span>
                {stat.suffix}
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};