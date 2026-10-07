import React, { useState, useEffect } from 'react';
import { AdminStudentProgress, AdminProgressSummary } from '../../types';
import { api } from '../../lib/api';
import {
  TrendingUp,
  Search,
  Users,
  CheckCircle2,
  Award,
  BookOpen,
  Filter,
  Eye,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  GraduationCap,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const UserProgressView: React.FC = () => {
  const [students, setStudents] = useState<AdminStudentProgress[]>([]);
  const [summary, setSummary] = useState<AdminProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Student Detail Modal
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<{
    student: any;
    ues: any[];
    recentAttempts: any[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsersProgress({
        q: search,
        level: levelFilter,
        department: deptFilter
      });
      setStudents(res.students || []);
      setSummary(res.summary || null);
    } catch (err) {
      console.error('Error loading students progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [levelFilter, deptFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProgress();
  };

  const handleOpenDetail = async (userId: string) => {
    setDetailLoading(true);
    try {
      const res = await api.getAdminUserProgressDetail(userId);
      setSelectedStudentDetail(res);
    } catch (err) {
      console.error('Error loading student detail progress:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const departmentsList = Array.from(new Set(students.map(s => s.department).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
            Suivi & Progression des Étudiants
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Tableau de bord de suivi en temps réel de l'avancement, séances terminées et résultats aux QCM.
          </p>
        </div>

        <button
          onClick={loadProgress}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#111B21] p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs">
            <div className="flex items-center justify-between text-[#667781] dark:text-[#8696A0]">
              <span className="text-xs font-semibold">Étudiants Suivis</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-[#111B21] dark:text-white mt-1">
              {summary.totalStudents}
            </div>
            <div className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">Comptes étudiants inscrits</div>
          </div>

          <div className="bg-white dark:bg-[#111B21] p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs">
            <div className="flex items-center justify-between text-[#667781] dark:text-[#8696A0]">
              <span className="text-xs font-semibold">Complétion Moyenne</span>
              <TrendingUp className="w-4 h-4 text-[#25D366]" />
            </div>
            <div className="text-2xl font-black text-[#075E54] dark:text-[#25D366] mt-1">
              {summary.averageCompletionRate}%
            </div>
            <div className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">Avancement global moyen</div>
          </div>

          <div className="bg-white dark:bg-[#111B21] p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs">
            <div className="flex items-center justify-between text-[#667781] dark:text-[#8696A0]">
              <span className="text-xs font-semibold">Séances Validées</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-[#111B21] dark:text-white mt-1">
              {summary.totalCompletedSessions}
            </div>
            <div className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">Modules et séances étudiées</div>
          </div>

          <div className="bg-white dark:bg-[#111B21] p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs">
            <div className="flex items-center justify-between text-[#667781] dark:text-[#8696A0]">
              <span className="text-xs font-semibold">Tests & QCM Soumis</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-[#111B21] dark:text-white mt-1">
              {summary.totalQuizzesTaken}
            </div>
            <div className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">Tentatives d'auto-évaluation</div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-[#111B21] p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou numéro de téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F0F2F5]/50 dark:bg-[#1F2C34]/50 text-[#111B21] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#25D366]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1F2C34] text-[#111B21] dark:text-white"
            >
              <option value="ALL">Tous les Niveaux (L1, L2, L3)</option>
              <option value="L1">Licence 1 (L1)</option>
              <option value="L2">Licence 2 (L2)</option>
              <option value="L3">Licence 3 (L3)</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1F2C34] text-[#111B21] dark:text-white"
            >
              <option value="ALL">Toutes les Facultés</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#075E54] dark:bg-[#25D366] dark:text-[#075E54] rounded-xl hover:opacity-90 transition-opacity"
            >
              Filtrer
            </button>
          </div>
        </form>
      </div>

      {/* Students List Table */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-[#667781] dark:text-[#8696A0]">Chargement de la progression des étudiants...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-[#667781] mx-auto opacity-50" />
            <p className="text-xs font-medium text-[#111B21] dark:text-white">Aucun étudiant trouvé.</p>
            <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">Modifiez vos critères de recherche ou vos filtres.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F0F2F5]/60 dark:bg-[#1F2C34]/60 border-b border-[#E9EDEF] dark:border-[#222E35] text-[#667781] dark:text-[#8696A0]">
                  <th className="p-3.5 font-bold">Étudiant</th>
                  <th className="p-3.5 font-bold">Faculté / Filière</th>
                  <th className="p-3.5 font-bold">Niveau</th>
                  <th className="p-3.5 font-bold">Progression Globale</th>
                  <th className="p-3.5 font-bold text-center">Séances Faites</th>
                  <th className="p-3.5 font-bold text-center">QCM & Score</th>
                  <th className="p-3.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EDEF] dark:divide-[#222E35]">
                {students.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-[#F0F2F5]/40 dark:hover:bg-[#1F2C34]/40 transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-[#111B21] dark:text-white">
                        {st.fullName}
                      </div>
                      <div className="text-[11px] text-[#667781] dark:text-[#8696A0] font-mono">
                        {st.phone}
                      </div>
                      {st.isSponsored && (
                        <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 rounded">
                          Compte Sponsorisé
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-[#111B21] dark:text-white">{st.department}</div>
                      <div className="text-[11px] text-[#667781] dark:text-[#8696A0]">{st.program}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] border border-emerald-200 dark:border-emerald-800">
                        {st.level}
                      </span>
                    </td>

                    <td className="p-3.5 min-w-[160px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-[#075E54] dark:text-[#25D366]">{st.globalProgressPercent}%</span>
                        <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">{st.accessibleUesCount} UE(s)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            st.globalProgressPercent >= 75
                              ? 'bg-[#25D366]'
                              : st.globalProgressPercent >= 40
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${st.globalProgressPercent}%` }}
                        ></div>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-bold text-[#111B21] dark:text-white">{st.completedSessionsCount}</span>
                      <span className="text-[10px] text-[#667781] dark:text-[#8696A0]"> / {st.totalSessions}</span>
                    </td>

                    <td className="p-3.5 text-center">
                      {st.totalQuizzesTaken > 0 ? (
                        <div>
                          <span className={`font-bold ${st.avgQuizScore >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {st.avgQuizScore}%
                          </span>
                          <div className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                            {st.passedQuizzesCount} validé(s) / {st.totalQuizzesTaken}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Aucun test</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetail(st.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Progress Detail Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] my-8 animate-in fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF] dark:border-[#222E35]">
              <div>
                <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                  Progression détaillée de {selectedStudentDetail.student.fullName}
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0]">
                  {selectedStudentDetail.student.phone} · {selectedStudentDetail.student.department} · {selectedStudentDetail.student.program} ({selectedStudentDetail.student.level})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 pt-4 text-xs">
              {/* UEs Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
                  Unités d'Enseignement & Séances
                </h4>

                {selectedStudentDetail.ues.length === 0 ? (
                  <p className="text-gray-400 italic">Aucune UE active ou accessible pour cet étudiant.</p>
                ) : (
                  selectedStudentDetail.ues.map((ueItem: any) => (
                    <div
                      key={ueItem.ueId}
                      className="p-4 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5]/40 dark:bg-[#1F2C34]/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {ueItem.ueCode}
                          </span>
                          <span className="font-bold text-sm text-[#111B21] dark:text-white ml-2">
                            {ueItem.ueTitle}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                          {ueItem.level}
                        </span>
                      </div>

                      {/* Sessions List */}
                      <div className="space-y-1.5 pt-1">
                        {ueItem.sessions.map((sess: any) => (
                          <div
                            key={sess.sessionId}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35]"
                          >
                            <div className="flex items-center gap-2">
                              {sess.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                              ) : sess.status === 'in_progress' ? (
                                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shrink-0"></div>
                              )}
                              <div>
                                <span className="font-semibold text-xs text-[#111B21] dark:text-white">
                                  Séance {sess.sessionNumber} : {sess.title}
                                </span>
                                {sess.completedAt && (
                                  <div className="text-[10px] text-gray-400">
                                    Terminé le {new Date(sess.completedAt).toLocaleDateString('fr-FR')}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {sess.bestScore !== null && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sess.bestScore >= 75 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                                  QCM: {sess.bestScore}%
                                </span>
                              )}
                              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                sess.status === 'completed'
                                  ? 'bg-emerald-50 text-[#075E54] dark:bg-emerald-950 dark:text-[#25D366]'
                                  : sess.status === 'in_progress'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {sess.status === 'completed' ? 'Validé' : sess.status === 'in_progress' ? 'En cours' : 'Non commencé'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Recent Quiz Attempts */}
              {selectedStudentDetail.recentAttempts && selectedStudentDetail.recentAttempts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
                    Dernières tentatives de QCM
                  </h4>

                  <div className="space-y-1.5">
                    {selectedStudentDetail.recentAttempts.map((att: any) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35]"
                      >
                        <div>
                          <div className="font-semibold text-xs text-[#111B21] dark:text-white">
                            Score : {att.score} / {att.maxScore} ({att.percentage}%)
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {att.submittedAt ? new Date(att.submittedAt).toLocaleString('fr-FR') : ''}
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          att.passed
                            ? 'bg-emerald-100 text-[#075E54] dark:bg-emerald-950 dark:text-[#25D366]'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {att.passed ? 'Admis' : 'Non validé'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
