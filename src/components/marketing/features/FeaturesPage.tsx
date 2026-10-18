import React from "react";
import { FeaturesHero } from "./sections/FeaturesHero";
import { PillarsSection } from "./sections/PillarsSection";
import { CampusRealitySection } from "./sections/CampusRealitySection";
import { FacultiesSpecSection } from "./sections/FacultiesSpecSection";
import { FeaturesTestimonial } from "./sections/FeaturesTestimonial";
import { FeaturesFinalCta } from "./sections/FeaturesFinalCta";
import { useSEO } from "@/src/hooks/useSEO";

interface FeaturesPageProps {
  onGetStarted: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onGetStarted }) => {
  useSEO({
    title: "UL Study Flow | Révisions et cours pour les étudiants de Lomé",
    description:
      "La plateforme EdTech qui aide les étudiants de l'Université de Lomé à réviser plus efficacement : fiches, audios, vidéos et assistant IA.",
  });
  return (
    <div className="w-full">
      {/* 1. Hero avec image + badges flottants */}
      <FeaturesHero onGetStarted={onGetStarted} />

      {/* 2. Les 6 piliers fonctionnels */}
      <PillarsSection />

      {/* 3. Comparatif terrain (4 paires) */}
      <CampusRealitySection />

      {/* 4. Spécialisation par faculté */}
      <FacultiesSpecSection />

      {/* 5. Témoignage étudiant */}
      <FeaturesTestimonial />

      {/* 6. CTA final */}
      <FeaturesFinalCta onGetStarted={onGetStarted} />
    </div>
  );
};
