import React, { createContext, useContext, useState } from "react";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setIsLoading,
        startLoading: () => setIsLoading(true),
        stopLoading: () => setIsLoading(false),
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return ctx;
};
