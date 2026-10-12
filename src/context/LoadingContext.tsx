import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

interface LoadingContextType {
  isLoading: boolean;
  // Nombre d'opérations en cours (permet de gérer plusieurs loadings simultanés)
  activeCount: number;
  startLoading: () => void;
  stopLoading: () => void;
  // Force l'arrêt de tout
  resetLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeCount, setActiveCount] = useState(0);

  const startLoading = useCallback(() => {
    setActiveCount((c) => c + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setActiveCount((c) => Math.max(0, c - 1));
  }, []);

  const resetLoading = useCallback(() => {
    setActiveCount(0);
  }, []);

  const value = useMemo(
    () => ({
      isLoading: activeCount > 0,
      activeCount,
      startLoading,
      stopLoading,
      resetLoading,
    }),
    [activeCount, startLoading, stopLoading, resetLoading],
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within a LoadingProvider");
  return ctx;
}
