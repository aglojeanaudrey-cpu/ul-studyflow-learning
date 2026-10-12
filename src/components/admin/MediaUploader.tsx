import React, { useState, useRef } from "react";
import { api } from "../../lib/api";
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Video,
  Volume2,
  FileText,
  Loader2,
  Link as LinkIcon,
  Trash2,
  Play,
} from "lucide-react";

type MediaKind = "video" | "audio" | "pdf";

interface MediaUploaderProps {
  kind: MediaKind;
  currentUrl?: string;
  currentPublicId?: string;
  onUploaded: (data: {
    url: string;
    public_id: string;
    duration?: number;
    bytes?: number;
    thumbnail_url?: string;
  }) => void;
  onRemoved?: () => void;
}

const ACCEPT_MAP: Record<MediaKind, string> = {
  video: "video/mp4,video/webm,video/quicktime,video/x-matroska",
  audio: "audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/m4a",
  pdf: "application/pdf",
};

const MAX_SIZE_MB = 500; // 500 MB

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  kind,
  currentUrl,
  currentPublicId,
  onUploaded,
  onRemoved,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Vérifications
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${MAX_SIZE_MB} MB).`);
      return;
    }

    const acceptTypes = ACCEPT_MAP[kind].split(",");
    if (!acceptTypes.some((t) => file.type.startsWith(t.split("/")[0]))) {
      setError(`Type de fichier non supporté. Attendu : ${kind}`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const result = await api.uploadToCloudinary(file, (p) => setProgress(p));
      onUploaded({
        url: result.url,
        public_id: result.public_id,
        duration: result.duration,
        bytes: result.bytes,
        thumbnail_url: result.thumbnail_url,
      });
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // Fichier déjà uploadé : afficher l'aperçu
  if (currentUrl) {
    return (
      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Média uploadé
          </span>
        </div>

        {/* Aperçu selon le type */}
        {kind === "video" && (
          <video
            src={currentUrl}
            controls
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            className="w-full max-h-48 rounded-lg bg-black"
          />
        )}

        {kind === "audio" && (
          <audio
            src={currentUrl}
            controls
            controlsList="nodownload"
            className="w-full"
          />
        )}

        {kind === "pdf" && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 bg-white dark:bg-[#111B21] rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50"
          >
            <FileText className="w-3.5 h-3.5" />
            Voir le PDF
          </a>
        )}

        {/* Bouton supprimer */}
        {onRemoved && (
          <button
            type="button"
            onClick={onRemoved}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <Trash2 className="w-3 h-3" />
            Retirer ce média
          </button>
        )}
      </div>
    );
  }

  // Aucun fichier : afficher la zone d'upload
  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative cursor-pointer p-6 rounded-xl border-2 border-dashed transition-all ${
          dragOver
            ? "border-[#25D366] bg-emerald-50/50 dark:bg-emerald-950/20"
            : "border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366] bg-white dark:bg-[#111B21]"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_MAP[kind]}
          onChange={handleInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
            <div className="w-full max-w-xs">
              <div className="h-2 bg-[#E9EDEF] dark:bg-[#222E35] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#25D366] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-center mt-1.5 font-bold text-[#075E54] dark:text-[#25D366]">
                Upload en cours... {progress}%
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 flex items-center justify-center">
              {kind === "video" && <Video className="w-6 h-6 text-[#25D366]" />}
              {kind === "audio" && (
                <Volume2 className="w-6 h-6 text-[#25D366]" />
              )}
              {kind === "pdf" && (
                <FileText className="w-6 h-6 text-[#25D366]" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#111B21] dark:text-white">
                Glissez votre fichier ici ou cliquez
              </p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">
                {kind === "video" && "MP4, WebM, MOV · Max 500 MB"}
                {kind === "audio" && "MP3, WAV, OGG · Max 500 MB"}
                {kind === "pdf" && "PDF · Max 500 MB"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-white bg-[#25D366] rounded-lg">
              <Upload className="w-3.5 h-3.5" />
              Choisir un fichier
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 flex items-start gap-2 text-[11px] text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
