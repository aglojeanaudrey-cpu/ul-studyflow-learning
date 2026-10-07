import React from 'react';
import { ChevronDown } from 'lucide-react';
import { FaqQuestion } from '../data/FaqData';

interface FaqAccordionItemProps {
  item: FaqQuestion;
  bulletColor?: string;
}

export const FaqAccordionItem: React.FC<FaqAccordionItemProps> = ({
  item,
  bulletColor = 'bg-[#25D366]',
}) => {
  return (
    <details
      className="group bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] transition-all duration-200 overflow-hidden open:border-[#25D366]/60 open:shadow-lg"
      open={item.openByDefault}
    >
      <summary className="flex justify-between items-center p-5 cursor-pointer list-none select-none font-bold text-[#111B21] dark:text-white hover:text-[#075E54] dark:hover:text-[#25D366] transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${bulletColor}`}
          />
          <span className="text-base sm:text-lg">{item.question}</span>
        </div>
        <ChevronDown className="w-5 h-5 text-[#8696A0] transition-transform duration-300 group-open:rotate-180 shrink-0" />
      </summary>

      <div className="px-5 pb-5 pt-1 text-[#667781] dark:text-[#8696A0] text-sm sm:text-base border-t border-[#E9EDEF] dark:border-[#222E35] leading-relaxed">
        {item.answer}
      </div>
    </details>
  );
};