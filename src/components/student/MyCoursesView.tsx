import React, { useState, useEffect } from 'react';
import { UE } from '../../types';
import { api } from '../../lib/api';
import { BookOpen, Search, Lock, Unlock, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { UnlockUeModal } from './UnlockUeModal';

interface MyCoursesViewProps {
  onOpenUe: (ueId: string) => void;
}

export const MyCoursesView: React.FC<MyCoursesViewProps> = ({ onOpenUe }) => {
  const [courses, setCourses] = useState<UE[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'my' | 'catalog'>('my');
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.getCourses();
      setCourses(res.courses);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCourses = courses.filter(c => {
    const matchesDept = filterDept === 'ALL' || c.departmentId.toLowerCase().includes(filterDept.toLowerCase());
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'my' ? c.isUnlocked : true;
    return matchesDept && matchesSearch && matchesTab;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header with quick unlock trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] dark:text-white">
            Unités d'Enseignement & Matières
          </h1>
          <p className="text-xs sm:text-sm text-[#667781] dark:text-[#8696A0]">
            Retrouve tes cours officiels LMD. Séance 1 toujours offerte pour toutes les UE.
          </p>
        </div>

        <button
          onClick={() => setUnlockModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs self-start sm:self-auto"
        >
          <Unlock className="w-4 h-4" />
          Demande de déblocage UE
        </button>
      </div>

      {/* Tabs : Mes UE / Catalogue */}
      <div className="flex items-center gap-2 p-1 bg-[#E9EDEF] dark:bg-[#1F2C34] rounded-xl self-start max-w-xs transition-colors">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'my'
              ? 'bg-white dark:bg-[#111B21] text-[#075E54] dark:text-[#25D366] shadow-xs'
              : 'text-[#667781] dark:text-[#8696A0]'
          }`}
        >
          Mes UE Débloquées
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'catalog'
              ? 'bg-white dark:bg-[#111B21] text-[#075E54] dark:text-[#25D366] shadow-xs'
              : 'text-[#667781] dark:text-[#8696A0]'
          }`}
        >
          Catalogue Complet
        </button>
      </div>

      {/* Search & Dept Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par intitulé ou code (ex : ANG 101, Microéconomie)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white focus:border-[#25D366] focus:outline-none shadow-xs"
          />
          <Search className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-2.5 top-3" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'FASEG', 'FDS', 'FDD', 'FLLA'].map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filterDept === dept
                  ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] font-bold'
                  : 'bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]'
              }`}
            >
              {dept === 'ALL' ? 'Toutes' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3">
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Aucune matière trouvée avec ces critères.
          </p>
          {activeTab === 'my' && (
            <button
              onClick={() => setActiveTab('catalog')}
              className="px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
            >
              Voir le catalogue complet
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCourses.map((ue) => (
            <div
              key={ue.id}
              onClick={() => onOpenUe(ue.id)}
              className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-4 sm:p-5 shadow-xs hover:border-[#25D366] dark:hover:border-[#25D366] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold shrink-0">
                  <BookOpen className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {ue.code}
                    </span>
                    <span className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                      {ue.level} · {ue.semester}
                    </span>
                    {ue.isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        <Unlock className="w-3 h-3" /> Débloqué
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <Sparkles className="w-3 h-3" /> Séance 1 Offerte · 500 F
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#111B21] dark:text-white mt-1 group-hover:text-[#075E54] dark:group-hover:text-[#25D366] transition-colors">
                    {ue.title}
                  </h3>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5 line-clamp-2">
                    {ue.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-xs font-semibold text-[#075E54] dark:text-[#25D366]">
                  {ue.sessionsCount || 0} séances
                </span>
                <div className="p-2 rounded-xl text-[#667781] dark:text-[#8696A0] group-hover:text-[#075E54] dark:group-hover:text-[#25D366] group-hover:bg-emerald-50 dark:group-hover:bg-[#1F2C34] transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unlock Modal */}
      {unlockModalOpen && (
        <UnlockUeModal
          isOpen={unlockModalOpen}
          onClose={() => setUnlockModalOpen(false)}
          onSuccess={() => {
            setUnlockModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};
