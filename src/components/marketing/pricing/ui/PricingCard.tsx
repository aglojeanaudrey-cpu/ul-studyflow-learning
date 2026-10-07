import React from 'react';
import { Check, X, Info } from 'lucide-react';

export interface PricingFeature {
  label: React.ReactNode;
  description?: string;
  included: boolean;
  emphasized?: boolean;
}

interface PricingCardProps {
  variant: 'default' | 'highlight' | 'featured';
  badge: string;
  badgeIcon?: React.ReactNode;
  title: string;
  subtitle: string;
  price: string;
  priceUnit: string;
  priceOriginal?: string;
  priceNote?: React.ReactNode;
  validityNote?: React.ReactNode;
  features: PricingFeature[];
  ctaLabel: string;
  ctaIcon?: React.ReactNode;
  ctaHint?: React.ReactNode;
  onCta: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  variant,
  badge,
  badgeIcon,
  title,
  subtitle,
  price,
  priceUnit,
  priceOriginal,
  priceNote,
  validityNote,
  features,
  ctaLabel,
  ctaIcon,
  ctaHint,
  onCta,
}) => {
  const isFeatured = variant === 'featured';
  const isHighlight = variant === 'highlight';

  // Conteneur principal
  const cardClasses = isFeatured
    ? 'bg-gradient-to-b from-[#075E54] to-[#0a6b5f] text-white border-2 border-[#25D366] lg:-translate-y-2 shadow-[0_20px_32px_-6px_rgba(7,94,84,0.35)]'
    : isHighlight
      ? 'bg-white dark:bg-[#111B21] border-2 border-[#25D366]/60'
      : 'bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35]';

  // Couleurs de texte selon variante
  const titleColor = isFeatured ? 'text-white' : 'text-[#111B21] dark:text-white';
  const subtitleColor = isFeatured
    ? 'text-emerald-100/90'
    : 'text-[#667781] dark:text-[#8696A0]';
  const priceColor = isFeatured
    ? 'text-[#25D366]'
    : isHighlight
      ? 'text-[#075E54] dark:text-[#25D366]'
      : 'text-[#111B21] dark:text-white';
  const unitColor = isFeatured
    ? 'text-emerald-100/80'
    : 'text-[#667781] dark:text-[#8696A0]';
  const dividerColor = isFeatured
    ? 'border-emerald-700/60'
    : 'border-[#E9EDEF] dark:border-[#222E35]';
  const featureTextColor = isFeatured
    ? 'text-white'
    : 'text-[#111B21] dark:text-slate-300';
  const featureCheckColor = isFeatured ? 'text-[#25D366]' : 'text-[#25D366]';

  return (
    <div
      className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${cardClasses}`}
    >
      {/* Badge flottant pour la card "featured" */}
      {isFeatured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#25D366] text-[#075E54] font-bold text-xs uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
          ⭐ {badge}
        </div>
      )}

      <div>
        {/* En-tête */}
        <div className={`flex items-center justify-between mb-4 ${isFeatured ? 'mt-3' : ''}`}>
          {!isFeatured && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                isHighlight
                  ? 'bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] flex items-center gap-1.5'
                  : 'bg-[#F0F2F5] dark:bg-[#0B141A] text-[#667781] dark:text-[#8696A0]'
              }`}
            >
              {isHighlight && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
              )}
              {badge}
            </span>
          )}
          {badgeIcon && (
            <span className={isFeatured ? 'text-[#25D366]' : 'text-[#25D366]'}>
              {badgeIcon}
            </span>
          )}
        </div>

        {/* Titre + sous-titre */}
        <h3 className={`text-xl font-bold mb-1 ${titleColor}`}>{title}</h3>
        <p className={`text-sm mb-6 ${subtitleColor}`}>{subtitle}</p>

        {/* Prix */}
        <div className={`flex items-baseline gap-2 pb-6 border-b ${dividerColor}`}>
          <span className={`text-3xl sm:text-4xl font-extrabold ${priceColor}`}>
            {price}
          </span>
          <span className={`text-xs sm:text-sm font-medium ${unitColor}`}>
            {priceUnit}
          </span>
        </div>

        {/* Prix original barré */}
        {priceOriginal && (
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`line-through text-xs ${
                isFeatured ? 'text-emerald-300/60' : 'text-[#8696A0]'
              }`}
            >
              {priceOriginal}
            </span>
            {priceNote}
          </div>
        )}

        {/* Note de validité */}
        {validityNote && (
          <div
            className={`mt-4 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              isFeatured
                ? 'bg-emerald-900/60 border border-[#25D366]/40 text-[#25D366]'
                : 'bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366]'
            }`}
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{validityNote}</span>
          </div>
        )}

        {/* Liste des features */}
        <ul className="space-y-3 py-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm">
              {feature.included ? (
                <Check className={`w-5 h-5 shrink-0 mt-0.5 ${featureCheckColor}`} />
              ) : (
                <X className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              )}
              <div className="flex-1">
                <span
                  className={`${
                    feature.included
                      ? feature.emphasized
                        ? `font-bold ${featureTextColor}`
                        : featureTextColor
                      : 'text-[#8696A0] line-through'
                  }`}
                >
                  {feature.label}
                </span>
                {feature.description && (
                  <p
                    className={`text-xs mt-0.5 ${
                      isFeatured ? 'text-emerald-200/70' : 'text-[#8696A0]'
                    }`}
                  >
                    {feature.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="pt-4">
        <button
          onClick={onCta}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
            isFeatured
              ? 'bg-[#25D366] text-[#075E54] hover:bg-[#1faa54] shadow-md'
              : isHighlight
                ? 'bg-[#075E54] text-white hover:bg-[#0a6b5f] shadow-sm'
                : 'border-2 border-[#075E54] text-[#075E54] dark:text-[#25D366] dark:border-[#25D366] hover:bg-[#25D366]/10'
          }`}
        >
          <span>{ctaLabel}</span>
          {ctaIcon}
        </button>
        {ctaHint && (
          <p
            className={`text-center text-xs mt-2 ${
              isFeatured ? 'text-emerald-200/70' : 'text-[#8696A0]'
            }`}
          >
            {ctaHint}
          </p>
        )}
      </div>
    </div>
  );
};