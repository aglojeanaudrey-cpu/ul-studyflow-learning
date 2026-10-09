import React, { useEffect } from "react";
import {
  X,
  ExternalLink,
  Info,
  Megaphone,
  Gift,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { PopupCampaign } from "../../types";
import { api } from "../../lib/api";
import { usePopupTrigger, markPopupAsSeen } from "../../hooks/usePopupTrigger";

interface ActivePopupProps {
  popup: PopupCampaign | null;
  currentPage: string;
}

const SIZE_MAP: Record<string, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[600px]",
  lg: "max-w-[800px]",
  xl: "max-w-[1000px]",
};

const POSITION_MAP: Record<string, string> = {
  center: "items-center justify-center p-4",
  top: "items-start justify-center pt-4",
  bottom: "items-end justify-center pb-20",
  bottom_right: "items-end justify-end pb-20 pr-4",
  bottom_left: "items-end justify-start pb-20 pl-4",
};

function TypeIcon({ type, color }: { type: string; color: string }) {
  const cls = "w-5 h-5";
  const style = { color };
  switch (type) {
    case "promo":
      return <Gift className={cls} style={style} />;
    case "alert":
      return <AlertTriangle className={cls} style={style} />;
    case "ad":
      return <Megaphone className={cls} style={style} />;
    case "survey":
      return <ClipboardList className={cls} style={style} />;
    case "announcement":
      return <Megaphone className={cls} style={style} />;
    default:
      return <Info className={cls} style={style} />;
  }
}

const ANIMATION_MAP: Record<string, string> = {
  fade: "animate-in fade-in duration-300",
  slide_up: "animate-in slide-in-from-bottom duration-300",
  slide_down: "animate-in slide-in-from-top duration-300",
  zoom: "animate-in zoom-in-95 duration-300",
  none: "",
};

export const ActivePopup: React.FC<ActivePopupProps> = ({
  popup,
  currentPage,
}) => {
  const { shouldShow, setShouldShow } = usePopupTrigger(popup);

  useEffect(() => {
    if (shouldShow && popup) {
      api.trackPopupView(popup.id, currentPage).catch(() => {});
      markPopupAsSeen(popup);
    }
  }, [shouldShow, popup?.id, currentPage]);

  // ⭐ ESC pour fermer
  useEffect(() => {
    if (!shouldShow || !popup?.is_dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        api.trackPopupClick(popup.id, "dismiss", currentPage).catch(() => {});
        setShouldShow(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shouldShow, popup?.id, currentPage, popup?.is_dismissible]);

  if (!shouldShow || !popup) return null;

  const handleClose = () => {
    if (popup.is_dismissible) {
      api.trackPopupClick(popup.id, "dismiss", currentPage).catch(() => {});
      setShouldShow(false);
    }
  };

  const handleButtonClick = (which: "primary" | "secondary") => {
    const action =
      which === "primary"
        ? popup.primary_button_action
        : popup.secondary_button_action;
    const url =
      which === "primary"
        ? popup.primary_button_url
        : popup.secondary_button_url;

    api.trackPopupClick(popup.id, which, currentPage).catch(() => {});

    if (action === "link" && url) {
      window.open(url, "_blank", "noopener,noreferrer");
      if (popup.is_dismissible) setShouldShow(false);
    } else if (action === "close") {
      setShouldShow(false);
    } else if (action === "scroll") {
      if (url) {
        const el = document.querySelector(url);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
      setShouldShow(false);
    }
  };

  const positionClass = POSITION_MAP[popup.position] || POSITION_MAP.center;
  const sizeClass = SIZE_MAP[popup.size] || SIZE_MAP.md;
  const animationClass = ANIMATION_MAP[popup.animation] || "";

  const isBanner = popup.position === "top" || popup.position === "bottom";
  const containerClass = isBanner
    ? `${sizeClass} w-full`
    : `${sizeClass} w-[calc(100%-2rem)]`;

  // Clic sur backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && popup.is_dismissible) {
      handleClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex ${positionClass} pointer-events-none`}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-white dark:bg-[#111B21] rounded-2xl shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden pointer-events-auto ${containerClass} ${animationClass}`}
      >
        {/* Barre d'accent supérieure */}
        <div
          className="h-1 w-full"
          style={{ backgroundColor: popup.accent_color }}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-2 p-4 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${popup.accent_color}20` }}
            >
              <TypeIcon type={popup.popup_type} color={popup.accent_color} />
            </div>
            <h3 className="font-bold text-base text-[#111B21] dark:text-white truncate">
              {popup.title}
            </h3>
          </div>

          {popup.is_dismissible && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] transition-colors shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Contenu */}
        <div className="px-4 pb-2 space-y-3 max-h-[60vh] overflow-y-auto">
          {popup.media_type === "image" && popup.media_url && (
            <img
              src={popup.media_url}
              alt={popup.title}
              className="w-full rounded-xl object-cover max-h-64"
            />
          )}

          {popup.media_type === "video" && popup.media_url && (
            <video
              src={popup.media_url}
              poster={popup.media_thumbnail || undefined}
              controls
              className="w-full rounded-xl max-h-64 bg-black"
            />
          )}

          {popup.media_type === "video_autoplay" && popup.media_url && (
            <video
              src={popup.media_url}
              poster={popup.media_thumbnail || undefined}
              autoPlay
              muted
              loop
              playsInline
              className="w-full rounded-xl max-h-64 bg-black"
            />
          )}

          {popup.message && (
            <p className="text-sm text-[#111B21] dark:text-[#E9EDEF] leading-relaxed whitespace-pre-line">
              {popup.message}
            </p>
          )}
        </div>

        {/* Boutons */}
        {(popup.primary_button_text || popup.secondary_button_text) && (
          <div className="p-4 pt-2 flex flex-wrap items-center justify-end gap-2">
            {popup.secondary_button_text && (
              <button
                onClick={() => handleButtonClick("secondary")}
                className="px-4 py-2 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] rounded-xl transition-colors"
              >
                {popup.secondary_button_text}
              </button>
            )}

            {popup.primary_button_text && (
              <button
                onClick={() => handleButtonClick("primary")}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white rounded-xl transition-all hover:opacity-90 shadow-sm"
                style={{ backgroundColor: popup.accent_color }}
              >
                {popup.primary_button_text}
                {popup.primary_button_action === "link" && (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                {popup.primary_button_action === "close" && (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                {popup.primary_button_action === "scroll" && (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Indication "ESC pour fermer" */}
        {popup.is_dismissible && (
          <div className="px-4 pb-3 -mt-2">
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] text-center opacity-60">
              Appuyez sur{" "}
              <kbd className="px-1 py-0.5 rounded border border-[#E9EDEF] dark:border-[#222E35] font-mono">
                ESC
              </kbd>{" "}
              pour fermer
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
