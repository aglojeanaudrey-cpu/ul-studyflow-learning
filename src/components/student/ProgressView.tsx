import React, { useState, useEffect } from 'react';
import { StudentProgressOverview } from '../../types';
import { api } from '../../lib/api';
import { Award, BookOpen, CheckCircle2, TrendingUp, Calendar, ArrowRight } from 'lucide-react';

interface ProgressViewProps {
  onOpenUe: (ueId: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ onOpenUe }) => {
  const [data, setData] = useState<StudentProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getProgress();
        setData(res);
      } catch (err) {
        console.error('Error fetching progress:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111B21]">
          Ma Progression Académique
        </h1>
        <p className="text-xs sm:text-sm text-[#667781]">
          Visualisez votre avancée dans les séances et vos résultats aux questionnaires.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Global Progress */}
        <div className="p-4 bg-white rounded-2xl border border-[#E9EDEF] shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#667781]">Progression Globale</span>
          <p className="text-2xl font-extrabold text-[#075E54] tabular-nums">
            {data.globalProgress}%
          </p>
          <div className="w-full bg-[#F0F2F5] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#25D366] h-full rounded-full"
              style={{ width: `${data.globalProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Séances Terminées */}
        <div className="p-4 bg-white rounded-2xl border border-[#E9EDEF] shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#667781]">Séances Terminées</span>
          <p className="text-2xl font-extrabold text-[#075E54] tabular-nums">
            {data.totalCompletedAll}
          </p>
          <p className="text-[10px] text-[#667781]">Sur {data.totalSessionsAll} séances publiées</p>
        </div>

        {/* Séances Restantes */}
        <div className="p-4 bg-white rounded-2xl border border-[#E9EDEF] shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#667781]">Séances Restantes</span>
          <p className="text-2xl font-extrabold text-[#111B21] tabular-nums">
            {Math.max(0, data.totalSessionsAll - data.totalCompletedAll)}
          </p>
          <p className="text-[10px] text-[#667781]">À finaliser pour le semestre</p>
        </div>

        {/* Questionnaires Validés */}
        <div className="p-4 bg-white rounded-2xl border border-[#E9EDEF] shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#667781]">Quiz Passés</span>
          <p className="text-2xl font-extrabold text-[#25D366] tabular-nums">
            {data.totalQuizzesTaken}
          </p>
          <p className="text-[10px] text-[#667781]">Évaluations complétées</p>
        </div>
      </div>

      {/* Détail par Unité d'Enseignement */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-[#111B21]">
          Avancement par Unité d'Enseignement
        </h3>

        <div className="space-y-3">
          {data.ueBreakdown.map((ue) => (
            <div
              key={ue.ueId}
              onClick={() => onOpenUe(ue.ueId)}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E9EDEF] shadow-xs hover:border-[#25D366] transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#075E54] bg-emerald-50 px-2 py-0.5 rounded">
                    {ue.ueCode}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-[#111B21] group-hover:text-[#075E54]">
                    {ue.ueTitle}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#075E54] shrink-0">
                  <span className="tabular-nums">{ue.progressPercent}%</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#667781] group-hover:text-[#25D366]" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#F0F2F5] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#25D366] h-full rounded-full transition-all duration-300"
                  style={{ width: `${ue.progressPercent}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#667781] pt-1">
                <span>
                  {ue.completedSessions} sur {ue.totalSessions} séances complétées
                </span>
                <span>
                  {ue.avgQuizScore !== null ? `Moyenne quiz : ${ue.avgQuizScore}%` : 'Aucun quiz validé'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historique Récent */}
      {data.recentActivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-base text-[#111B21]">Historique d'apprentissage</h3>
          <div className="bg-white rounded-2xl border border-[#E9EDEF] p-4 shadow-xs divide-y divide-[#F0F2F5]">
            {data.recentActivities.map((act, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
                    {act.type === 'quiz' ? '✍️' : '📖'}
                  </div>
                  <div>
                    <p className="font-bold text-[#111B21]">{act.title}</p>
                    <p className="text-[11px] text-[#667781]">{act.subtitle}</p>
                  </div>
                </div>
                <span className="text-[11px] text-[#667781] tabular-nums font-mono">
                  {new Date(act.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
