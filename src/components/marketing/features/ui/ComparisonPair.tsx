import React from 'react';
import { X, CheckCircle2, Verified } from 'lucide-react';

interface ComparisonPairProps {
  problemTitle: string;
  problemDescription: string;
  problemFooter: string;
  solutionTitle: string;
  solutionDescription: string;
  solutionFooter: string;
}

export const ComparisonPair: React.FC<ComparisonPairProps> = ({
  problemTitle,
  problemDescription,
  problemFooter,
  solutionTitle,
  solutionDescription,
  solutionFooter,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 rounded-2xl overflow-hidden border border-[#E9EDEF] dark:border-[#222E35] shadow-sm">
      {/* Côté problème */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 p-5 border-b sm:border-b-0 sm:border-r border-rose-100 dark:border-rose-900/40 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold uppercase mb-2">
            <X className="w-4 h-4" />
            La galère habituelle
          </div>
          <h4 className="text-base font-bold text-[#111B21] dark:text-white mb-2">
            {problemTitle}
          </h4>
          <p className="text-sm text-[#8696A0]">{problemDescription}</p>
        </div>
        <span className="text-xs text-rose-500 font-bold mt-4">
          {problemFooter}
        </span>
      </div>

      {/* Côté solution */}
      <div className="bg-[#25D366]/5 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[#25D366] text-xs font-bold uppercase mb-2">
            <CheckCircle2 className="w-4 h-4" />
            La méthode UL STUDY FLOW
          </div>
          <h4 className="text-base font-bold text-[#075E54] dark:text-[#25D366] mb-2">
            {solutionTitle}
          </h4>
          <p className="text-sm text-[#667781] dark:text-[#8696A0]">
            {solutionDescription}
          </p>
        </div>
        <span className="text-xs text-[#075E54] dark:text-[#25D366] font-bold mt-4 flex items-center gap-1">
          <Verified className="w-3.5 h-3.5 text-[#25D366]" />
          {solutionFooter}
        </span>
      </div>
    </div>
  );
};