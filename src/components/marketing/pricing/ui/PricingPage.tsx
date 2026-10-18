import React from "react";
import { PricingHero } from "../sections/PricingHero";
import { PricingCardsSection } from "../sections/PricingCardsSection";
import { MobileMoneySection } from "../sections/MobileMoneySection";
import { ComparisonTable } from "../sections/ComparisonTable";
import { TutoratSection } from "../sections/TutoratSection";
import { BookingWidget } from "../sections/BookingWidget";
import { TestimonialSection } from "../sections/TestimonialSection";
import { PricingFaqSection } from "../sections/PricingFaqSection";
import { PricingFinalCta } from "../sections/PricingFinalCta";
import { useSEO } from "@/src/hooks/useSEO";

interface PricingPageProps {
  onGetStarted: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted }) => {
  useSEO({
    title: "UL Study Flow | Révisions et cours pour les étudiants de Lomé",
    description:
      "La plateforme EdTech qui aide les étudiants de l'Université de Lomé à réviser plus efficacement : fiches, audios, vidéos et assistant IA.",
  });
  return (
    <div className="w-full">
      {/* 1. Hero tarifs + toggle À la carte / Packs */}
      <PricingHero onGetStarted={onGetStarted} />

      {/* 2. Les 3 cartes tarifaires */}
      <PricingCardsSection onGetStarted={onGetStarted} />

      {/* 3. Mobile Money + 3 étapes USSD */}
      <MobileMoneySection />

      {/* 4. Tableau comparatif détaillé */}
      <ComparisonTable />

      {/* 5. Section Tutorat (2 formules) */}
      <TutoratSection />

      {/* 6. Widget de réservation intégré */}
      <BookingWidget />

      {/* 7. Témoignage + comparaison budget */}
      <TestimonialSection />

      {/* 8. FAQ spécifique tarifs */}
      <PricingFaqSection />

      {/* 9. CTA final */}
      <PricingFinalCta onGetStarted={onGetStarted} />
    </div>
  );
};
