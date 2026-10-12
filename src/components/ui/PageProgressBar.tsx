import React, { useEffect, useState } from "react";

interface PageProgressBarProps {
  loading: boolean;
}

/**
 * Barre de progression en haut de page (style YouTube / GitHub).
 * Apparaît quand `loading` passe à true, disparaît 300ms après.
 */
export const PageProgressBar: React.FC<PageProgressBarProps> = ({
  loading,
}) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let timeout: ReturnType<typeof setTimeout>;

    if (loading) {
      setVisible(true);
      setProgress(10);

      interval = setInterval(() => {
        setProgress((prev) => {
          // Progression asymptotique vers 90% (jamais 100% tant que ce n'est pas fini)
          if (prev >= 90) return 90;
          return prev + Math.random() * 8;
        });
      }, 300);
    } else if (visible) {
      // Terminer la barre
      setProgress(100);
      timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [loading]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-[#25D366] via-[#128C7E] to-[#25D366] transition-all duration-300 ease-out shadow-lg shadow-[#25D366]/50"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
