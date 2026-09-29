import React, { useState } from 'react';
import { Check, Sparkles, MessageCircle, Users, BookOpen, CreditCard, ShieldCheck } from 'lucide-react';

interface PricingSectionProps {
  onStart: () => void;
  onContact: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onStart, onContact }) => {
  const [selectedUeCount, setSelectedUeCount] = useState<number>(3);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#128C7E]/10 dark:bg-[#128C7E]/20 text-[#075E54] dark:text-[#25D366] text-xs font-semibold">
          Tarifs clairs et accessibles pour tous les étudiants
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#111B21] dark:text-white">
          Des offres conçues pour ton budget étudiant
        </h1>
        <p className="text-sm text-[#667781] dark:text-[#8696A0]">
          Accède aux meilleurs résumés et séances sans abonnement caché. Paye uniquement ce dont tu as besoin.
        </p>
      </div>

      {/* Free Chapter Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-[#075E54] flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5 text-[#075E54]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#075E54] dark:text-[#25D366]">
              Séance 01 offerte gratuitement sur toutes les UE
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              Teste gratuitement la première séance de n'importe quelle matière pour vérifier la qualité pédagogique avant tout déblocage.
            </p>
          </div>
        </div>
        <button
          onClick={onStart}
          className="px-5 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-colors whitespace-nowrap shadow-sm shrink-0"
        >
          Tester gratuitement
        </button>
      </div>

      {/* 2 Main Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Card 1: Accès UE */}
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border-2 border-[#25D366] p-6 sm:p-7 shadow-md relative flex flex-col justify-between transition-colors">
          <div className="absolute -top-3 right-6 bg-[#25D366] text-[#075E54] text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
            Offre Principale
          </div>
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#111B21] dark:text-white">Unité d'Enseignement (UE)</h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5">Accès complet à toutes les séances d'une matière</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#075E54] dark:text-[#25D366] tabular-nums">500</span>
                <span className="text-xs font-semibold text-[#667781] dark:text-[#8696A0]">FCFA / UE</span>
              </div>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 mt-2 inline-block">
                ✨ Pack Réussite : 300 FCFA l'unité dès 3 UE !
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Séance 01 offerte en libre accès immédiat</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Toutes les séances suivantes du semestre débloquées sous 12h</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Podcasts audios & vidéos explicatives</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Fiches PDF synthétiques téléchargeables</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Questionnaires dynamiques & flashcards de mémorisation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Accès à l'Assistant IA sur cette matière</span>
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <button
              onClick={onStart}
              className="w-full py-3 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all shadow-sm"
            >
              Débloquer une UE (ou créer un compte)
            </button>
          </div>
        </div>

        {/* Card 2: Tutorat en ligne individuel */}
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-7 shadow-sm relative flex flex-col justify-between transition-colors">
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-[#128C7E]/20 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#111B21] dark:text-white">Tutorat en ligne individuel</h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5">Accompagnement sur-mesure avec un tuteur aîné</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#075E54] dark:text-[#25D366] tabular-nums">1 000</span>
                <span className="text-xs font-semibold text-[#667781] dark:text-[#8696A0]">FCFA / heure</span>
              </div>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">Séance en visio Google Meet ou WhatsApp direct</p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Explication personnalisée sur tes blocages de cours</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Résolution guidée des anciens sujets d'examens</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Méthodologie de travail et conseils pour les épreuves</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Tuteur issu de ta faculté (Master ou Doctorat)</span>
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <button
              onClick={onContact}
              className="w-full py-3 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
            >
              Demander un tuteur en ligne
            </button>
          </div>
        </div>
      </div>

      {/* Simulateur Déblocage Multi-UE */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-7 shadow-sm space-y-4 text-xs transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
            Simulateur de Déblocage & Tarif Dégressif
          </h3>
          <span className="text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
            +100 FCFA frais opérateur
          </span>
        </div>

        <p className="text-[#667781] dark:text-[#8696A0]">
          Sélectionne le nombre de matières à débloquer pour voir la somme totale exacte à déposer par T-Money ou Flooz :
        </p>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => setSelectedUeCount(num)}
              className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                selectedUeCount === num
                  ? 'bg-[#075E54] text-white shadow-xs'
                  : 'bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0] hover:bg-[#E9EDEF]'
              }`}
            >
              {num} {num > 1 ? 'UEs' : 'UE'}
            </button>
          ))}
        </div>

        <div className="p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-2xl flex items-center justify-between">
          <div>
            <p className="font-bold text-[#111B21] dark:text-white">
              {selectedUeCount} matière(s) {selectedUeCount >= 3 ? '(Tarif dégressif 300 F / UE)' : '(Tarif unitaire 500 F / UE)'}
            </p>
            <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">
              Sous-total: {selectedUeCount * (selectedUeCount >= 3 ? 300 : 500)} F + 100 F frais ={' '}
              <strong className="text-[#075E54] dark:text-[#25D366]">
                {selectedUeCount * (selectedUeCount >= 3 ? 300 : 500) + 100} FCFA
              </strong>
            </p>
          </div>
          <button
            onClick={onStart}
            className="px-4 py-2 font-bold text-xs text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shadow-xs"
          >
            Faire la demande
          </button>
        </div>
      </div>
    </div>
  );
};
