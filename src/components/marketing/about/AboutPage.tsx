import React from "react";
import { AboutHero } from "./sections/AboutHero";
import { ConstatSection } from "./sections/ConstatSection";
import { ValuesSection } from "./sections/ValuesSection";
import { TeamSection } from "./sections/TeamSection";
import { TransparencySection } from "./sections/TransparencySection";
import { AboutFinalCta } from "./sections/AboutFinalCta";

interface AboutPageProps {
  onGetStarted?: () => void;
  onContactClick?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onGetStarted,
  onContactClick,
}: any) => {
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
