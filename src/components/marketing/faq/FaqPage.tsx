import React, { useState } from "react";
import { FaqHero } from "./sections/FaqHero";
import { FaqContent } from "./sections/FaqContent";
import { FaqFinalCta } from "./sections/FaqFinalCta";
import { FaqCategoryId } from "./data/FaqData";
import { useSEO } from "@/src/hooks/useSEO";

interface FaqPageProps {
  onGetStarted: () => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ onGetStarted }) => {
  useSEO({
    title: "UL Study Flow | Révisions et cours pour les étudiants de Lomé",
    description:
      "La plateforme EdTech qui aide les étudiants de l'Université de Lomé à réviser plus efficacement : fiches, audios, vidéos et assistant IA.",
  });
  // State partagé entre Hero (recherche) et Content (filtres)
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategoryId | "all">(
    "all",
  );

  return (
    <div className="w-full">
      <FaqHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <FaqContent
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <FaqFinalCta onGetStarted={onGetStarted} />
    </div>
  );
};
