import React from 'react';
import { Target, Compass, Sparkles, BookOpen } from 'lucide-react';
import campusImage from '@/src/assets/images/campus_university_lome_1790533866163.jpg'

export const AboutSection: React.FC = () => {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#128C7E]/10 text-[#075E54] text-xs font-semibold">
          Notre Mission : Une EdTech par les étudiants, pour les étudiants
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111B21]">
          Rendre l'excellence universitaire accessible à tous
        </h1>
        <p className="text-sm text-[#667781]">
          UL STUDY FLOW est une EdTech indépendante créée par des étudiants pour les étudiants. Elle n'est pas la plateforme officielle de l'Université de Lomé, mais une initiative concrète d'entraide et d'innovation pédagogique pensée sur le terrain.
        </p>
      </div>

      {/* Campus Image Banner */}
      <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white">
        <img
          src={campusImage}
          alt="Campus étudiant de Lomé, Togo"
          className="w-full h-64 sm:h-80 object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="p-4 bg-white text-center text-xs text-[#667781]">
          Initiative étudiante · Lomé, Togo · Carrefour du savoir et de l'innovation
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E9EDEF] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
            <Target className="w-5 h-5 text-[#075E54]" />
          </div>
          <h3 className="font-bold text-lg text-[#111B21]">Le Problème que nous résolvons</h3>
          <p className="text-xs sm:text-sm text-[#667781] leading-relaxed">
            Dans les grands amphithéâtres de Lomé, suivre un cours magistral de 3 heures sans décrocher relève parfois du défi. Les polycopiés photocopiés à la sauvette sont souvent incomplets et l'étudiant se retrouve seul face à ses doutes la veille des examens. UL Study Flow apporte un cadre structuré et rassurant.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E9EDEF] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
            <Compass className="w-5 h-5 text-[#075E54]" />
          </div>
          <h3 className="font-bold text-lg text-[#111B21]">Notre Approche Pédagogique</h3>
          <p className="text-xs sm:text-sm text-[#667781] leading-relaxed">
            Nous croyons au micro-learning : découper des matières denses comme la microéconomie, la comptabilité ou l'algorithmique en séances concises de 40 minutes, associées à un podcast audio de synthèse et un questionnaire de validation immédiat avec correction commentée.
          </p>
        </div>
      </div>

      {/* Vision à long terme */}
      <div className="bg-[#075E54] text-white p-6 sm:p-10 rounded-2xl space-y-4 shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#25D366] text-[#075E54] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Vision à Long Terme
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white">
          Bâtir l'écosystème EdTech de référence pour l'Afrique de l'Ouest
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-3xl">
          En démarrant à Lomé avec les filières FASEG, FDS, FDD et FLLA, nous posons les bases d'une EdTech étudiante solidaire et innovante qui s'étendra à d'autres universités et grandes écoles supérieures du Togo et de l'espace universitaire UEMOA.
        </p>
      </div>
    </div>
  );
};
