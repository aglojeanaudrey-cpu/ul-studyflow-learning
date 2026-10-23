import React, { useState, useEffect, useRef } from "react";
import { Session, Chapter, QuizAttempt, Flashcard } from "../../types";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { PDFDownloadButton } from "./PDFDownloadButton";
import { RenderedContent } from "./RenderedContent";
import {
  ArrowLeft,
  CheckCircle2,
  Volume2,
  FileText,
  Video,
  CheckSquare,
  Sparkles,
  BookOpen,
  ShieldAlert,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Lock,
  Unlock,
  Clock,
  ArrowUp,
} from "lucide-react";
import { QuizModal } from "./QuizModal";
import { UnlockUeModal } from "./UnlockUeModal";
import { SecureVideoPlayer } from "./SecureVideoPlayer";
import { SecureAudioPlayer } from "./SecureAudioPlayer";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";

interface SessionViewProps {
  sessionId: string;
  onBack: () => void;
  onAskAiWithContext: (sessionId: string) => void;
}

interface SecureMedia {
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  watermarkText?: string;
  expiresIn?: number;
}

export const SessionView: React.FC<SessionViewProps> = ({
  sessionId,
  onBack,
  onAskAiWithContext,
}) => {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [ueTitle, setUeTitle] = useState("");
  const [ueCode, setUeCode] = useState("");
  const [ueId, setUeId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string>("in_progress");
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLockedError, setIsLockedError] = useState(false);

  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [pendingPromoCode, setPendingPromoCode] = useState<string | null>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [recordingWarning, setRecordingWarning] = useState(false);

  const [secureMedia, setSecureMedia] = useState<SecureMedia | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // ⭐ Barre de progression de lecture
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const isOnline = useOnlineStatus();

  // Chargement de la séance
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setIsLockedError(false);
        const res = await api.getSession(sessionId);
        setSession(res.session);
        setUeTitle(res.ueTitle);
        setUeCode(res.ueCode);
        setUeId(res.session.ueId);
        setStatus(res.progressStatus);
        setLastAttempt(res.lastQuizAttempt);
      } catch (err: any) {
        setError(err.message || "Impossible de charger la séance.");
        if (
          err.message &&
          (err.message.includes("bloquée") ||
            err.message.includes("déblocage") ||
            err.message.includes("accès"))
        ) {
          setIsLockedError(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  // Anti-capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.key === "p") ||
        (e.metaKey &&
          e.shiftKey &&
          (e.key === "3" || e.key === "4" || e.key === "5"))
      ) {
        setRecordingWarning(true);
        setTimeout(() => setRecordingWarning(false), 5000);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ⭐ Barre de progression de lecture
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = el.offsetHeight;
      const visibleTop = Math.max(0, windowHeight - rect.top);
      const progress = Math.min(
        100,
        Math.max(0, (visibleTop / totalHeight) * 100),
      );
      setReadProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeChapterIndex]);

  const handleCompleteManual = async () => {
    try {
      await api.completeSession(sessionId);
      setStatus("completed");
    } catch (err) {
      console.error("Error completing session:", err);
    }
  };

  const chapters: Chapter[] =
    session?.chapters && session.chapters.length > 0
      ? session.chapters
      : session
        ? [
            {
              id: `chap_${session.id}_fallback`,
              sessionId: session.id,
              number: 1,
              title: session.title,
              objectives: session.objective || "",
              summaryText: session.content?.summaryText || "",
              summaryHtml: "",
              summaryJson: {},
              video: session.content?.video,
              audio: session.content?.audio,
              pdf: session.content?.pdf,
              flashcards: session.flashcards || [],
              quiz: session.quiz,
            },
          ]
        : [];

  const currentChapter: Chapter | undefined = chapters[activeChapterIndex];

  useEffect(() => {
    if (!currentChapter) return;
    const videoNeedsUrl =
      currentChapter.video?.isProtected && !currentChapter.video?.url;
    const audioNeedsUrl =
      currentChapter.audio?.isProtected && !currentChapter.audio?.url;
    const pdfNeedsUrl =
      currentChapter.pdf?.isProtected && !currentChapter.pdf?.url;
    const needsSecureUrl = videoNeedsUrl || audioNeedsUrl || pdfNeedsUrl;

    if (!needsSecureUrl) {
      setSecureMedia(null);
      setMediaError(null);
      return;
    }

    let cancelled = false;
    setLoadingMedia(true);
    setMediaError(null);

    api
      .getSecureVideoUrl(currentChapter.id)
      .then((res: any) => {
        if (cancelled) return;
        setSecureMedia({
          videoUrl: res.videoUrl,
          audioUrl: res.audioUrl,
          pdfUrl: res.pdfUrl,
          watermarkText: res.watermarkText,
          expiresIn: res.expiresIn,
        });
      })
      .catch((err: any) => {
        if (cancelled) return;
        console.error("Erreur chargement média sécurisé:", err);
        setMediaError(
          err.message || "Impossible de charger le contenu protégé.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingMedia(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentChapter?.id]);

  // ═════════════════════════════════════════════════════════════════════
  // ─── ÉCRAN DE CHARGEMENT ───
  // ═════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // ─── ÉCRAN VERROUILLÉ ───
  // ═════════════════════════════════════════════════════════════════════
  if (error || !session || !currentChapter) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs border border-amber-200 dark:border-amber-800">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white">
            {isLockedError
              ? "Séance Réservée (Verrouillée)"
              : "Accès Restreint"}
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0] leading-relaxed">
            {error ||
              "Cette séance nécessite une autorisation ou un déblocage."}
          </p>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-xs text-[#075E54] dark:text-[#25D366] font-medium border border-emerald-200 dark:border-emerald-800 text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#25D366]" />
              Règle d'accès UL Study Flow :
            </p>
            <p className="text-[11px] text-[#128C7E] dark:text-emerald-300">
              • La <strong>1ère séance</strong> de chaque UE et{" "}
              <strong>tous ses chapitres</strong> sont{" "}
              <strong>100% gratuits et libres d'accès</strong> à tous les
              étudiants de Lomé.
            </p>
            <p className="text-[11px] text-[#128C7E] dark:text-emerald-300">
              • À partir de la <strong>2ème séance</strong>, les séances sont
              bloquées et nécessitent un déblocage auprès de l'administration.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
          >
            ← Retour à l'UE
          </button>
          <button
            onClick={() => setUnlockModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs"
          >
            <Unlock className="w-3.5 h-3.5" />
            Demande de déblocage UE (500 F)
          </button>
        </div>
        {unlockModalOpen && (
          <UnlockUeModal
            isOpen={unlockModalOpen}
            initialSelectedUeId={ueId}
            initialPromoCode={pendingPromoCode || undefined}
            onClose={() => setUnlockModalOpen(false)}
            onSuccess={() => {
              setUnlockModalOpen(false);
              setPendingPromoCode(null);
              window.location.reload();
            }}
          />
        )}
      </div>
    );
  }

  // ─── Variables dérivées ───
  const flashcards: Flashcard[] =
    currentChapter.flashcards && currentChapter.flashcards.length > 0
      ? currentChapter.flashcards
      : [
          {
            id: "fc_def_1",
            front: `Quel est l'objectif du chapitre ${currentChapter.number} ?`,
            back: currentChapter.objectives || currentChapter.title,
            category: "Objectif Pédagogique",
          },
        ];

  const currentFlashcard = flashcards[currentFlashcardIndex] || flashcards[0];
  const activeQuiz = currentChapter.quiz || session.quiz;

  const getVideoSrc = (): string | null => {
    if (currentChapter.video?.isProtected) {
      return secureMedia?.videoUrl || null;
    }
    return currentChapter.video?.url || null;
  };
  const getAudioSrc = (): string | null => {
    if (currentChapter.audio?.isProtected) {
      return secureMedia?.audioUrl || null;
    }
    return currentChapter.audio?.url || null;
  };
  const getPdfSrc = (): string | null => {
    if (currentChapter.pdf?.isProtected) {
      return secureMedia?.pdfUrl || null;
    }
    return currentChapter.pdf?.url || null;
  };

  const videoSrc = getVideoSrc();
  const audioSrc = getAudioSrc();
  const pdfSrc = getPdfSrc();

  const watermarkName = user
    ? `${user.firstName} ${user.lastName?.[0] || ""}.`
    : undefined;
  const watermarkPhone = user?.displayPhone || user?.phone;

  const hasPrevChapter = activeChapterIndex > 0;
  const hasNextChapter = activeChapterIndex < chapters.length - 1;

  const goToChapter = (idx: number) => {
    setActiveChapterIndex(idx);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    setSecureMedia(null);
    setMediaError(null);
    setReadProgress(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ═════════════════════════════════════════════════════════════════════
  // ─── RENDU PRINCIPAL ───
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="select-none min-h-screen bg-white dark:bg-[#0B141A]">
      {/* ⭐ Barre de progression de lecture (sticky top) */}
      <div className="sticky top-0 z-30 h-1 bg-transparent">
        <div
          className="h-full bg-[#25D366] transition-all duration-150 ease-out"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* ⭐ Bandeau protection anti-capture */}
      {recordingWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 bg-rose-900 text-white text-xs rounded-2xl shadow-2xl border-2 border-rose-500 max-w-md w-full animate-bounce flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-300 shrink-0" />
          <div className="leading-tight">
            <strong>Protection des contenus UL StudyFlow</strong>
            <p className="text-[11px] text-rose-200 mt-0.5">
              L'enregistrement et la capture d'écran sont strictement interdits
              sous peine de suspension immédiate du compte.
            </p>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs p-2 text-center border-b border-amber-200 dark:border-amber-900">
          Mode hors ligne. Les vidéos et audios nécessitent une connexion.
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══ HEADER STICKY DISCRET ═══ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-1 z-20 bg-white/95 dark:bg-[#0B141A]/95 backdrop-blur-md border-b border-[#E9EDEF] dark:border-[#222E35]">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] hover:underline transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour à {ueCode}</span>
            <span className="sm:hidden">Retour</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {session.sessionNumber === 1 && (
              <span className="hidden sm:inline text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                Séance 01 · Gratuite
              </span>
            )}

            {status === "completed" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-[#25D366]" />
                <span className="hidden sm:inline">Séance validée</span>
                <span className="sm:hidden">OK</span>
              </span>
            ) : (
              <button
                onClick={handleCompleteManual}
                className="text-[11px] font-semibold text-[#075E54] dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-[#1F2C34] bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] px-2.5 py-0.5 rounded-full shadow-2xs transition-colors shrink-0"
              >
                Marquer comme lue
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══ CONTENU PRINCIPAL ═══ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div ref={contentRef} className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {/* ─── HERO SÉANCE ─── */}
        <section className="py-8 sm:py-12 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#667781] dark:text-[#8696A0]">
            <span className="text-[#075E54] dark:text-[#25D366] font-extrabold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              {ueCode}
            </span>
            <span>·</span>
            <span className="font-bold text-[#111B21] dark:text-white">
              Séance {session.sessionNumber}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {session.estimatedMinutes} min
            </span>
            <span>·</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {chapters.length} chapitre(s)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111B21] dark:text-white leading-tight">
            {session.title}
          </h1>

          {session.description && (
            <p className="text-sm sm:text-base text-[#667781] dark:text-[#8696A0] leading-relaxed max-w-prose">
              {session.description}
            </p>
          )}

          {session.objective && (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-[#25D366] rounded-r-2xl flex items-start gap-3">
              <span className="text-lg">🎯</span>
              <div className="text-sm text-[#075E54] dark:text-emerald-300 leading-relaxed">
                <strong className="block text-xs uppercase tracking-wide mb-1">
                  Objectif de la séance
                </strong>
                {session.objective}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => onAskAiWithContext(session.id)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-3.5 py-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
              Poser une question à l'IA
            </button>
          </div>
        </section>

        <hr className="border-[#E9EDEF] dark:border-[#222E35]" />

        {/* ─── NAVIGATION CHAPITRES (tabs scrollables mobile-first) ─── */}
        <section className="py-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Chapitres du cours
            </h3>
            <span className="text-[11px] text-[#667781] dark:text-[#8696A0]">
              {activeChapterIndex + 1} / {chapters.length}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {chapters.map((ch, idx) => {
              const isSelected = activeChapterIndex === idx;
              return (
                <button
                  key={ch.id}
                  onClick={() => goToChapter(idx)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white border-[#E9EDEF] dark:border-[#222E35] hover:border-blue-300"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                      isSelected
                        ? "bg-white text-blue-600"
                        : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300"
                    }`}
                  >
                    {ch.number}
                  </span>
                  <span className="max-w-40 truncate">{ch.title}</span>
                </button>
              );
            })}
          </div>
        </section>

        <hr className="border-[#E9EDEF] dark:border-[#222E35]" />

        {/* ─── HERO CHAPITRE ─── */}
        <section className="py-8 sm:py-10 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800 tracking-wide">
                CHAPITRE {currentChapter.number}
              </span>
            </div>
            <PDFDownloadButton
              ueTitle={ueTitle}
              ueCode={ueCode}
              sessionNumber={session.sessionNumber}
              sessionTitle={session.title}
              chapterNumber={currentChapter.number}
              chapterTitle={currentChapter.title}
              objectives={currentChapter.objectives}
              contentJson={currentChapter.summaryJson}
              contentHtml={
                currentChapter.summaryHtml || currentChapter.summaryText
              }
              studentName={
                user ? `${user.firstName} ${user.lastName}` : undefined
              }
              variant="primary"
              label="PDF Synthèse"
            />
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111B21] dark:text-white leading-tight max-w-prose">
            {currentChapter.title}
          </h2>

          {currentChapter.objectives && (
            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 border-l-4 border-blue-500 rounded-r-2xl">
              <div className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                <strong className="block text-xs uppercase tracking-wide mb-1 text-blue-700 dark:text-blue-300">
                  🎯 Objectifs pédagogiques
                </strong>
                {currentChapter.objectives}
              </div>
            </div>
          )}
        </section>

        <hr className="border-[#E9EDEF] dark:border-[#222E35]" />

        {/* ⭐ Erreur de chargement média */}
        {mediaError && (
          <div className="my-6 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{mediaError}</span>
          </div>
        )}

        {/* ─── VIDÉO (si présente) ─── */}
        {currentChapter.video &&
          (currentChapter.video.url || currentChapter.video.isProtected) && (
            <section className="py-8 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Vidéo explicative
                  {currentChapter.video.duration && (
                    <span className="text-xs font-normal text-[#667781] dark:text-[#8696A0]">
                      ({currentChapter.video.duration})
                    </span>
                  )}
                </h3>
                <span className="text-[10px] text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-medium">
                  🔒 Stream sécurisé
                </span>
              </div>

              {currentChapter.video.url &&
              typeof currentChapter.video.url === "string" &&
              (currentChapter.video.url.includes("youtube.com") ||
                currentChapter.video.url.includes("youtu.be") ||
                currentChapter.video.url.includes("youtube-nocookie.com")) ? (
                <div
                  className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative border border-slate-800"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <iframe
                    src={currentChapter.video.url}
                    title={currentChapter.video.title}
                    className="w-full h-full pointer-events-auto"
                    allowFullScreen
                  ></iframe>
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 opacity-25 select-none text-[10px] text-white font-mono">
                    <div className="text-left">
                      UL STUDYFLOW · {user?.displayPhone || user?.phone}
                    </div>
                    <div className="text-right">
                      CONFIDENTIEL · REVENTE INTERDITE
                    </div>
                  </div>
                </div>
              ) : currentChapter.video.isProtected ? (
                loadingMedia ? (
                  <div className="aspect-video bg-black rounded-2xl flex items-center justify-center">
                    <div className="text-white text-xs flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Chargement sécurisé...
                    </div>
                  </div>
                ) : videoSrc ? (
                  <SecureVideoPlayer
                    src={videoSrc}
                    poster={currentChapter.video.thumbnail_url}
                    title={currentChapter.video.title || currentChapter.title}
                    watermarkName={watermarkName}
                    watermarkPhone={watermarkPhone}
                    isProtected={true}
                    onCaptureDetected={(reason) => {
                      console.warn("[Anti-Capture]", reason);
                    }}
                  />
                ) : (
                  <div className="aspect-video bg-black rounded-2xl flex items-center justify-center">
                    <p className="text-white text-xs">
                      Vidéo indisponible (accès restreint)
                    </p>
                  </div>
                )
              ) : videoSrc ? (
                <SecureVideoPlayer
                  src={videoSrc}
                  poster={currentChapter.video.thumbnail_url}
                  title={currentChapter.video.title || currentChapter.title}
                  watermarkName={watermarkName}
                  watermarkPhone={watermarkPhone}
                  isProtected={true}
                  onCaptureDetected={(reason) => {
                    console.warn("[Anti-Capture]", reason);
                  }}
                />
              ) : (
                <div className="aspect-video bg-black rounded-2xl flex items-center justify-center">
                  <p className="text-white text-xs">Vidéo indisponible</p>
                </div>
              )}
            </section>
          )}

        {/* ─── AUDIO (si présent) ─── */}
        {currentChapter.audio && (
          <section className="py-6 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Podcast audio de révision
                {currentChapter.audio.duration && (
                  <span className="text-xs font-normal text-[#667781] dark:text-[#8696A0]">
                    ({currentChapter.audio.duration})
                  </span>
                )}
              </h3>
              <span className="text-[10px] text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-medium">
                🔒 Audio protégé
              </span>
            </div>

            {currentChapter.audio.isProtected ? (
              loadingMedia ? (
                <div className="p-6 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-2xl flex items-center justify-center">
                  <div className="text-xs text-[#667781] flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Chargement sécurisé...
                  </div>
                </div>
              ) : audioSrc ? (
                <SecureAudioPlayer
                  src={audioSrc}
                  title={
                    currentChapter.audio.title ||
                    `Podcast Chapitre ${currentChapter.number}`
                  }
                  speaker={currentChapter.audio.speaker}
                  watermarkName={watermarkName}
                  isProtected={true}
                />
              ) : (
                <p className="text-xs text-[#667781] italic">
                  Audio indisponible (accès restreint)
                </p>
              )
            ) : audioSrc ? (
              <SecureAudioPlayer
                src={audioSrc}
                title={
                  currentChapter.audio.title ||
                  `Podcast Chapitre ${currentChapter.number}`
                }
                speaker={currentChapter.audio.speaker}
                watermarkName={watermarkName}
                isProtected={true}
              />
            ) : (
              <p className="text-xs text-[#667781] italic">
                Audio indisponible
              </p>
            )}
          </section>
        )}

        {/* ─── CONTENU RÉDIGÉ (le cœur du document) ─── */}
        <section className="py-8 space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E9EDEF] dark:border-[#222E35]">
            <h3 className="text-sm font-bold text-[#075E54] dark:text-[#25D366] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Contenu du chapitre
            </h3>
            <PDFDownloadButton
              ueTitle={ueTitle}
              ueCode={ueCode}
              sessionNumber={session.sessionNumber}
              sessionTitle={session.title}
              chapterNumber={currentChapter.number}
              chapterTitle={currentChapter.title}
              objectives={currentChapter.objectives}
              contentJson={currentChapter.summaryJson}
              contentHtml={
                currentChapter.summaryHtml || currentChapter.summaryText
              }
              studentName={
                user ? `${user.firstName} ${user.lastName}` : undefined
              }
              variant="secondary"
              label="Télécharger le PDF"
            />
          </div>

          <div className="max-w-prose">
            {currentChapter.summaryHtml ? (
              <RenderedContent
                html={currentChapter.summaryHtml}
                blocksStyle={currentChapter.summaryBlocksStyle || {}}
                className="text-[#111B21] dark:text-[#E9EDEF] text-[15px] sm:text-base leading-relaxed"
              />
            ) : currentChapter.summaryText ? (
              <div className="prose prose-sm max-w-none text-[#111B21] dark:text-[#E9EDEF] leading-relaxed space-y-4 text-[15px] sm:text-base">
                {currentChapter.summaryText.split("\n\n").map((block, i) => {
                  if (block.startsWith("### ")) {
                    return (
                      <h3
                        key={i}
                        className="text-lg sm:text-xl font-bold text-[#075E54] dark:text-[#25D366] pt-4 mt-6 border-t border-[#E9EDEF] dark:border-[#222E35] first:border-t-0 first:mt-0 first:pt-0"
                      >
                        {block.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (block.startsWith("- ")) {
                    const items = block.split("\n");
                    return (
                      <ul
                        key={i}
                        className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300"
                      >
                        {items.map((it, j) => (
                          <li key={j}>{it.replace("- ", "")}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="text-slate-800 dark:text-slate-200">
                      {block}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic text-sm">
                Contenu pédagogique en cours de rédaction.
              </p>
            )}
          </div>
        </section>

        <hr className="border-[#E9EDEF] dark:border-[#222E35]" />

        {/* ─── SUPPORT PDF ─── */}
        {currentChapter.pdf && currentChapter.pdf.title && (
          <section className="py-6">
            <div className="p-5 bg-red-50/40 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#111B21] dark:text-white truncate">
                    {currentChapter.pdf.title}
                  </p>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0]">
                    {currentChapter.pdf.pages || 6} pages · Fiche de synthèse
                  </p>
                </div>
              </div>

              {currentChapter.pdf.isProtected ? (
                loadingMedia ? (
                  <span className="text-xs text-[#667781] italic">
                    Chargement...
                  </span>
                ) : pdfSrc ? (
                  <a
                    href={pdfSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Ouvrir le PDF
                  </a>
                ) : (
                  <span className="text-xs text-[#667781] italic">
                    PDF indisponible
                  </span>
                )
              ) : (
                <PDFDownloadButton
                  ueTitle={ueTitle}
                  ueCode={ueCode}
                  sessionNumber={session.sessionNumber}
                  sessionTitle={session.title}
                  chapterNumber={currentChapter.number}
                  chapterTitle={currentChapter.title}
                  objectives={currentChapter.objectives}
                  contentJson={currentChapter.summaryJson}
                  contentHtml={
                    currentChapter.summaryHtml || currentChapter.summaryText
                  }
                  studentName={
                    user ? `${user.firstName} ${user.lastName}` : undefined
                  }
                  variant="primary"
                  label="Télécharger le PDF"
                />
              )}
            </div>
          </section>
        )}

        {/* ─── FLASHCARDS ─── */}
        <section className="py-8 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-[#111B21] dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Flashcards & Cartes Mémoire
              <span className="text-xs font-normal text-[#667781] dark:text-[#8696A0]">
                ({flashcards.length})
              </span>
            </h3>
            <span className="text-xs font-semibold text-[#667781] dark:text-[#8696A0]">
              {currentFlashcardIndex + 1} / {flashcards.length}
            </span>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-48 p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
              isFlipped
                ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-[#25D366]"
                : "bg-[#F0F2F5] dark:bg-[#1F2C34] border-slate-200 dark:border-[#222E35] hover:border-[#25D366]"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-[#667781] dark:text-[#8696A0]">
              <span className="font-bold uppercase tracking-wider text-[#075E54] dark:text-[#25D366]">
                {currentFlashcard.category ||
                  `Chapitre ${currentChapter.number}`}
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
                <RotateCw className="w-3 h-3" />
                {isFlipped ? "Verso (Réponse)" : "Recto (Question)"}
              </span>
            </div>

            <div className="my-auto py-4 text-center">
              <p className="text-base sm:text-lg font-bold text-[#111B21] dark:text-white leading-relaxed">
                {isFlipped ? currentFlashcard.back : currentFlashcard.front}
              </p>
            </div>

            <div className="text-center text-[10px] text-[#667781] dark:text-[#8696A0]">
              {isFlipped
                ? "Cliquez pour voir la question"
                : "Cliquez sur la carte pour révéler la réponse"}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 gap-2">
            <button
              disabled={currentFlashcardIndex === 0}
              onClick={() => {
                setIsFlipped(false);
                setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));
              }}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Précédente</span>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-[#25D366]/20 hover:bg-[#25D366]/30 rounded-xl transition-colors"
            >
              Retourner
            </button>

            <button
              disabled={currentFlashcardIndex === flashcards.length - 1}
              onClick={() => {
                setIsFlipped(false);
                setCurrentFlashcardIndex((prev) =>
                  Math.min(flashcards.length - 1, prev + 1),
                );
              }}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
            >
              <span className="hidden sm:inline">Suivante</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ─── QCM ─── */}
        {activeQuiz && (
          <section className="py-8 space-y-4">
            <div className="p-6 bg-emerald-50/60 dark:bg-emerald-950/30 border-2 border-[#25D366]/60 rounded-3xl space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-[#111B21] dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#25D366]" />
                  {activeQuiz.title || `QCM d'auto-évaluation`}
                </h3>
                {lastAttempt && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      lastAttempt.passed
                        ? "bg-emerald-100 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366]"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400"
                    }`}
                  >
                    Dernier : {lastAttempt.score}/{lastAttempt.maxScore} (
                    {lastAttempt.percentage}%)
                  </span>
                )}
              </div>

              <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed max-w-prose">
                {activeQuiz.description ||
                  "Répondez aux questions interactives pour tester votre maîtrise du chapitre et obtenir une correction détaillée."}
              </p>

              <button
                onClick={() => setQuizOpen(true)}
                className="w-full py-3 text-sm font-bold text-[#075E54] bg-[#25D366] rounded-2xl hover:bg-[#1faa54] transition-all shadow-xs"
              >
                {lastAttempt ? "Repasser le QCM" : "Commencer le QCM"}
              </button>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ═══ NAVIGATION ENTRE CHAPITRES (bas de page) ═══ */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="pt-8 border-t border-[#E9EDEF] dark:border-[#222E35]">
          <div className="flex items-stretch justify-between gap-3">
            {hasPrevChapter ? (
              <button
                onClick={() => goToChapter(activeChapterIndex - 1)}
                className="flex-1 text-left p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all group"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] mb-1">
                  <ChevronLeft className="w-3 h-3" />
                  Chapitre précédent
                </div>
                <p className="text-sm font-bold text-[#111B21] dark:text-white line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {chapters[activeChapterIndex - 1].title}
                </p>
              </button>
            ) : (
              <div className="flex-1" />
            )}

            {hasNextChapter ? (
              <button
                onClick={() => goToChapter(activeChapterIndex + 1)}
                className="flex-1 text-right p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all group"
              >
                <div className="flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] mb-1">
                  Chapitre suivant
                  <ChevronRight className="w-3 h-3" />
                </div>
                <p className="text-sm font-bold text-[#111B21] dark:text-white line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {chapters[activeChapterIndex + 1].title}
                </p>
              </button>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>

        {/* ─── Bouton "Retour en haut" flottant ─── */}
        {readProgress > 30 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-20 w-11 h-11 rounded-full bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            aria-label="Retour en haut"
            title="Retour en haut"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>

      {activeQuiz && (
        <QuizModal
          isOpen={quizOpen}
          quiz={activeQuiz}
          onClose={() => setQuizOpen(false)}
          onSuccess={(attempt) => {
            setLastAttempt(attempt);
            if (attempt.passed) setStatus("completed");
          }}
        />
      )}
    </div>
  );
};
