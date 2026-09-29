import React from 'react';
import { ArrowRight, BookOpen, Smartphone, CheckCircle2, Play, Award } from 'lucide-react';
import { UlStudyFlowLogo } from '../brand/UlStudyFlowLogo';
import heroImage from '@/src/assets/images/hero_ul_student_1790533845064.jpg';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreCourses: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onExploreCourses }) => {
  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* Main Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#128C7E]/10 dark:bg-[#128C7E]/20 border border-[#128C7E]/20 text-[#075E54] dark:text-[#25D366] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
              Plateforme EdTech indépendante par et pour les étudiants de Lomé
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#111B21] dark:text-white tracking-tight leading-[1.15]">
              Apprends mieux. <br />
              <span className="text-[#075E54] dark:text-[#25D366]">Comprends plus vite.</span> <br />
              <span className="text-[#25D366] dark:text-emerald-400">Progresse à ton rythme.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#667781] dark:text-[#8696A0] max-w-2xl leading-relaxed">
              Retrouve tous tes cours universitaires conformes au système LMD. Première séance de chaque UE 100% gratuite, résumés PDF téléchargeables, vidéos, podcasts audio et questionnaires avec corrections détaillées.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-[#075E54] bg-[#25D366] rounded-2xl hover:bg-[#1faa54] transition-all shadow-md active:scale-95"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onExploreCourses}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-[#111B21] dark:text-white bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] rounded-2xl hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] transition-all shadow-sm"
              >
                Découvrir la plateforme
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 border-t border-[#E9EDEF] dark:border-[#222E35] grid grid-cols-3 gap-4">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#075E54] dark:text-[#25D366] tabular-nums">4 Facultés</p>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5">FASEG, FDS, FDD, FLLA</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#075E54] dark:text-[#25D366] tabular-nums">100% Mobile</p>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5">Fluide sur smartphone & tablette</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#075E54] dark:text-[#25D366] tabular-nums">Dès 300 F</p>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5">500 F/UE (300 F dès 3 UE)</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#222E35] bg-white dark:bg-[#111B21]">
              <img
                src={heroImage}
                alt="Étudiant apprenant sur UL Study Flow"
                className="w-full h-72 sm:h-96 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366] text-[#075E54] text-xs font-bold mb-2 self-start">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Séance 01 validée · Anglais ANG 101
                </div>
                <h3 className="font-bold text-lg text-white">
                  Des révisions simples et efficaces à Lomé
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  Accède aux explications audio et teste tes connaissances en 5 minutes chrono entre deux cours.
                </p>
              </div>
            </div>

            {/* Floating card WhatsApp-like */}
            <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white dark:bg-[#111B21] p-3.5 rounded-2xl shadow-xl border border-[#E9EDEF] dark:border-[#222E35] max-w-[220px] hidden sm:block">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111B21] dark:text-white">Score Quiz : 100%</p>
                  <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">Félicitations Kodjo !</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Le Problème vs La Solution */}
      <section className="bg-white dark:bg-[#111B21] py-12 border-y border-[#E9EDEF] dark:border-[#222E35] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#111B21] dark:text-white">
              Pourquoi UL STUDY FLOW fait toute la différence ?
            </h2>
            <p className="text-sm text-[#667781] dark:text-[#8696A0]">
              Une réponse concrète aux réalités universitaires de Lomé : amphis bondés, polycopiés dispersés et manque de retours individuels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Problème */}
            <div className="p-6 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-4">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                La galère habituelle de l'étudiant à Lomé
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Amphis bondés (Amphi 1000, Amphi 1500) où le tableau et le son sont parfois difficiles à capter.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Des polycopiés photocopiés longs, sans format vidéos ou audios de démonstration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Aucun moyen rapide de savoir si on a réellement compris avant le jour de l'examen sur table.</span>
                </li>
              </ul>
            </div>

            {/* Solution */}
            <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-4">
              <div className="flex items-center gap-2 text-[#075E54] dark:text-[#25D366] font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                La méthode UL STUDY FLOW
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span>Chaque UE est découpée en séances courtes et progressives avec fiches de révision structurées.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span>Audios podcasts et vidéos concrètes pour réviser dans le bus, au campus ou chez soi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span>Séance 01 gratuite sur chaque UE et déblocage transparent par T-Money ou Flooz.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3 grands piliers simples */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] shadow-sm space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
            </div>
            <h3 className="font-bold text-base text-[#111B21] dark:text-white">1. Des cours ultra-clairs</h3>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] leading-relaxed">
              Fini les pavés indigestes. Retrouve l'essentiel de chaque chapitre avec les définitions clés, formules et exemples adaptés aux examens togolais.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] shadow-sm space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#128C7E]/20 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
            </div>
            <h3 className="font-bold text-base text-[#111B21] dark:text-white">2. Expérience mobile & tablette</h3>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] leading-relaxed">
              Une navigation fluide comme WhatsApp : lisible, rapide et légère pour consommer un minimum de forfait internet sur smartphone ou tablette.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] shadow-sm space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
            </div>
            <h3 className="font-bold text-base text-[#111B21] dark:text-white">3. Évaluation immédiate & IA</h3>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] leading-relaxed">
              Teste-toi sur des QCM réels et pose tes questions à l'assistant IA spécialisé dans tes matières pour éclaircir le moindre doute.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
