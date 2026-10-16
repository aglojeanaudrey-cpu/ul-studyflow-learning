import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Shield,
} from "lucide-react";
import { useAntiCapture } from "../../hooks/useAntiCapture";

interface SecureAudioPlayerProps {
  src: string;
  title?: string;
  speaker?: string;
  watermarkName?: string;
  onCaptureDetected?: (reason: string) => void;
  isProtected?: boolean;
}

export const SecureAudioPlayer: React.FC<SecureAudioPlayerProps> = ({
  src,
  title,
  speaker,
  watermarkName,
  onCaptureDetected,
  isProtected = true,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useAntiCapture({
    enabled: isProtected,
    onCaptureDetected: (reason) => {
      if (
        reason === "tab_hidden" &&
        audioRef.current &&
        !audioRef.current.paused
      ) {
        audioRef.current.pause();
        setPlaying(false);
      }
      onCaptureDetected?.(reason);
    },
  });

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(duration, currentTime + seconds),
      );
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-50/30 dark:from-blue-950/40 dark:to-blue-950/10 rounded-2xl border border-blue-200 dark:border-blue-800 p-4 space-y-3">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() =>
          audioRef.current && setCurrentTime(audioRef.current.currentTime)
        }
        onLoadedMetadata={() =>
          audioRef.current && setDuration(audioRef.current.duration)
        }
        onEnded={() => setPlaying(false)}
        preload="metadata"
        style={{ display: "none" }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-[#111B21] dark:text-white truncate">
            {title || "Podcast audio"}
          </h4>
          {speaker && (
            <p className="text-[11px] text-[#667781] dark:text-[#8696A0] truncate">
              {speaker}
            </p>
          )}
        </div>
        {isProtected && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
            <Shield className="w-2.5 h-2.5" />
            Protégé
          </span>
        )}
      </div>

      {/* Player controls */}
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-blue-200 dark:bg-blue-900 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => skip(-15)}
              className="p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
              title="-15s"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all active:scale-95"
            >
              {playing ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skip(15)}
              className="p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
              title="+15s"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              className="p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
            >
              {muted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          <span className="text-xs font-mono text-blue-800 dark:text-blue-200 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Watermark dans le player (info-bulle flottante) */}
      {isProtected && watermarkName && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg pointer-events-none">
          <p className="text-[9px] text-white/70 font-mono">{watermarkName}</p>
        </div>
      )}
    </div>
  );
};
