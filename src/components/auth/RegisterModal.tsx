import React, { useState } from 'react';
import { X, UserPlus, Phone, Lock, School, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UlStudyFlowLogo } from '../brand/UlStudyFlowLogo';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin
}) => {
  const { register } = useAuth();
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('FASEG');
  const [program, setProgram] = useState('Sciences Économiques');
  const [level, setLevel] = useState<'L1' | 'L2' | 'L3'>('L1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      await register({
        phone,
        firstName,
        lastName,
        department,
        program,
        level,
        password,
        confirmPassword
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Échec lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const getProgramsForDepartment = (dept: string) => {
    switch (dept) {
      case 'FASEG':
        return ['Sciences Économiques', 'Sciences de Gestion', 'Économie'];
      case 'FDS':
        return ['Informatique & Systèmes', 'Mathématiques Appliquées', 'Sciences Physiques'];
      case 'FDD':
        return ['Droit Privé', 'Droit Public', 'Sciences Politiques'];
      case 'FLLA':
        return ['Anglais (Études Anglophones)', 'Linguistique & Communication'];
      default:
        return ['Formation Générale'];
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
            <h3 className="font-bold text-xl text-[#111B21] dark:text-white">Créer un compte étudiant</h3>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
              Rejoins la communauté universitaire de Lomé sur UL STUDY FLOW.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
              {error}
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
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">
                Normalisé automatiquement (+228) pour éviter les doublons.
              </p>
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

            {/* Academic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                  Département *
                </label>
                <select
                  value={department}
                  onChange={(e) => {
                    const newDept = e.target.value;
                    setDepartment(newDept);
                    const progs = getProgramsForDepartment(newDept);
                    setProgram(progs[0]);
                  }}
                  className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
                >
                  <option value="FASEG">FASEG</option>
                  <option value="FDS">FDS</option>
                  <option value="FDD">FDD</option>
                  <option value="FLLA">FLLA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                  Filière *
                </label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
                >
                  {getProgramsForDepartment(department).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
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
                <input
                  type="password"
                  required
                  placeholder="Min. 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                  Confirmation *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirmer"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all disabled:opacity-50 mt-2 shadow-sm active:scale-95"
            >
              {loading ? 'Création du compte...' : 'Créer mon compte et accéder aux cours'}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#667781] dark:text-[#8696A0]">
            Vous possédez déjà un compte ?{' '}
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
