import React from "react";
import logoImg from "../../assets/images/ul_study_logo_1790588296770.webp";
import { UlStudyFlowIcon } from "./UlStudyFlowIcon";

interface UlStudyFlowLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "image" | "vector";
  showTagline?: boolean;
  lightText?: boolean;
}

export const UlStudyFlowLogo: React.FC<UlStudyFlowLogoProps> = ({
  className = "",
  size = "md",
  variant = "vector",
  showTagline = true,
  lightText = false,
}) => {
  if (variant === "image") {
    return (
      <img
        src={logoImg}
        alt="UL STUDYFLOW - Apprendre · Comprendre · Progresser"
        className={`object-contain max-h-12 rounded-lg ${className}`}
      />
    );
  }

  // Icône : taille responsive
  const iconSizeClass =
    size === "sm"
      ? "w-7 h-7 sm:w-8 sm:h-8"
      : size === "lg"
        ? "w-10 h-10 sm:w-12 sm:h-12"
        : "w-8 h-8 sm:w-10 sm:h-10";

  // Titre "UL STUDYFLOW" : responsive (petit mobile, normal desktop)
  const titleClass =
    size === "sm"
      ? "text-xs sm:text-base"
      : size === "lg"
        ? "text-lg sm:text-2xl"
        : "text-sm sm:text-lg";

  // Tagline : TAILLE FIXE, identique partout (même taille que mobile)
  const taglineClass = "text-[7px]";

  // Gap et marge responsive (légèrement plus serrés sur mobile)
  const gapClass = "gap-1.5 sm:gap-2";
  const taglineMarginClass = "mt-0.5";

  return (
    <div className={`flex items-center ${gapClass} ${className}`}>
      <UlStudyFlowIcon className={iconSizeClass} />
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1 sm:gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${titleClass} ${
              lightText ? "text-white" : "text-[#075E54] dark:text-[#25D366]"
            }`}
          >
            UL
          </span>
          <span
            className={`font-black tracking-tight ${titleClass} ${
              lightText
                ? "text-emerald-300"
                : "text-[#25D366] dark:text-emerald-400"
            }`}
          >
            STUDYFLOW
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-semibold tracking-wider uppercase ${taglineMarginClass} ${taglineClass} ${
              lightText
                ? "text-emerald-200/90"
                : "text-[#128C7E] dark:text-emerald-300/80"
            }`}
          >
            Apprendre • Comprendre • Progresser
          </span>
        )}
      </div>
    </div>
  );
};
