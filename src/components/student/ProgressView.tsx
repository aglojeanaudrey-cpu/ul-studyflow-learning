import React, { useState, useEffect } from "react";
import { StudentProgressOverview } from "../../types";
import { api } from "../../lib/api";
import {
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ArrowRight,
  Target,
  Sparkles,
} from "lucide-react";

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
        console.error("Error fetching progress:", err);
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
      {/* ⭐ Header (style ReferralView) */}
      <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] dark:from-[#111B21] dark:to-[#1F2C34] text-white p-5 sm:p-6 rounded-3xl shadow-md space-y-3 border border-emerald-800 dark:border-[#222E35] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#25D366]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Ma Progression Académique
            </h1>
            <p className="text-xs text-emerald-100/90 dark:text-[#8696A0]">
              Visualisez votre avancée dans les séances et vos résultats aux
              questionnaires.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Global Progress */}
        <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-1 transition-colors">
          <span className="text-[11px] font-semibold text-[#667781] dark:text-[#8696A0]">
            Progression Globale
          </span>
          <p className="text-2xl font-extrabold text-[#075E54] dark:text-[#25D366] tabular-nums">
            {data.globalProgress}%
          </p>
          <div className="w-full bg-[#F0F2F5] dark:bg-[#1F2C34] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#25D366] h-full rounded-full transition-all duration-300"
              style={{ width: `${data.globalProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Séances Terminées */}
        <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-1 transition-colors">
          <span className="text-[11px] font-semibold text-[#667781] dark:text-[#8696A0]">
            Séances Terminées
          </span>
          <p className="text-2xl font-extrabold text-[#075E54] dark:text-[#25D366] tabular-nums">
            {data.totalCompletedAll}
          </p>
          <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
            Sur {data.totalSessionsAll} séances publiées
          </p>
        </div>

        {/* Séances Restantes */}
        <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-1 transition-colors">
          <span className="text-[11px] font-semibold text-[#667781] dark:text-[#8696A0]">
            Séances Restantes
          </span>
          <p className="text-2xl font-extrabold text-[#111B21] dark:text-white tabular-nums">
            {Math.max(0, data.totalSessionsAll - data.totalCompletedAll)}
          </p>
          <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
            À finaliser pour le semestre
          </p>
        </div>

        {/* Quiz passés */}
        <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-1 transition-colors">
          <span className="text-[11px] font-semibold text-[#667781] dark:text-[#8696A0]">
            Quiz Passés
          </span>
          <p className="text-2xl font-extrabold text-[#25D366] tabular-nums">
            {data.totalQuizzesTaken}
          </p>
          <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
            Évaluations complétées
          </p>
        </div>
      </div>

      {/* Détail par Unité d'Enseignement */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-[#111B21] dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#25D366]" />
          Avancement par Unité d'Enseignement
        </h3>

        <div className="space-y-3">
          {data.ueBreakdown.map((ue) => (
            <div
              key={ue.ueId}
              onClick={() => onOpenUe(ue.ueId)}
              className="p-4 sm:p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs hover:border-[#25D366] dark:hover:border-[#25D366] transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                    {ue.ueCode}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-[#111B21] dark:text-white group-hover:text-[#075E54] dark:group-hover:text-[#25D366] truncate">
                    {ue.ueTitle}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] shrink-0">
                  <span className="tabular-nums">{ue.progressPercent}%</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#667781] dark:text-[#8696A0] group-hover:text-[#25D366] transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#F0F2F5] dark:bg-[#1F2C34] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#25D366] h-full rounded-full transition-all duration-300"
                  style={{ width: `${ue.progressPercent}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#667781] dark:text-[#8696A0] pt-1 gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {ue.completedSessions} sur {ue.totalSessions} séances
                  complétées
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {ue.avgQuizScore !== null
                    ? `Moyenne quiz : ${ue.avgQuizScore}%`
                    : "Aucun quiz validé"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historique Récent */}
      {data.recentActivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-base text-[#111B21] dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#25D366]" />
            Historique d'apprentissage
          </h3>
          <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-4 shadow-xs divide-y divide-[#F0F2F5] dark:divide-[#222E35] transition-colors">
            {data.recentActivities.map((act, idx) => (
              <div
                key={idx}
                className="py-2.5 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold shrink-0">
                    {act.type === "quiz" ? "✍️" : "📖"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#111B21] dark:text-white truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-[#667781] dark:text-[#8696A0] truncate">
                      {act.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-[#667781] dark:text-[#8696A0] tabular-nums font-mono shrink-0">
                  {new Date(act.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
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
