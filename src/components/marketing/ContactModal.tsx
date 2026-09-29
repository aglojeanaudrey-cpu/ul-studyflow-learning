import React, { useState } from 'react';
import { X, Send, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { api } from '../../lib/api';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Demande d\'information');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.sendContact(name, phone, subject, message);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E9EDEF]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1.5 rounded-lg hover:bg-[#F0F2F5]"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#075E54] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-[#25D366]" />
            </div>
            <h3 className="font-bold text-lg text-[#111B21]">Message bien reçu !</h3>
            <p className="text-xs text-[#667781] max-w-sm mx-auto">
              Merci {name}. Notre équipe de tuteurs UL Study Flow vous contactera rapidement par appel ou WhatsApp au {phone}.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="px-6 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-[#111B21]">Contacter UL Study Flow</h3>
              <p className="text-xs text-[#667781]">
                Une question, une assistance ou une inscription à un tutorat ? Écrivez-nous ou joignez-nous directement :
              </p>
              <div className="mt-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-[#075E54] flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                  +228 99 70 59 20 / 71 67 69 45
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-[#25D366]" />
                  ulstudyflow@gmail.com
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#111B21] mb-1">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Kodjo Mensah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white focus:border-[#25D366] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111B21] mb-1">
                  Numéro de téléphone (WhatsApp) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : 90 12 34 56 ou +228 90 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white focus:border-[#25D366] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111B21] mb-1">
                  Sujet de votre demande
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white focus:border-[#25D366] focus:outline-none"
                >
                  <option>Demande d'information générale</option>
                  <option>Problème d'accès à mon UE</option>
                  <option>Réservation de tutorat en ligne (Google Meet / WhatsApp)</option>
                  <option>Devenir tuteur ou enseignant partenaire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111B21] mb-1">
                  Votre message *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Expliquez-nous votre situation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white focus:border-[#25D366] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#667781] hover:text-[#111B21]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loading ? 'Envoi...' : 'Envoyer le message'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
