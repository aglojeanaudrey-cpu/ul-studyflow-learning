import React, { useState, useEffect } from "react";
import {
  UE,
  Session,
  Chapter,
  Department,
  Program,
  AcademicYear,
  QuizQuestion,
  Flashcard,
} from "../../types";
import { api } from "../../lib/api";
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
  Clock,
  ChevronDown,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Upload,
  Link as LinkIcon,
  Cloud,
  Calculator,
  Hash,
  Maximize2,
  Minimize2,
  Eye,
} from "lucide-react";
import { ReviewsModerationView } from "./ReviewsModerationView";
import { MediaUploader } from "./MediaUploader";
import { RichTextEditor } from "./rich-text";
import { RenderedContent } from "../student/RenderedContent";
import { estimatePdfPages, countWords } from "../../lib/pdf/estimatePages";
import { BlockStyle } from "../../types";

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

  // Expanded sessions for chapter visibility
  const [expandedSessions, setExpandedSessions] = useState<
    Record<string, boolean>
  >({});

  // ⭐ Vue mobile : 'list' = liste UE, 'detail' = séances de l'UE sélectionnée
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  // ⭐ Vue : 'courses' = gestion UE/séances/chapitres, 'reviews' = modération des avis
  const [adminView, setAdminView] = useState<"courses" | "reviews">("courses");

  // UE Modal State
  const [ueModalOpen, setUeModalOpen] = useState(false);
  const [editingUeId, setEditingUeId] = useState<string | null>(null);
  const [ueForm, setUeForm] = useState({
    code: "",
    title: "",
    description: "",
    objective: "",
    departmentId: "",
    programId: "",
    level: "L1" as "L1" | "L2" | "L3",
    semester: "Semestre 1 (Harmattan)",
    academicYear: "2025-2026",
    priceFcfa: 500,
    isPublished: true,
    isSuspended: false,
  });

  // Session Modal State
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState({
    sessionNumber: 1,
    estimatedMinutes: 45,
    title: "",
    description: "",
    objective: "",
    isPublished: true,
    isSuspended: false,
  });

  // Chapter Modal State
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterParentSessionId, setChapterParentSessionId] = useState<
    string | null
  >(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterStep, setChapterStep] = useState<1 | 2 | 3>(1);
  // ⭐ Mode plein écran pour l'édition de chapitre
  const [chapterFullscreen, setChapterFullscreen] = useState(true);

  const [chapterForm, setChapterForm] = useState({
    number: 1,
    title: "",
    objectives: "",
    summaryText: "",
    hasAudio: false,
    audioTitle: "",
    audioUrl: "",
    audioDuration: "10:00",
    audioSpeaker: "Équipe UL Study Flow (ulstudyflow@gmail.com)",
    hasVideo: false,
    videoTitle: "",
    videoUrl: "",
    videoDuration: "15:00",
    hasPdf: true,
    pdfTitle: "",
    pdfPages: 8,
    pdfSizeMb: 1.2,
    hasQuiz: false,
    quizTitle: "",
    quizPassingScore: 75,
    quizQuestions: [] as QuizQuestion[],
    flashcards: [] as Flashcard[],
  });

  // Contenu riche TipTap (HTML + JSON)
  const [chapterHtml, setChapterHtml] = useState<string>("");
  const [chapterJson, setChapterJson] = useState<any>(null);
  // Styles de blocs (largeur image, etc.)
  const [chapterBlocksStyle, setChapterBlocksStyle] = useState<
    Record<string, BlockStyle>
  >({});
  // Aperçu étudiant
  const [previewOpen, setPreviewOpen] = useState(false);

  // Mode d'upload pour médias : 'url' = URL externe, 'upload' = Cloudinary
  const [videoMode, setVideoMode] = useState<"url" | "upload">("url");
  const [audioMode, setAudioMode] = useState<"url" | "upload">("url");
  const [pdfMode, setPdfMode] = useState<"url" | "upload">("url");

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "ue" | "session" | "chapter";
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
        api.getAcademicMeta(),
      ]);
      setCourses(cRes.courses);
      setDepartments(metaRes.departments);
      setPrograms(metaRes.programs);
      setAcademicYears(metaRes.academicYears);

      if (cRes.courses.length > 0 && !selectedUe) {
        setSelectedUe(cRes.courses[0]);
      } else if (selectedUe) {
        const updated = cRes.courses.find((c) => c.id === selectedUe.id);
        if (updated) setSelectedUe(updated);
      }
    } catch (err) {
      console.error("Error loading courses and meta:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsForUe = async (ueId: string) => {
    try {
      const res = await api.getUe(ueId);
      setSessions(res.sessions);
      const expands: Record<string, boolean> = {};
      res.sessions.forEach((s) => {
        expands[s.id] = true;
      });
      setExpandedSessions(expands);
    } catch (err) {
      console.error("Error loading sessions for UE:", err);
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

  const toggleSessionExpand = (sessionId: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  const openCreateUeModal = () => {
    setEditingUeId(null);
    const firstDept = departments[0]?.id || "dept_faseg";
    const firstProg =
      programs.find((p) => p.departmentId === firstDept)?.id ||
      programs[0]?.id ||
      "prog_eco";
    setUeForm({
      code: "",
      title: "",
      description: "",
      objective: "",
      departmentId: firstDept,
      programId: firstProg,
      level: "L1",
      semester: "Semestre 1 (Harmattan)",
      academicYear:
        academicYears.find((a) => a.isCurrent)?.label || "2025-2026",
      priceFcfa: 500,
      isPublished: true,
      isSuspended: false,
    });
    setUeModalOpen(true);
  };

  const openEditUeModal = (ue: UE) => {
    setEditingUeId(ue.id);
    setUeForm({
      code: ue.code,
      title: ue.title,
      description: ue.description,
      objective: ue.objective || "",
      departmentId: ue.departmentId,
      programId: ue.programId,
      level: ue.level,
      semester: ue.semester,
      academicYear: ue.academicYear,
      priceFcfa: ue.priceFcfa,
      isPublished: ue.isPublished,
      isSuspended: Boolean(ue.isSuspended),
    });
    setUeModalOpen(true);
  };

  const handleSaveUe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...ueForm,
        id: editingUeId || undefined,
      };
      await api.saveUe(payload);
      setUeModalOpen(false);
      showSuccess(
        editingUeId
          ? `UE ${ueForm.code} mise à jour.`
          : `UE ${ueForm.code} créée avec succès.`,
      );
      await loadData();
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'enregistrement de l'UE.");
    }
  };

  const handleToggleSuspendUe = async (ue: UE) => {
    try {
      const res = await api.toggleSuspendUe(ue.id);
      showSuccess(
        `UE ${ue.code} ${res.isSuspended ? "suspendue" : "réactivée"}.`,
      );
      await loadData();
    } catch (err: any) {
      showError(err.message || "Erreur lors de la modification du statut.");
    }
  };

  const handleDeleteUe = async (ueId: string) => {
    try {
      await api.deleteUe(ueId);
      showSuccess("UE et toutes ses séances supprimées avec succès.");
      setDeleteConfirm(null);
      if (selectedUe?.id === ueId) {
        setSelectedUe(null);
      }
      await loadData();
    } catch (err: any) {
      showError(err.message || "Erreur de suppression.");
    }
  };

  // SESSIONS MANAGEMENT
  const openCreateSessionModal = () => {
    if (!selectedUe) return;
    setEditingSessionId(null);
    const nextNum = sessions.length + 1;
    setSessionForm({
      sessionNumber: nextNum,
      estimatedMinutes: 45,
      title: "",
      description: "",
      objective: "",
      isPublished: true,
      isSuspended: false,
    });
    setSessionModalOpen(true);
  };

  const openEditSessionModal = (session: Session) => {
    setEditingSessionId(session.id);
    setSessionForm({
      sessionNumber: session.sessionNumber,
      estimatedMinutes: session.estimatedMinutes,
      title: session.title,
      description: session.description || "",
      objective: session.objective || "",
      isPublished: session.isPublished,
      isSuspended: Boolean(session.isSuspended),
    });
    setSessionModalOpen(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUe) return;

    try {
      const payload: any = {
        id: editingSessionId || undefined,
        ueId: selectedUe.id,
        sessionNumber: sessionForm.sessionNumber,
        estimatedMinutes: sessionForm.estimatedMinutes,
        title: sessionForm.title,
        description: sessionForm.description,
        objective: sessionForm.objective,
        isPublished: sessionForm.isPublished,
        isSuspended: sessionForm.isSuspended,
      };

      await api.saveSession(payload);
      setSessionModalOpen(false);
      showSuccess(
        editingSessionId
          ? `Séance mise à jour avec succès.`
          : `Séance ${sessionForm.sessionNumber} créée avec succès.`,
      );
      await loadSessionsForUe(selectedUe.id);
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'enregistrement de la séance.");
    }
  };

  const handleToggleSuspendSession = async (s: Session) => {
    try {
      const res = await api.toggleSuspendSession(s.id);
      showSuccess(
        `Séance ${s.sessionNumber} ${res.isSuspended ? "suspendue" : "réactivée"}.`,
      );
      if (selectedUe) await loadSessionsForUe(selectedUe.id);
    } catch (err: any) {
      showError(err.message || "Erreur de modification.");
    }
  };

  const handleToggleSessionAccess = async (s: Session) => {
    if (s.sessionNumber === 1) {
      showError(
        "La 1ère séance d'une UE est obligatoirement gratuite et accessible à tous les étudiants (non verrouillable).",
      );
      return;
    }
    try {
      const res = await api.toggleSessionAccess(s.id);
      showSuccess(res.message);
      if (selectedUe) await loadSessionsForUe(selectedUe.id);
    } catch (err: any) {
      showError(err.message || "Action impossible.");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      showSuccess("Séance supprimée.");
      setDeleteConfirm(null);
      if (selectedUe) await loadSessionsForUe(selectedUe.id);
    } catch (err: any) {
      showError(err.message || "Erreur de suppression.");
    }
  };

  // CHAPTERS MANAGEMENT
  const openCreateChapterModal = (session: Session) => {
    setChapterParentSessionId(session.id);
    setEditingChapterId(null);
    setChapterStep(1);
    const nextChapNum = (session.chapters?.length || 0) + 1;

    setChapterForm({
      number: nextChapNum,
      title: "",
      objectives: "",
      summaryText: `### 1. Introduction au Chapitre ${nextChapNum}\nInsérez ici le contenu pédagogique et les concepts clés du chapitre.\n\n### 2. Notions et Démonstrations\n- Notion clé A\n- Notion clé B\n\n### 3. Synthèse pour l'examen\nRésumé synthétique des points cruciaux.`,
      hasAudio: false,
      audioTitle: `Podcast Chapitre ${nextChapNum} - ${session.title}`,
      audioUrl: "",
      audioDuration: "08:00",
      audioSpeaker: "Tuteur UL Study Flow (ulstudyflow@gmail.com)",
      hasVideo: false,
      videoTitle: `Vidéo Explicative Chapitre ${nextChapNum}`,
      videoUrl: "",
      videoDuration: "12:00",
      hasPdf: true,
      pdfTitle: `Fiche Chapitre ${nextChapNum} - ${session.title}`,
      pdfPages: 6,
      pdfSizeMb: 1.2,
      hasQuiz: false,
      quizTitle: `QCM d'auto-évaluation - Chapitre ${nextChapNum}`,
      quizPassingScore: 75,
      quizQuestions: [
        {
          id: "q_" + Date.now(),
          text: "Quelle est la notion fondamentale à retenir dans ce chapitre ?",
          type: "single",
          options: ["Option A (Correcte)", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A (Correcte)",
          explanation: "Explication pédagogique pas à pas pour l'étudiant.",
          points: 5,
        },
      ],
      flashcards: [
        {
          id: "fc_" + Date.now(),
          front: "Notion / Définition clé du chapitre ?",
          back: "Explication synthétique et formule à mémoriser pour l'examen.",
          category: "Notion Fondamentale",
        },
      ],
    });
    // Reset modes
    setVideoMode("url");
    setAudioMode("url");
    setPdfMode("url");
    // Reset contenu riche
    setChapterHtml("");
    setChapterJson(null);
    setChapterBlocksStyle({});
    setChapterModalOpen(true);
  };

  const openEditChapterModal = (chapter: Chapter, session: Session) => {
    setChapterParentSessionId(session.id);
    setEditingChapterId(chapter.id);
    setChapterStep(1);

    setChapterForm({
      number: chapter.number,
      title: chapter.title,
      objectives: chapter.objectives || "",
      summaryText: chapter.summaryText || "",
      hasAudio: Boolean(chapter.audio && chapter.audio.url),
      audioTitle: chapter.audio?.title || `Podcast Chapitre ${chapter.number}`,
      audioUrl: chapter.audio?.url || "",
      audioDuration: chapter.audio?.duration || "08:00",
      audioSpeaker:
        chapter.audio?.speaker || "UL Study Flow (ulstudyflow@gmail.com)",
      hasVideo: Boolean(chapter.video && chapter.video.url),
      videoTitle: chapter.video?.title || `Vidéo Chapitre ${chapter.number}`,
      videoUrl: chapter.video?.url || "",
      videoDuration: chapter.video?.duration || "12:00",
      hasPdf: Boolean(chapter.pdf && chapter.pdf.title),
      pdfTitle: chapter.pdf?.title || `Fiche Chapitre ${chapter.number}`,
      pdfPages: chapter.pdf?.pages || 6,
      pdfSizeMb: chapter.pdf?.sizeMb || 1.2,
      hasQuiz: Boolean(
        chapter.quiz &&
        chapter.quiz.questions &&
        chapter.quiz.questions.length > 0,
      ),
      quizTitle: chapter.quiz?.title || `QCM Chapitre ${chapter.number}`,
      quizPassingScore: chapter.quiz?.passingScorePercent || 75,
      quizQuestions: chapter.quiz?.questions || [],
      flashcards: chapter.flashcards || [],
    });

    // ⭐ Reset modes selon l'existant
    setVideoMode(
      chapter.video?.url?.includes("cloudinary.com") ? "upload" : "url",
    );
    setAudioMode(
      chapter.audio?.url?.includes("cloudinary.com") ? "upload" : "url",
    );
    setPdfMode(chapter.pdf?.url?.includes("cloudinary.com") ? "upload" : "url");
    // Charger le contenu riche existant
    setChapterHtml(chapter.summaryHtml || "");
    setChapterJson(chapter.summaryJson || null);
    setChapterBlocksStyle(chapter.summaryBlocksStyle || {});
    setChapterModalOpen(true);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🟢 handleSaveChapter appelé");
    console.log("   chapterParentSessionId:", chapterParentSessionId);
    console.log("   selectedUe:", selectedUe?.id);
    console.log("   form state:", chapterForm);
    // ⭐ Validation manuelle avec messages
    if (!chapterForm.title?.trim()) {
      showError("Le titre du chapitre est obligatoire.");
      setChapterStep(1);
      return;
    }
    if (!chapterForm.objectives?.trim()) {
      showError("Les objectifs pédagogiques sont obligatoires.");
      setChapterStep(1);
      return;
    }
    if (!chapterForm.summaryText?.trim()) {
      showError("Le contenu du cours est obligatoire.");
      setChapterStep(1);
      return;
    }
    if (!chapterParentSessionId || !selectedUe) {
      showError("Session ou UE manquante. Rechargez la page.");
      return;
    }
    if (!chapterParentSessionId || !selectedUe) {
      console.warn(
        "❌ Sortie prématurée : chapterParentSessionId ou selectedUe manquant",
      );
      return;
    }
    if (!chapterParentSessionId || !selectedUe) return;

    try {
      const payload: any = {
        id: editingChapterId || undefined,
        sessionId: chapterParentSessionId,
        number: chapterForm.number,
        title: chapterForm.title,
        objectives: chapterForm.objectives,
        summaryText: chapterForm.summaryText,
        summaryHtml: chapterHtml,
        summaryJson: chapterJson,
        summaryBlocksStyle: chapterBlocksStyle,
        video: chapterForm.hasVideo
          ? {
              title: chapterForm.videoTitle,
              url: chapterForm.videoUrl,
              duration: chapterForm.videoDuration,
              provider: chapterForm.videoUrl.includes("cloudinary.com")
                ? "cloudinary"
                : "external",
            }
          : {},
        audio: chapterForm.hasAudio
          ? {
              title: chapterForm.audioTitle,
              url: chapterForm.audioUrl,
              duration: chapterForm.audioDuration,
              speaker: chapterForm.audioSpeaker,
              provider: chapterForm.audioUrl.includes("cloudinary.com")
                ? "cloudinary"
                : "external",
            }
          : {},
        pdf: chapterForm.hasPdf
          ? {
              title: chapterForm.pdfTitle,
              url: chapterForm.audioUrl || "#",
              pages: chapterForm.pdfPages,
              sizeMb: chapterForm.pdfSizeMb,
              summaryMarkdown: "Support téléchargeable UL Study Flow",
              provider: (chapterForm as any).pdfUrl?.includes?.(
                "cloudinary.com",
              )
                ? "cloudinary"
                : "external",
            }
          : {},
        flashcards: chapterForm.flashcards,
        quiz: chapterForm.hasQuiz
          ? {
              title: chapterForm.quizTitle,
              passingScorePercent: chapterForm.quizPassingScore,
              questions: chapterForm.quizQuestions,
            }
          : false,
      };

      await api.saveChapter(payload);
      setChapterModalOpen(false);
      showSuccess(
        editingChapterId
          ? `Chapitre mis à jour avec succès.`
          : `Chapitre ${chapterForm.number} créé avec succès.`,
      );
      await loadSessionsForUe(selectedUe.id);
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'enregistrement du chapitre.");
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await api.deleteChapter(chapterId);
      showSuccess("Chapitre supprimé avec succès.");
      setDeleteConfirm(null);
      if (selectedUe) await loadSessionsForUe(selectedUe.id);
    } catch (err: any) {
      showError(err.message || "Erreur lors de la suppression du chapitre.");
    }
  };

  const handleAddFlashcard = () => {
    const newCard: Flashcard = {
      id: "fc_" + Date.now(),
      front: "Nouvelle notion / question du chapitre",
      back: "Explication / réponse synthétique",
      category: "Général",
    };
    setChapterForm({
      ...chapterForm,
      flashcards: [...chapterForm.flashcards, newCard],
    });
  };

  const handleUpdateFlashcard = (
    id: string,
    field: keyof Flashcard,
    value: string,
  ) => {
    setChapterForm({
      ...chapterForm,
      flashcards: chapterForm.flashcards.map((f) =>
        f.id === id ? { ...f, [field]: value } : f,
      ),
    });
  };

  const handleRemoveFlashcard = (id: string) => {
    setChapterForm({
      ...chapterForm,
      flashcards: chapterForm.flashcards.filter((f) => f.id !== id),
    });
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: "q_" + Date.now(),
      text: "Question relative à ce chapitre ?",
      type: "single",
      options: ["Choix A (Correct)", "Choix B", "Choix C", "Choix D"],
      correctAnswer: "Choix A (Correct)",
      explanation: "Explication détaillée pas à pas de la réponse.",
      points: 5,
    };
    setChapterForm({
      ...chapterForm,
      quizQuestions: [...chapterForm.quizQuestions, newQ],
    });
  };

  const handleUpdateQuestion = (
    id: string,
    field: keyof QuizQuestion,
    value: any,
  ) => {
    setChapterForm({
      ...chapterForm,
      quizQuestions: chapterForm.quizQuestions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q,
      ),
    });
  };

  const handleRemoveQuestion = (id: string) => {
    setChapterForm({
      ...chapterForm,
      quizQuestions: chapterForm.quizQuestions.filter((q) => q.id !== id),
    });
  };

  // Fermer la modal chapitre avec ESC
  React.useEffect(() => {
    if (!chapterModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChapterModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [chapterModalOpen]);

  const filteredProgramsForUe = programs.filter(
    (p) => p.departmentId === ueForm.departmentId,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white">
            Gestion des Cours & Architecture Pédagogique
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Architecture :{" "}
            <strong>
              Faculté / Département → Filière → UE → Séances → Chapitres
            </strong>{" "}
            (Médias, Résumé PDF, QCM & Flashcards).
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
      {/* ⭐ Navigation entre les 2 vues */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#111B21] p-1 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] w-fit">
        <button
          onClick={() => setAdminView("courses")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            adminView === "courses"
              ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]"
              : "text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          UE & Séances
        </button>
        <button
          onClick={() => setAdminView("reviews")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            adminView === "reviews"
              ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]"
              : "text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Modération des Avis
        </button>
      </div>

      {/* ⭐ VUE 1 : Modération des avis */}
      {adminView === "reviews" && <ReviewsModerationView />}

      {/* ⭐ VUE 2 : Layout responsive : mobile = 1 vue à la fois, desktop = 2 colonnes */}
      {adminView === "courses" && (
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
          {/* ============================================================ */}
          {/* COLONNE GAUCHE : LISTE DES UE                                */}
          {/* ============================================================ */}
          <div
            className={`lg:col-span-4 space-y-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:flex lg:flex-col ${
              mobileView === "detail" ? "hidden lg:flex" : "flex flex-col"
            }`}
          >
            <div className="flex items-center justify-between shrink-0">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
                Unités d'Enseignement ({courses.length})
              </h3>
              <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                Sélectionnez une UE
              </span>
            </div>

            <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden divide-y divide-[#E9EDEF] dark:divide-[#222E35] shadow-xs transition-colors lg:flex-1 lg:overflow-y-auto lg:min-h-0">
              {courses.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#667781] dark:text-[#8696A0]">
                  Aucune UE trouvée. Créez votre première UE.
                </div>
              ) : (
                courses.map((ue) => {
                  const isSelected = selectedUe?.id === ue.id;
                  const dept = departments.find(
                    (d) => d.id === ue.departmentId,
                  );
                  const prog = programs.find((p) => p.id === ue.programId);

                  return (
                    <div
                      key={ue.id}
                      onClick={() => {
                        setSelectedUe(ue);
                        setMobileView("detail");
                      }}
                      className={`p-4 cursor-pointer transition-colors relative ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-[#25D366]"
                          : "hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-white dark:bg-[#0B141A] px-2 py-0.5 rounded border border-[#E9EDEF] dark:border-[#222E35]">
                              {ue.code}
                            </span>
                            <span className="text-[10px] font-semibold text-[#667781] dark:text-[#8696A0] bg-[#F0F2F5] dark:bg-[#1F2C34] px-1.5 py-0.5 rounded">
                              {dept?.code || ue.departmentId} ·{" "}
                              {prog?.name || ue.programId}
                            </span>
                            <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                              {ue.level}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#111B21] dark:text-white mt-1.5">
                            {ue.title}
                          </h4>
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
                        <p className="text-[11px] text-[#075E54] dark:text-emerald-300 font-medium mt-1 line-clamp-1 italic">
                          🎯 Objectif: {ue.objective}
                        </p>
                      )}
                      <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5 line-clamp-2">
                        {ue.description}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-[#E9EDEF]/60 dark:border-[#222E35] flex items-center justify-between text-[11px]">
                        <span className="text-[#667781] dark:text-[#8696A0]">
                          {ue.priceFcfa} FCFA
                        </span>
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => openEditUeModal(ue)}
                            title="Modifier l'UE"
                            className="p-1 rounded text-[#075E54] dark:text-[#25D366] hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleSuspendUe(ue)}
                            title={
                              ue.isSuspended
                                ? "Réactiver l'UE"
                                : "Suspendre l'UE"
                            }
                            className="p-1 rounded text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors"
                          >
                            {ue.isSuspended ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: "ue",
                                id: ue.id,
                                name: `${ue.code} - ${ue.title}`,
                              })
                            }
                            title="Supprimer l'UE"
                            className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
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

          {/* ============================================================ */}
          {/* COLONNE DROITE : SÉANCES & CHAPITRES                         */}
          {/* ============================================================ */}
          <div
            className={`lg:col-span-8 space-y-3 ${
              mobileView === "list" ? "hidden lg:block" : "block"
            }`}
          >
            {/* ⭐ BOUTON RETOUR (mobile uniquement) */}
            {selectedUe && (
              <button
                onClick={() => setMobileView("list")}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] dark:hover:bg-[#222E35] rounded-xl transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Retour à la liste des UE
              </button>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
                  Séances de cours :{" "}
                  {selectedUe?.code || "Aucune UE sélectionnée"} (
                  {sessions.length})
                </h3>
                {selectedUe && (
                  <p className="text-[11px] text-[#075E54] dark:text-emerald-300 font-medium">
                    {selectedUe.title}
                  </p>
                )}
              </div>

              {selectedUe && (
                <button
                  onClick={openCreateSessionModal}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une séance
                </button>
              )}
            </div>

            <div className="space-y-4">
              {!selectedUe ? (
                <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-8 text-center text-xs text-[#667781] dark:text-[#8696A0]">
                  Veuillez sélectionner une Unité d'Enseignement pour gérer ses
                  séances et ses chapitres.
                </div>
              ) : sessions.length === 0 ? (
                <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-8 text-center text-xs text-[#667781] dark:text-[#8696A0] space-y-3">
                  <BookOpen className="w-8 h-8 text-[#25D366] mx-auto opacity-70" />
                  <p className="font-medium">
                    Aucune séance configurée pour cette UE.
                  </p>
                  <button
                    onClick={openCreateSessionModal}
                    className="px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all shadow-xs"
                  >
                    + Créer la Séance 01
                  </button>
                </div>
              ) : (
                sessions.map((s) => {
                  const isExpanded = expandedSessions[s.id] ?? true;
                  const chapters = s.chapters || [];

                  return (
                    <div
                      key={s.id}
                      className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden shadow-xs transition-colors"
                    >
                      {/* Session Header Card */}
                      <div className="p-4 sm:p-5 space-y-2.5 bg-linear-to-r from-[#F0F2F5]/50 to-transparent dark:from-[#1F2C34]/40 border-b border-[#E9EDEF] dark:border-[#222E35]">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => toggleSessionExpand(s.id)}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                              title={isExpanded ? "Réduire" : "Développer"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>

                            <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              Séance {s.sessionNumber}
                            </span>

                            <span className="text-xs text-[#667781] dark:text-[#8696A0] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {s.estimatedMinutes} min
                            </span>

                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                              {chapters.length} chapitre(s)
                            </span>

                            {s.sessionNumber === 1 ? (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] px-2 py-0.5 rounded font-bold border border-emerald-300 dark:border-emerald-800">
                                ⭐ Séance 01 Gratuite
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleSessionAccess(s)}
                                className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold border flex items-center gap-1 transition-all ${
                                  s.isLockedForUsers === false
                                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                                    : "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900"
                                }`}
                                title="Cliquer pour autoriser ou bloquer l'accès"
                              >
                                {s.isLockedForUsers === false ? (
                                  <Unlock className="w-3 h-3 text-[#25D366]" />
                                ) : (
                                  <Lock className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                )}
                                <span>
                                  {s.isLockedForUsers === false
                                    ? "Débloquée"
                                    : "Verrouillée"}
                                </span>
                              </button>
                            )}

                            {s.isSuspended && (
                              <span className="text-[10px] bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded font-bold border border-rose-200 dark:border-rose-900">
                                Suspendue
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => openEditSessionModal(s)}
                              title="Modifier les infos de la séance"
                              className="p-1.5 rounded text-[#075E54] dark:text-[#25D366] hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleSuspendSession(s)}
                              title={
                                s.isSuspended
                                  ? "Réactiver la séance"
                                  : "Suspendre la séance"
                              }
                              className="p-1.5 rounded text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors"
                            >
                              {s.isSuspended ? (
                                <Unlock className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: "session",
                                  id: s.id,
                                  name: `Séance ${s.sessionNumber} : ${s.title}`,
                                })
                              }
                              title="Supprimer la séance"
                              className="p-1.5 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-bold text-base text-[#111B21] dark:text-white">
                          {s.title}
                        </h4>

                        {s.objective && (
                          <p className="text-xs text-[#075E54] dark:text-emerald-300 font-medium">
                            🎯 <strong>Objectif de la séance :</strong>{" "}
                            {s.objective}
                          </p>
                        )}

                        {s.description && (
                          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
                            {s.description}
                          </p>
                        )}
                      </div>

                      {/* Chapters List within Session */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 space-y-3 bg-[#FAFAFA] dark:bg-[#0B141A]/50">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs uppercase tracking-wider text-[#667781] dark:text-[#8696A0] flex items-center gap-1.5">
                              <Bookmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              Chapitres ({chapters.length})
                            </h5>

                            <button
                              onClick={() => openCreateChapterModal(s)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Ajouter un Chapitre
                            </button>
                          </div>

                          {chapters.length === 0 ? (
                            <div className="p-6 text-center text-xs text-[#667781] dark:text-[#8696A0] bg-white dark:bg-[#111B21] rounded-xl border border-dashed border-[#E9EDEF] dark:border-[#222E35] space-y-2">
                              <p>Aucun chapitre créé pour cette séance.</p>
                              <button
                                onClick={() => openCreateChapterModal(s)}
                                className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 rounded-lg hover:bg-blue-100"
                              >
                                + Créer le Chapitre 01
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {chapters.map((ch) => (
                                <div
                                  key={ch.id}
                                  className="p-3.5 bg-white dark:bg-[#111B21] rounded-xl border border-[#E9EDEF] dark:border-[#222E35] space-y-2 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1 min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                                          Chapitre {ch.number}
                                        </span>
                                        <h6 className="font-bold text-sm text-[#111B21] dark:text-white">
                                          {ch.title}
                                        </h6>
                                      </div>

                                      {ch.objectives && (
                                        <p className="text-[11px] text-[#075E54] dark:text-emerald-300 font-medium italic">
                                          🎯 {ch.objectives}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() =>
                                          openEditChapterModal(ch, s)
                                        }
                                        title="Modifier ce chapitre"
                                        className="p-1 rounded text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setDeleteConfirm({
                                            type: "chapter",
                                            id: ch.id,
                                            name: `Chapitre ${ch.number} : ${ch.title}`,
                                          })
                                        }
                                        title="Supprimer ce chapitre"
                                        className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Chapter Module Badges */}
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]">
                                      <FileText className="w-3 h-3 text-[#075E54]" />
                                      Texte
                                    </span>

                                    {ch.pdf?.title && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                                        <FileText className="w-3 h-3 text-red-600" />
                                        PDF ({ch.pdf.pages || 6}p)
                                      </span>
                                    )}

                                    {ch.audio?.url && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                        <Volume2 className="w-3 h-3" />
                                        Audio
                                      </span>
                                    )}

                                    {ch.video?.url && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                                        <Video className="w-3 h-3" />
                                        Vidéo
                                      </span>
                                    )}

                                    {ch.quiz?.questions &&
                                      ch.quiz.questions.length > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#075E54] dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-semibold">
                                          <CheckSquare className="w-3 h-3 text-[#25D366]" />
                                          QCM ({ch.quiz.questions.length})
                                        </span>
                                      )}

                                    {ch.flashcards &&
                                      ch.flashcards.length > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                                          <Sparkles className="w-3 h-3 text-amber-600" />
                                          Flashcards ({ch.flashcards.length})
                                        </span>
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
      {/* Fin vue courses */}

      {/* -------------------------------------------------------------
          MODAL 1: CRÉER / MODIFIER UNE UE
      ------------------------------------------------------------- */}
      {ueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF] dark:border-[#222E35]">
              <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                {editingUeId
                  ? "Modifier l'Unité d'Enseignement"
                  : "Créer une nouvelle UE"}
              </h3>
              <button
                type="button"
                onClick={() => setUeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveUe} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Code UE (ex: ECO-101)
                  </label>
                  <input
                    type="text"
                    required
                    value={ueForm.code}
                    onChange={(e) =>
                      setUeForm({
                        ...ueForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Niveau LMD
                  </label>
                  <select
                    value={ueForm.level}
                    onChange={(e) =>
                      setUeForm({ ...ueForm, level: e.target.value as any })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="L1">Licence 1 (L1)</option>
                    <option value="L2">Licence 2 (L2)</option>
                    <option value="L3">Licence 3 (L3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Intitulé complet de l'UE
                </label>
                <input
                  type="text"
                  required
                  value={ueForm.title}
                  onChange={(e) =>
                    setUeForm({ ...ueForm, title: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Département / Faculté
                  </label>
                  <select
                    value={ueForm.departmentId}
                    onChange={(e) => {
                      const dId = e.target.value;
                      const firstProg =
                        programs.find((p) => p.departmentId === dId)?.id || "";
                      setUeForm({
                        ...ueForm,
                        departmentId: dId,
                        programId: firstProg,
                      });
                    }}
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Filière
                  </label>
                  <select
                    value={ueForm.programId}
                    onChange={(e) =>
                      setUeForm({ ...ueForm, programId: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    {filteredProgramsForUe.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  🎯 Objectif pédagogique général de l'UE
                </label>
                <textarea
                  rows={2}
                  value={ueForm.objective}
                  onChange={(e) =>
                    setUeForm({ ...ueForm, objective: e.target.value })
                  }
                  placeholder="Compétences visées, maîtrise des fondamentaux..."
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Description détaillée
                </label>
                <textarea
                  rows={3}
                  value={ueForm.description}
                  onChange={(e) =>
                    setUeForm({ ...ueForm, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Prix unitaire en FCFA
                  </label>
                  <input
                    type="number"
                    value={ueForm.priceFcfa}
                    onChange={(e) =>
                      setUeForm({
                        ...ueForm,
                        priceFcfa: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={ueForm.isPublished}
                      onChange={(e) =>
                        setUeForm({ ...ueForm, isPublished: e.target.checked })
                      }
                      className="w-4 h-4 text-[#25D366] rounded"
                    />
                    Publiée
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex justify-end gap-2">
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
                  {editingUeId ? "Mettre à jour l'UE" : "Créer l'UE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 2: CRÉER / MODIFIER UNE SÉANCE
      ------------------------------------------------------------- */}
      {sessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                    {editingSessionId
                      ? "Modifier la Séance"
                      : "Créer une Séance"}
                  </h3>
                  <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                    UE : {selectedUe?.code} - {selectedUe?.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSessionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={handleSaveSession}
              className="space-y-4 pt-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Numéro de séance *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={sessionForm.sessionNumber}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        sessionNumber: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-bold"
                  />
                  {sessionForm.sessionNumber === 1 && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                      ⭐ La séance 01 est automatiquement libre d'accès et
                      gratuite pour tous les étudiants.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Durée estimée (en minutes) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={sessionForm.estimatedMinutes}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        estimatedMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Titre de la séance *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Introduction aux équilibres macroéconomiques"
                  value={sessionForm.title}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, title: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  🎯 Objectif pédagogique de la séance
                </label>
                <textarea
                  rows={2}
                  placeholder="Ce que l'étudiant doit savoir et maîtriser à l'issue de cette séance..."
                  value={sessionForm.objective}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      objective: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Description brève
                </label>
                <textarea
                  rows={3}
                  placeholder="Présentation des thématiques abordées dans cette séance..."
                  value={sessionForm.description}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={sessionForm.isPublished}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        isPublished: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#25D366] rounded"
                  />
                  Séance publiée
                </label>
              </div>

              <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex justify-end gap-2">
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
                  {editingSessionId
                    ? "Mettre à jour la séance"
                    : "Créer la séance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
      MODAL 3: CRÉER / MODIFIER UN CHAPITRE (PLEIN ÉCRAN)
      ------------------------------------------------------------- */}
      {chapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0 bg-white dark:bg-[#0B141A] flex flex-col animate-in fade-in duration-150">
            {/* ============ HEADER PLEIN ÉCRAN ============ */}
            <header className="bg-[#075E54] dark:bg-[#111B21] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-[#128C7E] dark:border-[#222E35]">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center font-bold shrink-0">
                  <Bookmark className="w-4 h-4 text-blue-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm leading-tight truncate">
                    {editingChapterId
                      ? "Modifier le Chapitre"
                      : "Ajouter un Chapitre à la Séance"}
                  </h3>
                  <p className="text-[11px] text-emerald-200 truncate">
                    {selectedUe?.code} · Séance{" "}
                    {sessions.find((s) => s.id === chapterParentSessionId)
                      ?.sessionNumber || "?"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Toggle compact / plein écran (optionnel pour le futur) */}
                <button
                  type="button"
                  onClick={() => setChapterModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors"
                  title="Fermer (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* ============ STEPPER TABS (sticky) ============ */}
            <div className="bg-white dark:bg-[#111B21] border-b border-[#E9EDEF] dark:border-[#222E35] px-4 py-2.5 shrink-0">
              <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setChapterStep(1)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                    chapterStep === 1
                      ? "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                      : "bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0] border-transparent"
                  }`}
                >
                  1. Infos & Contenu
                </button>
                <button
                  type="button"
                  onClick={() => setChapterStep(2)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                    chapterStep === 2
                      ? "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                      : "bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0] border-transparent"
                  }`}
                >
                  2. Médias & PDF
                </button>
                <button
                  type="button"
                  onClick={() => setChapterStep(3)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                    chapterStep === 3
                      ? "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                      : "bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0] border-transparent"
                  }`}
                >
                  3. QCM & Flashcards
                </button>
              </div>
            </div>

            {/* ============ CONTENU (scrollable) ============ */}
            <form
              id="chapter-form"
              onSubmit={handleSaveChapter}
              className="flex-1 min-h-0 flex flex-col"
            >
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 text-xs">
                  {/* STEP 1: INFOS & TEXT CONTENT */}
                  {chapterStep === 1 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Numéro du chapitre *
                          </label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={chapterForm.number}
                            onChange={(e) =>
                              setChapterForm({
                                ...chapterForm,
                                number: Number(e.target.value),
                              })
                            }
                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Titre du chapitre *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Les hypothèses fondamentales du modèle"
                            value={chapterForm.title}
                            onChange={(e) =>
                              setChapterForm({
                                ...chapterForm,
                                title: e.target.value,
                              })
                            }
                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                          🎯 Objectifs pédagogiques du chapitre *
                        </label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Objectifs et compétences précises à acquérir dans ce chapitre..."
                          value={chapterForm.objectives}
                          onChange={(e) =>
                            setChapterForm({
                              ...chapterForm,
                              objectives: e.target.value,
                            })
                          }
                          className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300 items-center justify-between">
                          <span>Contenu du cours (éditeur riche) *</span>
                          <div className="flex items-center gap-3 text-[10px] font-normal text-[#667781] dark:text-[#8696A0]">
                            {chapterJson && (
                              <>
                                <span className="inline-flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  {countWords(chapterJson).toLocaleString(
                                    "fr-FR",
                                  )}{" "}
                                  mots
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Calculator className="w-3 h-3" />≈{" "}
                                  {estimatePdfPages(chapterJson)} page(s) PDF
                                </span>
                              </>
                            )}
                          </div>
                        </label>

                        <RichTextEditor
                          initialHtml={chapterHtml}
                          initialJson={chapterJson}
                          initialBlocksStyle={chapterBlocksStyle}
                          onChange={(data) => {
                            setChapterHtml(data.html);
                            setChapterJson(data.json);
                            setChapterBlocksStyle(data.blocksStyle);
                            setChapterForm({
                              ...chapterForm,
                              summaryText: data.html,
                            });
                          }}
                          placeholder="Rédigez le contenu pédagogique : définitions, formules, exemples, tableaux…"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: MEDIAS & SUPPORT PDF */}
                  {chapterStep === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                      {/* Résumé Synthétique PDF */}
                      <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-red-900 dark:text-red-300">
                          <input
                            type="checkbox"
                            checked={chapterForm.hasPdf}
                            onChange={(e) =>
                              setChapterForm({
                                ...chapterForm,
                                hasPdf: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-red-600 rounded"
                          />
                          <FileText className="w-4 h-4 text-red-600" />
                          Activer le Résumé Synthétique Téléchargeable par PDF
                        </label>

                        {chapterForm.hasPdf && (
                          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-red-200 dark:border-red-900">
                            <div className="col-span-2">
                              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                Titre de la fiche PDF
                              </label>
                              <input
                                type="text"
                                value={chapterForm.pdfTitle}
                                onChange={(e) =>
                                  setChapterForm({
                                    ...chapterForm,
                                    pdfTitle: e.target.value,
                                  })
                                }
                                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300 items-center gap-1">
                                <Calculator className="w-3 h-3 text-[#25D366]" />
                                Pages (auto)
                              </label>
                              <div className="w-full p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-between">
                                <span className="text-sm font-bold text-[#075E54] dark:text-[#25D366] tabular-nums">
                                  ≈{" "}
                                  {chapterJson
                                    ? estimatePdfPages(chapterJson)
                                    : 1}
                                </span>
                              </div>
                              <p className="text-[9px] text-[#667781] dark:text-[#8696A0] mt-0.5 italic">
                                Calculé automatiquement
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Audio Podcast */}
                      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-blue-900 dark:text-blue-300">
                          <input
                            type="checkbox"
                            checked={chapterForm.hasAudio}
                            onChange={(e) =>
                              setChapterForm({
                                ...chapterForm,
                                hasAudio: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <Volume2 className="w-4 h-4 text-blue-600" />
                          Média Audio / Podcast Explicatif
                        </label>

                        {chapterForm.hasAudio && (
                          <div className="space-y-3 pt-2 border-t border-blue-200 dark:border-blue-900">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                  Titre du podcast audio
                                </label>
                                <input
                                  type="text"
                                  value={chapterForm.audioTitle}
                                  onChange={(e) =>
                                    setChapterForm({
                                      ...chapterForm,
                                      audioTitle: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                  Durée audio
                                </label>
                                <input
                                  type="text"
                                  placeholder="08:30"
                                  value={chapterForm.audioDuration}
                                  onChange={(e) =>
                                    setChapterForm({
                                      ...chapterForm,
                                      audioDuration: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                URL du fichier Audio
                              </label>
                              <input
                                type="text"
                                placeholder="https://..."
                                value={chapterForm.audioUrl}
                                onChange={(e) =>
                                  setChapterForm({
                                    ...chapterForm,
                                    audioUrl: e.target.value,
                                  })
                                }
                                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vidéo Explicative */}
                      <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-purple-900 dark:text-purple-300">
                          <input
                            type="checkbox"
                            checked={chapterForm.hasVideo}
                            onChange={(e) =>
                              setChapterForm({
                                ...chapterForm,
                                hasVideo: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <Video className="w-4 h-4 text-purple-600" />
                          Média Vidéo Explicative du cours
                        </label>

                        {chapterForm.hasVideo && (
                          <div className="space-y-3 pt-2 border-t border-purple-200 dark:border-purple-900">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                  Titre de la vidéo
                                </label>
                                <input
                                  type="text"
                                  value={chapterForm.videoTitle}
                                  onChange={(e) =>
                                    setChapterForm({
                                      ...chapterForm,
                                      videoTitle: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                  Durée vidéo
                                </label>
                                <input
                                  type="text"
                                  placeholder="14:20"
                                  value={chapterForm.videoDuration}
                                  onChange={(e) =>
                                    setChapterForm({
                                      ...chapterForm,
                                      videoDuration: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                URL Vidéo / Embed
                              </label>
                              <input
                                type="text"
                                placeholder="https://..."
                                value={chapterForm.videoUrl}
                                onChange={(e) =>
                                  setChapterForm({
                                    ...chapterForm,
                                    videoUrl: e.target.value,
                                  })
                                }
                                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: QCM & FLASHCARDS */}
                  {chapterStep === 3 && (
                    <div className="space-y-5 animate-in fade-in">
                      {/* QCM Builder */}
                      <div className="space-y-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#111B21] dark:text-white">
                            <input
                              type="checkbox"
                              checked={chapterForm.hasQuiz}
                              onChange={(e) =>
                                setChapterForm({
                                  ...chapterForm,
                                  hasQuiz: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-[#25D366] rounded"
                            />
                            <CheckSquare className="w-4 h-4 text-[#25D366]" />
                            Activer le QCM d'auto-évaluation du chapitre
                          </label>

                          {chapterForm.hasQuiz && (
                            <button
                              type="button"
                              onClick={handleAddQuestion}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50"
                            >
                              <Plus className="w-3 h-3" /> Ajouter une question
                            </button>
                          )}
                        </div>

                        {chapterForm.hasQuiz && (
                          <div className="space-y-3 pt-2 border-t border-emerald-200 dark:border-emerald-900">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-2">
                                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                  Titre du QCM
                                </label>
                                <input
                                  type="text"
                                  value={chapterForm.quizTitle}
                                  onChange={(e) =>
                                    setChapterForm({
                                      ...chapterForm,
                                      quizTitle: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                  Score de validation (%)
                                </label>
                                <input
                                  type="number"
                                  value={chapterForm.quizPassingScore}
                                  onChange={(e) =>
                                    setChapterForm({
                                      ...chapterForm,
                                      quizPassingScore: Number(e.target.value),
                                    })
                                  }
                                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              {chapterForm.quizQuestions.map((q, qIdx) => (
                                <div
                                  key={q.id}
                                  className="p-3 bg-white dark:bg-[#111B21] rounded-xl border border-gray-200 dark:border-gray-700 space-y-2.5 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-xs text-[#075E54] dark:text-[#25D366]">
                                      Question {qIdx + 1}
                                    </span>
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
                                    onChange={(e) =>
                                      handleUpdateQuestion(
                                        q.id,
                                        "text",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 font-semibold"
                                  />

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                                        Options (séparées par des virgules)
                                      </label>
                                      <input
                                        type="text"
                                        value={q.options.join(", ")}
                                        onChange={(e) =>
                                          handleUpdateQuestion(
                                            q.id,
                                            "options",
                                            e.target.value
                                              .split(",")
                                              .map((s) => s.trim()),
                                          )
                                        }
                                        className="w-full p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                                        Réponse exacte
                                      </label>
                                      <input
                                        type="text"
                                        value={String(q.correctAnswer)}
                                        onChange={(e) =>
                                          handleUpdateQuestion(
                                            q.id,
                                            "correctAnswer",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 font-bold text-[#075E54] dark:text-[#25D366]"
                                      />
                                    </div>
                                  </div>

                                  <input
                                    type="text"
                                    placeholder="Explication pédagogique..."
                                    value={q.explanation}
                                    onChange={(e) =>
                                      handleUpdateQuestion(
                                        q.id,
                                        "explanation",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[11px]"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Flashcards Builder */}
                      <div className="space-y-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <h4 className="font-bold text-sm text-[#111B21] dark:text-white">
                              Flashcards ({chapterForm.flashcards.length})
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddFlashcard}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 hover:bg-amber-50"
                          >
                            <Plus className="w-3 h-3" /> Ajouter une Flashcard
                          </button>
                        </div>

                        <div className="space-y-3">
                          {chapterForm.flashcards.map((fc, fIdx) => (
                            <div
                              key={fc.id}
                              className="p-3 bg-white dark:bg-[#111B21] rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-xs text-amber-800 dark:text-amber-400">
                                  Carte {fIdx + 1}
                                </span>
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
                                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                                    Recto (Question)
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={fc.front}
                                    onChange={(e) =>
                                      handleUpdateFlashcard(
                                        fc.id,
                                        "front",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs font-medium"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                                    Verso (Réponse)
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={fc.back}
                                    onChange={(e) =>
                                      handleUpdateFlashcard(
                                        fc.id,
                                        "back",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* ============ FOOTER ACTIONS (sticky bottom) ============ */}
            <footer className="border-t border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] px-4 py-3 shrink-0">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {chapterStep > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setChapterStep((prev) => (prev - 1) as any)
                      }
                      className="px-3 py-1.5 font-semibold text-[#667781] dark:text-[#8696A0] bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200"
                    >
                      ← Étape précédente
                    </button>
                  )}
                  {chapterStep < 3 && (
                    <button
                      type="button"
                      onClick={() =>
                        setChapterStep((prev) => (prev + 1) as any)
                      }
                      className="px-3 py-1.5 font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 rounded-xl hover:bg-blue-200"
                    >
                      Étape suivante →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                    title="Voir comment l'étudiant verra ce chapitre"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Aperçu étudiant
                  </button>
                  <button
                    type="button"
                    onClick={() => setChapterModalOpen(false)}
                    className="px-4 py-2 font-semibold text-[#667781] dark:text-[#8696A0]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    form="chapter-form"
                    className="px-5 py-2 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xs"
                  >
                    {editingChapterId
                      ? "Enregistrer le chapitre"
                      : "Créer le chapitre"}
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* ⭐ MODAL APERÇU ÉTUDIANT */}
      {previewOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col">
          <header className="bg-[#075E54] dark:bg-[#111B21] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-[#128C7E] dark:border-[#222E35]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Eye className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">
                  Aperçu étudiant
                </h3>
                <p className="text-[11px] text-emerald-200">
                  Voici exactement ce que verra l'étudiant dans ce chapitre
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              title="Fermer l'aperçu"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-[#0B141A]">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {/* Titre + objectifs */}
              <div className="bg-linear-to-r from-blue-50/80 via-white to-blue-50/30 dark:from-blue-950/40 dark:via-[#111B21] dark:to-transparent rounded-3xl border border-blue-200 dark:border-blue-900 p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                    Chapitre {chapterForm.number}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-[#111B21] dark:text-white">
                    {chapterForm.title || "(Sans titre)"}
                  </h2>
                </div>
                {chapterForm.objectives && (
                  <div className="p-3 bg-blue-100/50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                    <strong>🎯 Objectifs pédagogiques du chapitre :</strong>{" "}
                    {chapterForm.objectives}
                  </div>
                )}
              </div>

              {/* Contenu riche */}
              <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#075E54] dark:text-[#25D366] border-b border-[#E9EDEF] dark:border-[#222E35] pb-3 mb-4">
                  <BookOpen className="w-4 h-4 text-[#25D366]" />
                  Contenu rédigé & Résumé synthétique du chapitre
                </div>
                {chapterHtml ? (
                  <RenderedContent
                    html={chapterHtml}
                    blocksStyle={chapterBlocksStyle}
                    className="text-[#111B21] dark:text-[#E9EDEF]"
                  />
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic text-xs">
                    Contenu pédagogique en cours de rédaction.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          DELETE CONFIRMATION MODAL
      ------------------------------------------------------------- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                Confirmer la suppression
              </h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1 leading-relaxed">
                Êtes-vous certain de vouloir supprimer :{" "}
                <strong>{deleteConfirm.name}</strong> ?
                {deleteConfirm.type === "ue" &&
                  " Toutes les séances, chapitres et contenus liés seront déplacés vers la corbeille."}
                {deleteConfirm.type === "session" &&
                  " Tous les chapitres, médias, QCM et Flashcards de cette séance seront déplacés vers la corbeille."}
                {deleteConfirm.type === "chapter" &&
                  " Tout le contenu multimédia et pédagogique de ce chapitre sera déplacé vers la corbeille."}
              </p>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                <Trash2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  💡 Cet élément sera conservé dans la{" "}
                  <strong>corbeille pendant 30 jours</strong>. Vous pourrez le
                  restaurer à tout moment depuis l'onglet{" "}
                  <strong>Corbeille</strong>.
                </span>
              </div>
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
                  if (deleteConfirm.type === "ue")
                    handleDeleteUe(deleteConfirm.id);
                  else if (deleteConfirm.type === "session")
                    handleDeleteSession(deleteConfirm.id);
                  else if (deleteConfirm.type === "chapter")
                    handleDeleteChapter(deleteConfirm.id);
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
