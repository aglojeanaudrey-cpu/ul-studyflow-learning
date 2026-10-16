import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { DynamicForm, Department, Program } from "../../types";
import { api } from "../../lib/api";
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
  Laptop,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import { DynamicFormModal } from "./DynamicFormModal";
import { PasswordInput } from "../ui/PasswordInput";

export const StudentProfileView: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [forms, setForms] = useState<DynamicForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<DynamicForm | null>(null);

  // ⭐ Meta académique
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // ⭐ Modal d'édition
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    program: "",
    level: "L1" as "L1" | "L2" | "L3",
    currentPassword: "",
    newPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [formsRes, metaRes] = await Promise.all([
          api.getForms(),
          api.getAcademicMeta(),
        ]);
        setForms(formsRes.forms);
        setDepartments(metaRes.departments || []);
        setPrograms(metaRes.programs || []);
      } catch (err) {
        console.error("Error loading profile data:", err);
      }
    }
    load();
  }, []);

  const openEditModal = () => {
    if (!user) return;
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      department: user.department || "",
      program: user.program || "",
      level: (user.level as any) || "L1",
      currentPassword: "",
      newPassword: "",
    });
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const payload: any = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        department: editForm.department,
        program: editForm.program,
        level: editForm.level,
      };

      if (editForm.newPassword.trim()) {
        payload.currentPassword = editForm.currentPassword;
        payload.newPassword = editForm.newPassword;
      }

      await api.updateProfile(payload);
      await refreshUser();
      setEditModalOpen(false);
      setSuccessMsg("Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const dept = departments.find((d) => d.code === editForm.department);
    return dept ? p.departmentId === dept.id : true;
  });

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] dark:text-white">
          Mon Profil Étudiant
        </h1>
        <p className="text-xs sm:text-sm text-[#667781] dark:text-[#8696A0]">
          Informations de compte, préférences d'affichage et démarches sur UL
          Study Flow.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-6 shadow-xs space-y-5 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-[#25D366] text-[#075E54] flex items-center justify-center font-extrabold text-2xl shadow-xs shrink-0">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-[#111B21] dark:text-white truncate">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] font-mono mt-0.5">
                {user.displayPhone}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
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

          {/* ⭐ Bouton Modifier */}
          <button
            onClick={openEditModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors shrink-0"
            title="Modifier mes informations"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Modifier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] text-xs">
          <div className="p-3 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl space-y-1">
            <span className="text-[#667781] dark:text-[#8696A0]">
              Statut du compte :
            </span>
            <p className="font-bold text-emerald-700 dark:text-[#25D366] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#25D366]" /> Actif & Vérifié
              (Lomé)
            </p>
          </div>
          <div className="p-3 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl space-y-1">
            <span className="text-[#667781] dark:text-[#8696A0]">
              Rôle système :
            </span>
            <p className="font-bold text-[#075E54] dark:text-emerald-400">
              {user.role}
            </p>
          </div>
        </div>
      </div>

      {/* Theme Preference Settings */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 shadow-xs space-y-3 transition-colors">
        <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
          {resolvedTheme === "dark" ? (
            <Moon className="w-4 h-4 text-[#25D366]" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          Apparence & Thème d'affichage
        </h3>
        <p className="text-xs text-[#667781] dark:text-[#8696A0]">
          Choisissez entre le mode clair, le mode sombre (dark mode) ou la
          détection automatique selon votre appareil.
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => setTheme("light")}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
              theme === "light"
                ? "border-[#25D366] bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] ring-1 ring-[#25D366]"
                : "border-[#E9EDEF] dark:border-[#222E35] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Mode Clair</span>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
              theme === "dark"
                ? "border-[#25D366] bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] ring-1 ring-[#25D366]"
                : "border-[#E9EDEF] dark:border-[#222E35] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]"
            }`}
          >
            <Moon className="w-4 h-4 text-emerald-400" />
            <span>Mode Sombre</span>
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
              theme === "system"
                ? "border-[#25D366] bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] ring-1 ring-[#25D366]"
                : "border-[#E9EDEF] dark:border-[#222E35] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]"
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
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-[#111B21] dark:text-white truncate">
                    {form.title}
                  </h4>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] line-clamp-1">
                    {form.description}
                  </p>
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

      {/* ⭐ Modal d'édition de profil */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-bold text-lg text-[#111B21] dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#25D366]" />
                Modifier mes informations
              </h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                Certaines informations peuvent être modifiées. Votre numéro de
                téléphone ne peut pas être changé (contactez le support).
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#0B141A] focus:outline-none focus:border-[#25D366]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#0B141A] focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="etudiant@domaine.com"
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#0B141A] focus:outline-none focus:border-[#25D366]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Département
                  </label>
                  <select
                    value={editForm.department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      const dept = departments.find((d) => d.code === newDept);
                      const firstProg = dept
                        ? programs.find((p) => p.departmentId === dept.id)
                        : null;
                      setEditForm({
                        ...editForm,
                        department: newDept,
                        program: firstProg?.name || editForm.program,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#0B141A] focus:outline-none focus:border-[#25D366]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Filière
                  </label>
                  <select
                    value={editForm.program}
                    onChange={(e) =>
                      setEditForm({ ...editForm, program: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#0B141A] focus:outline-none focus:border-[#25D366]"
                  >
                    {filteredPrograms.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Niveau
                  </label>
                  <select
                    value={editForm.level}
                    onChange={(e) =>
                      setEditForm({ ...editForm, level: e.target.value as any })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#0B141A] focus:outline-none focus:border-[#25D366]"
                  >
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                  </select>
                </div>
              </div>

              {/* Changement de mot de passe */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2.5">
                <p className="font-bold text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Changer mon mot de passe (optionnel)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-[#111B21] dark:text-white">
                      Mot de passe actuel
                    </label>
                    <PasswordInput
                      value={editForm.currentPassword}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-[#111B21] dark:text-white">
                      Nouveau mot de passe
                    </label>
                    <PasswordInput
                      value={editForm.newPassword}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Min. 6 caractères"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
