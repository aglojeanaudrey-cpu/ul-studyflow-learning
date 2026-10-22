import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "ulsf_user";

// ⭐ Lire le user en cache (synchrone, avant le premier render)
function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // restaurer le user depuis le cache pour afficher le dashboard instantanément (même hors ligne)
  const [user, setUser] = useState<User | null>(() => readCachedUser());
  const [loading, setLoading] = useState<boolean>(true);

  const persistUser = (u: User | null) => {
    try {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      const freshUser = data.user || null;
      setUser(freshUser);
      persistUser(freshUser);
    } catch (err: any) {
      // nettoyer si SÛR que la session est invalide (401) et pas simplement hors ligne.
      const isNetworkError =
        !navigator.onLine ||
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError");
      if (!isNetworkError) {
        // Session invalide → nettoyer le cache
        setUser(null);
        persistUser(null);
      }
      // Sinon, garder le cache pour permettre l'accès hors ligne
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Poser le cookie CSRF dès le démarrage
    fetch((import.meta.env.VITE_API_URL || "") + "/api/csrf-token", {
      credentials: "include",
    }).catch(() => {});

    refreshUser();
  }, []);

  const login = async (phoneOrEmail: string, password: string) => {
    const res = await api.login(phoneOrEmail, password);
    setUser(res.user);
    persistUser(res.user);
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    setUser(res.user);
    persistUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore l'erreur réseau, déconnecte localement
    }
    setUser(null);
    persistUser(null); // nettoie le cache
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
