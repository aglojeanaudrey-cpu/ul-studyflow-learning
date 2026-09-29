import React from 'react';
import iconImg from '../../assets/images/ul_study_icon_1790588282181.jpg';

interface UlStudyFlowIconProps {
  className?: string;
  size?: number | string;
  variant?: 'image' | 'svg';
}

export const UlStudyFlowIcon: React.FC<UlStudyFlowIconProps> = ({
  className = 'w-9 h-9',
  size,
  variant = 'image'
}) => {
  if (variant === 'image') {
    return (
      <img
        src={iconImg}
        alt="UL StudyFlow Icon"
        style={size ? { width: size, height: size } : undefined}
        className={`object-contain rounded-xl shadow-xs transition-transform group-hover:scale-105 ${className}`}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={size ? { width: size, height: size } : undefined}
      className={`shrink-0 transition-transform group-hover:scale-105 ${className}`}
    >
      <defs>
        <linearGradient id="ulGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B4B3F" />
          <stop offset="50%" stopColor="#075E54" />
          <stop offset="100%" stopColor="#25D366" />
        </linearGradient>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0B4B3F" />
          <stop offset="100%" stopColor="#25D366" />
        </linearGradient>
      </defs>

      {/* Graduation Cap */}
      <path
        d="M50 14L85 28L50 42L15 28L50 14Z"
        fill="url(#ulGrad)"
      />
      <path
        d="M26 33V46C26 53 37 58 50 58C63 58 74 53 74 46V33"
        stroke="#075E54"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Tassel */}
      <path d="M78 28V43" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="78" cy="46" r="3" fill="#25D366" />

      {/* U letter */}
      <path
        d="M22 46V64C22 72 29 78 38 78C47 78 54 72 54 64V46H45V64C45 68 42 70 38 70C34 70 31 68 31 64V46H22Z"
        fill="url(#ulGrad)"
      />

      {/* L letter */}
      <path
        d="M58 46V78H78V70H67V46H58Z"
        fill="url(#ulGrad)"
      />

      {/* Dynamic 3 Wave stripes */}
      <path
        d="M20 78C30 74 45 74 62 78C67 79 70 80 73 80"
        stroke="url(#waveGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M22 84C32 80 47 80 64 84C69 85 72 86 75 86"
        stroke="url(#waveGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M26 90C36 86 50 86 66 90C71 91 74 92 77 92"
        stroke="#25D366"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* 3 circular dots */}
      <circle cx="82" cy="78" r="3.5" fill="#075E54" />
      <circle cx="84" cy="85" r="3.5" fill="#128C7E" />
      <circle cx="86" cy="92" r="3.5" fill="#25D366" />
    </svg>
  );
};
