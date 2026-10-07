import React, { useState, useEffect, useRef } from 'react';
import { Session, Chapter, QuizAttempt, Flashcard } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  FileText,
  Video,
  CheckSquare,
  Sparkles,
  Download,
  BookOpen,
  ShieldAlert,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Lock,
  Unlock,
  Clock
} from 'lucide-react';
import { QuizModal } from './QuizModal';
import { UnlockUeModal } from './UnlockUeModal';

interface SessionViewProps {
  sessionId: string;
  onBack: () => void;
  onAskAiWithContext: (sessionId: string) => void;
}

export const SessionView: React.FC<SessionViewProps> = ({
  sessionId,
  onBack,
  onAskAiWithContext
}) => {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [ueTitle, setUeTitle] = useState('');
  const [ueCode, setUeCode] = useState('');
  const [ueId, setUeId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string>('in_progress');
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLockedError, setIsLockedError] = useState(false);

  // Active Chapter Index
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Quiz Modal State
  const [quizOpen, setQuizOpen] = useState(false);

  // Unlock Modal State
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  // Flashcards Interactive State
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Anti-Screen Recording Warning State
  const [recordingWarning, setRecordingWarning] = useState(false);

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
        setError(err.message || 'Impossible de charger la séance.');
        if (err.message && (err.message.includes('bloquée') || err.message.includes('déblocage') || err.message.includes('accès'))) {
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
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))) {
        setRecordingWarning(true);
        setTimeout(() => setRecordingWarning(false), 5000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setAudioSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleCompleteManual = async () => {
    try {
      await api.completeSession(sessionId);
      setStatus('completed');
    } catch (err) {
      console.error('Error completing session:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Locked session or error screen
  if (error || !session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs border border-amber-200 dark:border-amber-800">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white">
            {isLockedError ? 'Séance Réservée (Verrouillée)' : 'Accès Restreint'}
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0] leading-relaxed">
            {error || 'Cette séance nécessite une autorisation ou un déblocage.'}
          </p>

          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-xs text-[#075E54] dark:text-[#25D366] font-medium border border-emerald-200 dark:border-emerald-800 text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#25D366]" />
              Règle d'accès UL Study Flow :
            </p>
            <p className="text-[11px] text-[#128C7E] dark:text-emerald-300">
              • La <strong>1ère séance</strong> de chaque UE et <strong>tous ses chapitres</strong> sont <strong>100% gratuits et libres d'accès</strong> à tous les étudiants de Lomé.
            </p>
            <p className="text-[11px] text-[#128C7E] dark:text-emerald-300">
              • À partir de la <strong>2ème séance</strong>, les séances sont bloquées et nécessitent un déblocage auprès de l'administration.
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
            onClose={() => setUnlockModalOpen(false)}
            onSuccess={() => {
              setUnlockModalOpen(false);
              window.location.reload();
            }}
          />
        )}
      </div>
    );
  }

  // Determine chapters or fallback
  const chapters: Chapter[] = (session.chapters && session.chapters.length > 0)
    ? session.chapters
    : [{
        id: `chap_${session.id}_fallback`,
        sessionId: session.id,
        number: 1,
        title: session.title,
        objectives: session.objective || '',
        summaryText: session.content?.summaryText || '',
        video: session.content?.video,
        audio: session.content?.audio,
        pdf: session.content?.pdf,
        flashcards: session.flashcards || [],
        quiz: session.quiz
      }];

  const currentChapter: Chapter = chapters[activeChapterIndex] || chapters[0];

  // Download printable summary as PDF for the current chapter
  const handleDownloadSummaryPdf = () => {
    if (!session || !currentChapter) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${ueCode} - Séance ${session.sessionNumber} - Chapitre ${currentChapter.number} : ${currentChapter.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { color: #075E54; margin-bottom: 5px; }
            .header { border-bottom: 2px solid #25D366; padding-bottom: 15px; margin-bottom: 25px; }
            .meta { font-size: 13px; color: #555; }
            .objective { background: #e8f5e9; padding: 12px; border-left: 4px solid #25D366; margin-bottom: 20px; font-weight: 500; font-size: 14px; }
            .content { font-size: 15px; white-space: pre-wrap; }
            .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 11px; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>UL STUDY FLOW · FICHE DE RÉVISION & SYNTHÈSE</h1>
            <div class="meta">${ueCode} - ${ueTitle} | Séance ${session.sessionNumber} : ${session.title} | Chapitre ${currentChapter.number} : ${currentChapter.title}</div>
          </div>
          ${currentChapter.objectives ? `<div class="objective">🎯 Objectifs du chapitre : ${currentChapter.objectives}</div>` : ''}
          <div class="content">${currentChapter.summaryText || 'Contenu pédagogique UL Study Flow'}</div>
          <div class="footer">Édité par UL Study Flow · Plateforme EdTech par les étudiants pour les étudiants (Lomé, Togo) · Contact: ulstudyflow@gmail.com</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const flashcards: Flashcard[] = (currentChapter.flashcards && currentChapter.flashcards.length > 0)
    ? currentChapter.flashcards
    : [
        {
          id: 'fc_def_1',
          front: `Quel est l'objectif du chapitre ${currentChapter.number} ?`,
          back: currentChapter.objectives || currentChapter.title,
          category: 'Objectif Pédagogique'
        }
      ];

  const currentFlashcard = flashcards[currentFlashcardIndex] || flashcards[0];
  const activeQuiz = currentChapter.quiz || session.quiz;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6 select-none">
      {/* Anti-Screen Recording Warning Banner */}
      {recordingWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 bg-rose-900 text-white text-xs rounded-2xl shadow-2xl border-2 border-rose-500 max-w-md w-full animate-bounce flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-300 shrink-0" />
          <div className="leading-tight">
            <strong>Protection des contenus UL Study Flow</strong>
            <p className="text-[11px] text-rose-200 mt-0.5">
              L'enregistrement et la capture d'écran sont strictement interdits sous peine de suspension immédiate du compte.
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

          {status === 'completed' ? (
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
          <span className="font-bold text-[#111B21] dark:text-white">Séance {session.sessionNumber}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.estimatedMinutes} min</span>
          <span>·</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">{chapters.length} chapitre(s)</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[#111B21] dark:text-white">
          {session.title}
        </h1>

        {/* Objectif de la séance */}
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

        {/* AI Quick Context Prompt */}
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
                  }}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102'
                      : 'bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white border-[#E9EDEF] dark:border-[#222E35] hover:border-blue-300'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300'
                  }`}>
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
      <div className="bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30 dark:from-blue-950/40 dark:via-[#111B21] dark:to-transparent rounded-3xl border border-blue-200 dark:border-blue-900 p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              Chapitre {currentChapter.number}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#111B21] dark:text-white">
              {currentChapter.title}
            </h2>
          </div>

          <button
            onClick={handleDownloadSummaryPdf}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors border border-red-200 dark:border-red-900 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            PDF Synthèse
          </button>
        </div>

        {currentChapter.objectives && (
          <div className="p-3 bg-blue-100/50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200">
            <strong>🎯 Objectifs pédagogiques du chapitre :</strong> {currentChapter.objectives}
          </div>
        )}
      </div>

      {/* 1. Vidéo Explicative (Non téléchargeable & Anti-capture d'écran) */}
      {currentChapter.video && currentChapter.video.url && (
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400">
              <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Vidéo explicative du chapitre ({currentChapter.video.duration || 'Cours'})
            </div>
            <span className="text-[10px] text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-medium">
              🔒 Stream sécurisé
            </span>
          </div>

          {/* Secure Video Player Container with dynamic watermark */}
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

            {/* Dynamic Anti-Screen Record Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 opacity-25 select-none text-[10px] text-white font-mono">
              <div className="text-left">UL STUDY FLOW · {user?.displayPhone || user?.phone}</div>
              <div className="text-right">CONFIDENTIEL · REVENTE INTERDITE</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#667781] dark:text-[#8696A0]">
            <span className="truncate max-w-[60%]">{currentChapter.video.title || currentChapter.title}</span>
            <span className="text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              🔒 Vidéo protégée (Anti-capture actif)
            </span>
          </div>
        </div>
      )}

      {/* 2. Audio Podcast Player (Non téléchargeable) */}
      {currentChapter.audio && currentChapter.audio.url && (
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
              <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Podcast audio de révision ({currentChapter.audio.duration || 'Podcast'})
            </div>
            <span className="text-[10px] text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-medium">
              🔒 Audio protégé
            </span>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-2xl">
            <button
              onClick={handleToggleAudio}
              className="w-11 h-11 rounded-full bg-[#25D366] text-[#075E54] flex items-center justify-center shrink-0 hover:bg-[#1faa54] transition-transform active:scale-95 shadow-sm"
            >
              {isPlayingAudio ? (
                <Pause className="w-5 h-5 fill-[#075E54]" />
              ) : (
                <Play className="w-5 h-5 fill-[#075E54] ml-0.5" />
              )}
            </button>

            <div className="flex-1 min-w-0" onContextMenu={(e) => e.preventDefault()}>
              <p className="text-xs font-bold text-[#111B21] dark:text-white truncate">
                {currentChapter.audio.title || `Podcast Chapitre ${currentChapter.number}`}
              </p>
              <audio
                ref={audioRef}
                src={currentChapter.audio.url}
                onEnded={() => setIsPlayingAudio(false)}
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-8 mt-1"
                controls
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {[1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`text-[11px] px-2 py-1 rounded-lg font-bold transition-colors ${
                    audioSpeed === speed
                      ? 'bg-[#075E54] text-white shadow-2xs'
                      : 'bg-white dark:bg-[#111B21] text-[#667781] dark:text-[#8696A0] hover:bg-[#E9EDEF]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#667781] dark:text-[#8696A0]">
            <span>Intervenant : {currentChapter.audio.speaker || 'UL Study Flow'}</span>
            <span className="text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              🔒 Audio sécurisé non téléchargeable
            </span>
          </div>
        </div>
      )}

      {/* 3. Résumé de cours structuré & Contenu Texte (Téléchargeable en PDF) */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[#E9EDEF] dark:border-[#222E35] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#075E54] dark:text-[#25D366]">
            <BookOpen className="w-4 h-4 text-[#25D366]" />
            Contenu rédigé & Résumé synthétique du chapitre
          </div>
          <button
            onClick={handleDownloadSummaryPdf}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-3 py-1 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            <Download className="w-3 h-3" />
            Télécharger le PDF
          </button>
        </div>

        <div className="prose prose-sm max-w-none text-[#111B21] dark:text-[#E9EDEF] leading-relaxed space-y-4 text-xs sm:text-sm">
          {(currentChapter.summaryText || 'Contenu pédagogique en cours de rédaction.').split('\n\n').map((block, i) => {
            if (block.startsWith('### ')) {
              return (
                <h3 key={i} className="text-sm sm:text-base font-bold text-[#075E54] dark:text-[#25D366] pt-2">
                  {block.replace('### ', '')}
                </h3>
              );
            }
            if (block.startsWith('- ')) {
              const items = block.split('\n');
              return (
                <ul key={i} className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  {items.map((it, j) => (
                    <li key={j}>{it.replace('- ', '')}</li>
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
      </div>

      {/* 4. Support Polycopié PDF Officiel Téléchargeable */}
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
                {currentChapter.pdf.pages || 6} pages · Résumé synthétique téléchargeable par PDF
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadSummaryPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger le PDF
          </button>
        </div>
      )}

      {/* 5. Flashcards & Cartes Mémoire Interactives */}
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

        {/* Flippable Card Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`min-h-[170px] p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
            isFlipped
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-[#25D366]'
              : 'bg-[#F0F2F5] dark:bg-[#1F2C34] border-slate-200 dark:border-[#222E35] hover:border-[#25D366]'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[#667781] dark:text-[#8696A0]">
            <span className="font-bold uppercase tracking-wider text-[#075E54] dark:text-[#25D366]">
              {currentFlashcard.category || `Chapitre ${currentChapter.number}`}
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
              <RotateCw className="w-3 h-3" />
              {isFlipped ? 'Verso (Réponse)' : 'Recto (Question - Cliquez pour tourner)'}
            </span>
          </div>

          <div className="my-auto py-3 text-center">
            <p className="text-base sm:text-lg font-bold text-[#111B21] dark:text-white leading-relaxed">
              {isFlipped ? currentFlashcard.back : currentFlashcard.front}
            </p>
          </div>

          <div className="text-center text-[10px] text-[#667781] dark:text-[#8696A0]">
            {isFlipped ? 'Cliquez pour voir la question' : 'Cliquez n\'importe où sur la carte pour révéler la réponse'}
          </div>
        </div>

        {/* Card Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={currentFlashcardIndex === 0}
            onClick={() => {
              setIsFlipped(false);
              setCurrentFlashcardIndex(prev => Math.max(0, prev - 1));
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
              setCurrentFlashcardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
          >
            Suivante
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6. Questionnaire Dynamique d'Évaluation (QCM) */}
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
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366]'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400'
                }`}
              >
                Dernier score : {lastAttempt.score}/{lastAttempt.maxScore} ({lastAttempt.percentage}%)
              </span>
            )}
          </div>

          <p className="text-xs text-[#667781] dark:text-[#8696A0] leading-relaxed">
            {activeQuiz.description || "Répondez aux questions interactives du questionnaire pour tester votre maîtrise du chapitre et obtenir une correction détaillée."}
          </p>

          <button
            onClick={() => setQuizOpen(true)}
            className="w-full py-3 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-2xl hover:bg-[#1faa54] transition-all shadow-xs"
          >
            {lastAttempt ? 'Repasser le QCM' : 'Commencer le QCM'}
          </button>
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuiz && (
        <QuizModal
          isOpen={quizOpen}
          quiz={activeQuiz}
          onClose={() => setQuizOpen(false)}
          onSuccess={(attempt) => {
            setLastAttempt(attempt);
            if (attempt.passed) setStatus('completed');
          }}
        />
      )}
    </div>
  );
};
