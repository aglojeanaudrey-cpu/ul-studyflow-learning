import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UE, StudentProgressOverview } from '../../types';
import { api } from '../../lib/api';
import {
  BookOpen,
  Play,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  MessageCircle,
  FileCheck
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenUe: (ueId: string) => void;
  onOpenSession: (sessionId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenUe,
  onOpenSession,
  onNavigateTab
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<UE[]>([]);
  const [progressData, setProgressData] = useState<StudentProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesRes, progRes] = await Promise.all([
          api.getMyCourses(),
          api.getProgress()
        ]);
        setCourses(coursesRes.myCourses);
        setProgressData(progRes);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Active / next session to resume
  const activeCourse = courses.find(c => (c.progressPercent || 0) < 100) || courses[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Header Banner */}
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
          Semestre en cours. Continue ton parcours d'apprentissage aujourd'hui sur tes matières.
        </p>
      </div>

      {/* Continuer mon apprentissage (1 Action Claire) */}
      {activeCourse && (
        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#128C7E] dark:text-[#25D366] uppercase tracking-wider">
              Reprendre la séance
            </span>
            <span className="text-xs font-semibold text-[#075E54] dark:text-[#25D366] tabular-nums">
              {activeCourse.progressPercent || 0}% terminé
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#667781] dark:text-[#8696A0]">{activeCourse.code}</p>
              <h2 className="text-base sm:text-lg font-bold text-[#111B21] dark:text-white mt-0.5">
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

          {/* Progress bar */}
          <div className="w-full bg-[#F0F2F5] dark:bg-[#1F2C34] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#25D366] h-full rounded-full transition-all duration-300"
              style={{ width: `${activeCourse.progressPercent || 5}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Mes UE (WhatsApp-like vertical list) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#111B21] dark:text-white">Mes Unités d'Enseignement</h3>
          <button
            onClick={() => onNavigateTab('student_courses')}
            className="text-xs font-semibold text-[#075E54] dark:text-[#25D366] hover:underline flex items-center gap-1"
          >
            Toutes les matières
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden divide-y divide-[#E9EDEF] dark:divide-[#222E35] shadow-sm transition-colors">
          {courses.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#667781] dark:text-[#8696A0]">
              Aucune UE débloquée pour le moment. Accédez au catalogue pour explorer les cours.
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
                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold shrink-0">
                      <BookOpen className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {course.code}
                        </span>
                        <span className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                          {course.completedSessionsCount || 0} / {course.sessionsCount || 0} séances
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

      {/* Quick shortcuts for Student */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Assistant IA shortcut */}
        <button
          onClick={() => onNavigateTab('student_ai')}
          className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-sm hover:border-[#25D366] dark:hover:border-[#25D366] transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#25D366]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#111B21] dark:text-white group-hover:text-[#075E54] dark:group-hover:text-[#25D366]">
              Poser une question à l'IA
            </h4>
            <p className="text-xs text-[#667781] dark:text-[#8696A0]">
              Aide instantanée sur tes cours et explications des notions complexes.
            </p>
          </div>
        </button>

        {/* Progression shortcut */}
        <button
          onClick={() => onNavigateTab('student_progress')}
          className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-sm hover:border-[#25D366] dark:hover:border-[#25D366] transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#128C7E]/20 text-[#075E54] dark:text-[#25D366] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#111B21] dark:text-white group-hover:text-[#075E54] dark:group-hover:text-[#25D366]">
              Statistiques & Quiz ({progressData?.globalProgress || 0}%)
            </h4>
            <p className="text-xs text-[#667781] dark:text-[#8696A0]">
              Consulte tes scores aux examens blancs et ton rythme d'apprentissage.
            </p>
          </div>
        </button>
      </div>

      {/* Activité Récente */}
      {progressData && progressData.recentActivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-base text-[#111B21] dark:text-white">Activité récente</h3>
          <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-4 shadow-sm space-y-3 transition-colors">
            {progressData.recentActivities.slice(0, 4).map((act, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-[#F0F2F5] dark:border-[#1F2C34] last:border-none">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
                    {act.type === 'quiz' ? '✍️' : '📖'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#111B21] dark:text-white">{act.title}</p>
                    <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">{act.subtitle}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#667781] dark:text-[#8696A0] font-mono">
                  {new Date(act.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
