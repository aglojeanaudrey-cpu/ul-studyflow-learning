import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionBadge } from '../ui/SectionBadge';

interface Faculty {
  code: string;
  name: string;
  description: string;
  ueCount?: number;
}

const FACULTIES: Faculty[] = [
  {
    code: 'FASEG',
    name: 'Sciences Économiques & Gestion',
    description:
      'Comptabilité, Microéconomie, Macroéconomie, Gestion financière, Statistiques.',
  },
  {
    code: 'FDS',
    name: 'Faculté Des Sciences',
    description:
      'Mathématiques, Physique, Chimie, Informatique fondamentale, Algèbre.',
  },
  {
    code: 'FDD',
    name: 'Faculté De Droit',
    description:
      'Droit civil, Droit constitutionnel, Droit administratif, Histoire du droit.',
  },
  {
    code: 'FLLA & FSHS',
    name: 'Lettres, Langues & Sciences Humaines',
    description:
      'Anglais professionnel ANG 101, Sociologie, Géographie, Psychologie.',
  },
];

export const FacultiesSection: React.FC = () => {
  return (
    <section id="facultes" className="py-20 bg-white dark:bg-[#111B21]">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <SectionBadge>Programme universitaire de Lomé</SectionBadge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21] dark:text-white tracking-tight mt-3">
              Facultés &amp; Formations Disponibles
            </h2>
          </div>
          <p className="text-sm text-[#667781] dark:text-[#8696A0] md:text-right flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#25D366]" />
            Des contenus alignés sur les syllabus officiels de l'UL
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FACULTIES.map((faculty, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-[#F0F2F5] dark:bg-[#0B141A] border border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all duration-200"
            >
              <div className="text-[#075E54] dark:text-[#25D366] font-extrabold text-lg mb-1">
                {faculty.code}
              </div>
              <p className="font-bold text-[#111B21] dark:text-white mb-2">
                {faculty.name}
              </p>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mb-4 leading-relaxed">
                {faculty.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};