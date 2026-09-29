import React, { useState, useEffect } from 'react';
import { PlatformConfig, PromoCode, UnlockRequest } from '../../types';
import { api } from '../../lib/api';
import {
  Settings,
  Save,
  CheckCircle2,
  Tag,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  Percent,
  Gift,
  AlertCircle,
  Clock,
  Check,
  X,
  Phone,
  User as UserIcon,
  CreditCard
} from 'lucide-react';

export const ConfigPricingView: React.FC = () => {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);

  // New promo code form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState<number>(20);
  const [newPromoApplicable, setNewPromoApplicable] = useState<'all' | 'ue_unlock' | 'tutoring'>('all');

  const loadAll = async () => {
    try {
      const [cRes, pRes, rRes] = await Promise.all([
        api.getAdminConfig(),
        api.getAdminPromoCodes(),
        api.getAdminUnlockRequests()
      ]);
      setConfig(cRes.config);
      setPromoCodes(pRes.promoCodes);
      setUnlockRequests(rRes.requests || []);
    } catch (err) {
      console.error('Error fetching admin config, promo codes, or requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    try {
      await api.updateAdminConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error updating config:', err);
      setErrorMsg('Erreur lors de la mise à jour des paramètres.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    try {
      const res = await api.createAdminPromoCode({
        code: newPromoCode.trim().toUpperCase(),
        discountPercent: Number(newPromoPercent),
        applicableTo: newPromoApplicable
      });
      setNewPromoCode('');
      setPromoSuccessMsg(`Offre promo "${res.promoCode.code}" créée avec succès (${res.promoCode.discountPercent}% de réduction).`);
      setTimeout(() => setPromoSuccessMsg(null), 3500);
      const pRes = await api.getAdminPromoCodes();
      setPromoCodes(pRes.promoCodes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de créer ce code promo.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleTogglePromo = async (id: string) => {
    try {
      await api.toggleAdminPromoCode(id);
      const pRes = await api.getAdminPromoCodes();
      setPromoCodes(pRes.promoCodes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Action impossible.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleDeletePromo = async (id: string) => {
    try {
      await api.deleteAdminPromoCode(id);
      setPromoSuccessMsg('Offre promo supprimée avec succès.');
      setTimeout(() => setPromoSuccessMsg(null), 3000);
      const pRes = await api.getAdminPromoCodes();
      setPromoCodes(pRes.promoCodes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur de suppression.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleApproveRequest = async (reqId: string, studentName: string) => {
    try {
      await api.approveUnlockRequest(reqId);
      setRequestSuccessMsg(`Demande de ${studentName} validée : les UE ont été débloquées avec succès !`);
      setTimeout(() => setRequestSuccessMsg(null), 4000);
      const rRes = await api.getAdminUnlockRequests();
      setUnlockRequests(rRes.requests || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la validation du déblocage.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleRejectRequest = async (reqId: string, studentName: string) => {
    try {
      await api.rejectUnlockRequest(reqId);
      setRequestSuccessMsg(`Demande de ${studentName} rejetée / bloquée.`);
      setTimeout(() => setRequestSuccessMsg(null), 4000);
      const rRes = await api.getAdminUnlockRequests();
      setUnlockRequests(rRes.requests || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors du rejet.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingRequests = unlockRequests.filter(r => r.status === 'pending');
  const pastRequests = unlockRequests.filter(r => r.status !== 'pending');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#111B21] dark:text-white">Tarifs, Offres & Déblocages UE</h2>
        <p className="text-xs text-[#667781] dark:text-[#8696A0]">
          Validation des demandes de déblocage d'UE soumises par les étudiants · Création des codes promo · Tarification officielle.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#25D366] text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
          Paramètres et tarifs enregistrés avec succès.
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {errorMsg}
        </div>
      )}

      {/* SECTION 1: DEMANDES DE DÉBLOCAGE ÉTUDIANTS (STAFF & SUPERUSER) */}
      <div className="bg-white dark:bg-[#111B21] p-6 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-4 text-xs transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-[#E9EDEF] dark:border-[#222E35]">
          <div>
            <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
              Demandes de Déblocage d'UE en Attente ({pendingRequests.length})
            </h3>
            <p className="text-[11px] text-[#667781] dark:text-[#8696A0] mt-0.5">
              Vérifiez le versement sur Mix Togo (+228 71 67 69 45) ou Flooz (+228 99 70 59 20) puis cliquez sur « Valider & Débloquer » sous 12h.
            </p>
          </div>
          {pendingRequests.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
              {pendingRequests.length} à traiter
            </span>
          )}
        </div>

        {requestSuccessMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#25D366] text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
            {requestSuccessMsg}
          </div>
        )}

        {pendingRequests.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#667781] dark:text-[#8696A0] bg-[#F0F2F5]/60 dark:bg-[#1F2C34]/40 rounded-xl">
            Toutes les demandes de déblocage ont été traitées. Aucune demande en attente.
          </div>
        ) : (
          <div className="divide-y divide-[#E9EDEF] dark:divide-[#222E35] border border-[#E9EDEF] dark:border-[#222E35] rounded-xl overflow-hidden">
            {pendingRequests.map((req) => {
              const displayName = req.userName || req.studentName || 'Étudiant';
              const displayPhone = req.userPhone || req.studentPhone || '';
              const promo = req.promoCode || req.appliedPromoCode;

              return (
                <div key={req.id} className="p-4 bg-white dark:bg-[#111B21] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F0F2F5]/40 dark:hover:bg-[#1F2C34]/40 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#111B21] dark:text-white">
                        {displayName}
                      </span>
                      {displayPhone && (
                        <span className="text-[10px] text-[#667781] dark:text-[#8696A0] font-mono">
                          ({displayPhone})
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                        {req.paymentMethod}
                      </span>
                    </div>

                    <p className="text-xs text-[#075E54] dark:text-[#25D366] font-medium">
                      Matières demandées ({req.ueCodes.length}) : <strong>{req.ueCodes.join(', ')}</strong>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#667781] dark:text-[#8696A0]">
                      <span>Montant total : <strong className="text-[#111B21] dark:text-white">{req.totalFcfa} FCFA</strong> (avec +100F frais)</span>
                      {promo && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                          Promo: {promo} (-{req.discountPercent}%)
                        </span>
                      )}
                      <span>· Date : {new Date(req.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleApproveRequest(req.id, displayName)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Valider & Débloquer
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id, displayName)}
                      className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-xl transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Rejeter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Historical requests summary */}
        {pastRequests.length > 0 && (
          <div className="pt-2">
            <details className="cursor-pointer">
              <summary className="text-[11px] font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white">
                Voir l'historique des {pastRequests.length} demandes déjà traitées
              </summary>
              <div className="mt-2 divide-y divide-[#E9EDEF] dark:divide-[#222E35] border border-[#E9EDEF] dark:border-[#222E35] rounded-xl max-h-48 overflow-y-auto">
                {pastRequests.map(r => (
                  <div key={r.id} className="p-2.5 flex items-center justify-between text-[11px] bg-white dark:bg-[#111B21]">
                    <div>
                      <span className="font-semibold text-[#111B21] dark:text-white">{r.studentName || r.userName || 'Étudiant'}</span>
                      <span className="text-[#667781] dark:text-[#8696A0] ml-2">({r.ueCodes.join(', ')})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      r.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-[#25D366]'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {r.status === 'approved' ? 'Validé' : 'Rejeté'}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* SECTION 2: CRÉATION D'OFFRE & CODES PROMO (SUPERUSER) */}
      <div className="bg-white dark:bg-[#111B21] p-6 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-5 text-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E9EDEF] dark:border-[#222E35]">
          <div>
            <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Création d'Offre Promotionnelle (Code Promo)
            </h3>
            <p className="text-[11px] text-[#667781] dark:text-[#8696A0] mt-0.5">
              L'utilisateur pourra saisir ce code promo lors d'une demande de déblocage d'UE ou de tutorat pour bénéficier de la réduction en pourcentage.
            </p>
          </div>
        </div>

        {promoSuccessMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#25D366] text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
            {promoSuccessMsg}
          </div>
        )}

        {/* Create Offer Form */}
        <form onSubmit={handleCreatePromo} className="p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Code promo à saisir *</label>
              <input
                type="text"
                required
                placeholder="Ex : REUSSITE20, EXAMEN50..."
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] font-bold tracking-wider text-[#075E54] dark:text-[#25D366] focus:outline-none focus:border-[#25D366]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Réduction en pourcentage (%) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={newPromoPercent}
                  onChange={(e) => setNewPromoPercent(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-bold pl-8 focus:outline-none focus:border-[#25D366]"
                />
                <Percent className="w-3.5 h-3.5 text-[#667781] dark:text-[#8696A0] absolute left-2.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Applicable sur</label>
              <select
                value={newPromoApplicable}
                onChange={(e) => setNewPromoApplicable(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-medium"
              >
                <option value="all">Déblocage d'UE & Tutorat</option>
                <option value="ue_unlock">Déblocage d'UE uniquement</option>
                <option value="tutoring">Tutorat en ligne uniquement</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-bold text-xs text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Créer l'offre promo
            </button>
          </div>
        </form>

        {/* Existing Promo Codes List */}
        <div className="space-y-2 pt-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
            Offres et Codes Promo Actifs ({promoCodes.length})
          </h4>

          {promoCodes.length === 0 ? (
            <p className="text-xs text-[#667781] dark:text-[#8696A0] p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl text-center">
              Aucun code promo créé pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-[#E9EDEF] dark:divide-[#222E35] border border-[#E9EDEF] dark:border-[#222E35] rounded-xl overflow-hidden">
              {promoCodes.map((p) => (
                <div
                  key={p.id}
                  className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                    p.isActive ? 'bg-white dark:bg-[#111B21]' : 'bg-[#F0F2F5]/60 dark:bg-[#1F2C34]/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] font-bold flex items-center justify-center text-xs border border-emerald-200 dark:border-emerald-800">
                      %{p.discountPercent}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#111B21] dark:text-white tracking-wider font-mono">
                          {p.code}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366]">
                          -{p.discountPercent}%
                        </span>
                        {!p.isActive && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                            Inactif
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">
                        Valable pour : {p.applicableTo === 'all' ? 'Toutes les offres' : p.applicableTo === 'ue_unlock' ? 'Déblocage UE' : 'Tutorat en ligne'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePromo(p.id)}
                      title={p.isActive ? 'Désactiver le code promo' : 'Activer le code promo'}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        p.isActive
                          ? 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'
                          : 'text-emerald-700 dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950'
                      }`}
                    >
                      {p.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeletePromo(p.id)}
                      title="Supprimer l'offre"
                      className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: TARIFS PRINCIPAUX */}
      <form onSubmit={handleSave} className="bg-white dark:bg-[#111B21] p-6 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-4 text-xs transition-colors">
        <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-1.5 pb-2 border-b border-[#E9EDEF] dark:border-[#222E35]">
          <Settings className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
          Grille Tarifaire Officielle
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
              Prix unitaire standard par UE (FCFA)
            </label>
            <input
              type="number"
              value={config.defaultUePriceFcfa}
              onChange={(e) => setConfig({ ...config, defaultUePriceFcfa: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white font-bold"
            />
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">Valeur officielle : 500 FCFA</p>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
              Prix par UE dès 3 UE achetées (FCFA)
            </label>
            <input
              type="number"
              value={config.discountedUePriceFcfa || 300}
              onChange={(e) => setConfig({ ...config, discountedUePriceFcfa: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white font-bold"
            />
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">Offre spéciale pack : 300 FCFA / UE</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
              Tutorat individuel en ligne (FCFA / heure)
            </label>
            <input
              type="number"
              value={config.onlineAssistancePerHourFcfa}
              onChange={(e) => setConfig({ ...config, onlineAssistancePerHourFcfa: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white font-bold"
            />
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">Via Google Meet ou WhatsApp</p>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
              Frais de transaction fixes (FCFA)
            </label>
            <input
              type="number"
              disabled
              value={100}
              className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white opacity-70 font-bold"
            />
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">+100 FCFA ajoutés aux demandes de déblocage</p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#111B21] dark:text-white">
            <input
              type="checkbox"
              checked={config.firstChapterFreeEnabled}
              onChange={(e) => setConfig({ ...config, firstChapterFreeEnabled: e.target.checked })}
              className="w-4 h-4 text-[#25D366] rounded"
            />
            Offrir la Séance 01 gratuitement à tous les étudiants inscrits (Non verrouillable)
          </label>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs self-end"
          >
            <Save className="w-3.5 h-3.5" />
            Enregistrer les tarifs
          </button>
        </div>
      </form>
    </div>
  );
};
