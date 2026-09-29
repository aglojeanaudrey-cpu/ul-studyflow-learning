import React, { useState, useEffect } from 'react';
import { UE } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Lock,
  Unlock,
  Check,
  CheckCircle2,
  Sparkles,
  Phone,
  Send,
  Tag,
  AlertCircle,
  HelpCircle,
  Copy
} from 'lucide-react';

interface UnlockUeModalProps {
  isOpen: boolean;
  initialSelectedUeId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const UnlockUeModal: React.FC<UnlockUeModalProps> = ({
  isOpen,
  initialSelectedUeId,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<UE[]>([]);
  const [selectedUeIds, setSelectedUeIds] = useState<string[]>([]);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [numero, setNumero] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mix' | 'flooz'>('mix');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getCourses();
        // Filter published and locked courses
        setCourses(res.courses.filter(c => !c.isSuspended));
      } catch (err) {
        console.error('Error loading courses for unlock:', err);
      }
    }
    if (isOpen) {
      load();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setNom(user.lastName || '');
      setPrenom(user.firstName || '');
      setNumero(user.displayPhone || user.phone || '');
    }
    if (initialSelectedUeId) {
      setSelectedUeIds([initialSelectedUeId]);
    }
  }, [user, initialSelectedUeId, isOpen]);

  if (!isOpen) return null;

  const toggleUeSelection = (ueId: string) => {
    if (selectedUeIds.includes(ueId)) {
      setSelectedUeIds(selectedUeIds.filter(id => id !== ueId));
    } else {
      setSelectedUeIds([...selectedUeIds, ueId]);
    }
  };

  const selectAllUes = () => {
    const lockedIds = courses.filter(c => !c.isUnlocked).map(c => c.id);
    setSelectedUeIds(lockedIds);
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoError(null);
    try {
      const res = await api.validatePromoCode(promoCodeInput.trim());
      if (res.valid && res.discountPercent) {
        setAppliedPromo({
          code: res.code || promoCodeInput.trim().toUpperCase(),
          discountPercent: res.discountPercent
        });
      } else {
        setPromoError(res.error || 'Code promo invalide.');
      }
    } catch (err: any) {
      setPromoError(err.message || 'Code promo invalide ou expiré.');
    }
  };

  // Price calculations
  const count = selectedUeIds.length;
  // Tier pricing: 500 standard, 300 if 3 or more UEs
  const unitPrice = count >= 3 ? 300 : 500;
  const rawSubtotal = count * unitPrice;
  const discountAmount = appliedPromo ? Math.round((rawSubtotal * appliedPromo.discountPercent) / 100) : 0;
  const discountedSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const transactionFee = 100;
  const totalToPay = count > 0 ? discountedSubtotal + transactionFee : 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedUeIds.length === 0) {
      setError('Veuillez sélectionner au moins une UE à débloquer.');
      return;
    }
    if (!nom.trim() || !prenom.trim() || !numero.trim()) {
      setError('Veuillez remplir votre nom, prénom et numéro de téléphone.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitUnlockRequest({
        nom: nom.trim(),
        prenom: prenom.trim(),
        numero: numero.trim(),
        ueIds: selectedUeIds,
        promoCode: appliedPromo?.code,
        paymentMethod: paymentMethod === 'mix' ? 'Mix Togo (+228 71 67 69 45)' : 'Flooz Togo (+228 99 70 59 20)',
        notes: notes.trim()
      });

      setSubmittedRequest(res.request);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de la demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative border border-[#E9EDEF] my-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#667781] hover:text-[#111B21] p-1.5 rounded-lg hover:bg-[#F0F2F5]"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedRequest ? (
          /* Confirmation & Instructions view */
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#075E54] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-[#111B21]">Demande de Déblocage Enregistrée !</h3>
              <p className="text-xs text-[#667781] mt-1">
                Réf: <span className="font-mono font-bold text-[#111B21]">{submittedRequest.id}</span> · UEs demandées : <strong>{submittedRequest.ueCodes.join(', ')}</strong>
              </p>
            </div>

            {/* Total and numbers box */}
            <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-300 text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <span className="font-bold text-xs text-amber-900">Montant total exact à déposer :</span>
                <span className="text-xl font-extrabold text-[#075E54] tabular-nums">
                  {submittedRequest.totalFcfa} FCFA
                </span>
              </div>

              <div className="space-y-2 text-xs text-amber-900">
                <p className="font-semibold">
                  Veuillez effectuer votre dépôt dès maintenant sur l'un des comptes officiels :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#667781] block">T-MONEY (Mix Togo)</span>
                      <span className="font-mono font-bold text-sm text-[#111B21]">+228 71 67 69 45</span>
                    </div>
                    <button
                      onClick={() => handleCopy('+22871676945')}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100"
                      title="Copier le numéro"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#667781] block">MOOV MONEY (Flooz Togo)</span>
                      <span className="font-mono font-bold text-sm text-[#111B21]">+228 99 70 59 20</span>
                    </div>
                    <button
                      onClick={() => handleCopy('+22899705920')}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100"
                      title="Copier le numéro"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[#075E54] text-[11px] leading-relaxed">
                  ✓ <strong>Activation garantie :</strong> L'administration vous donnera accès à vos cours dans les prochaines <strong>12h</strong> après vérification du transfert.
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs"
            >
              Compris, j'effectue le dépôt
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Unlock className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111B21]">Demande de déblocage d'UE</h3>
                  <p className="text-xs text-[#667781]">
                    Accédez à toutes les séances, exercices corrigés et polycopiés de vos matières.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Information Utilisateur */}
            <div className="p-4 bg-[#F0F2F5] rounded-2xl space-y-3">
              <span className="font-bold text-xs uppercase tracking-wider text-[#667781] block">
                1. Vos coordonnées de contact
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21]">Nom *</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-white font-medium focus:outline-none focus:border-[#25D366]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21]">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-white font-medium focus:outline-none focus:border-[#25D366]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21]">Numéro de téléphone (+228) *</label>
                  <input
                    type="tel"
                    required
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-white font-mono font-medium focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>
            </div>

            {/* Sélection des UEs (1 ou plusieurs) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-[#667781]">
                  2. Choisissez la ou les UE à débloquer ({selectedUeIds.length} sélectionnée(s))
                </span>
                <button
                  type="button"
                  onClick={selectAllUes}
                  className="text-[11px] font-bold text-[#075E54] hover:underline"
                >
                  Tout sélectionner
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {courses.map((ue) => {
                  const isSelected = selectedUeIds.includes(ue.id);
                  const isAlreadyUnlocked = ue.isUnlocked;

                  return (
                    <div
                      key={ue.id}
                      onClick={() => !isAlreadyUnlocked && toggleUeSelection(ue.id)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isAlreadyUnlocked
                          ? 'bg-emerald-50/60 border-emerald-200 cursor-default opacity-80'
                          : isSelected
                          ? 'bg-emerald-50 border-[#25D366] shadow-2xs'
                          : 'bg-white border-[#E9EDEF] hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#075E54]">{ue.code}</span>
                          <span className="text-[10px] text-[#667781]">({ue.level})</span>
                          {isAlreadyUnlocked && (
                            <span className="text-[9px] font-bold text-[#25D366] bg-white px-1.5 rounded">
                              Déjà actif
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-[#111B21] truncate">{ue.title}</p>
                      </div>

                      <div className="shrink-0">
                        {isAlreadyUnlocked ? (
                          <Check className="w-4 h-4 text-[#25D366]" />
                        ) : (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // parent click handled
                            className="w-4 h-4 text-[#25D366] rounded pointer-events-none"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {count >= 3 ? (
                <div className="p-2 bg-emerald-50 text-[#075E54] rounded-xl text-[11px] font-bold flex items-center gap-1.5 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tarif pack activé : 300 FCFA par UE (au lieu de 500 FCFA) dès 3 matières !
                </div>
              ) : count > 0 ? (
                <p className="text-[11px] text-[#667781] italic">
                  💡 Conseil : Choisissez 3 UE ou plus pour bénéficier du tarif réduit à 300 FCFA l'unité !
                </p>
              ) : null}
            </div>

            {/* Code Promo */}
            <div className="p-3.5 bg-[#F0F2F5] rounded-2xl space-y-2">
              <label className="block font-semibold text-[#111B21]">Code promo / Offre de réduction (Optionnel)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Saisissez votre code promo..."
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    className="w-full p-2 rounded-xl border border-[#E9EDEF] bg-white uppercase tracking-wider font-mono font-bold pl-8 focus:outline-none focus:border-[#25D366]"
                  />
                  <Tag className="w-3.5 h-3.5 text-[#667781] absolute left-2.5 top-3" />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-colors shadow-2xs"
                >
                  Appliquer
                </button>
              </div>

              {appliedPromo && (
                <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  ✓ Code {appliedPromo.code} appliqué (-{appliedPromo.discountPercent}% de remise)
                </p>
              )}
              {promoError && (
                <p className="text-[11px] text-rose-600 font-semibold">{promoError}</p>
              )}
            </div>

            {/* Total Preview Box & Deposit Instructions */}
            <div className="p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl space-y-3">
              <div className="space-y-1.5 text-xs text-slate-800 pb-2 border-b border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-[#667781]">Matières sélectionnées :</span>
                  <span className="font-semibold">{count} UE ({unitPrice} FCFA / unité)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667781]">Sous-total UE :</span>
                  <span className="font-semibold">{rawSubtotal} FCFA</span>
                </div>
                {appliedPromo && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>Remise Code Promo (-{appliedPromo.discountPercent}%) :</span>
                    <span>-{discountAmount} FCFA</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#667781]">Frais de transaction :</span>
                  <span className="font-semibold">+100 FCFA</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-[#075E54] block">
                    Somme totale à payer :
                  </span>
                  <span className="text-[10px] text-[#667781]">Montant exact du dépôt</span>
                </div>
                <div className="text-2xl font-black text-[#075E54] tabular-nums">
                  {totalToPay} FCFA
                </div>
              </div>
            </div>

            {/* Instruction de Paiement & Numéros */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs text-amber-950">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-900 block">
                3. Instructions de dépôt & Comptes officiels
              </span>
              <p className="leading-relaxed">
                Après avoir cliqué sur <strong>"Confirmer la demande"</strong>, faites un dépôt de la somme totale affichée (<strong>{totalToPay} FCFA</strong>) sur l'un de nos numéros ci-dessous. L'administration vous donnera accès dans les prochaines <strong>12h</strong> :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
                <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-sans font-bold text-[#667781] block">Mix Togo (T-Money)</span>
                    <span className="font-bold text-xs text-[#111B21]">+228 71 67 69 45</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('+22871676945')}
                    className="p-1 rounded bg-amber-50 text-amber-800 hover:bg-amber-100"
                    title="Copier"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-sans font-bold text-[#667781] block">Flooz Togo (Moov Money)</span>
                    <span className="font-bold text-xs text-[#111B21]">+228 99 70 59 20</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('+22899705920')}
                    className="p-1 rounded bg-amber-50 text-amber-800 hover:bg-amber-100"
                    title="Copier"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {copiedNumber && (
                <p className="text-[11px] font-bold text-emerald-700 text-center">
                  Numéro {copiedNumber} copié dans le presse-papier !
                </p>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#111B21] mb-1">
                  ID de transaction / Référence du dépôt (Optionnel si vous le faites après)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Référence SMS du transfert..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border border-amber-200 bg-white"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9EDEF]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-[#667781] hover:text-[#111B21]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || count === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all disabled:opacity-50 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Traitement en cours...' : `Confirmer la demande (${totalToPay} FCFA)`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
