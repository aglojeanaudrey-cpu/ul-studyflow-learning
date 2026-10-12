import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { useAntiCapture } from "../../hooks/useAntiCapture";

interface SecureVideoPlayerProps {
  /** URL de la vidéo (Cloudinary signée ou externe) */
  src: string;
  /** URL du poster (miniature) */
  poster?: string;
  /** Titre affiché au-dessus */
  title?: string;
  /** Infos du spectateur (pour watermark) */
  watermarkName?: string;
  watermarkPhone?: string;
  /** Callback quand une capture est détectée */
  onCaptureDetected?: (reason: string) => void;
  /** Est-ce une vidéo protégée (Cloudinary) ou une URL externe (YouTube, etc.) ? */
  isProtected?: boolean;
}

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  src,
  poster,
  title,
  watermarkName,
  watermarkPhone,
  onCaptureDetected,
  isProtected = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captureWarning, setCaptureWarning] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // ⭐ Hook anti-capture
  const { isTabHidden, rightClickAttempts, blockedShortcuts } = useAntiCapture({
    enabled: isProtected,
    onCaptureDetected: (reason) => {
      // Pause automatique si changement d'onglet
      if (
        reason === "tab_hidden" &&
        videoRef.current &&
        !videoRef.current.paused
      ) {
        videoRef.current.pause();
        setPlaying(false);
      }

      // Afficher un warning visuel
      const messages: Record<string, string> = {
        right_click: "🚫 Le clic droit est désactivé sur cette vidéo protégée.",
        tab_hidden: "⚠️ Vidéo mise en pause : vous avez changé d'onglet.",
        window_blur: "⚠️ Ne fermez pas cette fenêtre pendant la lecture.",
        printscreen_attempt: "⚠️ Capture d'écran détectée et enregistrée.",
        drag_attempt: "🚫 Le téléchargement est désactivé.",
      };

      const msg = messages[reason] || messages[reason.split("_")[0]] || null;
      if (msg) {
        setCaptureWarning(msg);
        setTimeout(() => setCaptureWarning(null), 3500);
      }

      // Remonter au parent (pour log côté serveur si besoin)
      onCaptureDetected?.(reason);
    },
  });

  // Pause auto si tab caché
  useEffect(() => {
    if (isTabHidden && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [isTabHidden]);

  // Watermark dynamique (nom + téléphone)
  const watermarkText = [
    watermarkName,
    watermarkPhone,
    new Date().toLocaleDateString("fr-FR"),
  ]
    .filter(Boolean)
    .join(" · ");

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVideoLoaded(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const enterFullscreen = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen?.();
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2">
      {/* Header avec badge protection */}
      {title && (
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-sm text-[#111B21] dark:text-white truncate">
            {title}
          </h4>
          {isProtected && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <Shield className="w-2.5 h-2.5" />
              Contenu protégé
            </span>
          )}
        </div>
      )}

      {/* Warning capture */}
      {captureWarning && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {captureWarning}
        </div>
      )}

      {/* Conteneur vidéo */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-black select-none group"
        onContextMenu={(e) => isProtected && e.preventDefault()}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setPlaying(false)}
          controls={false}
          controlsList="nodownload noplaybackrate nofullscreen"
          disablePictureInPicture
          playsInline
          preload="metadata"
          className="w-full max-h-[70vh] object-contain"
        />

        {/* Watermark dynamique — visible discrètement */}
        {isProtected && watermarkText && (
          <>
            {/* Watermark principale bas-droite */}
            <div className="absolute bottom-16 right-4 pointer-events-none select-none">
              <span className="text-white text-[11px] font-mono opacity-25 drop-shadow-lg">
                {watermarkText}
              </span>
            </div>

            {/* Watermark secondaire haut-gauche (plus discret) */}
            <div className="absolute top-3 left-3 pointer-events-none select-none">
              <span className="text-white text-[9px] font-mono opacity-15">
                UL Study Flow · {watermarkName}
              </span>
            </div>
          </>
        )}

        {/* Overlay bouton Play (avant lecture) */}
        {!playing && !videoLoaded && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl">
              <Play className="w-7 h-7 text-[#075E54] fill-current ml-1" />
            </div>
          </button>
        )}

        {/* Contrôles personnalisés (barre du bas) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Barre de progression */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#25D366] mb-2"
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                {playing ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                {muted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <span className="text-white text-[11px] font-mono tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button
              onClick={enterFullscreen}
              className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Plein écran"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badge pause auto */}
        {isTabHidden && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1">
            <EyeOff className="w-3 h-3" />
            En pause
          </div>
        )}
      </div>

      {/* Notice protection */}
      {isProtected && (
        <div className="p-2.5 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl border border-[#E9EDEF] dark:border-[#222E35] flex items-start gap-2 text-[10px] text-[#667781] dark:text-[#8696A0]">
          <Lock className="w-3 h-3 shrink-0 mt-0.5 text-[#25D366]" />
          <span>
            Cette vidéo est protégée par un watermark personnalisé à votre nom.
            Toute tentative de capture d'écran ou d'enregistrement est tracée et
            enregistrée. Le partage non autorisé entraîne la suspension du
            compte.
          </span>
        </div>
      )}
    </div>
  );
};
