import React from "react";
import { AboutHero } from "./sections/AboutHero";
import { ConstatSection } from "./sections/ConstatSection";
import { ValuesSection } from "./sections/ValuesSection";
import { TeamSection } from "./sections/TeamSection";
import { TransparencySection } from "./sections/TransparencySection";
import { AboutFinalCta } from "./sections/AboutFinalCta";
import { useSEO } from "@/src/hooks/useSEO";

interface AboutPageProps {
  onGetStarted?: () => void;
  onContactClick?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onGetStarted,
  onContactClick,
}: any) => {
  useSEO({
    title: "UL Study Flow | Révisions et cours pour les étudiants de Lomé",
    description:
      "La plateforme EdTech qui aide les étudiants de l'Université de Lomé à réviser plus efficacement : fiches, audios, vidéos et assistant IA.",
  });
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B141A] transition-colors">
      <AboutHero onGetStarted={onGetStarted} />
      <ConstatSection />
      <ValuesSection />
      <TeamSection onContactClick={onContactClick} />
      <TransparencySection />
      <AboutFinalCta onGetStarted={onGetStarted} />
    </div>
  );
};
