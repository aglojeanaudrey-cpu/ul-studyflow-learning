import React from 'react';
import logoImg from '../../assets/images/ul_study_logo_1790588296770.jpg';
import { UlStudyFlowIcon } from './UlStudyFlowIcon';

interface UlStudyFlowLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'image' | 'vector';
  showTagline?: boolean;
  lightText?: boolean;
}

export const UlStudyFlowLogo: React.FC<UlStudyFlowLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'vector',
  showTagline = true,
  lightText = false
}) => {
  if (variant === 'image') {
    return (
      <img
        src={logoImg}
        alt="UL STUDYFLOW - Apprendre · Comprendre · Progresser"
        className={`object-contain max-h-12 rounded-lg ${className}`}
      />
    );
  }

  const iconSizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleClass = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const taglineClass = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-[11px]' : 'text-[10px]';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <UlStudyFlowIcon className={iconSizeClass} />
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className={`font-black tracking-tight ${titleClass} ${lightText ? 'text-white' : 'text-[#075E54] dark:text-[#25D366]'}`}>
            UL
          </span>
          <span className={`font-black tracking-tight ${titleClass} ${lightText ? 'text-emerald-300' : 'text-[#25D366] dark:text-emerald-400'}`}>
            STUDYFLOW
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-semibold tracking-wider uppercase mt-1 ${taglineClass} ${
              lightText ? 'text-emerald-200/90' : 'text-[#128C7E] dark:text-emerald-300/80'
            }`}
          >
            Apprendre • Comprendre • Progresser
          </span>
        )}
      </div>
    </div>
  );
};
