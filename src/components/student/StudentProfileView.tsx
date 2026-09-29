import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DynamicForm } from '../../types';
import { api } from '../../lib/api';
import {
  User,
  Phone,
  School,
  BookOpen,
  LogOut,
  FileText,
  ArrowRight,
  ShieldCheck,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';
import { DynamicFormModal } from './DynamicFormModal';

export const StudentProfileView: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [forms, setForms] = useState<DynamicForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<DynamicForm | null>(null);

  useEffect(() => {
    async function loadForms() {
      try {
        const res = await api.getForms();
        setForms(res.forms);
      } catch (err) {
        console.error('Error loading forms:', err);
      }
    }
    loadForms();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] dark:text-white">
          Mon Profil Étudiant
        </h1>
        <p className="text-xs sm:text-sm text-[#667781] dark:text-[#8696A0]">
          Informations de compte, préférences d'affichage et démarches sur UL Study Flow.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-6 shadow-xs space-y-5 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#25D366] text-[#075E54] flex items-center justify-center font-extrabold text-2xl shadow-xs">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#111B21] dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] font-mono mt-0.5">{user.displayPhone}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {user.department}
              </span>
              <span className="text-[11px] font-semibold text-[#667781] dark:text-[#8696A0] bg-[#F0F2F5] dark:bg-[#1F2C34] px-2 py-0.5 rounded">
                {user.level} · {user.program}
              </span>
              {user.isSponsored && (
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  ⭐ Sponsorisé
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] text-xs">
          <div className="p-3 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl space-y-1">
            <span className="text-[#667781] dark:text-[#8696A0]">Statut du compte :</span>
            <p className="font-bold text-emerald-700 dark:text-[#25D366] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#25D366]" /> Actif & Vérifié (Lomé)
            </p>
          </div>
          <div className="p-3 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl space-y-1">
            <span className="text-[#667781] dark:text-[#8696A0]">Rôle système :</span>
            <p className="font-bold text-[#075E54] dark:text-emerald-400">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Theme Preference Settings */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 shadow-xs space-y-3 transition-colors">
        <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
          {resolvedTheme === 'dark' ? <Moon className="w-4 h-4 text-[#25D366]" /> : <Sun className="w-4 h-4 text-amber-500" />}
          Apparence & Thème d'affichage
        </h3>
        <p className="text-xs text-[#667781] dark:text-[#8696A0]">
          Choisissez entre le mode clair, le mode sombre (dark mode) ou la détection automatique selon votre appareil.
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => setTheme('light')}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
              theme === 'light'
                ? 'border-[#25D366] bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] ring-1 ring-[#25D366]'
                : 'border-[#E9EDEF] dark:border-[#222E35] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Mode Clair</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
              theme === 'dark'
                ? 'border-[#25D366] bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] ring-1 ring-[#25D366]'
                : 'border-[#E9EDEF] dark:border-[#222E35] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]'
            }`}
          >
            <Moon className="w-4 h-4 text-emerald-400" />
            <span>Mode Sombre</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
              theme === 'system'
                ? 'border-[#25D366] bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] ring-1 ring-[#25D366]'
                : 'border-[#E9EDEF] dark:border-[#222E35] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]'
            }`}
          >
            <Laptop className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            <span>Système</span>
          </button>
        </div>
      </div>

      {/* Formulaires d'inscription & Démarches */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-[#111B21] dark:text-white">
          Formulaires & Démarches Disponibles ({forms.length})
        </h3>

        <div className="space-y-3">
          {forms.map((form) => (
            <div
              key={form.id}
              className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs flex items-center justify-between gap-4 hover:border-[#25D366] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111B21] dark:text-white">{form.title}</h4>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] line-clamp-1">{form.description}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedForm(form)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shrink-0"
              >
                Remplir
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Disconnect Button */}
      <div className="pt-4 border-t border-[#E9EDEF] dark:border-[#222E35]">
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter de mon compte
        </button>
      </div>

      {/* Dynamic Form Fill Modal */}
      {selectedForm && (
        <DynamicFormModal
          isOpen={!!selectedForm}
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
          onSuccess={() => setSelectedForm(null)}
        />
      )}
    </div>
  );
};
