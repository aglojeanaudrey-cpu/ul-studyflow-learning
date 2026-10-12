import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { ChapterPDFDocument } from "./ChapterPDFDocument";

interface PDFDownloadButtonProps {
  ueTitle: string;
  ueCode: string;
  sessionNumber: number;
  sessionTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  objectives?: string;
  contentJson?: any;
  contentHtml?: string;
  studentName?: string;
  /** Variante visuelle : 'primary' (rouge) ou 'secondary' (vert) */
  variant?: "primary" | "secondary";
  /** Label personnalisé */
  label?: string;
}

/**
 * Bouton de téléchargement PDF avec :
 * - Loading visuel pendant la génération
 * - Anti-double-clic
 * - Feedback de succès
 */
export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  ueTitle,
  ueCode,
  sessionNumber,
  sessionTitle,
  chapterNumber,
  chapterTitle,
  objectives,
  contentJson,
  contentHtml,
  studentName,
  variant = "primary",
  label = "Télécharger PDF",
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    if (loading) return; // ⭐ Anti-double-clic

    setLoading(true);
    setSuccess(false);

    try {
      // Génération du blob PDF
      const doc = (
        <ChapterPDFDocument
          ueTitle={ueTitle}
          ueCode={ueCode}
          sessionNumber={sessionNumber}
          sessionTitle={sessionTitle}
          chapterNumber={chapterNumber}
          chapterTitle={chapterTitle}
          objectives={objectives}
          contentJson={contentJson}
          contentHtml={contentHtml}
          studentName={studentName}
        />
      );

      const blob = await pdf(doc).toBlob();

      // Déclenchement du téléchargement
      const url = URL.createObjectURL(blob);
      const fileName = `${ueCode}-S${sessionNumber}-C${chapterNumber}-${chapterTitle.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nettoyage
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("Erreur génération PDF:", err);
      // Fallback : message d'erreur discret
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Style selon variant
  const baseClass =
    variant === "primary"
      ? "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-xs shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
      : "inline-flex items-center gap-1 text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-3 py-1 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed";

  const iconSize = variant === "primary" ? "w-3.5 h-3.5" : "w-3 h-3";

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={baseClass}
      title={loading ? "Génération en cours…" : "Télécharger le PDF"}
    >
      {loading ? (
        <>
          <Loader2 className={`${iconSize} animate-spin`} />
          {variant === "primary" ? "Préparation…" : "Préparation…"}
        </>
      ) : success ? (
        <>
          <CheckCircle2 className={iconSize} />
          Téléchargé ✓
        </>
      ) : (
        <>
          <Download className={iconSize} />
          {label}
        </>
      )}
    </button>
  );
};
