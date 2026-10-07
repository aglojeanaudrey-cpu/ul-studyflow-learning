import React from 'react';
import { Badge, Headset, FlaskConical, MessageCircle, MapPin, GraduationCap } from 'lucide-react';
import { Container } from '../../ui/Container';
import { TEAM_MEMBERS, TeamMember } from '../data/teamData';

interface TeamSectionProps {
  onContactClick?: () => void;
}

const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  const isScientific = member.isScientific;

  return (
    <div className="bg-white dark:bg-[#111B21] rounded-2xl overflow-hidden border border-[#E9EDEF] dark:border-[#222E35] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col">
      {/* Visuel (image OU fond vert pour Dr. Elom) */}
      <div className="relative aspect-square overflow-hidden">
        {isScientific ? (
          <div className="w-full h-full bg-gradient-to-br from-[#075E54] to-[#0a6b5f] flex items-center justify-center p-8 text-center text-white">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[#25D366]/20 border-2 border-[#25D366] flex items-center justify-center mb-4">
                <FlaskConical className="w-10 h-10 text-[#25D366]" />
              </div>
              <div className="text-lg font-bold">FDS Sciences Exactes</div>
              <div className="text-sm text-emerald-100/80 mt-1">
                Maths • Physique • Chimie
              </div>
            </div>
          </div>
        ) : (
          <img
            src={member.image}
            alt={`Portrait ${member.name}`}
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Badge */}
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
            isScientific
              ? 'bg-[#25D366] text-[#075E54]'
              : 'bg-[#075E54]/90 text-[#25D366]'
          }`}
        >
          {member.badge}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#075E54] dark:text-[#25D366]">
            {member.name}
          </h3>
          <p className="text-xs font-semibold text-[#25D366] mt-0.5">
            {member.role}
          </p>
          <p className="text-sm text-[#667781] dark:text-[#8696A0] mt-3 leading-relaxed">
            {member.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-between text-xs text-[#8696A0]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#25D366]" />
            <span>{member.footer.label}</span>
          </span>
          <span className="text-[#075E54] dark:text-[#25D366] font-bold">
            {member.footerRight}
          </span>
        </div>
      </div>
    </div>
  );
};

export const TeamSection: React.FC<TeamSectionProps> = ({ onContactClick }) => {
  return (
    <section
      id="equipe"
      className="py-16 md:py-20 bg-[#F0F2F5] dark:bg-[#0B141A] border-y border-[#E9EDEF] dark:border-[#222E35] transition-colors"
    >
      <Container>
        {/* En-tête + stat réseau */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] mb-3">
              <Badge className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">
                Des étudiants pour les étudiants
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-white tracking-tight">
              L'Équipe &amp; Les Ambassadeurs du Campus
            </h2>

            <p className="text-base text-[#667781] dark:text-[#8696A0] mt-2">
              Des majors de promotion, des diplômés passionnés et des tuteurs
              expérimentés réunis pour hisser l'ensemble de la communauté vers le
              haut.
            </p>
          </div>

          {/* Box Réseau tuteurs */}
          <div className="bg-[#075E54] text-white p-4 rounded-xl border border-[#25D366]/30 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-lg bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
              <Headset className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold text-[#25D366]">
                Réseau de 35+ Tuteurs Pairs
              </div>
              <div className="text-xs text-emerald-100/80">
                Campus Nord &amp; Sud • Permanence active
              </div>
            </div>
          </div>
        </div>

        {/* Grille 3 membres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>

        {/* Box Tutorat 1-à-1 */}
        <div className="mt-12 bg-[#25D366]/10 dark:bg-[#25D366]/5 border border-[#25D366]/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#075E54] text-[#25D366] flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#075E54] dark:text-[#25D366]">
                Besoin d'un coup de pouce personnalisé ?
              </h3>
              <p className="text-sm text-[#667781] dark:text-[#8696A0] mt-1">
                Réserve une séance de tutorat individuel avec nos majors de
                promotion. Élucidation de chapitres complexes, correction de
                devoirs et coaching méthodologique direct.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
            <div className="bg-white dark:bg-[#111B21] px-4 py-2.5 rounded-xl border border-[#25D366]/30 text-center flex-1 md:flex-initial">
              <span className="block text-[10px] font-semibold text-[#8696A0] uppercase">
                WhatsApp Audio
              </span>
              <span className="text-sm font-bold text-[#075E54] dark:text-[#25D366]">
                1 000 F / séance
              </span>
            </div>
            <div className="bg-white dark:bg-[#111B21] px-4 py-2.5 rounded-xl border border-[#25D366]/30 text-center flex-1 md:flex-initial">
              <span className="block text-[10px] font-semibold text-[#8696A0] uppercase">
                Google Meet
              </span>
              <span className="text-sm font-bold text-[#075E54] dark:text-[#25D366]">
                1 500 F / séance
              </span>
            </div>
            <button
              onClick={onContactClick}
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-[#25D366] text-[#075E54] text-sm font-bold hover:bg-[#1faa54] transition-colors text-center"
            >
              Réserver sur WhatsApp
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};