import React from 'react';
import { AboutHero } from './sections/AboutHero';
import { ConstatSection } from './sections/ConstatSection';
import { ValuesSection } from './sections/ValuesSection';
import { TeamSection } from './sections/TeamSection';
import { TransparencySection } from './sections/TransparencySection';
import { AboutFinalCta } from './sections/AboutFinalCta';

interface AboutPageProps {
  onGetStarted: () => void;
  onContactClick?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onGetStarted,
  onContactClick,
}) => {
  return (
    <div className="w-full">
      {/* 1. Hero + 4 stat cards */}
      <AboutHero onGetStarted={onGetStarted} />

      {/* 2. Constat (galère vs solution) */}
      <ConstatSection />

      {/* 3. 4 valeurs */}
      <ValuesSection />

      {/* 4. Équipe + tutorat */}
      <TeamSection onContactClick={onContactClick} />

      {/* 5. Règles de transparence */}
      <TransparencySection />

      {/* 6. CTA final */}
      <AboutFinalCta onGetStarted={onGetStarted} />
    </div>
  );
};