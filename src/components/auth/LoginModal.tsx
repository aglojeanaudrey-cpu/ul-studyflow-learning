import React, { useState } from 'react';
import { X, LogIn, Phone, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UlStudyFlowLogo } from '../brand/UlStudyFlowLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister, onSuccess }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Échec de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111B21] rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] transition-colors">
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
            <h3 className="font-bold text-xl text-[#111B21] dark:text-white">Connexion à votre compte</h3>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
              Accédez à vos cours et à votre progression universitaire LMD.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1">
                Numéro de téléphone ou E-mail
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex : 99 70 59 20 ou aglojeanaudrey@gmail.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
                />
                <Phone className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-[#111B21] dark:text-white">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-2.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all shadow-sm active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] text-center text-xs text-[#667781] dark:text-[#8696A0]">
            Pas encore de compte étudiant ?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-bold text-[#075E54] dark:text-[#25D366] hover:underline"
            >
              Créer un compte gratuitement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
