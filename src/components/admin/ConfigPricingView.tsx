import React, { useState, useEffect } from "react";
import {
  PlatformConfig,
  PromoCode,
  UnlockRequest,
  PaymentMethod,
} from "../../types";
import { api } from "../../lib/api";
import {
  Settings,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Percent,
  Gift,
  AlertCircle,
  Check,
  X,
  CreditCard,
  QrCode,
  Link as LinkIcon,
  Smartphone,
  Edit2,
  ExternalLink,
  Image as ImageIcon,
  ArrowUpDown,
  Eye,
  Calendar,
  Clock,
} from "lucide-react";

export const ConfigPricingView: React.FC = () => {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(
    null,
  );
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(
    null,
  );

  // New promo code form
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoPercent, setNewPromoPercent] = useState<number>(20);
  const [newPromoApplicable, setNewPromoApplicable] = useState<
    "all" | "ue_unlock" | "tutoring"
  >("all");

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Payment Method Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState<{
    name: string;
    type: "phone_account" | "payment_link" | "qr_code" | "other";
    accountNumber: string;
    paymentUrl: string;
    qrCodeImage: string;
    instructions: string;
    logoUrl: string;
    order: number;
    isActive: boolean;
  }>({
    name: "",
    type: "phone_account",
    accountNumber: "",
    paymentUrl: "",
    qrCodeImage: "",
    instructions: "",
    logoUrl: "",
    order: 1,
    isActive: true,
  });

  const loadAll = async () => {
    try {
      const [cRes, pRes, rRes, pmRes] = await Promise.all([
        api.getAdminConfig(),
        api.getAdminPromoCodes(),
        api.getAdminUnlockRequests(),
        api.getAdminPaymentMethods(),
      ]);
      setConfig(cRes.config);
      setPromoCodes(pRes.promoCodes);
      setUnlockRequests(rRes.requests || []);
      setPaymentMethods(pmRes.paymentMethods || []);
    } catch (err) {
      console.error(
        "Error fetching admin config, promo codes, requests, or payment methods:",
        err,
      );
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
      console.error("Error updating config:", err);
      setErrorMsg("Erreur lors de la mise à jour des paramètres.");
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
        applicableTo: newPromoApplicable,
      });
      setNewPromoCode("");
      setPromoSuccessMsg(
        `Offre promo "${res.promoCode.code}" créée avec succès (${res.promoCode.discountPercent}% de réduction).`,
      );
      setTimeout(() => setPromoSuccessMsg(null), 3500);
      const pRes = await api.getAdminPromoCodes();
      setPromoCodes(pRes.promoCodes);
    } catch (err: any) {
      setErrorMsg(err.message || "Impossible de créer ce code promo.");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleTogglePromo = async (id: string) => {
    try {
      await api.toggleAdminPromoCode(id);
      const pRes = await api.getAdminPromoCodes();
      setPromoCodes(pRes.promoCodes);
    } catch (err: any) {
      setErrorMsg(err.message || "Action impossible.");
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleDeletePromo = async (id: string) => {
    try {
      await api.deleteAdminPromoCode(id);
      setPromoSuccessMsg("Offre promo supprimée avec succès.");
      setTimeout(() => setPromoSuccessMsg(null), 3000);
      const pRes = await api.getAdminPromoCodes();
      setPromoCodes(pRes.promoCodes);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de suppression.");
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  // Payment Methods Handlers
  const openCreatePaymentModal = () => {
    setEditingPaymentMethod(null);
    setPaymentForm({
      name: "",
      type: "phone_account",
      accountNumber: "",
      paymentUrl: "",
      qrCodeImage: "",
      instructions:
        "Effectuez votre transfert puis conservez la confirmation SMS.",
      logoUrl: "",
      order: paymentMethods.length + 1,
      isActive: true,
    });
    setIsPaymentModalOpen(true);
  };

  const openEditPaymentModal = (pm: PaymentMethod) => {
    setEditingPaymentMethod(pm);
    setPaymentForm({
      name: pm.name,
      type: pm.type,
      accountNumber: pm.accountNumber || "",
      paymentUrl: pm.paymentUrl || "",
      qrCodeImage: pm.qrCodeImage || "",
      instructions: pm.instructions || "",
      logoUrl: pm.logoUrl || "",
      order: pm.order,
      isActive: pm.isActive,
    });
    setIsPaymentModalOpen(true);
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.name.trim()) return;

    try {
      if (editingPaymentMethod) {
        await api.updateAdminPaymentMethod(
          editingPaymentMethod.id,
          paymentForm,
        );
        setPaymentSuccessMsg(
          `Moyen de paiement "${paymentForm.name}" modifié.`,
        );
      } else {
        await api.createAdminPaymentMethod(paymentForm);
        setPaymentSuccessMsg(
          `Moyen de paiement "${paymentForm.name}" ajouté avec succès.`,
        );
      }
      setIsPaymentModalOpen(false);
      setTimeout(() => setPaymentSuccessMsg(null), 3500);
      const res = await api.getAdminPaymentMethods();
      setPaymentMethods(res.paymentMethods || []);
    } catch (err: any) {
      setErrorMsg(
        err.message || "Erreur lors de l'enregistrement du moyen de paiement.",
      );
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleTogglePaymentMethod = async (id: string) => {
    try {
      await api.toggleAdminPaymentMethod(id);
      const res = await api.getAdminPaymentMethods();
      setPaymentMethods(res.paymentMethods || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Action impossible.");
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleDeletePaymentMethod = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Voulez-vous vraiment supprimer le moyen de paiement "${name}" ?`,
      )
    )
      return;
    try {
      await api.deleteAdminPaymentMethod(id);
      setPaymentSuccessMsg(`Moyen de paiement "${name}" supprimé.`);
      setTimeout(() => setPaymentSuccessMsg(null), 3000);
      const res = await api.getAdminPaymentMethods();
      setPaymentMethods(res.paymentMethods || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la suppression.");
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleApproveRequest = async (reqId: string, studentName: string) => {
    try {
      await api.approveUnlockRequest(reqId);
      setRequestSuccessMsg(
        `Demande de ${studentName} validée : les UE ont été débloquées avec succès !`,
      );
      setTimeout(() => setRequestSuccessMsg(null), 4000);
      const rRes = await api.getAdminUnlockRequests();
      setUnlockRequests(rRes.requests || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la validation du déblocage.");
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
      setErrorMsg(err.message || "Erreur lors du rejet.");
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

  const pendingRequests = unlockRequests.filter((r) => r.status === "pending");
  const pastRequests = unlockRequests.filter((r) => r.status !== "pending");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#111B21] dark:text-white">
          Tarifs, Offres & Moyens de Paiement
        </h2>
        <p className="text-xs text-[#667781] dark:text-[#8696A0]">
          Gestion des demandes de déblocage · Configuration des moyens de
          paiement (Numéros, Liens, QR Codes) · Codes promo · Tarification
          officielle.
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

      {/* SECTION 1: DEMANDES DE DÉBLOCAGE ÉTUDIANTS */}
      <div className="bg-white dark:bg-[#111B21] p-6 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-4 text-xs transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-[#E9EDEF] dark:border-[#222E35]">
          <div>
            <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
              Demandes de Déblocage d'UE en Attente ({pendingRequests.length})
            </h3>
            <p className="text-[11px] text-[#667781] dark:text-[#8696A0] mt-0.5">
              Vérifiez le versement puis validez le déblocage sous 12h.
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
            Toutes les demandes de déblocage ont été traitées. Aucune demande en
            attente.
          </div>
        ) : (
          <div className="divide-y divide-[#E9EDEF] dark:divide-[#222E35] border border-[#E9EDEF] dark:border-[#222E35] rounded-xl overflow-hidden">
            {pendingRequests.map((req) => {
              const displayName = req.userName || req.studentName || "Étudiant";
              const displayPhone = req.userPhone || req.studentPhone || "";
              const promo = req.promoCode || req.appliedPromoCode;

              return (
                <div
                  key={req.id}
                  className="p-4 bg-white dark:bg-[#111B21] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F0F2F5]/40 dark:hover:bg-[#1F2C34]/40 transition-colors"
                >
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
                      Matières demandées ({req.ueCodes.length}) :{" "}
                      <strong>{req.ueCodes.join(", ")}</strong>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#667781] dark:text-[#8696A0]">
                      <span>
                        Montant total :{" "}
                        <strong className="text-[#111B21] dark:text-white">
                          {req.totalFcfa} FCFA
                        </strong>{" "}
                        (avec +100F frais)
                      </span>
                      {promo && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                          Promo: {promo} (-{req.discountPercent}%)
                        </span>
                      )}
                      <span>
                        · Date :{" "}
                        {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
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
                Voir l'historique des {pastRequests.length} demandes déjà
                traitées
              </summary>
              <div className="mt-2 divide-y divide-[#E9EDEF] dark:divide-[#222E35] border border-[#E9EDEF] dark:border-[#222E35] rounded-xl max-h-48 overflow-y-auto">
                {pastRequests.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 flex items-center justify-between text-[11px] bg-white dark:bg-[#111B21]"
                  >
                    <div>
                      <span className="font-semibold text-[#111B21] dark:text-white">
                        {r.studentName || r.userName || "Étudiant"}
                      </span>
                      <span className="text-[#667781] dark:text-[#8696A0] ml-2">
                        ({r.ueCodes.join(", ")})
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        r.status === "approved"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-[#25D366]"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {r.status === "approved" ? "Validé" : "Rejeté"}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* SECTION 2: CONFIGURATION DIRECTE DES MOYENS DE PAIEMENT (NUMÉROS, LIENS, QR CODES) */}
      <div className="bg-white dark:bg-[#111B21] p-6 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-5 text-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E9EDEF] dark:border-[#222E35]">
          <div>
            <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
              Moyens de Paiement Officiels (Numéros, Liens & QR Codes)
            </h3>
            <p className="text-[11px] text-[#667781] dark:text-[#8696A0] mt-0.5">
              Configurez directement les numéros de téléphone (T-Money, Flooz),
              les boutons de redirection ou les images de QR Code affichés aux
              étudiants.
            </p>
          </div>

          <button
            onClick={openCreatePaymentModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un canal de paiement
          </button>
        </div>

        {paymentSuccessMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#25D366] text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
            {paymentSuccessMsg}
          </div>
        )}

        {paymentMethods.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#667781] dark:text-[#8696A0] bg-[#F0F2F5]/60 dark:bg-[#1F2C34]/40 rounded-xl space-y-2">
            <p>Aucun moyen de paiement configuré pour le moment.</p>
            <button
              onClick={openCreatePaymentModal}
              className="px-3.5 py-1.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
            >
              + Configurer un premier moyen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {paymentMethods.map((pm) => {
              return (
                <div
                  key={pm.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 relative ${
                    pm.isActive
                      ? "bg-white dark:bg-[#111B21] border-[#E9EDEF] dark:border-[#222E35] shadow-xs"
                      : "bg-[#F0F2F5]/60 dark:bg-[#1F2C34]/40 border-dashed border-gray-300 dark:border-gray-700 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
                        {pm.type === "phone_account" ? (
                          <Smartphone className="w-4 h-4" />
                        ) : pm.type === "payment_link" ? (
                          <LinkIcon className="w-4 h-4" />
                        ) : pm.type === "qr_code" ? (
                          <QrCode className="w-4 h-4" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#111B21] dark:text-white">
                          {pm.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-gray-100 dark:bg-gray-800 text-[#667781] dark:text-[#8696A0]">
                            {pm.type === "phone_account"
                              ? "Numéro / Compte"
                              : pm.type === "payment_link"
                                ? "Lien de Paiement"
                                : pm.type === "qr_code"
                                  ? "QR Code"
                                  : "Autre"}
                          </span>
                          <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                            Ordre: {pm.order}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePaymentMethod(pm.id)}
                        title={
                          pm.isActive
                            ? "Désactiver ce moyen"
                            : "Activer ce moyen"
                        }
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          pm.isActive
                            ? "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950"
                            : "text-emerald-700 dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        }`}
                      >
                        {pm.isActive ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditPaymentModal(pm)}
                        title="Modifier"
                        className="p-1.5 rounded-lg text-[#075E54] dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeletePaymentMethod(pm.id, pm.name)
                        }
                        title="Supprimer"
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Channel Details Display */}
                  <div className="space-y-1.5 bg-[#F0F2F5] dark:bg-[#1F2C34] p-2.5 rounded-lg text-[11px]">
                    {pm.accountNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#667781] dark:text-[#8696A0]">
                          Numéro / Compte :
                        </span>
                        <strong className="font-mono text-[#111B21] dark:text-white font-bold">
                          {pm.accountNumber}
                        </strong>
                      </div>
                    )}
                    {pm.paymentUrl && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#667781] dark:text-[#8696A0] shrink-0">
                          Lien :
                        </span>
                        <a
                          href={pm.paymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 font-mono truncate hover:underline flex items-center gap-1"
                        >
                          {pm.paymentUrl}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    {pm.qrCodeImage && (
                      <div className="pt-1 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setLightboxImage(pm.qrCodeImage!)}
                          className="group relative shrink-0"
                          title="Cliquer pour agrandir"
                        >
                          <img
                            src={pm.qrCodeImage}
                            alt="QR Code"
                            className="w-20 h-20 rounded-lg object-contain bg-white p-1 border border-gray-200 group-hover:border-[#25D366] group-hover:shadow-md transition-all"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                          </div>
                        </button>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[10px] font-bold text-[#075E54] dark:text-[#25D366]">
                            QR Code prêt
                          </span>
                          <span className="text-[9px] text-[#667781] dark:text-[#8696A0]">
                            Cliquer pour agrandir
                          </span>
                        </div>
                      </div>
                    )}
                    {pm.instructions && (
                      <p className="text-[10px] text-[#667781] dark:text-[#8696A0] italic pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                        {pm.instructions}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: CRÉATION D'OFFRE & CODES PROMO */}
      <div className="bg-white dark:bg-[#111B21] p-6 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-5 text-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E9EDEF] dark:border-[#222E35]">
          <div>
            <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Création d'Offre Promotionnelle (Code Promo)
            </h3>
            <p className="text-[11px] text-[#667781] dark:text-[#8696A0] mt-0.5">
              L'utilisateur pourra saisir ce code promo lors d'une demande de
              déblocage d'UE ou de tutorat.
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
        <form
          onSubmit={handleCreatePromo}
          className="p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                Code promo à saisir *
              </label>
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
              <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                Réduction en pourcentage (%) *
              </label>
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
              <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                Applicable sur
              </label>
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
                    p.isActive
                      ? "bg-white dark:bg-[#111B21]"
                      : "bg-[#F0F2F5]/60 dark:bg-[#1F2C34]/40 opacity-60"
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
                        Valable pour :{" "}
                        {p.applicableTo === "all"
                          ? "Toutes les offres"
                          : p.applicableTo === "ue_unlock"
                            ? "Déblocage UE"
                            : "Tutorat en ligne"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePromo(p.id)}
                      title={
                        p.isActive
                          ? "Désactiver le code promo"
                          : "Activer le code promo"
                      }
                      className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        p.isActive
                          ? "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950"
                          : "text-emerald-700 dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      }`}
                    >
                      {p.isActive ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
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

      {/* SECTION 4: TARIFS PRINCIPAUX */}
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-[#111B21] p-6 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-4 text-xs transition-colors"
      >
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
              onChange={(e) =>
                setConfig({
                  ...config,
                  defaultUePriceFcfa: Number(e.target.value),
                })
              }
              className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white font-bold"
            />
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">
              Valeur officielle : 500 FCFA
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
              Prix par UE dès 3 UE achetées (FCFA)
            </label>
            <input
              type="number"
              value={config.discountedUePriceFcfa || 300}
              onChange={(e) =>
                setConfig({
                  ...config,
                  discountedUePriceFcfa: Number(e.target.value),
                })
              }
              className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white font-bold"
            />
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">
              Offre spéciale pack : 300 FCFA / UE
            </p>
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
              onChange={(e) =>
                setConfig({
                  ...config,
                  onlineAssistancePerHourFcfa: Number(e.target.value),
                })
              }
              className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white font-bold"
            />
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">
              Via Google Meet ou WhatsApp
            </p>
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
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">
              +100 FCFA ajoutés aux demandes de déblocage
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#111B21] dark:text-white">
            <input
              type="checkbox"
              checked={config.firstChapterFreeEnabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  firstChapterFreeEnabled: e.target.checked,
                })
              }
              className="w-4 h-4 text-[#25D366] rounded"
            />
            Offrir la Séance 01 gratuitement à tous les étudiants inscrits (Non
            verrouillable)
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

      {/* SECTION 5: RÉTENTION DES ACTIVITÉS ÉTUDIANTES */}
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-[#111B21] p-6 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-4 text-xs transition-colors"
      >
        <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-1.5 pb-2 border-b border-[#E9EDEF] dark:border-[#222E35]">
          <Clock className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
          Rétention des Activités Étudiantes
        </h3>

        <p className="text-[11px] text-[#667781] dark:text-[#8696A0] leading-relaxed">
          Contrôlez la durée d'affichage des <strong>activités récentes</strong>{" "}
          et de l'<strong>historique d'apprentissage</strong> sur les tableaux
          de bord étudiants.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
              Afficher les activités des X derniers jours
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={3650}
                value={config.activitiesRetentionDays || 30}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    activitiesRetentionDays: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#0B141A] font-bold pl-10"
              />
              <Calendar className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-3 top-3" />
            </div>
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">
              Valeur recommandée : <strong>30 jours</strong> · Max : 3650 (10
              ans)
            </p>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-amber-900 dark:text-amber-300 leading-relaxed">
              <strong>ℹ️ Important :</strong> Cette durée affecte{" "}
              <strong>uniquement l'affichage</strong> sur le dashboard et la
              page progression. <strong>Aucune donnée n'est supprimée</strong>{" "}
              de la base de données.
            </div>
          </div>
        </div>

        {/* Aperçu rapide */}
        <div className="p-3 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl border border-[#E9EDEF] dark:border-[#222E35]">
          <p className="text-[10px] font-bold text-[#667781] dark:text-[#8696A0] uppercase tracking-wider mb-2">
            📅 Aperçu des périodes
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            {[7, 30, 90, 365].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() =>
                  setConfig({ ...config, activitiesRetentionDays: d })
                }
                className={`px-2 py-1.5 rounded-lg font-bold transition-colors ${
                  (config.activitiesRetentionDays || 30) === d
                    ? "bg-[#25D366] text-[#075E54]"
                    : "bg-white dark:bg-[#111B21] text-[#667781] dark:text-[#8696A0] border border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]"
                }`}
              >
                {d === 7
                  ? "7 jours"
                  : d === 30
                    ? "30 jours"
                    : d === 90
                      ? "3 mois"
                      : "1 an"}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            Enregistrer la durée
          </button>
        </div>
      </form>

      {/* MODAL: CREATE / EDIT PAYMENT METHOD */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9EDEF] dark:border-[#222E35]">
              <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#25D366]" />
                {editingPaymentMethod
                  ? "Modifier le moyen de paiement"
                  : "Nouveau moyen de paiement"}
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSavePaymentMethod}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                  Nom affiché du moyen de paiement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Mix Togo (T-Money), Flooz Togo (Moov Money), Paiement Sécurisé..."
                  value={paymentForm.name}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white font-medium focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Type de canal *
                  </label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white font-medium"
                  >
                    <option value="phone_account">
                      📱 Numéro de téléphone / Compte
                    </option>
                    <option value="payment_link">
                      🔗 Bouton / Lien de paiement externe
                    </option>
                    <option value="qr_code">📷 Image QR Code</option>
                    <option value="other">Autre moyen</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={paymentForm.order}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        order: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white font-bold"
                  />
                </div>
              </div>

              {(paymentForm.type === "phone_account" ||
                paymentForm.type === "other") && (
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Numéro de téléphone / Compte de versement
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : +228 71 67 69 45 ou 99 70 59 20"
                    value={paymentForm.accountNumber}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        accountNumber: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white font-mono font-bold"
                  />
                </div>
              )}

              {(paymentForm.type === "payment_link" ||
                paymentForm.type === "other") && (
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Lien / URL de redirection de paiement
                  </label>
                  <input
                    type="url"
                    placeholder="https://pay.example.com/checkout..."
                    value={paymentForm.paymentUrl}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentUrl: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white font-mono"
                  />
                </div>
              )}

              {(paymentForm.type === "qr_code" ||
                paymentForm.type === "other") && (
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    URL de l'image QR Code
                  </label>
                  <input
                    type="text"
                    placeholder="https://.../qrcode.png ou data:image/..."
                    value={paymentForm.qrCodeImage}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        qrCodeImage: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                  Logo / Image d'illustration (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="https://.../logo-tmoney.png"
                  value={paymentForm.logoUrl}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, logoUrl: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                  Instructions données à l'étudiant
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex : Effectuez votre transfert par Mix Togo puis conservez le SMS de confirmation..."
                  value={paymentForm.instructions}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      instructions: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#111B21] dark:text-white">
                  <input
                    type="checkbox"
                    checked={paymentForm.isActive}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#25D366] rounded"
                  />
                  Actif (Visible par les étudiants)
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-3.5 py-2 font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold text-xs text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE LIGHTBOX */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white dark:bg-[#111B21] rounded-2xl p-4 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-sm text-[#111B21] dark:text-white mb-3">
              Aperçu du QR Code
            </h3>
            <img
              src={lightboxImage}
              alt="QR Code agrandi"
              className="w-full max-h-[70vh] object-contain rounded-xl bg-white p-2"
            />
            <p className="text-[10px] text-center text-[#667781] dark:text-[#8696A0] mt-3">
              Scannez avec T-Money / Flooz / une app bancaire
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
