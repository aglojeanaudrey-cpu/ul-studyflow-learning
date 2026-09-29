import React, { useState, useEffect, useRef } from 'react';
import { Session, QuizAttempt, Flashcard } from '../../types';
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
  Eye,
  Cloud,
  HelpCircle,
  AlertTriangle,
  Lock,
  Unlock
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
      // Check for PrintScreen or screenshot shortcuts
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

  // Download printable summary as PDF
  const handleDownloadSummaryPdf = () => {
    if (!session) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${ueCode} - Séance ${session.sessionNumber} : ${session.title}</title>
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
            <h1>UL STUDY FLOW · FICHE DE RÉVISION</h1>
            <div class="meta">${ueCode} - ${ueTitle} | Séance ${session.sessionNumber} : ${session.title} (${session.estimatedMinutes} min)</div>
          </div>
          ${session.objective ? `<div class="objective">🎯 Objectif : ${session.objective}</div>` : ''}
          <div class="content">${session.content.summaryText}</div>
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
              • La <strong>1ère séance</strong> de chaque UE est <strong>100% gratuite et accessible</strong> à tous les étudiants de Lomé.
            </p>
            <p className="text-[11px] text-[#128C7E] dark:text-emerald-300">
              • Les séances suivantes nécessitent une validation par l'administration (déblocage sous 12h max).
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

  const flashcards: Flashcard[] = session.flashcards && session.flashcards.length > 0 ? session.flashcards : [
    {
      id: 'fc_def_1',
      front: `Quel est l'objectif principal de la séance ${session.sessionNumber} ?`,
      back: session.objective || session.title,
      category: 'Objectif Pédagogique'
    },
    {
      id: 'fc_def_2',
      front: 'Quelle notion clé est abordée dans cette séance ?',
      back: session.description || 'Consulter le résumé structuré et le questionnaire de cours.',
      category: 'Notion Clé'
    }
  ];

  const currentFlashcard = flashcards[currentFlashcardIndex] || flashcards[0];

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
              ⭐ Séance 01 Offerte
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

      {/* Session Title Header */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-7 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#667781] dark:text-[#8696A0]">
          <span className="text-[#075E54] dark:text-[#25D366] font-extrabold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            {ueCode}
          </span>
          <span>·</span>
          <span className="font-bold text-[#111B21] dark:text-white">Séance {session.sessionNumber}</span>
          <span>·</span>
          <span>{session.estimatedMinutes} minutes</span>
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

        <p className="text-xs sm:text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed">
          {session.description}
        </p>

        {/* AI Quick Context Prompt & Download PDF */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
          <button
            onClick={() => onAskAiWithContext(session.id)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-3.5 py-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
            Poser une question à l'IA sur cette séance
          </button>

          <button
            onClick={handleDownloadSummaryPdf}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger la fiche en PDF
          </button>
        </div>
      </div>

      {/* 1. Vidéo Explicative (Non téléchargeable & Anti-capture d'écran) */}
      {session.content.video && (
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#075E54] dark:text-[#25D366]">
              <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Vidéo explicative ({session.content.video.duration})
            </div>
            <span className="text-[10px] text-[#667781] dark:text-[#8696A0] flex items-center gap-1">
              <Cloud className="w-3 h-3 text-blue-500" />
              Drive UL Study Flow (ulstudyflow@gmail.com)
            </span>
          </div>

          {/* Secure Video Player Container with dynamic watermark */}
          <div
            className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative border border-slate-800"
            onContextMenu={(e) => e.preventDefault()}
          >
            <iframe
              src={session.content.video.url}
              title={session.content.video.title}
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
            <span className="truncate max-w-[60%]">{session.content.video.title}</span>
            <span className="text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              🔒 Vidéo protégée (Anti-capture actif)
            </span>
          </div>
        </div>
      )}

      {/* 2. Audio Podcast Player (Non téléchargeable) */}
      {session.content.audio && (
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#075E54] dark:text-[#25D366]">
              <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Podcast de révision ({session.content.audio.duration})
            </div>
            <span className="text-[10px] text-[#667781] dark:text-[#8696A0] flex items-center gap-1">
              <Cloud className="w-3 h-3 text-blue-500" />
              Stocké sur Drive (ulstudyflow@gmail.com)
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
                {session.content.audio.title}
              </p>
              <audio
                ref={audioRef}
                src={session.content.audio.url}
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
            <span>Par {session.content.audio.speaker}</span>
            <span className="text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              🔒 Audio sécurisé non téléchargeable
            </span>
          </div>
        </div>
      )}

      {/* 3. Résumé de cours structuré (Format texte téléchargeable en PDF) */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[#E9EDEF] dark:border-[#222E35] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#075E54] dark:text-[#25D366]">
            <BookOpen className="w-4 h-4 text-[#25D366]" />
            Fiche de cours synthétique & Résumé structuré
          </div>
          <button
            onClick={handleDownloadSummaryPdf}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-3 py-1 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            <Download className="w-3 h-3" />
            Télécharger en PDF
          </button>
        </div>

        <div className="prose prose-sm max-w-none text-[#111B21] dark:text-[#E9EDEF] leading-relaxed space-y-4 text-xs sm:text-sm">
          {session.content.summaryText.split('\n\n').map((block, i) => {
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

      {/* 4. Support Polycopié PDF Officiel */}
      {session.content.pdf && (
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold shrink-0">
              <FileText className="w-6 h-6 text-[#075E54] dark:text-[#25D366]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#111B21] dark:text-white truncate">
                {session.content.pdf.title}
              </p>
              <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                {session.content.pdf.pages} pages · {session.content.pdf.sizeMb} Mo · Polycopié UL téléchargeable
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadSummaryPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger le PDF
          </button>
        </div>
      )}

      {/* 5. Étape 3 : Flashcards Interactives */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] p-6 sm:p-7 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-[#111B21] dark:text-white">
              Flashcards & Mémorisation Interactive
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
              {currentFlashcard.category || 'Notion Clé'}
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
            Carte précédente
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
            Carte suivante
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6. Étape 3 : Questionnaire Dynamique d'Évaluation */}
      {session.quiz && (
        <div className="bg-white dark:bg-[#111B21] rounded-3xl border-2 border-[#25D366] p-6 sm:p-7 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#25D366]" />
              <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                Questionnaire dynamique de validation
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
            {session.quiz.description} Répondez aux questions pour tester votre compréhension et obtenir une correction pas à pas détaillée.
          </p>

          <button
            onClick={() => setQuizOpen(true)}
            className="w-full py-3 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-2xl hover:bg-[#1faa54] transition-all shadow-xs"
          >
            {lastAttempt ? 'Repasser le questionnaire' : 'Commencer le questionnaire'}
          </button>
        </div>
      )}

      {/* Quiz Modal */}
      {session.quiz && (
        <QuizModal
          isOpen={quizOpen}
          quiz={session.quiz}
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
