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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ⭐ Au démarrage : tenter de récupérer l'utilisateur via le cookie HttpOnly.
  // Si le cookie est valide, /api/auth/me renvoie l'utilisateur.
  // Sinon → 401 → utilisateur anonyme.
  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user || null);
    } catch (err) {
      // Pas de cookie valide → anonyme
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ⭐ Poser le cookie CSRF dès le démarrage
    fetch((import.meta.env.VITE_API_URL || "") + "/api/csrf-token", {
      credentials: "include",
    }).catch(() => {});

    refreshUser();
  }, []);

  const login = async (phoneOrEmail: string, password: string) => {
    const res = await api.login(phoneOrEmail, password);
    setUser(res.user);
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    setUser(res.user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
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
