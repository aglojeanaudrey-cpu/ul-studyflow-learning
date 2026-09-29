import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('ul_studyflow_theme') as Theme;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      // localStorage error fallback
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('ul_studyflow_theme') as Theme;
    if (saved === 'dark') return 'dark';
    if (saved === 'light') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        setResolvedTheme('dark');
      } else {
        root.classList.remove('dark');
        setResolvedTheme('light');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('ul_studyflow_theme', newTheme);
    } catch (e) {}
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
