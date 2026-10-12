import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

/**
 * Spinner de chargement réutilisable.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  label,
  className = "",
}) => {
  const sizeClass =
    size === "sm"
      ? "w-5 h-5 border-2"
      : size === "lg"
        ? "w-10 h-10 border-3"
        : "w-7 h-7 border-3";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`${sizeClass} border-[#25D366] border-t-transparent rounded-full animate-spin`}
      ></div>
      {label && (
        <span className="text-xs font-semibold text-[#075E54] dark:text-[#25D366] tracking-wider uppercase">
          {label}
        </span>
      )}
    </div>
  );
};

/**
 * Overlay de chargement plein écran avec fond semi-transparent.
 */
export const LoadingOverlay: React.FC<{ visible: boolean; label?: string }> = ({
  visible,
  label,
}) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111B21] rounded-2xl p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35]">
        <LoadingSpinner size="lg" label={label || "Chargement..."} />
      </div>
    </div>
  );
};

/**
 * Spinner inline (dans un bouton par exemple).
 */
export const InlineSpinner: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div
    className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
  ></div>
);
