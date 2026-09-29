import React from 'react';
import { UserPlus, School, KeyRound, PlayCircle, BookOpen, CheckSquare, Award, BarChart3, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  onStart: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStart }) => {
  const steps = [
    {
      number: '01',
      title: 'Créer un compte étudiant',
      description: 'Inscris-toi simplement avec ton numéro de téléphone togolais (+228) et un mot de passe sécurisé en moins de 30 secondes.',
      icon: UserPlus
    },
    {
      number: '02',
      title: 'Sélectionner tes informations académiques',
      description: 'Choisis ta faculté (FASEG, FDS, FDD, FLLA), ta filière et ton niveau (Licence 1, Licence 2 ou Licence 3).',
      icon: School
    },
    {
      number: '03',
      title: 'Accéder aux UE autorisées',
      description: 'Retrouve instantanément ton tableau de bord avec les Unités d\'Enseignement débloquées et profite du premier chapitre gratuit.',
      icon: KeyRound
    },
    {
      number: '04',
      title: 'Choisir une séance de cours',
      description: 'Sélectionne la séance de ton choix : Séance 01, Séance 02... selon ton planning de TD et de révision.',
      icon: PlayCircle
    },
    {
      number: '05',
      title: 'Étudier selon ton format préféré',
      description: 'Lis la fiche de cours synthétique, écoute le podcast audio de l\'enseignant, regarde la vidéo ou télécharge le polycopié PDF.',
      icon: BookOpen
    },
    {
      number: '06',
      title: 'Faire le questionnaire d\'évaluation',
      description: 'Réponds aux questions types d\'examens (choix unique, choix multiple, vrai/faux) pour vérifier ta maîtrise.',
      icon: CheckSquare
    },
    {
      number: '07',
      title: 'Consulter la correction détaillée',
      description: 'Vois immédiatement tes bonnes et mauvaises réponses avec l\'explication pédagogique complète fournie par les tuteurs.',
      icon: Award
    },
    {
      number: '08',
      title: 'Suivre ta progression jusqu\'aux partiels',
      description: 'Garde un œil sur tes pourcentages de complétion et tes moyennes de notes pour arriver serein le jour de l\'examen.',
      icon: BarChart3
    }
  ];

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#128C7E]/10 text-[#075E54] text-xs font-semibold">
          Parcours étudiant étape par étape
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111B21]">
          Comment ça marche ?
        </h1>
        <p className="text-sm text-[#667781]">
          Un parcours vertical ultra-fluide pour t'accompagner du premier jour du semestre jusqu'à la mention aux examens.
        </p>
      </div>

      {/* Vertical Steps */}
      <div className="relative border-l-2 border-[#128C7E]/20 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative group">
              {/* Dot / Number Badge */}
              <div className="absolute -left-[35px] sm:-left-[51px] top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#075E54] text-white flex items-center justify-center font-bold text-xs sm:text-sm border-2 border-white shadow-sm group-hover:bg-[#25D366] group-hover:text-[#075E54] transition-colors">
                {step.number}
              </div>

              {/* Step Content */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E9EDEF] shadow-sm hover:border-[#25D366] transition-all space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#128C7E]" />
                  <h3 className="font-bold text-base sm:text-lg text-[#111B21]">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#667781] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="text-center pt-8">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all shadow-md active:scale-95"
        >
          Créer mon compte maintenant
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
