import React, { useState, useEffect } from 'react';
import { UE, Session, Department, Program, AcademicYear, QuizQuestion, Flashcard } from '../../types';
import { api } from '../../lib/api';
import {
  Plus,
  BookOpen,
  Layers,
  Edit2,
  Check,
  X,
  FileText,
  Sparkles,
  Trash2,
  Lock,
  Unlock,
  Volume2,
  Video,
  CheckSquare,
  HelpCircle,
  Cloud,
  Download,
  AlertCircle,
  CheckCircle2,
  Tag
} from 'lucide-react';

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<UE[]>([]);
  const [selectedUe, setSelectedUe] = useState<UE | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);

  // Success / Error alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UE Modal State
  const [ueModalOpen, setUeModalOpen] = useState(false);
  const [editingUeId, setEditingUeId] = useState<string | null>(null);
  const [ueForm, setUeForm] = useState({
    code: '',
    title: '',
    description: '',
    objective: '',
    departmentId: '',
    programId: '',
    level: 'L1' as 'L1' | 'L2' | 'L3',
    semester: 'Semestre 1 (Harmattan)',
    academicYear: '2025-2026',
    priceFcfa: 500,
    isPublished: true,
    isSuspended: false
  });

  // Session Modal State
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionStep, setSessionStep] = useState<1 | 2 | 3>(1);

  const [sessionForm, setSessionForm] = useState({
    sessionNumber: 1,
    title: '',
    description: '',
    objective: '',
    estimatedMinutes: 45,
    summaryText: '',
    isPublished: true,
    isSuspended: false,
    // Step 2 Media
    hasAudio: false,
    audioTitle: '',
    audioUrl: '',
    audioDuration: '10:00',
    audioSpeaker: 'Équipe UL Study Flow (ulstudyflow@gmail.com)',
    hasVideo: false,
    videoTitle: '',
    videoUrl: '',
    videoDuration: '15:00',
    hasPdf: true,
    pdfTitle: '',
    pdfPages: 12,
    pdfSizeMb: 1.5,
    // Step 3 Dynamic Quiz & Flashcards
    hasQuiz: false,
    quizTitle: '',
    quizPassingScore: 70,
    quizQuestions: [] as QuizQuestion[],
    flashcards: [] as Flashcard[]
  });

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'ue' | 'session';
    id: string;
    name: string;
  } | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4500);
  };

  const loadData = async () => {
    try {
      const [cRes, metaRes] = await Promise.all([
        api.getCourses(),
        api.getAcademicMeta()
      ]);
      setCourses(cRes.courses);
      setDepartments(metaRes.departments);
      setPrograms(metaRes.programs);
      setAcademicYears(metaRes.academicYears);

      if (cRes.courses.length > 0 && !selectedUe) {
        setSelectedUe(cRes.courses[0]);
      } else if (selectedUe) {
        const updated = cRes.courses.find(c => c.id === selectedUe.id);
        if (updated) setSelectedUe(updated);
      }
    } catch (err) {
      console.error('Error loading courses and meta:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsForUe = async (ueId: string) => {
    try {
      const res = await api.getUe(ueId);
      setSessions(res.sessions);
    } catch (err) {
      console.error('Error loading sessions for UE:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUe) {
      loadSessionsForUe(selectedUe.id);
    }
  }, [selectedUe]);

  // Open Create UE Modal
  const openCreateUeModal = () => {
    setEditingUeId(null);
    const firstDept = departments[0]?.id || 'dept_faseg';
    const firstProg = programs.find(p => p.departmentId === firstDept)?.id || programs[0]?.id || 'prog_eco';
    setUeForm({
      code: '',
      title: '',
      description: '',
      objective: '',
      departmentId: firstDept,
      programId: firstProg,
      level: 'L1',
      semester: 'Semestre 1 (Harmattan)',
      academicYear: academicYears.find(a => a.isCurrent)?.label || '2025-2026',
      priceFcfa: 500,
      isPublished: true,
      isSuspended: false
    });
    setUeModalOpen(true);
  };

  // Open Edit UE Modal
  const openEditUeModal = (ue: UE) => {
    setEditingUeId(ue.id);
    setUeForm({
      code: ue.code,
      title: ue.title,
      description: ue.description,
      objective: ue.objective || '',
      departmentId: ue.departmentId,
      programId: ue.programId,
      level: ue.level,
      semester: ue.semester,
      academicYear: ue.academicYear,
      priceFcfa: ue.priceFcfa,
      isPublished: ue.isPublished,
      isSuspended: Boolean(ue.isSuspended)
    });
    setUeModalOpen(true);
  };

  // Handle Save UE
  const handleSaveUe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...ueForm,
        id: editingUeId || undefined
      };
      await api.saveUe(payload);
      setUeModalOpen(false);
      showSuccess(editingUeId ? `UE ${ueForm.code} mise à jour.` : `UE ${ueForm.code} créée avec succès.`);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de l\'enregistrement de l\'UE.');
    }
  };

  // Handle Toggle Suspend UE
  const handleToggleSuspendUe = async (ue: UE) => {
    try {
      const res = await api.toggleSuspendUe(ue.id);
      showSuccess(`UE ${ue.code} ${res.isSuspended ? 'suspendue' : 'réactivée'}.`);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la modification du statut.');
    }
  };

  // Handle Delete UE
  const handleDeleteUe = async (ueId: string) => {
    try {
      await api.deleteUe(ueId);
      showSuccess('UE et toutes ses séances supprimées avec succès.');
      setDeleteConfirm(null);
      if (selectedUe?.id === ueId) {
        setSelectedUe(null);
      }
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur de suppression.');
    }
  };

  // Open Create Session Modal
  const openCreateSessionModal = () => {
    if (!selectedUe) return;
    setEditingSessionId(null);
    setSessionStep(1);
    const nextNum = sessions.length + 1;
    setSessionForm({
      sessionNumber: nextNum,
      title: '',
      description: '',
      objective: '',
      estimatedMinutes: 45,
      summaryText: `### 1. Introduction à la séance ${nextNum}\nInsérez ici le résumé pédagogique officiel pour les étudiants.\n\n### 2. Notions Clés\n- Point important 1\n- Point important 2\n\n### 3. Application pratique\nExemple d'exercice résolu.`,
      isPublished: true,
      isSuspended: false,
      hasAudio: false,
      audioTitle: `Podcast Séance ${nextNum} : Révision & Synthèse`,
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      audioDuration: '08:30',
      audioSpeaker: 'Tuteur UL Study Flow (ulstudyflow@gmail.com)',
      hasVideo: false,
      videoTitle: `Vidéo Explicative Séance ${nextNum}`,
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      videoDuration: '12:00',
      hasPdf: true,
      pdfTitle: `Fiche Séance ${nextNum} - ${selectedUe.code}`,
      pdfPages: 6,
      pdfSizeMb: 1.2,
      hasQuiz: false,
      quizTitle: `Quiz de validation - Séance ${nextNum}`,
      quizPassingScore: 70,
      quizQuestions: [
        {
          id: 'q_' + Date.now(),
          text: 'Quelle est la notion fondamentale à retenir dans cette séance ?',
          type: 'single',
          options: ['Option A (Correcte)', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A (Correcte)',
          explanation: 'Explication pédagogique pas à pas pour l\'étudiant.',
          points: 5
        }
      ],
      flashcards: [
        {
          id: 'fc_' + Date.now(),
          front: 'Question ou concept clé de la séance ?',
          back: 'Définition exacte ou formule à retenir pour l\'examen.',
          category: 'Notion Fondamentale'
        }
      ]
    });
    setSessionModalOpen(true);
  };

  // Open Edit Session Modal
  const openEditSessionModal = async (session: Session) => {
    try {
      const fullRes = await api.getSession(session.id);
      const s = fullRes.session;
      setEditingSessionId(s.id);
      setSessionStep(1);

      setSessionForm({
        sessionNumber: s.sessionNumber,
        title: s.title,
        description: s.description,
        objective: s.objective || '',
        estimatedMinutes: s.estimatedMinutes,
        summaryText: s.content?.summaryText || '',
        isPublished: s.isPublished,
        isSuspended: Boolean(s.isSuspended),
        hasAudio: Boolean(s.content?.audio),
        audioTitle: s.content?.audio?.title || `Podcast Séance ${s.sessionNumber}`,
        audioUrl: s.content?.audio?.url || '',
        audioDuration: s.content?.audio?.duration || '10:00',
        audioSpeaker: s.content?.audio?.speaker || 'UL Study Flow (ulstudyflow@gmail.com)',
        hasVideo: Boolean(s.content?.video),
        videoTitle: s.content?.video?.title || `Vidéo Séance ${s.sessionNumber}`,
        videoUrl: s.content?.video?.url || '',
        videoDuration: s.content?.video?.duration || '15:00',
        hasPdf: Boolean(s.content?.pdf),
        pdfTitle: s.content?.pdf?.title || `Support Polycopié Séance ${s.sessionNumber}`,
        pdfPages: s.content?.pdf?.pages || 8,
        pdfSizeMb: s.content?.pdf?.sizeMb || 1.2,
        hasQuiz: Boolean(s.quiz),
        quizTitle: s.quiz?.title || `Quiz Séance ${s.sessionNumber}`,
        quizPassingScore: s.quiz?.passingScorePercent || 70,
        quizQuestions: s.quiz?.questions || [],
        flashcards: s.flashcards || []
      });

      setSessionModalOpen(true);
    } catch (err: any) {
      showError(err.message || 'Impossible de charger la séance.');
    }
  };

  // Handle Save Session
  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUe) return;

    try {
      const payload: any = {
        id: editingSessionId || undefined,
        ueId: selectedUe.id,
        sessionNumber: sessionForm.sessionNumber,
        title: sessionForm.title,
        description: sessionForm.description,
        objective: sessionForm.objective,
        estimatedMinutes: sessionForm.estimatedMinutes,
        summaryText: sessionForm.summaryText,
        isPublished: sessionForm.isPublished,
        isSuspended: sessionForm.isSuspended,
        video: sessionForm.hasVideo
          ? {
              title: sessionForm.videoTitle,
              url: sessionForm.videoUrl,
              duration: sessionForm.videoDuration,
              provider: 'youtube',
              driveFileUrl: 'https://drive.google.com/drive/folders/ulstudyflow@gmail.com'
            }
          : undefined,
        audio: sessionForm.hasAudio
          ? {
              title: sessionForm.audioTitle,
              url: sessionForm.audioUrl,
              duration: sessionForm.audioDuration,
              speaker: sessionForm.audioSpeaker,
              driveFileUrl: 'https://drive.google.com/drive/folders/ulstudyflow@gmail.com'
            }
          : undefined,
        pdf: sessionForm.hasPdf
          ? {
              title: sessionForm.pdfTitle,
              url: '#',
              pages: sessionForm.pdfPages,
              sizeMb: sessionForm.pdfSizeMb,
              summaryMarkdown: 'Support téléchargeable UL'
            }
          : undefined,
        flashcards: sessionForm.flashcards
      };

      await api.saveSession(payload);
      setSessionModalOpen(false);
      showSuccess(editingSessionId ? `Séance mise à jour avec succès.` : `Séance ${sessionForm.sessionNumber} créée avec succès.`);
      await loadSessionsForUe(selectedUe.id);
    } catch (err: any) {
      showError(err.message || 'Erreur lors de l\'enregistrement de la séance.');
    }
  };

  // Handle Toggle Suspend Session
  const handleToggleSuspendSession = async (s: Session) => {
    try {
      const res = await api.toggleSuspendSession(s.id);
      showSuccess(`Séance ${s.sessionNumber} ${res.isSuspended ? 'suspendue' : 'réactivée'}.`);
      if (selectedUe) await loadSessionsForUe(selectedUe.id);
    } catch (err: any) {
      showError(err.message || 'Erreur de modification.');
    }
  };

  // Handle Authorize / Block session access for simple users (STAFF & SUPERUSER)
  // Sauf pour la séance 1 qui est obligatoirement gratuite et accessible!
  const handleToggleSessionAccess = async (s: Session) => {
    if (s.sessionNumber === 1) {
      showError('La 1ère séance d\'une UE est obligatoirement gratuite et accessible à tous les étudiants (non verrouillable).');
      return;
    }
    try {
      const res = await api.toggleSessionAccess(s.id);
      showSuccess(res.message);
      if (selectedUe) await loadSessionsForUe(selectedUe.id);
    } catch (err: any) {
      showError(err.message || 'Action impossible.');
    }
  };

  // Handle Delete Session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      showSuccess('Séance supprimée.');
      setDeleteConfirm(null);
      if (selectedUe) await loadSessionsForUe(selectedUe.id);
    } catch (err: any) {
      showError(err.message || 'Erreur de suppression.');
    }
  };

  // Flashcards helpers in modal
  const handleAddFlashcard = () => {
    const newCard: Flashcard = {
      id: 'fc_' + Date.now(),
      front: 'Nouvelle notion / question',
      back: 'Explication / réponse',
      category: 'Général'
    };
    setSessionForm({
      ...sessionForm,
      flashcards: [...sessionForm.flashcards, newCard]
    });
  };

  const handleUpdateFlashcard = (id: string, field: keyof Flashcard, value: string) => {
    setSessionForm({
      ...sessionForm,
      flashcards: sessionForm.flashcards.map(f => f.id === id ? { ...f, [field]: value } : f)
    });
  };

  const handleRemoveFlashcard = (id: string) => {
    setSessionForm({
      ...sessionForm,
      flashcards: sessionForm.flashcards.filter(f => f.id !== id)
    });
  };

  // Quiz questions helper in modal
  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: 'q_' + Date.now(),
      text: 'Question de cours ?',
      type: 'single',
      options: ['Choix A (Correct)', 'Choix B', 'Choix C'],
      correctAnswer: 'Choix A (Correct)',
      explanation: 'Explication détaillée de la réponse.',
      points: 5
    };
    setSessionForm({
      ...sessionForm,
      quizQuestions: [...sessionForm.quizQuestions, newQ]
    });
  };

  const handleUpdateQuestion = (id: string, field: keyof QuizQuestion, value: any) => {
    setSessionForm({
      ...sessionForm,
      quizQuestions: sessionForm.quizQuestions.map(q => q.id === id ? { ...q, [field]: value } : q)
    });
  };

  const handleRemoveQuestion = (id: string) => {
    setSessionForm({
      ...sessionForm,
      quizQuestions: sessionForm.quizQuestions.filter(q => q.id !== id)
    });
  };

  // Filter programs by selected department in UE Form
  const filteredProgramsForUe = programs.filter(
    p => p.departmentId === ueForm.departmentId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21]">Gestion des Cours & Séances</h2>
          <p className="text-xs text-[#667781]">
            Précision du département, de la filière et de l'objectif de chaque UE · Structuration des séances en 3 étapes (Résumé, Médias non-téléchargeables, QCM & Flashcards).
          </p>
        </div>

        <button
          onClick={openCreateUeModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouvelle UE
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-Column Layout: UE List & Sessions List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: UE List */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
              Unités d'Enseignement ({courses.length})
            </h3>
            <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">Cliquez pour sélectionner</span>
          </div>

          <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden divide-y divide-[#E9EDEF] dark:divide-[#222E35] shadow-xs transition-colors">
            {courses.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667781] dark:text-[#8696A0]">
                Aucune UE trouvée. Créez votre première UE.
              </div>
            ) : (
              courses.map((ue) => {
                const isSelected = selectedUe?.id === ue.id;
                const dept = departments.find(d => d.id === ue.departmentId);
                const prog = programs.find(p => p.id === ue.programId);

                return (
                  <div
                    key={ue.id}
                    onClick={() => setSelectedUe(ue)}
                    className={`p-4 cursor-pointer transition-colors relative ${
                      isSelected ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-[#25D366]' : 'hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-white dark:bg-[#0B141A] px-2 py-0.5 rounded border border-[#E9EDEF] dark:border-[#222E35]">
                            {ue.code}
                          </span>
                          <span className="text-[10px] font-semibold text-[#667781] dark:text-[#8696A0] bg-[#F0F2F5] dark:bg-[#1F2C34] px-1.5 py-0.5 rounded">
                            {dept?.code || ue.departmentId} · {prog?.name || ue.programId}
                          </span>
                          <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                            {ue.level}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#111B21] dark:text-white mt-1.5">{ue.title}</h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {ue.isSuspended ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                            Suspendue
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366]">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {ue.objective && (
                      <p className="text-[11px] text-[#075E54] font-medium mt-1 line-clamp-1 italic">
                        🎯 Objectif: {ue.objective}
                      </p>
                    )}
                    <p className="text-xs text-[#667781] mt-0.5 line-clamp-2">{ue.description}</p>

                    <div className="mt-2.5 pt-2 border-t border-[#E9EDEF]/60 flex items-center justify-between text-[11px]">
                      <span className="text-[#667781]">{ue.priceFcfa} FCFA</span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditUeModal(ue)}
                          title="Modifier l'UE"
                          className="p-1 rounded text-[#075E54] hover:bg-emerald-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSuspendUe(ue)}
                          title={ue.isSuspended ? 'Réactiver l\'UE' : 'Suspendre l\'UE'}
                          className="p-1 rounded text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          {ue.isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'ue', id: ue.id, name: `${ue.code} - ${ue.title}` })}
                          title="Supprimer l'UE"
                          className="p-1 rounded text-rose-600 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Sessions in Selected UE */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#667781]">
                Séances de : {selectedUe?.code || 'Sélectionnez une UE'} ({sessions.length})
              </h3>
              {selectedUe && (
                <p className="text-[11px] text-[#075E54] font-medium">
                  {selectedUe.title}
                </p>
              )}
            </div>

            {selectedUe && (
              <button
                onClick={openCreateSessionModal}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une séance
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden divide-y divide-[#E9EDEF] dark:divide-[#222E35] shadow-xs transition-colors">
            {!selectedUe ? (
              <div className="p-8 text-center text-xs text-[#667781] dark:text-[#8696A0]">
                Veuillez sélectionner une Unité d'Enseignement à gauche pour voir et éditer ses séances.
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667781] dark:text-[#8696A0] space-y-2">
                <p>Aucune séance configurée pour cette UE.</p>
                <button
                  onClick={openCreateSessionModal}
                  className="px-3 py-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900"
                >
                  + Ajouter la Séance 01
                </button>
              </div>
            ) : (
              sessions.map((s) => (
                <div key={s.id} className="p-4 sm:p-5 hover:bg-[#F0F2F5]/60 dark:hover:bg-[#1F2C34]/60 transition-colors space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        Séance {s.sessionNumber} · {s.estimatedMinutes} min
                      </span>
                      {s.sessionNumber === 1 ? (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] px-2 py-0.5 rounded font-bold border border-emerald-300 dark:border-emerald-800">
                          ⭐ Séance 01 Gratuite (Pour tous les étudiants)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleSessionAccess(s)}
                          className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold border flex items-center gap-1 transition-all ${
                            s.isLockedForUsers === false
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                              : 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900'
                          }`}
                          title="Cliquer pour autoriser ou bloquer l'accès pour les comptes simples"
                        >
                          {s.isLockedForUsers === false ? <Unlock className="w-3 h-3 text-[#25D366]" /> : <Lock className="w-3 h-3 text-amber-700 dark:text-amber-400" />}
                          <span>{s.isLockedForUsers === false ? 'Accès Débloqué pour tous' : 'Verrouillée (Comptes simples)'}</span>
                        </button>
                      )}
                      {s.isSuspended ? (
                        <span className="text-[10px] bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded font-bold border border-rose-200 dark:border-rose-900">
                          Suspendue
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] px-2 py-0.5 rounded font-semibold">
                          Publiée
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditSessionModal(s)}
                        title="Modifier la séance"
                        className="p-1 rounded text-[#075E54] dark:text-[#25D366] hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleSuspendSession(s)}
                        title={s.isSuspended ? 'Réactiver' : 'Suspendre'}
                        className="p-1 rounded text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors"
                      >
                        {s.isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'session', id: s.id, name: `Séance ${s.sessionNumber} : ${s.title}` })}
                        title="Supprimer la séance"
                        className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-[#111B21] dark:text-white">{s.title}</h4>
                  {s.objective && (
                    <p className="text-[11px] text-[#075E54] dark:text-emerald-300 font-medium italic">
                      🎯 Objectif : {s.objective}
                    </p>
                  )}
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] line-clamp-2">{s.description}</p>

                  {/* Badges for formats and modules */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0F2F5] text-[#667781]">
                      <FileText className="w-3 h-3 text-[#075E54]" />
                      Texte & PDF
                    </span>

                    {s.content?.audio && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold" title="Audio non téléchargeable">
                        <Volume2 className="w-3 h-3" />
                        Audio ({s.content.audio.duration})
                      </span>
                    )}

                    {s.content?.video && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold" title="Vidéo sécurisée">
                        <Video className="w-3 h-3" />
                        Vidéo ({s.content.video.duration})
                      </span>
                    )}

                    {s.hasQuiz && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#075E54] font-bold">
                        <CheckSquare className="w-3 h-3" />
                        Questionnaire
                      </span>
                    )}

                    {s.flashcards && s.flashcards.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        {s.flashcards.length} Flashcard(s)
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL CREATION / MODIFICATION UE */}
      {ueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E9EDEF] space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setUeModalOpen(false)}
              className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#075E54] flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#111B21]">
                  {editingUeId ? `Modifier l'UE ${ueForm.code}` : 'Créer une Unité d\'Enseignement'}
                </h3>
                <p className="text-xs text-[#667781]">Précision du département, filière, niveau et objectifs.</p>
              </div>
            </div>

            <form onSubmit={handleSaveUe} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21]">Code UE *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ANG 101 ou ECO 102"
                    value={ueForm.code}
                    onChange={(e) => setUeForm({ ...ueForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white focus:outline-none focus:border-[#25D366] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21]">Niveau LMD *</label>
                  <select
                    value={ueForm.level}
                    onChange={(e) => setUeForm({ ...ueForm, level: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                  >
                    <option value="L1">Licence 1 (L1)</option>
                    <option value="L2">Licence 2 (L2)</option>
                    <option value="L3">Licence 3 (L3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111B21]">Titre complet de l'UE *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Grammaire et Communication Anglaise Fondamentale"
                  value={ueForm.title}
                  onChange={(e) => setUeForm({ ...ueForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                />
              </div>

              {/* Département et Filière */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21]">Département / Faculté *</label>
                  <select
                    value={ueForm.departmentId}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      const relatedProg = programs.find(p => p.departmentId === newDept)?.id || '';
                      setUeForm({ ...ueForm, departmentId: newDept, programId: relatedProg });
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white font-medium"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21]">Filière associée *</label>
                  <select
                    value={ueForm.programId}
                    onChange={(e) => setUeForm({ ...ueForm, programId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white font-medium"
                  >
                    {filteredProgramsForUe.length > 0 ? (
                      filteredProgramsForUe.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))
                    ) : (
                      programs.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111B21]">Objectif pédagogique de l'UE *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex : Maîtriser les structures grammaticales fondamentales, la phonétique et l'expression orale et écrite..."
                  value={ueForm.objective}
                  onChange={(e) => setUeForm({ ...ueForm, objective: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111B21]">Description générale *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Notions abordées, découpage semestriel, méthodologie..."
                  value={ueForm.description}
                  onChange={(e) => setUeForm({ ...ueForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21]">Prix (FCFA)</label>
                  <input
                    type="number"
                    value={ueForm.priceFcfa}
                    onChange={(e) => setUeForm({ ...ueForm, priceFcfa: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21]">Semestre</label>
                  <input
                    type="text"
                    value={ueForm.semester}
                    onChange={(e) => setUeForm({ ...ueForm, semester: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21]">Année Univ.</label>
                  <select
                    value={ueForm.academicYear}
                    onChange={(e) => setUeForm({ ...ueForm, academicYear: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                  >
                    {academicYears.map(ay => (
                      <option key={ay.id} value={ay.label}>{ay.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#F0F2F5] rounded-xl flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ueForm.isSuspended}
                    onChange={(e) => setUeForm({ ...ueForm, isSuspended: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="font-semibold text-rose-700">Suspendre l'UE (Masquer aux étudiants)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#E9EDEF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUeModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#667781]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shadow-xs"
                >
                  {editingUeId ? 'Enregistrer les modifications' : 'Créer l\'UE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MULTI-ÉTAPES SÉANCE (Étape 1: Infos, Étape 2: Médias Drive, Étape 3: QCM & Flashcards) */}
      {sessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSessionModalOpen(false)}
              className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-[#075E54]">
                  {selectedUe?.code}
                </span>
                <h3 className="font-bold text-lg text-[#111B21]">
                  {editingSessionId ? `Modifier la Séance ${sessionForm.sessionNumber}` : `Ajouter une séance à ${selectedUe?.code}`}
                </h3>
              </div>
              <p className="text-xs text-[#667781] mt-0.5">
                Configuration complète de la séance : résumé textuel, contenus audio/vidéo protégés, questionnaires et flashcards.
              </p>
            </div>

            {/* Step Tabs Navigation */}
            <div className="flex items-center border-b border-[#E9EDEF] text-xs font-bold gap-2">
              <button
                type="button"
                onClick={() => setSessionStep(1)}
                className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  sessionStep === 1
                    ? 'border-[#25D366] text-[#075E54]'
                    : 'border-transparent text-[#667781] hover:text-[#111B21]'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-[#E9EDEF] text-[#111B21] flex items-center justify-center text-[10px]">1</span>
                Informations & Résumé
              </button>

              <button
                type="button"
                onClick={() => setSessionStep(2)}
                className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  sessionStep === 2
                    ? 'border-[#25D366] text-[#075E54]'
                    : 'border-transparent text-[#667781] hover:text-[#111B21]'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-[#E9EDEF] text-[#111B21] flex items-center justify-center text-[10px]">2</span>
                Médias Audio & Vidéo
              </button>

              <button
                type="button"
                onClick={() => setSessionStep(3)}
                className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  sessionStep === 3
                    ? 'border-[#25D366] text-[#075E54]'
                    : 'border-transparent text-[#667781] hover:text-[#111B21]'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-[#E9EDEF] text-[#111B21] flex items-center justify-center text-[10px]">3</span>
                QCM & Flashcards
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
              {/* ÉTAPE 1 : INFORMATIONS GÉNÉRALES & RÉSUMÉ TEXTE */}
              {sessionStep === 1 && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-[#111B21]">N° de Séance *</label>
                      <input
                        type="number"
                        required
                        value={sessionForm.sessionNumber}
                        onChange={(e) => setSessionForm({ ...sessionForm, sessionNumber: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-semibold mb-1 text-[#111B21]">Durée estimée (minutes) *</label>
                      <input
                        type="number"
                        required
                        value={sessionForm.estimatedMinutes}
                        onChange={(e) => setSessionForm({ ...sessionForm, estimatedMinutes: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21]">Titre de la séance *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Séance 01 : Fundamentals of English Grammar & Tenses"
                      value={sessionForm.title}
                      onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21]">Objectif spécifique de la séance *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Identifier et appliquer correctement les temps du présent dans divers contextes académiques."
                      value={sessionForm.objective}
                      onChange={(e) => setSessionForm({ ...sessionForm, objective: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21]">Description courte</label>
                    <input
                      type="text"
                      placeholder="Aperçu des notions abordées pour l'étudiant..."
                      value={sessionForm.description}
                      onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-[#111B21]">Contenu format texte & Résumé synthétique (téléchargeable en PDF par les users) *</label>
                      <span className="text-[10px] text-[#667781]">Format Markdown supporté</span>
                    </div>
                    <textarea
                      required
                      rows={5}
                      value={sessionForm.summaryText}
                      onChange={(e) => setSessionForm({ ...sessionForm, summaryText: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : FORMATS AUDIO & VIDÉO (Stockage Google Drive UL Study Flow) */}
              {sessionStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
                    <Cloud className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-blue-900 leading-relaxed">
                      <strong>Stockage Cloud Google Drive :</strong> Les fichiers audio et vidéo sont hébergés et synchronisés avec le compte Google Drive officiel UL Study Flow (<strong>ulstudyflow@gmail.com</strong>).
                      <br />Côté étudiant, les fichiers audio sont <em>non téléchargeables</em> (paramètre nodownload) et les vidéos comportent un <em>filigrane de sécurité</em> dissuadant l'enregistrement d'écran.
                    </div>
                  </div>

                  {/* Audio Section */}
                  <div className="p-4 bg-[#F0F2F5] rounded-xl border border-[#E9EDEF] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#111B21]">
                        <input
                          type="checkbox"
                          checked={sessionForm.hasAudio}
                          onChange={(e) => setSessionForm({ ...sessionForm, hasAudio: e.target.checked })}
                          className="w-4 h-4 text-[#25D366] rounded"
                        />
                        <Volume2 className="w-4 h-4 text-blue-600" />
                        Activer le Podcast Audio de révision (Non téléchargeable)
                      </label>
                    </div>

                    {sessionForm.hasAudio && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E9EDEF]">
                        <div className="col-span-2">
                          <label className="block font-semibold mb-1">Titre du podcast audio</label>
                          <input
                            type="text"
                            value={sessionForm.audioTitle}
                            onChange={(e) => setSessionForm({ ...sessionForm, audioTitle: e.target.value })}
                            className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">URL Flux Audio (Google Drive / Direct)</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={sessionForm.audioUrl}
                            onChange={(e) => setSessionForm({ ...sessionForm, audioUrl: e.target.value })}
                            className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-white font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Durée audio</label>
                          <input
                            type="text"
                            placeholder="08:45"
                            value={sessionForm.audioDuration}
                            onChange={(e) => setSessionForm({ ...sessionForm, audioDuration: e.target.value })}
                            className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Section */}
                  <div className="p-4 bg-[#F0F2F5] rounded-xl border border-[#E9EDEF] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#111B21]">
                        <input
                          type="checkbox"
                          checked={sessionForm.hasVideo}
                          onChange={(e) => setSessionForm({ ...sessionForm, hasVideo: e.target.checked })}
                          className="w-4 h-4 text-[#25D366] rounded"
                        />
                        <Video className="w-4 h-4 text-purple-600" />
                        Activer la Vidéo explicative (Non téléchargeable & Anti-capture)
                      </label>
                    </div>

                    {sessionForm.hasVideo && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E9EDEF]">
                        <div className="col-span-2">
                          <label className="block font-semibold mb-1">Titre de la vidéo</label>
                          <input
                            type="text"
                            value={sessionForm.videoTitle}
                            onChange={(e) => setSessionForm({ ...sessionForm, videoTitle: e.target.value })}
                            className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">URL Vidéo / Embed Google Drive</label>
                          <input
                            type="text"
                            placeholder="https://www.youtube.com/embed/... ou Drive stream"
                            value={sessionForm.videoUrl}
                            onChange={(e) => setSessionForm({ ...sessionForm, videoUrl: e.target.value })}
                            className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-white font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Durée vidéo</label>
                          <input
                            type="text"
                            placeholder="14:20"
                            value={sessionForm.videoDuration}
                            onChange={(e) => setSessionForm({ ...sessionForm, videoDuration: e.target.value })}
                            className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Polycopié PDF Section */}
                  <div className="p-4 bg-[#F0F2F5] rounded-xl border border-[#E9EDEF] space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#111B21]">
                      <input
                        type="checkbox"
                        checked={sessionForm.hasPdf}
                        onChange={(e) => setSessionForm({ ...sessionForm, hasPdf: e.target.checked })}
                        className="w-4 h-4 text-[#25D366] rounded"
                      />
                      <FileText className="w-4 h-4 text-[#075E54]" />
                      Activer le Polycopié PDF officiel téléchargeable
                    </label>

                    {sessionForm.hasPdf && (
                      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#E9EDEF]">
                        <div className="col-span-2">
                          <label className="block font-semibold mb-1">Titre du document PDF</label>
                          <input
                            type="text"
                            value={sessionForm.pdfTitle}
                            onChange={(e) => setSessionForm({ ...sessionForm, pdfTitle: e.target.value })}
                            className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Nombre de pages</label>
                          <input
                            type="number"
                            value={sessionForm.pdfPages}
                            onChange={(e) => setSessionForm({ ...sessionForm, pdfPages: Number(e.target.value) })}
                            className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : QUESTIONNAIRES DYNAMIQUES & FLASHCARDS */}
              {sessionStep === 3 && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Dynamic Quiz Builder */}
                  <div className="space-y-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-[#25D366]" />
                        <h4 className="font-bold text-sm text-[#111B21]">Questionnaire Dynamique de Validation</h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075E54] bg-white px-2.5 py-1 rounded-lg border border-emerald-300 hover:bg-emerald-50"
                      >
                        <Plus className="w-3 h-3" /> Ajouter une question
                      </button>
                    </div>

                    <div className="space-y-3">
                      {sessionForm.quizQuestions.map((q, qIdx) => (
                        <div key={q.id} className="p-3 bg-white rounded-xl border border-[#E9EDEF] space-y-2.5 shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-[#075E54]">Question {qIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(q.id)}
                              className="text-rose-600 hover:text-rose-800 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Énoncé de la question..."
                            value={q.text}
                            onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)}
                            className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-[#F0F2F5] font-semibold"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-semibold text-[#667781] mb-1">
                                Options (séparées par une virgule)
                              </label>
                              <input
                                type="text"
                                placeholder="Option 1, Option 2, Option 3..."
                                value={q.options.join(', ')}
                                onChange={(e) => handleUpdateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                                className="w-full p-1.5 rounded-lg border border-[#E9EDEF] bg-[#F0F2F5]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#667781] mb-1">
                                Réponse correcte
                              </label>
                              <input
                                type="text"
                                placeholder="Texte exact de la bonne réponse"
                                value={String(q.correctAnswer)}
                                onChange={(e) => handleUpdateQuestion(q.id, 'correctAnswer', e.target.value)}
                                className="w-full p-1.5 rounded-lg border border-[#E9EDEF] bg-[#F0F2F5] font-bold text-[#075E54]"
                              />
                            </div>
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="Explication pédagogique affichée lors de la correction..."
                              value={q.explanation}
                              onChange={(e) => handleUpdateQuestion(q.id, 'explanation', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-[#E9EDEF] bg-[#F0F2F5] text-[11px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flashcards Builder */}
                  <div className="space-y-3 p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <h4 className="font-bold text-sm text-[#111B21]">Flashcards & Cartes Mémoire ({sessionForm.flashcards.length})</h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFlashcard}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-300 hover:bg-amber-50"
                      >
                        <Plus className="w-3 h-3" /> Ajouter une Flashcard
                      </button>
                    </div>

                    <div className="space-y-3">
                      {sessionForm.flashcards.map((fc, fIdx) => (
                        <div key={fc.id} className="p-3 bg-white rounded-xl border border-[#E9EDEF] space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-amber-800">Carte Mémoire {fIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFlashcard(fc.id)}
                              className="text-rose-600 hover:text-rose-800 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-semibold text-[#667781] mb-1">
                                Recto (Question ou Terme)
                              </label>
                              <textarea
                                rows={2}
                                value={fc.front}
                                onChange={(e) => handleUpdateFlashcard(fc.id, 'front', e.target.value)}
                                className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-[#F0F2F5] text-xs font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#667781] mb-1">
                                Verso (Réponse ou Définition)
                              </label>
                              <textarea
                                rows={2}
                                value={fc.back}
                                onChange={(e) => handleUpdateFlashcard(fc.id, 'back', e.target.value)}
                                className="w-full p-2 rounded-lg border border-[#E9EDEF] bg-[#F0F2F5] text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Bottom Actions */}
              <div className="pt-3 border-t border-[#E9EDEF] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {sessionStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setSessionStep((prev) => (prev - 1) as any)}
                      className="px-3 py-1.5 font-semibold text-[#667781] bg-[#F0F2F5] rounded-xl hover:bg-[#E9EDEF]"
                    >
                      ← Étape précédente
                    </button>
                  )}
                  {sessionStep < 3 && (
                    <button
                      type="button"
                      onClick={() => setSessionStep((prev) => (prev + 1) as any)}
                      className="px-3 py-1.5 font-bold text-[#075E54] bg-emerald-100 rounded-xl hover:bg-emerald-200"
                    >
                      Étape suivante →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionModalOpen(false)}
                    className="px-4 py-2 font-semibold text-[#667781]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shadow-xs"
                  >
                    {editingSessionId ? 'Enregistrer la séance' : 'Publier la séance'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#E9EDEF] space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#111B21]">Confirmer la suppression</h3>
              <p className="text-xs text-[#667781] mt-1 leading-relaxed">
                Êtes-vous certain de vouloir supprimer : <strong>{deleteConfirm.name}</strong> ?
                {deleteConfirm.type === 'ue' && ' Toutes les séances, progressions et accès liés à cette UE seront supprimés.'}
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-[#667781]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === 'ue') handleDeleteUe(deleteConfirm.id);
                  else handleDeleteSession(deleteConfirm.id);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
