import React from 'react';
import {
  TrendingUp,
  Gavel,
  FlaskConical,
  History,
  Check,
  GraduationCap,
} from 'lucide-react';
import { Container } from '../../ui/Container';

interface FacultySpec {
  code: string;
  name: string;
  icon: React.ElementType;
  features: string[];
  footer: string;
}

const FACULTIES: FacultySpec[] = [
  {
    code: 'FASEG',
    name: 'Sciences Éco & Gestion',
    icon: TrendingUp,
    features: [
      "Formules clés d'élasticité & optimisations microéconomiques",
      'Modèles macroéconomiques IS-LM et comptabilité générale',
      'Exercices corrigés de mathématiques financières',
    ],
    footer: 'Semestres S1 à S6 disponibles',
  },
  {
    code: 'FDD',
    name: 'Faculté de Droit',
    icon: Gavel,
    features: [
      'Méthodologie du Cas Pratique & de la Dissertation Juridique',
      'Fiches de jurisprudence togolaise & Droit Constitutionnel',
      "Banque de commentaires d'arrêts types examens",
    ],
    footer: 'Licence 1, 2, 3 & Masters',
  },
  {
    code: 'FDS',
    name: 'Faculté des Sciences',
    icon: FlaskConical,
    features: [
      'Algèbre linéaire, calcul différentiel & géométrie',
      'Chimie organique & mécanique du point pas à pas',
      'Guides préparatoires aux Travaux Pratiques (TP)',
    ],
    footer: 'Parcours MPC & CBG',
  },
  {
    code: 'FLLA / FSHS',
    name: 'Lettres & Sc. Humaines',
    icon: History,
    features: [
      'Vocabulaire spécialisé, linguistique & grammaire',
      "Fiches de synthèse d'œuvres littéraires africaines",
      'Méthodologie de dissertation philosophique et sociologique',
    ],
    footer: 'Départements Anglais, Lettres, Socio',
  },
];

export const FacultiesSpecSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <Container>
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 text-[#075E54] dark:text-[#25D366] text-xs font-bold border border-[#25D366]/30 mb-2">
              <GraduationCap className="w-4 h-4" />
              Spécialisation par cursus LMD
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21] dark:text-white tracking-tight">
              Des fonctionnalités calibrées pour chaque faculté
            </h2>
          </div>

          <p className="text-sm text-[#667781] dark:text-[#8696A0] max-w-md">
            Chaque domaine d'étude possède ses exigences méthodologiques.
            Découvre les outils intégrés à ton profil d'étudiant.
          </p>
        </div>

        {/* Grille des 4 facultés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FACULTIES.map((faculty) => {
            const Icon = faculty.icon;
            return (
              <div
                key={faculty.code}
                className="bg-white dark:bg-[#111B21] rounded-2xl p-6 border border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]/60 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] font-extrabold text-xs">
                      {faculty.code}
                    </span>
                    <Icon className="w-5 h-5 text-[#8696A0]" />
                  </div>

                  <h3 className="text-base font-bold text-[#111B21] dark:text-white mb-3">
                    {faculty.name}
                  </h3>

                  <ul className="space-y-2.5 text-sm text-[#667781] dark:text-[#8696A0] mb-6">
                    {faculty.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#F0F2F5] dark:bg-[#0B141A] p-2.5 rounded-xl text-xs text-[#075E54] dark:text-[#25D366] font-bold text-center border border-[#E9EDEF] dark:border-[#222E35]">
                  {faculty.footer}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};