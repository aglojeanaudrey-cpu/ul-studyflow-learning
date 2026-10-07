import React from 'react';
import { FaqCategory } from '../data/FaqData';

interface FaqCategoryPillProps {
  category: FaqCategory;
  isActive: boolean;
  onClick: () => void;
}

export const FaqCategoryPill: React.FC<FaqCategoryPillProps> = ({
  category,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
        isActive
          ? 'bg-[#075E54] text-white shadow-md'
          : 'bg-[#F0F2F5] dark:bg-[#0B141A] text-[#667781] dark:text-[#8696A0] hover:bg-[#25D366]/10 hover:text-[#075E54] dark:hover:text-[#25D366]'
      }`}
    >
      <span>{category.emoji}</span>
      <span>{category.label}</span>
    </button>
  );
};