import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { QuizModal } from "./QuizModal";
import { UnlockUeModal } from "./UnlockUeModal";
import { SecureVideoPlayer } from "./SecureVideoPlayer";
import { SecureAudioPlayer } from "./SecureAudioPlayer";

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

  // Active Chapter Index
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  // Quiz Modal State
  const [quizOpen, setQuizOpen] = useState(false);

  // Unlock Modal State
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [pendingPromoCode, setPendingPromoCode] = useState<string | null>(null);

  // Flashcards Interactive State
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Anti-Screen Recording Warning State
  const [recordingWarning, setRecordingWarning] = useState(false);

  // ⭐ URLs média sécurisées (chargées à la demande)
  const [secureMedia, setSecureMedia] = useState<SecureMedia | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

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

  // Anti-capture and screen recording protection listener
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

  const handleCompleteManual = async () => {
    try {
      await api.completeSession(sessionId);
      setStatus("completed");
    } catch (err) {
      console.error("Error completing session:", err);
    }
  };

  // Extraction du chapitre actif AVANT les hooks qui en dépendent
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
              // Cast explicite pour éviter le conflit de provider
              video: session.content?.video,
              audio: session.content?.audio,
              pdf: session.content?.pdf,
              flashcards: session.flashcards || [],
              quiz: session.quiz,
            },
          ]
        : [];

  const currentChapter: Chapter | undefined = chapters[activeChapterIndex];

  // ⭐ Charger les URLs média sécurisées quand on change de chapitre
  useEffect(() => {
    if (!currentChapter) return;

    // Détecter si le média est protégé (Cloudinary) et sans URL publique
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

  // ─── Écran de chargement ───
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ─── Écran verrouillé / erreur ───
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

  // ⭐ Helper : récupérer l'URL média finale (signée si protégée, sinon directe)
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

  // ⭐ Watermark à transmettre aux players
  const watermarkName = user
    ? `${user.firstName} ${user.lastName?.[0] || ""}.`
    : undefined;
  const watermarkPhone = user?.displayPhone || user?.phone;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6 select-none">
      {/* Anti-Screen Recording Warning Banner */}
      {recordingWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 bg-rose-900 text-white text-xs rounded-2xl shadow-2xl border-2 border-rose-500 max-w-md w-full animate-bounce flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-300 shrink-0" />
          <div className="leading-tight">
            <strong>Protection des contenus UL Study Flow</strong>
            <p className="text-[11px] text-rose-200 mt-0.5">
              L'enregistrement et la capture d'écran sont strictement interdits
              sous peine de suspension immédiate du compte.
            </p>
          </div>
        </div>
      )}

      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à {ueCode}
        </button>

        <div className="flex items-center gap-2">
          {session.sessionNumber === 1 && (
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
              ⭐ Séance 01 Gratuite (Tous chapitres libres)
            </span>
          )}

          {status === "completed" ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
              Séance validée
            </span>
          ) : (
            <button
              onClick={handleCompleteManual}
              className="text-xs font-semibold text-[#075E54] dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-[#1F2C34] bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] px-3 py-1 rounded-full shadow-2xs transition-colors"
            >
              Marquer comme lue ✓
            </button>
          )}
        </div>
      </div>

      {/* Session Title Header Card */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-7 shadow-xs space-y-3 transition-colors">
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

        <h1 className="text-xl sm:text-2xl font-black text-[#111B21] dark:text-white">
          {session.title}
        </h1>

        {session.objective && (
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-2">
            <span className="text-sm">🎯</span>
            <div className="text-xs text-[#075E54] dark:text-emerald-300">
              <strong>Objectif de la séance :</strong> {session.objective}
            </div>
          </div>
        )}

        {session.description && (
          <p className="text-xs sm:text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed">
            {session.description}
          </p>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
          <button
            onClick={() => onAskAiWithContext(session.id)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-3.5 py-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
            Poser une question à l'IA sur cette séance
          </button>
        </div>
      </div>

      {/* Chapters Horizontal Tab Navigation */}
      {chapters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Chapitres du cours ({chapters.length})
            </h3>
            <span className="text-[11px] text-[#667781] dark:text-[#8696A0]">
              Chapitre {activeChapterIndex + 1} / {chapters.length}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {chapters.map((ch, idx) => {
              const isSelected = activeChapterIndex === idx;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChapterIndex(idx);
                    setCurrentFlashcardIndex(0);
                    setIsFlipped(false);
                    setSecureMedia(null);
                    setMediaError(null);
                  }}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-102"
                      : "bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white border-[#E9EDEF] dark:border-[#222E35] hover:border-blue-300"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected
                        ? "bg-white text-blue-600"
                        : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300"
                    }`}
                  >
                    {ch.number}
                  </span>
                  <span>{ch.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Chapter Details Header */}
      <div className="bg-linear-to-r from-blue-50/80 via-white to-blue-50/30 dark:from-blue-950/40 dark:via-[#111B21] dark:to-transparent rounded-3xl border border-blue-200 dark:border-blue-900 p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              Chapitre {currentChapter.number}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#111B21] dark:text-white">
              {currentChapter.title}
            </h2>
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

        {currentChapter.objectives && (
          <div className="p-3 bg-blue-100/50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200">
            <strong>🎯 Objectifs pédagogiques du chapitre :</strong>{" "}
            {currentChapter.objectives}
          </div>
        )}
      </div>

      {/* ⭐ Erreur de chargement média */}
      {mediaError && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{mediaError}</span>
        </div>
      )}

      {/* 1. Vidéo Explicative */}
      {currentChapter.video &&
        (currentChapter.video.url || currentChapter.video.isProtected) && (
          <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400">
                <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Vidéo explicative du chapitre (
                {currentChapter.video.duration || "Cours"})
              </div>
              <span className="text-[10px] text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-medium">
                🔒 Stream sécurisé
              </span>
            </div>

            {/* Cas 1 : Vidéo YouTube (fallback) */}
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
                    UL STUDY FLOW · {user?.displayPhone || user?.phone}
                  </div>
                  <div className="text-right">
                    CONFIDENTIEL · REVENTE INTERDITE
                  </div>
                </div>
              </div>
            ) : currentChapter.video.isProtected ? (
              // Cas 2 : Vidéo Cloudinary protégée → URL signée à charger
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
              // Cas 3 : Vidéo externe non Cloudinary (URL directe)
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
          </div>
        )}

      {/* 2. Audio Podcast */}
      {currentChapter.audio && (
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
              <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Podcast audio de révision (
              {currentChapter.audio.duration || "Podcast"})
            </div>
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
            <p className="text-xs text-[#667781] italic">Audio indisponible</p>
          )}
        </div>
      )}

      {/* 3. Contenu rédigé */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[#E9EDEF] dark:border-[#222E35] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#075E54] dark:text-[#25D366]">
            <BookOpen className="w-4 h-4 text-[#25D366]" />
            Contenu rédigé & Résumé synthétique du chapitre
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
            variant="secondary"
            label="Télécharger le PDF"
          />
        </div>

        {currentChapter.summaryHtml ? (
          <RenderedContent
            html={currentChapter.summaryHtml}
            blocksStyle={currentChapter.summaryBlocksStyle || {}}
            className="text-[#111B21] dark:text-[#E9EDEF]"
          />
        ) : currentChapter.summaryText ? (
          <div className="prose prose-sm max-w-none text-[#111B21] dark:text-[#E9EDEF] leading-relaxed space-y-4 text-xs sm:text-sm">
            {currentChapter.summaryText.split("\n\n").map((block, i) => {
              if (block.startsWith("### ")) {
                return (
                  <h3
                    key={i}
                    className="text-sm sm:text-base font-bold text-[#075E54] dark:text-[#25D366] pt-2"
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
                    className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300"
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
          <p className="text-slate-500 dark:text-slate-400 italic text-xs">
            Contenu pédagogique en cours de rédaction.
          </p>
        )}
      </div>

      {/* 4. Support PDF officiel */}
      {currentChapter.pdf && currentChapter.pdf.title && (
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#111B21] dark:text-white truncate">
                {currentChapter.pdf.title}
              </p>
              <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                {currentChapter.pdf.pages || 6} pages · Résumé synthétique
                téléchargeable par PDF
              </p>
            </div>
          </div>

          {currentChapter.pdf.isProtected ? (
            loadingMedia ? (
              <span className="text-[11px] text-[#667781] italic">
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
              <span className="text-[11px] text-[#667781] italic">
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
      )}

      {/* 5. Flashcards */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-7 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-[#111B21] dark:text-white">
              Flashcards & Cartes Mémoire ({flashcards.length})
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#667781] dark:text-[#8696A0]">
            Carte {currentFlashcardIndex + 1} sur {flashcards.length}
          </span>
        </div>

        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`min-h-42.5 p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
            isFlipped
              ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-[#25D366]"
              : "bg-[#F0F2F5] dark:bg-[#1F2C34] border-slate-200 dark:border-[#222E35] hover:border-[#25D366]"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[#667781] dark:text-[#8696A0]">
            <span className="font-bold uppercase tracking-wider text-[#075E54] dark:text-[#25D366]">
              {currentFlashcard.category || `Chapitre ${currentChapter.number}`}
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
              <RotateCw className="w-3 h-3" />
              {isFlipped
                ? "Verso (Réponse)"
                : "Recto (Question - Cliquez pour tourner)"}
            </span>
          </div>

          <div className="my-auto py-3 text-center">
            <p className="text-base sm:text-lg font-bold text-[#111B21] dark:text-white leading-relaxed">
              {isFlipped ? currentFlashcard.back : currentFlashcard.front}
            </p>
          </div>

          <div className="text-center text-[10px] text-[#667781] dark:text-[#8696A0]">
            {isFlipped
              ? "Cliquez pour voir la question"
              : "Cliquez n'importe où sur la carte pour révéler la réponse"}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            disabled={currentFlashcardIndex === 0}
            onClick={() => {
              setIsFlipped(false);
              setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédente
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-[#25D366]/20 hover:bg-[#25D366]/30 rounded-xl transition-colors"
          >
            Retourner la carte
          </button>

          <button
            disabled={currentFlashcardIndex === flashcards.length - 1}
            onClick={() => {
              setIsFlipped(false);
              setCurrentFlashcardIndex((prev) =>
                Math.min(flashcards.length - 1, prev + 1),
              );
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
          >
            Suivante
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6. QCM */}
      {activeQuiz && (
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border-2 border-[#25D366] p-6 sm:p-7 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#25D366]" />
              <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                {activeQuiz.title || `QCM d'auto-évaluation`}
              </h3>
            </div>
            {lastAttempt && (
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  lastAttempt.passed
                    ? "bg-emerald-100 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366]"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400"
                }`}
              >
                Dernier score : {lastAttempt.score}/{lastAttempt.maxScore} (
                {lastAttempt.percentage}%)
              </span>
            )}
          </div>

          <p className="text-xs text-[#667781] dark:text-[#8696A0] leading-relaxed">
            {activeQuiz.description ||
              "Répondez aux questions interactives du questionnaire pour tester votre maîtrise du chapitre et obtenir une correction détaillée."}
          </p>

          <button
            onClick={() => setQuizOpen(true)}
            className="w-full py-3 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-2xl hover:bg-[#1faa54] transition-all shadow-xs"
          >
            {lastAttempt ? "Repasser le QCM" : "Commencer le QCM"}
          </button>
        </div>
      )}

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
