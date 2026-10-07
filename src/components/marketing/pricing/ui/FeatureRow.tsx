import React from 'react';
import { Check, X } from 'lucide-react';

interface FeatureRowProps {
  label: React.ReactNode;
  description?: string;
  col1: React.ReactNode;
  col2: React.ReactNode;
  col3: React.ReactNode;
  highlighted?: boolean;
}

export const FeatureRow: React.FC<FeatureRowProps> = ({
  label,
  description,
  col1,
  col2,
  col3,
  highlighted = false,
}) => {
  const cellBase = 'py-4 px-4 text-center text-sm';
  const highlightedCell =
    'bg-[#25D366]/5 dark:bg-[#25D366]/10 border-x border-[#25D366]/30';

  return (
    <tr
      className={`${
        highlighted ? 'bg-[#25D366]/10 dark:bg-[#25D366]/5 font-semibold' : ''
      } hover:bg-[#F0F2F5]/50 dark:hover:bg-[#0B141A]/50 transition-colors`}
    >
      {/* Colonne label */}
      <td className="py-4 px-5 text-sm font-medium text-[#111B21] dark:text-slate-300">
        <span>{label}</span>
        {description && (
          <p className="text-xs text-[#8696A0] mt-0.5 font-normal">
            {description}
          </p>
        )}
      </td>

      {/* Col 1 : Séance gratuite */}
      <td className={`${cellBase} text-[#8696A0]`}>
        <div className="flex items-center justify-center">{col1}</div>
      </td>

      {/* Col 2 : Pack 1 UE */}
      <td
        className={`${cellBase} text-[#075E54] dark:text-[#25D366] font-semibold`}
      >
        <div className="flex items-center justify-center">{col2}</div>
      </td>

      {/* Col 3 : Pack Semestre */}
      <td
        className={`${cellBase} text-[#075E54] dark:text-[#25D366] font-bold ${highlightedCell}`}
      >
        <div className="flex items-center justify-center">{col3}</div>
      </td>
    </tr>
  );
};

export const FeatureCheck: React.FC = () => (
  <Check className="w-5 h-5 text-[#25D366]" />
);

export const FeatureCross: React.FC = () => (
  <X className="w-5 h-5 text-rose-400" />
);