import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { UE, StudentProgressOverview } from "../../types";
import { api } from "../../lib/api";
import { Skeleton, SkeletonCourseCard } from "../ui/SkeletonLoader";
import { usePageLoading } from "../../hooks/usePageLoading";
import {
  BookOpen,
  Play,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Gift,
  Share2,
  Trophy,
  Wrench, // Nouvelle icône pour la boîte à outils
} from "lucide-react";

interface StudentDashboardProps {
  onOpenUe: (ueId: string) => void;
  onOpenSession: (sessionId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenUe,
  onOpenSession,
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<UE[]>([]);
  const [progressData, setProgressData] =
    useState<StudentProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);

  usePageLoading(loading);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesRes, progRes] = await Promise.all([
          api.getMyCourses(),
          api.getProgress(),
        ]);
        setCourses(coursesRes.myCourses);
        setProgressData(progRes);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="bg-[#075E54] dark:bg-[#111B21] p-5 sm:p-6 rounded-3xl">
          <Skeleton
            variant="rect"
            width="40%"
            height="24px"
            className="!bg-white/20 mb-2"
          />
          <Skeleton
            variant="rect"
            width="70%"
            height="14px"
            className="!bg-white/20"
          />
        </div>
        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 space-y-3">
          <Skeleton variant="rect" width="30%" height="14px" />
          <Skeleton variant="rect" width="60%" height="22px" />
          <Skeleton variant="rect" width="90%" height="14px" />
          <Skeleton variant="rect" width="100%" height="8px" />
        </div>
        <div className="space-y-3">
          <Skeleton variant="rect" width="40%" height="20px" />
          <SkeletonCourseCard />
          <SkeletonCourseCard />
        </div>
      </div>
    );
  }

  const activeCourse =
    courses.find((c) => (c.progressPercent || 0) < 100) || courses[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-[#075E54] dark:bg-[#111B21] text-white p-5 sm:p-6 rounded-3xl shadow-sm space-y-2 border border-emerald-800 dark:border-[#222E35] transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h1 className="text-lg sm:text-xl font-bold">
              Bonjour, {user?.firstName}
            </h1>
          </div>
          <span className="text-xs bg-[#128C7E] dark:bg-[#1F2C34] px-3 py-1 rounded-full text-emerald-100 font-medium border border-emerald-400/20">
            {user?.department} · {user?.level}
          </span>
        </div>
        <p className="text-xs text-emerald-100/90 dark:text-[#8696A0]">
          Semestre en cours. Continue ton parcours d'apprentissage aujourd'hui.
        </p>
      </div>

      {/* 2. Continuer mon apprentissage (Focus principal) */}
      {activeCourse && (
        <div className="group bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#128C7E] dark:text-[#25D366] uppercase tracking-wider">
              Reprendre la séance
            </span>
            <span className="text-xs font-semibold text-[#075E54] dark:text-[#25D366] tabular-nums">
              {activeCourse.progressPercent || 0}% terminé
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#667781] dark:text-[#8696A0]">
                {activeCourse.code}
              </p>
              <h2 className="text-base sm:text-lg font-bold text-[#111B21] dark:text-white mt-0.5 truncate">
                {activeCourse.title}
              </h2>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1 line-clamp-1">
                {activeCourse.description}
              </p>
            </div>
            <button
              onClick={() => onOpenUe(activeCourse.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all shrink-0 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-[#075E54]" />
              Continuer
            </button>
          </div>

          <div className="w-full bg-[#F0F2F5] dark:bg-[#1F2C34] h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-[#25D366] h-full rounded-full transition-all duration-500"
              style={{ width: `${activeCourse.progressPercent || 5}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 3. Mes UE (Liste principale) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#111B21] dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
            Mes Unités d'Enseignement
          </h3>
          <button
            onClick={() => onNavigateTab("student_courses")}
            className="text-xs font-semibold text-[#075E54] dark:text-[#25D366] hover:underline flex items-center gap-1"
          >
            Toutes les matières
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden divide-y divide-[#E9EDEF] dark:divide-[#222E35] shadow-sm">
          {courses.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#667781] dark:text-[#8696A0]">
              Aucune UE débloquée pour le moment.
            </div>
          ) : (
            courses.map((course) => {
              const progress = course.progressPercent || 0;
              return (
                <button
                  key={course.id}
                  onClick={() => onOpenUe(course.id)}
                  className="w-full p-4 text-left hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-[#075E54] dark:text-[#25D366] flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {course.code}
                        </span>
                        <span className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                          {course.completedSessionsCount || 0} /{" "}
                          {course.sessionsCount || 0} séances
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#111B21] dark:text-white truncate mt-1 group-hover:text-[#075E54] dark:group-hover:text-[#25D366]">
                        {course.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] tabular-nums">
                        {progress}%
                      </span>
                      <div className="w-16 sm:w-24 bg-[#E9EDEF] dark:bg-[#1F2C34] h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-[#25D366] h-full rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#667781] dark:text-[#8696A0] group-hover:text-[#25D366] transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 4. 🛠️ Boîte à outils (Section séparée pour éviter la confusion) */}
      {/* 4. 🛠️ Boîte à outils (Style visuel différent des cours) */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-[#111B21] dark:text-white flex items-center gap-2 px-1">
          <Wrench className="w-5 h-5 text-[#667781] dark:text-[#8696A0]" />
          Outils & Services
        </h3>

        {/* Conteneur global avec un fond légèrement teinté pour bien séparer des cours */}
        <div className="bg-[#F0F2F5] dark:bg-[#182229] p-3 sm:p-4 rounded-3xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Assistant IA - Style "Bouton d'action" */}
            <button
              onClick={() => onNavigateTab("student_ai")}
              className="p-4 bg-white dark:bg-[#111B21] rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex items-center gap-3 text-left group border border-transparent hover:border-purple-200 dark:hover:border-purple-900/50"
            >
              <div className="w-11 h-11 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#111B21] dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Assistant IA
                </h4>
                <p className="text-[11px] text-[#667781] dark:text-[#8696A0] mt-0.5 truncate">
                  Pose tes questions sur tes cours
                </p>
              </div>
            </button>

            {/* Statistiques & Quiz - Style "Bouton d'action" */}
            <button
              onClick={() => onNavigateTab("student_progress")}
              className="p-4 bg-white dark:bg-[#111B21] rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex items-center gap-3 text-left group border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50"
            >
              <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#111B21] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Stats & Quiz
                </h4>
                <p className="text-[11px] text-[#667781] dark:text-[#8696A0] mt-0.5 truncate">
                  {progressData?.globalProgress || 0}% de progression globale
                </p>
              </div>
            </button>
          </div>

          {/* Parrainage - Style "Bannière intégrée" (pas une carte de cours) */}
          <button
            onClick={() => onNavigateTab("student_referral")}
            className="w-full p-3 bg-gradient-to-r from-amber-100/80 to-amber-50 dark:from-amber-950/40 dark:to-[#111B21] rounded-2xl hover:from-amber-200/80 dark:hover:from-amber-900/50 transition-all flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">
                Parraine tes amis
              </h4>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5 truncate">
                Gagne des réductions et des UE offertes
              </p>
            </div>
            <div className="shrink-0 w-8 h-8 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center text-amber-600 group-hover:bg-white dark:group-hover:bg-white/20 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* 6. Activité Récente */}
      {progressData && progressData.recentActivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-base text-[#111B21] dark:text-white">
            Activité récente
          </h3>
          <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-2 shadow-sm">
            {progressData.recentActivities.slice(0, 4).map((act, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-3 border-b border-[#F0F2F5] dark:border-[#1F2C34] last:border-none hover:bg-gray-50 dark:hover:bg-[#1F2C34] rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
                    {act.type === "quiz" ? "✍️" : "📖"}
                  </div>
                  <div>
                    <p className="font-semibold text-[#111B21] dark:text-white">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                      {act.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#667781] dark:text-[#8696A0] font-mono bg-gray-100 dark:bg-[#222E35] px-2 py-1 rounded-md">
                  {new Date(act.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
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
