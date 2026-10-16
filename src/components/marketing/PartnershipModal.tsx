// src/components/marketing/PartnershipModal.tsx
import React, { useState } from "react";
import { Handshake, X, Send } from "lucide-react";
import { api } from "../../lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnershipModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    department: "",
    program: "",
    level: "L1",
    isDelegate: false,
    motivation: "",
    contribution: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    if (!form.fullName || !form.phone || !form.department || !form.program || !form.motivation) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      await api.submitPartnershipRequest(form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-lg w-full shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-between sticky top-0 bg-white dark:bg-[#111B21] z-10">
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[#25D366]" />
            <h3 className="font-bold text-[#111B21] dark:text-white">
              Rejoindre le projet
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]">
            <X className="w-5 h-5 text-[#667781]" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#25D366]/15 flex items-center justify-center mx-auto">
              <Handshake className="w-7 h-7 text-[#25D366]" />
            </div>
            <h4 className="font-bold text-[#111B21] dark:text-white">Demande envoyée !</h4>
            <p className="text-xs text-[#667781] dark:text-[#8696A0]">
              Nous te contacterons sur WhatsApp dans les prochains jours.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-5 py-2 rounded-xl bg-[#25D366] text-[#075E54] text-xs font-bold"
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {/* ... champs ... */}
            <input
              type="text"
              placeholder="Nom complet *"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#0B141A]"
            />
            <input
              type="tel"
              placeholder="Téléphone WhatsApp *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#0B141A]"
            />
            <input
              type="email"
              placeholder="Email (optionnel)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#0B141A]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Département *"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#0B141A]"
              />
              <input
                type="text"
                placeholder="Filière *"
                value={form.program}
                onChange={(e) => setForm({ ...form, program: e.target.value })}
                className="text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#0B141A]"
              />
            </div>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#0B141A]"
            >
              <option value="L1">L1</option>
              <option value="L2">L2</option>
              <option value="L3">L3</option>
              <option value="M1">M1</option>
              <option value="M2">M2</option>
            </select>

            <label className="flex items-center gap-2 text-xs text-[#111B21] dark:text-white">
              <input
                type="checkbox"
                checked={form.isDelegate}
                onChange={(e) => setForm({ ...form, isDelegate: e.target.checked })}
              />
              Je suis délégué(e) de ma filière
            </label>

            <textarea
              placeholder="Pourquoi veux-tu rejoindre le projet ? *"
              value={form.motivation}
              onChange={(e) => setForm({ ...form, motivation: e.target.value })}
              rows={3}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#0B141A]"
            />
            <textarea
              placeholder="Contribution envisagée (optionnel)"
              value={form.contribution}
              onChange={(e) => setForm({ ...form, contribution: e.target.value })}
              rows={2}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#0B141A]"
            />

            {error && (
              <p className="text-xs text-rose-500 font-semibold">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#25D366] text-[#075E54] text-xs font-bold hover:bg-[#1faa54] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? "Envoi..." : "Envoyer ma demande"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};