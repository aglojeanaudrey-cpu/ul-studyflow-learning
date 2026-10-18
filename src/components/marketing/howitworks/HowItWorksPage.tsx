import React from "react";
import { HowItWorksHero } from "./sections/HowItWorksHero";
import { StepsSection } from "./sections/StepsSection";
import { ComparisonSection } from "./sections/ComparisonSection";
import { TogoRealitiesSection } from "./sections/TogoRealitiesSection";
import { MiniFaqSection } from "./sections/MiniFaqSection";
import { HowItWorksFinalCta } from "./sections/HowItWorksFinalCta";
import { useSEO } from "@/src/hooks/useSEO";

interface HowItWorksPageProps {
  onGetStarted: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onGetStarted,
}) => {
  useSEO({
    title: "UL Study Flow | Révisions et cours pour les étudiants de Lomé",
    description:
      "La plateforme EdTech qui aide les étudiants de l'Université de Lomé à réviser plus efficacement : fiches, audios, vidéos et assistant IA.",
  });
  return (
    <div className="w-full">
      {/* 1. Hero + card composite */}
      <HowItWorksHero onGetStarted={onGetStarted} />

      {/* 2. Les 4 étapes détaillées */}
      <StepsSection onGetStarted={onGetStarted} />

      {/* 3. Comparatif Amphi vs UL STUDY FLOW */}
      <ComparisonSection />

      {/* 4. Conçu pour les réalités du Togo */}
      <TogoRealitiesSection />

      {/* 5. FAQ courte */}
      <MiniFaqSection />

      {/* 6. CTA finale */}
      <HowItWorksFinalCta onGetStarted={onGetStarted} />
    </div>
  );
};
