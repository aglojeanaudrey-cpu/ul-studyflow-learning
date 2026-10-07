import React from 'react';
import {
  ArrowRight,
  PlayCircle,
  Verified,
  Wallet,
  Clock,
  Users,
  ShieldCheck,
  Building2,
  BookOpen,
} from 'lucide-react';
import { Container } from '../../ui/Container';

interface AboutHeroProps {
  onGetStarted: () => void;
}

const STATS = [
  {
    icon: Users,
    badge: 'Campus UL',
    badgeColor: 'text-[#25D366] bg-[#25D366]/10',
    value: '4 800+',
    label: 'Étudiants accompagnés activement',
    iconColor: 'text-[#25D366]',
  },
  {
    icon: ShieldCheck,
    badge: 'Taux UL',
    badgeColor: 'text-[#25D366] bg-[#25D366]/10',
    value: '94%',
    label: 'De validation aux sessions normales',
    iconColor: 'text-[#25D366]',
  },
  {
    icon: Building2,
    badge: 'LMD Lomé',
    badgeColor: 'text-[#075E54] bg-[#F0F2F5] dark:bg-[#0B141A] dark:text-[#25D366]',
    value: '5 Facultés',
    label: 'FASEG, FDS, FDD, FLLA & FSHS',
    iconColor: 'text-[#25D366]',
  },
  {
    icon: BookOpen,
    badge: 'Rigoureux',
    badgeColor: 'text-[#075E54] bg-[#25D366]/20',
    value: '100%',
    label: "Aligné sur le syllabus LMD de l'UL",
    iconColor: 'text-amber-500',
  },
];

export const AboutHero: React.FC<AboutHeroProps> = ({ onGetStarted }) => {
  const scrollToConstat = () => {
    const el = document.getElementById('constat');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-[#25D366]/5 via-white to-white dark:from-[#25D366]/5 dark:via-[#111B21] dark:to-[#111B21] transition-colors">
      {/* Halos décoratifs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#25D366]/15 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#075E54 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Notre histoire &amp; mission • Université de Lomé
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#075E54] dark:text-white tracking-tight leading-tight mb-6">
            Démocratiser l'excellence universitaire à Lomé,{' '}
            <span className="text-[#25D366] underline decoration-[#25D366]/50 decoration-4 underline-offset-4">
              un étudiant à la fois.
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="text-base sm:text-lg text-[#667781] dark:text-[#8696A0] max-w-3xl mx-auto leading-relaxed mb-8">
            Née sur les bancs de l'Université de Lomé,{' '}
            <strong>UL STUDY FLOW</strong> est la première plateforme
            d'accélération académique conçue par et pour les étudiants togolais,
            pour surmonter les amphis bondés et réussir chaque semestre en toute
            sérénité.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#25D366] text-[#075E54] hover:bg-[#1faa54] font-bold text-sm shadow-md hover:shadow-xl transition-all active:scale-95"
            >
              <span>Tester la Séance 01 gratuite</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToConstat}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] text-[#075E54] dark:text-[#25D366] hover:bg-[#25D366]/5 font-semibold text-sm transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Découvrir notre démarche</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-6 border-t border-[#E9EDEF] dark:border-[#222E35] flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-[#667781] dark:text-[#8696A0]">
            <div className="flex items-center gap-1.5">
              <Verified className="w-4 h-4 text-[#25D366]" />
              <span>Conforme syllabus officiel LMD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-500" />
              <span>Paiement T-Money &amp; Flooz (dès 300 F)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#25D366]" />
              <span>Activation garantie sous 12h</span>
            </div>
          </div>
        </div>

        {/* 4 stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 pt-8 border-t border-[#E9EDEF] dark:border-[#222E35]">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#111B21] p-5 rounded-2xl border border-[#25D366]/30 shadow-sm flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.badgeColor}`}
                  >
                    {stat.badge}
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#075E54] dark:text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs text-[#667781] dark:text-[#8696A0] font-medium mt-1">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};