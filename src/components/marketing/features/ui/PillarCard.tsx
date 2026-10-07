import React from 'react';

export interface PillarFooter {
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge: React.ReactNode;
}

interface PillarCardProps {
  number: string;              // "Pilier 01"
  subtitle: string;            // ex: "Format PDF ultra-léger"
  icon: React.ReactNode;
  title: string;
  description: string;
  footer: PillarFooter;
  featured?: boolean;          // Pour le Pilier 06 (fond vert)
  badgeCustom?: React.ReactNode; // Badges T-Money / Flooz pour le Pilier 06
}

export const PillarCard: React.FC<PillarCardProps> = ({
  number,
  subtitle,
  icon,
  title,
  description,
  footer,
  featured = false,
  badgeCustom,
}) => {
  const cardClasses = featured
    ? 'bg-[#25D366]/10 border-2 border-[#25D366]/40 hover:border-[#25D366]'
    : 'bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]/60';

  const iconBg = featured
    ? 'bg-[#075E54] text-[#25D366]'
    : 'bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366]';

  const numberBg = featured
    ? 'bg-[#25D366] text-[#075E54]'
    : 'bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366]';

  const footerBorder = featured
    ? 'border-[#25D366]/30'
    : 'border-[#E9EDEF] dark:border-[#222E35]';

  return (
    <div
      className={`group relative rounded-2xl p-7 transition-all flex flex-col justify-between shadow-sm hover:shadow-xl ${cardClasses}`}
    >
      {/* Halo décoratif (featured) */}
      {featured && (
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#25D366]/20 rounded-full blur-xl pointer-events-none" />
      )}

      <div className="relative">
        {/* Icône */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform ${iconBg}`}
        >
          {icon}
        </div>

        {/* Numéro + sous-titre */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${numberBg}`}
          >
            {number}
          </span>
          <span className="text-xs text-[#8696A0] font-medium">{subtitle}</span>
        </div>

        {/* Titre + description */}
        <h3 className="text-lg font-bold text-[#111B21] dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed mb-4">
          {description}
        </p>
      </div>

      {/* Footer */}
      <div
        className={`relative pt-4 border-t flex items-center justify-between text-[#075E54] dark:text-[#25D366] text-xs font-bold ${footerBorder}`}
      >
        {badgeCustom ? (
          <div className="flex items-center gap-2 w-full justify-between">
            {badgeCustom}
          </div>
        ) : (
          <>
            <span className="flex items-center gap-1">
              {footer.icon}
              {footer.label}
            </span>
            <span className="text-xs font-bold bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] px-2 py-1 rounded">
              {footer.badge}
            </span>
          </>
        )}
      </div>
    </div>
  );
};