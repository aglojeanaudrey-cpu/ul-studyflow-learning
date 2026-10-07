import React from 'react';

interface SectionBadgeProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  icon?: React.ReactNode;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({
  children,
  variant = 'light',
  icon,
}) => {
  const base = 'inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider';

  const styles = variant === 'dark'
    ? 'bg-emerald-900/80 border border-emerald-600/40 text-[#25D366]'
    : 'bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366]';

  return (
    <span className={`${base} ${styles}`}>
      {icon ?? <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />}
      {children}
    </span>
  );
};