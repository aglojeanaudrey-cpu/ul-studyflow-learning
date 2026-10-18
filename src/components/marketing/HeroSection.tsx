import React from "react";
import { HeroBlock } from "./sections/HeroBlock";
import { SocialProofBar } from "./sections/SocialProofBar";
import { SignupCtaSection } from "./sections/SignUpCtaSection";
import { WhySection } from "./sections/WhySection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { FeaturesPillarsSection } from "./sections/FeaturesPillarsSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { FacultiesSection } from "./sections/FacultiesSection";
import { PricingBannerSection } from "./sections/PricingBannerSection";
import { FaqSection } from "./sections/FaqSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";
import { useSEO } from "@/src/hooks/useSEO";

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreCourses: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onExploreCourses,
}) => {
  useSEO({
    title: "UL Study Flow | Révisions et cours pour les étudiants de Lomé",
    description:
      "La plateforme EdTech qui aide les étudiants de l'Université de Lomé à réviser plus efficacement : fiches, audios, vidéos et assistant IA.",
  });
  return (
    <div className="w-full">
      {/* 1. Héro principal */}
      <HeroBlock
        onGetStarted={onGetStarted}
        onExploreCourses={onExploreCourses}
      />

      {/* 2. Barre de réassurance (4 800+ | 94% | 4.8/5 | 100%) */}
      <SocialProofBar />

      {/* 3. CTA inscription (remplace "Teste un cours en direct") */}
      <SignupCtaSection onGetStarted={onGetStarted} />

      {/* 4. Pourquoi UL STUDY FLOW (comparaison) */}
      <WhySection />

      {/* 5. Comment ça marche en 3 étapes */}
      <HowItWorksSection onGetStarted={onGetStarted} />

      {/* 6. 3 piliers fonctionnalités */}
      <FeaturesPillarsSection />

      {/* 7. Témoignages */}
      <TestimonialsSection />

      {/* 8. Facultés disponibles */}
      <FacultiesSection />

      {/* 9. Bandeau tarifs 300 F */}
      <PricingBannerSection onGetStarted={onGetStarted} />

      {/* 10. FAQ */}
      <FaqSection />

      {/* 11. CTA final */}
      <FinalCtaSection
        onGetStarted={onGetStarted}
        onExploreCourses={onExploreCourses}
      />
    </div>
  );
};
