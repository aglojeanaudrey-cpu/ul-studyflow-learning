import React from 'react';

interface SectionHeaderProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  centered = true,
  className = '',
}) => {
  return (
    <div className={`${centered ? 'text-center max-w-3xl mx-auto' : ''} space-y-3 mb-12 ${className}`}>
      {badge && <div>{badge}</div>}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21] dark:text-white tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-[#667781] dark:text-[#8696A0]">
          {subtitle}
        </p>
      )}
    </div>
  );
};