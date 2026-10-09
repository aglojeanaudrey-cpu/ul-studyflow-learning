import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Phone,
  Lock,
  School,
  GraduationCap,
  AlertCircle,
  Gift,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Department, Program } from "../../types";
import { UlStudyFlowLogo } from "../brand/UlStudyFlowLogo";
import { PasswordInput } from "../ui/PasswordInput";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const { register } = useAuth();

  // Meta académique
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  // Formulaire
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [programId, setProgramId] = useState("");
  const [level, setLevel] = useState<"L1" | "L2" | "L3">("L1");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ⭐ Code de parrainage détecté dans l'URL
  const [referralCode] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref");
  });

  // ⭐ Charger les vrais départements et programmes depuis l'API
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    async function loadMeta() {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const res = await api.getAcademicMeta();
        if (cancelled) return;

        const activeDepts = (res.departments || []).filter(
          (d: any) => !d.isSuspended,
        );
        const activeProgs = (res.programs || []).filter(
          (p: any) => !p.isSuspended,
        );

        setDepartments(activeDepts);
        setPrograms(activeProgs);

        // Pré-sélectionner le premier département + sa première filière
        if (activeDepts.length > 0) {
          setDepartmentCode(activeDepts[0].code);
          const firstProg = activeProgs.find(
            (p) => p.departmentId === activeDepts[0].id,
          );
          setProgramId(firstProg?.id || "");
        }
      } catch (err: any) {
        if (!cancelled)
          setMetaError(
            err.message || "Impossible de charger les départements.",
          );
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    }

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // ⭐ Filières du département actuellement sélectionné
  const currentDept = departments.find((d) => d.code === departmentCode);
  const filteredPrograms = currentDept
    ? programs.filter((p) => p.departmentId === currentDept.id)
    : [];

  // Reset de la filière si le département change
  const handleDepartmentChange = (newCode: string) => {
    setDepartmentCode(newCode);
    const dept = departments.find((d) => d.code === newCode);
    if (dept) {
      const firstProg = programs.find((p) => p.departmentId === dept.id);
      setProgramId(firstProg?.id || "");
    } else {
      setProgramId("");
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!departmentCode || !programId) {
      setError("Veuillez sélectionner un département et une filière.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const selectedProgram = programs.find((p) => p.id === programId);

      await register({
        phone,
        firstName,
        lastName,
        department: departmentCode,
        program: selectedProgram?.name || "",
        level,
        password,
        confirmPassword,
        referralCode: referralCode || undefined, // ⭐ Passer le code de parrainage
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Échec lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#111B21] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] my-8 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white p-1.5 rounded-xl hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div>
            <div className="mb-3">
              <UlStudyFlowLogo size="sm" showTagline />
            </div>
            <h3 className="font-bold text-xl text-[#111B21] dark:text-white">
              Créer un compte étudiant
            </h3>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
              Rejoins la communauté universitaire de Lomé sur UL STUDY FLOW.
            </p>
          </div>

          {metaError && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {metaError}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {referralCode && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#25D366] shrink-0" />
              <span>
                🎁 Vous avez été parrainé avec le code{" "}
                <strong>{referralCode}</strong> !
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                Numéro de téléphone (Format Togo) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex : 90 12 34 56 ou +228 90 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
                />
                <Phone className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Prénom & Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Kodjo"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Mensah"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
                />
              </div>
            </div>

            {/* Academic Info — ⭐ alimenté par l'API */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                  Département *
                </label>
                <div className="relative">
                  <select
                    value={departmentCode}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    disabled={metaLoading || departments.length === 0}
                    className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none disabled:opacity-50"
                  >
                    {metaLoading ? (
                      <option value="">Chargement...</option>
                    ) : departments.length === 0 ? (
                      <option value="">Aucun département</option>
                    ) : (
                      departments.map((d) => (
                        <option key={d.id} value={d.code}>
                          {d.code} — {d.name}
                        </option>
                      ))
                    )}
                  </select>
                  <School className="w-3.5 h-3.5 text-[#667781] dark:text-[#8696A0] absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                  Filière *
                </label>
                <div className="relative">
                  <select
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    disabled={metaLoading || filteredPrograms.length === 0}
                    className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none disabled:opacity-50"
                  >
                    {metaLoading ? (
                      <option value="">Chargement...</option>
                    ) : filteredPrograms.length === 0 ? (
                      <option value="">Aucune filière</option>
                    ) : (
                      filteredPrograms.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} — {p.name}
                        </option>
                      ))
                    )}
                  </select>
                  <GraduationCap className="w-3.5 h-3.5 text-[#667781] dark:text-[#8696A0] absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                  Niveau *
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
                >
                  <option value="L1">Licence 1 (L1)</option>
                  <option value="L2">Licence 2 (L2)</option>
                  <option value="L3">Licence 3 (L3)</option>
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                  Mot de passe *
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                  Confirmation *
                </label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || metaLoading || !programId}
              className="w-full py-3 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all disabled:opacity-50 mt-2 shadow-sm active:scale-95"
            >
              {loading
                ? "Création du compte..."
                : "Créer mon compte et accéder aux cours"}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#667781] dark:text-[#8696A0]">
            Vous possédez déjà un compte ?{" "}
            <button
              onClick={() => {
                onClose();
                onSwitchToLogin();
              }}
              className="font-bold text-[#075E54] dark:text-[#25D366] hover:underline"
            >
              Connectez-vous ici
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
