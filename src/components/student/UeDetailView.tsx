import React, { useState, useEffect } from 'react';
import { UE, Session } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Lock,
  Unlock,
  Sparkles,
  Award,
  Shield,
  AlertCircle
} from 'lucide-react';
import { UnlockUeModal } from './UnlockUeModal';

interface UeDetailViewProps {
  ueId: string;
  onBack: () => void;
  onOpenSession: (sessionId: string) => void;
}

export const UeDetailView: React.FC<UeDetailViewProps> = ({ ueId, onBack, onOpenSession }) => {
  const { user } = useAuth();
  const [ue, setUe] = useState<UE | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isSuperOrStaff = user?.role === 'SUPERUSER' || user?.role === 'STAFF';

  const showAlert = (type: 'success' | 'error', message: string) => {
    setActionAlert({ type, message });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const loadData = async () => {
    try {
      const res = await api.getUe(ueId);
      setUe(res.ue);
      setSessions(res.sessions);
    } catch (err) {
      console.error('Error fetching UE details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ueId]);

  // Handle staff/superuser toggle access for simple users on session > 1
  const handleToggleSessionAccess = async (e: React.MouseEvent, s: Session) => {
    e.stopPropagation();
    if (s.sessionNumber === 1) {
      showAlert('error', 'La 1ère séance d\'une UE est obligatoirement gratuite et accessible à tous les étudiants (non verrouillable).');
      return;
    }
    try {
      const res = await api.toggleSessionAccess(s.id);
      showAlert('success', res.message);
      await loadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Impossible de modifier l\'accès à la séance.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center space-y-4">
        <p className="text-sm text-[#667781] dark:text-[#8696A0]">Unité d'enseignement introuvable.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl"
        >
          Retour aux cours
        </button>
      </div>
    );
  }

  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const progressPercent = sessions.length > 0 ? Math.round((completedCount / sessions.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Alert toast for staff/superuser actions */}
      {actionAlert && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            actionAlert.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          <span>{actionAlert.message}</span>
          <button
            onClick={() => setActionAlert(null)}
            className="ml-2 font-bold opacity-80 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] hover:underline transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au catalogue
      </button>

      {/* Hero UE Summary Card */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
              {ue.code}
            </span>
            <span className="text-xs text-[#667781] dark:text-[#8696A0]">
              {ue.departmentName} · {ue.level}
            </span>
            {isSuperOrStaff && (
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                <Shield className="w-3 h-3" /> Espace Gestionnaire
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {ue.isUnlocked || isSuperOrStaff ? (
              <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                <Unlock className="w-3.5 h-3.5 text-[#25D366]" /> UE Débloquée
              </span>
            ) : (
              <button
                onClick={() => setUnlockModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs"
              >
                <Unlock className="w-3.5 h-3.5" />
                Débloquer cette UE (500 F)
              </button>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111B21] dark:text-white">
            {ue.title}
          </h1>

          {ue.objective && (
            <div className="mt-2 p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-[#075E54] dark:text-emerald-300">
              <strong>🎯 Objectif pédagogique :</strong> {ue.objective}
            </div>
          )}

          <p className="text-xs sm:text-sm text-[#667781] dark:text-[#8696A0] mt-2 leading-relaxed">
            {ue.description}
          </p>
        </div>

        {/* Progress gauge */}
        <div className="pt-2 border-t border-[#E9EDEF] dark:border-[#222E35] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#111B21] dark:text-white">Progression dans cette UE</span>
            <span className="font-bold text-[#075E54] dark:text-[#25D366] tabular-nums">
              {completedCount} / {sessions.length} séances ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-[#F0F2F5] dark:bg-[#1F2C34] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#25D366] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Free Chapter Notice for simple users if UE is locked */}
      {!ue.isUnlocked && !isSuperOrStaff && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs transition-colors">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
              <p className="font-bold text-sm">
                Séance 01 offerte gratuitement à tous les étudiants !
              </p>
              <p>
                La première séance de chaque UE est en libre accès pour découvrir la pédagogie. Débloquez les autres séances pour <strong>500 FCFA</strong> (ou <strong>300 FCFA l'unité</strong> dès 3 UE).
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Paiement direct T-Money / Flooz (+228 71 67 69 45 / +228 99 70 59 20) · Activation garantie sous 12h.
              </p>
            </div>
          </div>

          <button
            onClick={() => setUnlockModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs shrink-0 self-stretch sm:self-auto justify-center"
          >
            <Unlock className="w-4 h-4" />
            Demande de déblocage
          </button>
        </div>
      )}

      {/* Superuser & Staff Control Bar Notice */}
      {isSuperOrStaff && (
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl text-xs text-[#075E54] dark:text-emerald-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>
              <strong>Contrôle d'accès des séances :</strong> En tant que gestionnaire, vous pouvez autoriser ou bloquer l'accès des comptes étudiants simples pour chaque séance (sauf la 1ère séance qui reste toujours gratuite).
            </span>
          </div>
        </div>
      )}

      {/* Sessions Vertical List */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-[#111B21] dark:text-white">
          Séances d'apprentissage ({sessions.length})
        </h3>

        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden divide-y divide-[#E9EDEF] dark:divide-[#222E35] shadow-sm transition-colors">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#667781] dark:text-[#8696A0]">
              Aucune séance publiée pour cette UE pour le moment.
            </div>
          ) : (
            sessions.map((session) => {
              const isFirstSession = session.sessionNumber === 1;
              // Session 1 is NEVER locked for anyone.
              // For other sessions:
              // If superuser/staff: not locked for them to preview.
              // For students: locked if session.isLocked is true (or if not unlocked and session.isLockedForUsers !== false).
              const isLockedForStudent = !isFirstSession && (session.isLocked ?? (!ue.isUnlocked && session.isLockedForUsers !== false));
              const isLocked = isSuperOrStaff ? false : isLockedForStudent;
              const isDone = session.status === 'completed';
              const isInProgress = session.status === 'in_progress';

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    if (isLocked) {
                      setUnlockModalOpen(true);
                    } else {
                      onOpenSession(session.id);
                    }
                  }}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer ${
                    isLocked
                      ? 'bg-[#F0F2F5]/40 dark:bg-[#1F2C34]/40 hover:bg-[#F0F2F5]/70 dark:hover:bg-[#1F2C34]/70'
                      : 'hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] group'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone
                          ? 'bg-[#25D366] text-[#075E54]'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : isLocked
                          ? 'bg-slate-200 dark:bg-slate-800 text-[#667781] dark:text-[#8696A0]'
                          : 'bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-[#075E54]" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      ) : (
                        <span>{String(session.sessionNumber).padStart(2, '0')}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                          Séance {session.sessionNumber} · {session.estimatedMinutes} min
                        </span>
                        {isFirstSession && (
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                            ⭐ Séance 01 Gratuite (Pour tous)
                          </span>
                        )}
                        {!isFirstSession && isLocked && (
                          <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                            Verrouillée
                          </span>
                        )}
                        {!isFirstSession && !isLocked && !isSuperOrStaff && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            Accessible
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-[#111B21] dark:text-white mt-0.5 group-hover:text-[#075E54] dark:group-hover:text-[#25D366] transition-colors truncate">
                        {session.title}
                      </h4>
                      <p className="text-xs text-[#667781] dark:text-[#8696A0] line-clamp-1 mt-0.5">
                        {session.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Admin Access Toggle */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Superuser & Staff Direct Access Control Toggle */}
                    {isSuperOrStaff && (
                      <div className="flex items-center mr-1">
                        {isFirstSession ? (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            Toujours libre
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleToggleSessionAccess(e, session)}
                            className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border flex items-center gap-1.5 transition-all shadow-2xs ${
                              session.isLockedForUsers === false
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                                : 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900'
                            }`}
                            title="Cliquez pour autoriser ou bloquer l'accès pour les comptes étudiants simples"
                          >
                            {session.isLockedForUsers === false ? (
                              <>
                                <Unlock className="w-3.5 h-3.5 text-[#25D366]" />
                                <span>Étudiants : Débloqué</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>Étudiants : Bloqué</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {isLocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnlockModalOpen(true);
                        }}
                        className="p-2 text-[#667781] hover:text-[#075E54] dark:text-[#8696A0] dark:hover:text-[#25D366] rounded-xl hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942]"
                        title="Débloquer"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenSession(session.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 group-hover:bg-[#25D366] group-hover:text-[#075E54] rounded-xl transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Ouvrir
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Unlock UE Modal */}
      {unlockModalOpen && (
        <UnlockUeModal
          isOpen={unlockModalOpen}
          initialSelectedUeId={ue.id}
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
