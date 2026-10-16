import React from "react";
import {
  Badge,
  MessageCircle,
  Users,
  Compass,
  Handshake,
  Sparkles,
  Rocket,
  CircleDot,
} from "lucide-react";
import { Container } from "../../ui/Container";
import {
  TEAM_FOUNDER,
  TEAM_MEMBERS,
  PARTNERS_CALL,
  TeamMember,
} from "../data/teamData";

interface TeamSectionProps {
  onContactClick?: () => void;
}

const ACCENT_CLASSES: Record<
  TeamMember["accentColor"],
  { bg: string; text: string; ring: string; gradient: string }
> = {
  emerald: {
    bg: "bg-[#25D366]/15",
    text: "text-[#075E54] dark:text-[#25D366]",
    ring: "ring-[#25D366]/30",
    gradient: "from-[#075E54] to-[#0a6b5f]",
  },
  amber: {
    bg: "bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-500/30",
    gradient: "from-amber-600 to-amber-700",
  },
  sky: {
    bg: "bg-sky-500/15",
    text: "text-sky-700 dark:text-sky-400",
    ring: "ring-sky-500/30",
    gradient: "from-sky-600 to-sky-700",
  },
  violet: {
    bg: "bg-violet-500/15",
    text: "text-violet-700 dark:text-violet-400",
    ring: "ring-violet-500/30",
    gradient: "from-violet-600 to-violet-700",
  },
};

const STATUS_LABEL: Record<TeamMember["status"], string> = {
  founder: "Fondateur",
  active: "Actif",
  reflecting: "En réflexion",
  partner: "Partenaire",
};

const MemberCard: React.FC<{ member: TeamMember; featured?: boolean }> = ({
  member,
  featured,
}) => {
  const accents = ACCENT_CLASSES[member.accentColor];

  return (
    <div
      className={`bg-white dark:bg-[#111B21] rounded-2xl overflow-hidden border border-[#E9EDEF] dark:border-[#222E35] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col ${
        featured ? "ring-2 ring-[#25D366]/40" : ""
      }`}
    >
      {/* Bandeau supérieur avec initiales */}
      <div
        className={`relative h-32 bg-gradient-to-br ${accents.gradient} flex items-center justify-center`}
      >
        <div
          className={`w-20 h-20 rounded-2xl ${accents.bg} ring-2 ${accents.ring} backdrop-blur-sm flex items-center justify-center`}
        >
          <span
            className={`text-2xl font-extrabold ${accents.text} tracking-wider`}
          >
            {member.initials}
          </span>
        </div>

        {/* Badge statut */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-white/15 backdrop-blur-md text-white uppercase tracking-wider">
          {STATUS_LABEL[member.status]}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex-1">
          <h3 className="text-base font-bold text-[#075E54] dark:text-[#25D366]">
            {member.name}
          </h3>
          <p className="text-xs font-semibold text-[#25D366] mt-0.5">
            {member.role}
          </p>
          <p className="text-[11px] text-[#8696A0] mt-1 flex items-center gap-1">
            <CircleDot className="w-3 h-3" />
            {member.affiliation}
          </p>
          <p className="text-sm text-[#667781] dark:text-[#8696A0] mt-3 leading-relaxed">
            {member.description}
          </p>
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
        {/* ═══════════ EN-TÊTE ═══════════ */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] mb-3">
            <Rocket className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">
              Projet étudiant en construction
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-white tracking-tight">
            Le projet &amp; l'équipe fondatrice
          </h2>

          <p className="text-base text-[#667781] dark:text-[#8696A0] mt-3">
            Ul Study Flow Learning est né d'une conviction simple :{" "}
            <strong className="text-[#075E54] dark:text-[#25D366]">
              chaque étudiant de l'UL mérite un accès clair et organisé à ses
              cours
            </strong>
            . Porté par un étudiant, construit avec d'autres, ce projet grandit
            au rythme de la communauté.
          </p>
        </div>

        {/* ═══════════ FONDATEUR (carte mise en avant) ═══════════ */}
        <div className="mb-12">
          <p className="text-xs font-bold text-[#8696A0] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
            Initiateur du projet
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Carte fondateur */}
            <div className="lg:col-span-1">
              <MemberCard member={TEAM_FOUNDER} featured />
            </div>

            {/* Citation inspirante */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#075E54] to-[#0a6b5f] text-white rounded-2xl p-6 md:p-8 flex flex-col justify-between">
              <div>
                <Badge className="w-6 h-6 text-[#25D366] mb-3" />
                <blockquote className="text-lg md:text-xl font-semibold leading-relaxed">
                  « Nous n'avons pas attendu d'avoir tout pour commencer. Nous
                  avons commencé avec ce que nous avions, pour ceux qui en ont
                  besoin. »
                </blockquote>
                <p className="text-sm text-emerald-100/80 mt-3">
                  — Kokou Jean-Audrey Aglo, initiateur
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-extrabold text-[#25D366]">
                    100%
                  </div>
                  <div className="text-[10px] text-emerald-100/80 uppercase tracking-wider">
                    Étudiant
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#25D366]">
                    0 FCFA
                  </div>
                  <div className="text-[10px] text-emerald-100/80 uppercase tracking-wider">
                    Financement externe
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#25D366]">
                    1
                  </div>
                  <div className="text-[10px] text-emerald-100/80 uppercase tracking-wider">
                    Objectif : l'UL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ COLLECTIF EN CONSTRUCTION ═══════════ */}
        <div className="mb-12">
          <p className="text-xs font-bold text-[#8696A0] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#25D366]" />
            Le collectif en construction
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM_MEMBERS.map((member, idx) => (
              <MemberCard key={idx} member={member} />
            ))}
          </div>

          <p className="text-xs text-[#8696A0] mt-4 italic text-center">
            Certains membres du collectif réfléchissent encore à leur
            implication. Nous les laissons libres de choisir leur rythme — c'est
            aussi ça, un projet étudiant.
          </p>
        </div>

        {/* ═══════════ APPEL AUX PARTENAIRES (délégués) ═══════════ */}
        <div className="bg-[#25D366]/10 dark:bg-[#25D366]/5 border border-[#25D366]/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-[#075E54] text-[#25D366] flex items-center justify-center shrink-0">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#075E54] dark:text-[#25D366]">
                {PARTNERS_CALL.title}
              </h3>
              <p className="text-sm text-[#667781] dark:text-[#8696A0] mt-1">
                {PARTNERS_CALL.description}
              </p>
            </div>
          </div>

          <button
            onClick={onContactClick}
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-[#25D366] text-[#075E54] text-sm font-bold hover:bg-[#1faa54] transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            {PARTNERS_CALL.ctaLabel}
          </button>
        </div>
      </Container>
    </section>
  );
};