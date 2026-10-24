import React, { useState, useEffect } from "react";
import { PopupCampaign, Department, Program, PopupTemplate } from "../../types";
import { api } from "../../lib/api";
import { InlineSpinner } from "../ui/LoadingSpinner";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Power,
  PowerOff,
  BarChart3,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  MousePointerClick,
  Image as ImageIcon,
  Link as LinkIcon,
  Target,
  Users as UsersIcon,
  Clock,
  Sparkles,
  Info,
  Gift,
  AlertTriangle,
  ClipboardList,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { AdsStatsView } from "./AdsStatsView";

const PAGE_OPTIONS = [
  { id: "home", label: "Accueil", category: "Marketing" },
  { id: "features", label: "Fonctionnalités", category: "Marketing" },
  { id: "pricing", label: "Tarifs", category: "Marketing" },
  { id: "how_it_works", label: "Comment ça marche", category: "Marketing" },
  { id: "faq", label: "FAQ", category: "Marketing" },
  { id: "about", label: "À propos", category: "Marketing" },
  {
    id: "student_home",
    label: "Tableau de bord étudiant",
    category: "Étudiant",
  },
  { id: "student_courses", label: "Mes UE", category: "Étudiant" },
  { id: "student_progress", label: "Progression", category: "Étudiant" },
  { id: "student_ai", label: "Assistant IA", category: "Étudiant" },
  { id: "student_profile", label: "Profil", category: "Étudiant" },
  { id: "admin", label: "Dashboard Admin", category: "Admin" },
];

const POPUP_TYPE_LABELS: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  info: { label: "Information", icon: Info, color: "#2563EB" },
  promo: { label: "Promotion", icon: Gift, color: "#D97706" },
  ad: { label: "Publicité", icon: Megaphone, color: "#7C3AED" },
  survey: { label: "Enquête", icon: ClipboardList, color: "#0EA5E9" },
  alert: { label: "Alerte", icon: AlertTriangle, color: "#DC2626" },
  announcement: { label: "Annonce", icon: Megaphone, color: "#075E54" },
};

const EMPTY_FORM: Partial<PopupCampaign> = {
  title: "",
  message: "",
  popup_type: "info",
  media_type: "none",
  media_url: "",
  media_thumbnail: "",
  primary_button_text: "",
  primary_button_action: "link",
  primary_button_url: "",
  secondary_button_text: "",
  secondary_button_action: "close",
  secondary_button_url: "",
  size: "md",
  position: "center",
  accent_color: "#25D366",
  animation: "fade",
  is_dismissible: true,
  target_pages: [],
  target_audience: "all",
  target_departments: [],
  target_programs: [],
  target_levels: [],
  trigger_type: "after_delay",
  trigger_delay_seconds: 3,
  trigger_scroll_percent: 50,
  frequency: "once",
  frequency_custom_hours: 24,
  is_active: true,
  priority: 0,
  // Programmation avancée
  schedule_days: [],
  schedule_hours_start: "",
  schedule_hours_end: "",
  schedule_specific_dates: [],
  schedule_timezone: "Africa/Lome",
};

interface AdsManagerViewProps {
  externalTemplate?: PopupTemplate | null;
  onConsumeExternalTemplate?: () => void;
}

export const AdsManagerView: React.FC<AdsManagerViewProps> = ({
  externalTemplate,
  onConsumeExternalTemplate,
}) => {
  const [popups, setPopups] = useState<PopupCampaign[]>([]);
  const [templates, setTemplates] = useState<PopupTemplate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PopupCampaign>>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [statsPopupId, setStatsPopupId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };
  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4500);
  };

  const loadAll = async () => {
    try {
      const [popupsRes, metaRes, templatesRes] = await Promise.all([
        api.getAdminPopups(),
        api.getAcademicMeta(),
        api.getAdminPopupTemplates().catch(() => ({ templates: [] })),
      ]);
      setPopups(popupsRes.popups || []);
      setDepartments(
        (metaRes.departments || []).filter((d: any) => !d.isSuspended),
      );
      setPrograms((metaRes.programs || []).filter((p: any) => !p.isSuspended));
      setTemplates(templatesRes.templates || []);
    } catch (err) {
      console.error("Error loading popups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Consommer le template injecté depuis AdsTemplatesView
  useEffect(() => {
    if (!externalTemplate) return;

    const preset = (externalTemplate.preset || {}) as Partial<PopupCampaign>;
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      ...preset,
      template_used: externalTemplate.id,
    });
    setModalOpen(true);

    // Vider le state côté parent après consommation
    onConsumeExternalTemplate?.();
  }, [externalTemplate]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (popup: PopupCampaign) => {
    setEditingId(popup.id);
    setForm({ ...popup });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!form.title?.trim()) {
      showError("Le titre est obligatoire.");
      return;
    }
    if (!form.target_pages || form.target_pages.length === 0) {
      showError("Sélectionnez au moins une page cible.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.updateAdminPopup(editingId, form);
        showSuccess(`Campagne « ${form.title} » mise à jour.`);
      } else {
        await api.createAdminPopup(form);
        showSuccess(`Campagne « ${form.title} » créée avec succès.`);
      }
      setModalOpen(false);
      await loadAll();
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (popup: PopupCampaign) => {
    if (togglingId) return;
    setTogglingId(popup.id);
    try {
      const res = await api.toggleAdminPopup(popup.id);
      showSuccess(
        `« ${popup.title} » ${res.isActive ? "activée" : "désactivée"}.`,
      );
      await loadAll();
    } catch (err: any) {
      showError(err.message || "Action impossible.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm || deleting) return;
    setDeleting(true);
    try {
      await api.deleteAdminPopup(deleteConfirm.id);
      showSuccess(`Campagne « ${deleteConfirm.title} » supprimée.`);
      setDeleteConfirm(null);
      await loadAll();
    } catch (err: any) {
      showError(err.message || "Erreur de suppression.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleInArray = (
    field:
      | "target_pages"
      | "target_departments"
      | "target_programs"
      | "target_levels",
    value: string,
  ) => {
    const current = (form[field] as string[]) || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setForm({ ...form, [field]: next });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Vue Stats (modal plein écran)
  if (statsPopupId) {
    return (
      <AdsStatsView
        popupId={statsPopupId}
        onBack={() => setStatsPopupId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white">
            Publicités & Annonces
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Créez des popups ciblés pour informer, promouvoir ou interroger vos
            utilisateurs.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouvelle campagne
        </button>
      </div>

      {/* Alertes */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {errorMsg}
        </div>
      )}

      {/* Liste des campagnes */}
      {popups.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111B21] rounded-2xl border border-dashed border-[#E9EDEF] dark:border-[#222E35] space-y-3">
          <Megaphone className="w-10 h-10 text-[#25D366] mx-auto opacity-60" />
          <p className="text-sm font-medium text-[#111B21] dark:text-white">
            Aucune campagne créée
          </p>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Créez votre première campagne pour communiquer avec vos
            utilisateurs.
          </p>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
          >
            + Créer ma première campagne
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popups.map((popup) => {
            const typeInfo =
              POPUP_TYPE_LABELS[popup.popup_type] || POPUP_TYPE_LABELS.info;
            const Icon = typeInfo.icon;
            const ctr = popup.clickThroughRate || 0;

            return (
              <div
                key={popup.id}
                className={`p-5 bg-white dark:bg-[#111B21] rounded-2xl border shadow-xs space-y-3 transition-all ${
                  popup.is_active
                    ? "border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]"
                    : "border-dashed border-gray-300 dark:border-gray-700 opacity-70"
                }`}
              >
                {/* En-tête carte */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${popup.accent_color}20` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: popup.accent_color }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#111B21] dark:text-white truncate">
                        {popup.title}
                      </h3>
                      <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                        {typeInfo.label} · Priorité {popup.priority}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        popup.is_active
                          ? "bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366]"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      }`}
                    >
                      {popup.is_active ? "Active" : "Inactive"}
                    </span>
                    {((popup.schedule_days || []).length > 0 ||
                      (popup.schedule_hours_start &&
                        popup.schedule_hours_end) ||
                      (popup.schedule_specific_dates || []).length > 0) && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        📅 Programmé
                      </span>
                    )}
                  </div>
                </div>

                {/* Message tronqué */}
                {popup.message && (
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] line-clamp-2">
                    {popup.message}
                  </p>
                )}

                {/* Meta */}
                <div className="space-y-1 text-[11px] text-[#667781] dark:text-[#8696A0]">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3 h-3" />
                    <span className="truncate">
                      {popup.target_pages.length} page(s) ·{" "}
                      {popup.target_audience}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>
                      {popup.trigger_type === "after_delay"
                        ? `Après ${popup.trigger_delay_seconds}s`
                        : popup.trigger_type === "on_load"
                          ? "Au chargement"
                          : popup.trigger_type === "on_scroll"
                            ? `À ${popup.trigger_scroll_percent}% de scroll`
                            : "À l'intention de sortie"}
                      {" · "}
                      {popup.frequency}
                    </span>
                  </div>

                  {((popup.schedule_days || []).length > 0 ||
                    (popup.schedule_hours_start && popup.schedule_hours_end) ||
                    (popup.schedule_specific_dates || []).length > 0) && (
                    <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold">
                      <Calendar className="w-3 h-3" />
                      <span className="truncate">
                        {(() => {
                          const parts: string[] = [];
                          if ((popup.schedule_days || []).length > 0) {
                            const dayLabels = [
                              "Lun",
                              "Mar",
                              "Mer",
                              "Jeu",
                              "Ven",
                              "Sam",
                              "Dim",
                            ];
                            parts.push(
                              (popup.schedule_days || [])
                                .map((d) => dayLabels[d])
                                .join(", "),
                            );
                          }
                          if (
                            popup.schedule_hours_start &&
                            popup.schedule_hours_end
                          ) {
                            parts.push(
                              `${popup.schedule_hours_start}–${popup.schedule_hours_end}`,
                            );
                          }
                          if (
                            (popup.schedule_specific_dates || []).length > 0
                          ) {
                            parts.push(
                              `${(popup.schedule_specific_dates || []).length} date(s)`,
                            );
                          }
                          return `📅 ${parts.join(" · ")}`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats mini */}
                <div className="pt-2 border-t border-[#E9EDEF] dark:border-[#222E35] grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[#667781] dark:text-[#8696A0]">
                      <Eye className="w-3 h-3" />
                      <span className="text-[10px] font-semibold">Vues</span>
                    </div>
                    <p className="text-sm font-bold text-[#111B21] dark:text-white tabular-nums">
                      {popup.views_count || 0}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[#667781] dark:text-[#8696A0]">
                      <MousePointerClick className="w-3 h-3" />
                      <span className="text-[10px] font-semibold">Clics</span>
                    </div>
                    <p className="text-sm font-bold text-[#111B21] dark:text-white tabular-nums">
                      {popup.clicks_count || 0}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[#667781] dark:text-[#8696A0]">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-[10px] font-semibold">CTR</span>
                    </div>
                    <p className="text-sm font-bold text-[#075E54] dark:text-[#25D366] tabular-nums">
                      {ctr}%
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggle(popup)}
                      disabled={togglingId === popup.id}
                      title={popup.is_active ? "Désactiver" : "Activer"}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-60 ${
                        popup.is_active
                          ? "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950"
                          : "text-emerald-700 dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      }`}
                    >
                      {togglingId === popup.id ? (
                        <InlineSpinner className="text-current" />
                      ) : popup.is_active ? (
                        <PowerOff className="w-3.5 h-3.5" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(popup)}
                      title="Modifier"
                      className="p-1.5 rounded-lg text-[#075E54] dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({ id: popup.id, title: popup.title })
                      }
                      title="Supprimer"
                      className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setStatsPopupId(popup.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] rounded-xl transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Statistiques
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Création / Édition */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="font-bold text-lg text-[#111B21] dark:text-white">
                {editingId
                  ? "Modifier la campagne"
                  : "Créer une nouvelle campagne"}
              </h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                Configurez le contenu, le ciblage et le comportement du popup.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Partir d'un template */}
              {!editingId && templates.length > 0 && (
                <section className="space-y-2 p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <h4 className="font-bold uppercase tracking-wider text-[#075E54] dark:text-[#25D366] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Partir d'un template (optionnel)
                  </h4>
                  <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                    Sélectionnez un modèle pour pré-remplir tous les champs
                    automatiquement.
                  </p>
                  <select
                    value={form.template_used || ""}
                    onChange={(e) => {
                      const tplId = e.target.value;
                      if (tplId) {
                        const tpl = templates.find((t) => t.id === tplId);
                        if (tpl) {
                          setForm({
                            ...EMPTY_FORM,
                            ...(tpl.preset as Partial<PopupCampaign>),
                            template_used: tpl.id,
                          });
                        }
                      } else {
                        setForm({ ...EMPTY_FORM });
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-semibold"
                  >
                    <option value="">
                      — Aucun template (configuration manuelle) —
                    </option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                        {t.is_system ? " (système)" : ""}
                      </option>
                    ))}
                  </select>
                </section>
              )}

              {/* === CONTENU === */}
              <section className="space-y-3 p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl">
                <h4 className="font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
                  1. Contenu
                </h4>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title || ""}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Ex : Nouvelle UE disponible"
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={form.message || ""}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Décrivez votre annonce..."
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Type
                    </label>
                    <select
                      value={form.popup_type || "info"}
                      onChange={(e) =>
                        setForm({ ...form, popup_type: e.target.value as any })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-medium"
                    >
                      {Object.entries(POPUP_TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Priorité (0-100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.priority || 0}
                      onChange={(e) =>
                        setForm({ ...form, priority: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-bold"
                    />
                  </div>
                </div>
              </section>

              {/* === MÉDIA === */}
              <section className="space-y-3 p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl">
                <h4 className="font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
                  2. Média (optionnel)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Type de média
                    </label>
                    <select
                      value={form.media_type || "none"}
                      onChange={(e) =>
                        setForm({ ...form, media_type: e.target.value as any })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                    >
                      <option value="none">Aucun</option>
                      <option value="image">🖼️ Image</option>
                      <option value="video">🎬 Vidéo (lecture manuelle)</option>
                      <option value="video_autoplay">
                        🎥 Vidéo autoplay (muette)
                      </option>
                    </select>
                  </div>

                  {form.media_type !== "none" && (
                    <div>
                      <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                        URL du média
                      </label>
                      <input
                        type="url"
                        value={form.media_url || ""}
                        onChange={(e) =>
                          setForm({ ...form, media_url: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-mono"
                      />
                    </div>
                  )}
                </div>

                {form.media_type === "video" && (
                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Miniature (poster)
                    </label>
                    <input
                      type="url"
                      value={form.media_thumbnail || ""}
                      onChange={(e) =>
                        setForm({ ...form, media_thumbnail: e.target.value })
                      }
                      placeholder="https://... (image affichée avant lecture)"
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-mono"
                    />
                  </div>
                )}
              </section>

              {/* === BOUTONS === */}
              <section className="space-y-3 p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl">
                <h4 className="font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
                  3. Boutons d'action (optionnel)
                </h4>

                {/* Bouton principal */}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={form.primary_button_text || ""}
                    onChange={(e) =>
                      setForm({ ...form, primary_button_text: e.target.value })
                    }
                    placeholder="Bouton principal"
                    className="p-2 rounded-lg border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                  />
                  <select
                    value={form.primary_button_action || "link"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        primary_button_action: e.target.value as any,
                      })
                    }
                    className="p-2 rounded-lg border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                  >
                    <option value="link">Ouvrir un lien</option>
                    <option value="close">Fermer</option>
                    <option value="scroll">Scroll vers élément</option>
                  </select>
                  {form.primary_button_action === "link" && (
                    <input
                      type="url"
                      value={form.primary_button_url || ""}
                      onChange={(e) =>
                        setForm({ ...form, primary_button_url: e.target.value })
                      }
                      placeholder="https://..."
                      className="p-2 rounded-lg border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-mono text-[11px]"
                    />
                  )}
                </div>

                {/* Bouton secondaire */}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={form.secondary_button_text || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        secondary_button_text: e.target.value,
                      })
                    }
                    placeholder="Bouton secondaire"
                    className="p-2 rounded-lg border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                  />
                  <select
                    value={form.secondary_button_action || "close"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        secondary_button_action: e.target.value as any,
                      })
                    }
                    className="p-2 rounded-lg border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                  >
                    <option value="close">Fermer</option>
                    <option value="link">Ouvrir un lien</option>
                  </select>
                  {form.secondary_button_action === "link" && (
                    <input
                      type="url"
                      value={form.secondary_button_url || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          secondary_button_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="p-2 rounded-lg border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-mono text-[11px]"
                    />
                  )}
                </div>
              </section>

              {/* === STYLE === */}
              <section className="space-y-3 p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl">
                <h4 className="font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
                  4. Apparence
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Taille
                    </label>
                    <select
                      value={form.size || "md"}
                      onChange={(e) =>
                        setForm({ ...form, size: e.target.value as any })
                      }
                      className="w-full p-2 rounded-lg border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                    >
                      <option value="sm">Petit</option>
                      <option value="md">Moyen</option>
                      <option value="lg">Grand</option>
                      <option value="xl">Très grand</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Position
                    </label>
                    <select
                      value={form.position || "center"}
                      onChange={(e) =>
                        setForm({ ...form, position: e.target.value as any })
                      }
                      className="w-full p-2 rounded-lg border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                    >
                      <option value="center">Centré</option>
                      <option value="top">Bandeau haut</option>
                      <option value="bottom">Bandeau bas</option>
                      <option value="bottom_right">Coin bas-droit</option>
                      <option value="bottom_left">Coin bas-gauche</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Animation
                    </label>
                    <select
                      value={form.animation || "fade"}
                      onChange={(e) =>
                        setForm({ ...form, animation: e.target.value as any })
                      }
                      className="w-full p-2 rounded-lg border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                    >
                      <option value="fade">Fondu</option>
                      <option value="slide_up">Glisser haut</option>
                      <option value="slide_down">Glisser bas</option>
                      <option value="zoom">Zoom</option>
                      <option value="none">Aucune</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Couleur accent
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="color"
                        value={form.accent_color || "#25D366"}
                        onChange={(e) =>
                          setForm({ ...form, accent_color: e.target.value })
                        }
                        className="w-10 h-10 rounded border border-[#E9EDEF] dark:border-[#222E35] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={form.accent_color || "#25D366"}
                        onChange={(e) =>
                          setForm({ ...form, accent_color: e.target.value })
                        }
                        className="flex-1 p-2 rounded-lg border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-mono text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#111B21] dark:text-white">
                  <input
                    type="checkbox"
                    checked={form.is_dismissible !== false}
                    onChange={(e) =>
                      setForm({ ...form, is_dismissible: e.target.checked })
                    }
                    className="w-4 h-4 text-[#25D366] rounded"
                  />
                  L'utilisateur peut fermer le popup
                </label>
              </section>

              {/* === PAGES CIBLES === */}
              <section className="space-y-3 p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl">
                <h4 className="font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  5. Pages cibles ({(form.target_pages || []).length}{" "}
                  sélectionnée(s))
                </h4>

                {["Marketing", "Étudiant", "Admin"].map((cat) => (
                  <div key={cat}>
                    <p className="text-[10px] font-bold text-[#667781] dark:text-[#8696A0] uppercase mb-1.5">
                      {cat}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PAGE_OPTIONS.filter((p) => p.category === cat).map(
                        (p) => {
                          const isSelected = (form.target_pages || []).includes(
                            p.id,
                          );
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() =>
                                toggleInArray("target_pages", p.id)
                              }
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                                isSelected
                                  ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] border-transparent"
                                  : "bg-white dark:bg-[#111B21] text-[#667781] dark:text-[#8696A0] border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]"
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                ))}
              </section>

              {/* === CIBLAGE USERS === */}
              <section className="space-y-3 p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl">
                <h4 className="font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] flex items-center gap-1.5">
                  <UsersIcon className="w-3.5 h-3.5" />
                  6. Ciblage utilisateurs
                </h4>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Audience
                  </label>
                  <select
                    value={form.target_audience || "all"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        target_audience: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                  >
                    <option value="all">Tout le monde</option>
                    <option value="anonymous">Visiteurs non connectés</option>
                    <option value="logged_in">Utilisateurs connectés</option>
                    <option value="students">Étudiants uniquement</option>
                    <option value="sponsored">Sponsorisés uniquement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Départements ciblés (vide = tous)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {departments.map((d) => {
                      const isSelected = (
                        form.target_departments || []
                      ).includes(d.code);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() =>
                            toggleInArray("target_departments", d.code)
                          }
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                            isSelected
                              ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] border-transparent"
                              : "bg-white dark:bg-[#111B21] text-[#667781] dark:text-[#8696A0] border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]"
                          }`}
                        >
                          {d.code}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Filières ciblées (vide = toutes)
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {programs.map((p) => {
                      const isSelected = (form.target_programs || []).includes(
                        p.name,
                      );
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            toggleInArray("target_programs", p.name)
                          }
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                            isSelected
                              ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] border-transparent"
                              : "bg-white dark:bg-[#111B21] text-[#667781] dark:text-[#8696A0] border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]"
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Niveaux ciblés (vide = tous)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {["L1", "L2", "L3"].map((lvl) => {
                      const isSelected = (form.target_levels || []).includes(
                        lvl,
                      );
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => toggleInArray("target_levels", lvl)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                            isSelected
                              ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] border-transparent"
                              : "bg-white dark:bg-[#111B21] text-[#667781] dark:text-[#8696A0] border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]"
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* === DÉCLENCHEUR & FRÉQUENCE === */}
              <section className="space-y-3 p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl">
                <h4 className="font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  7. Déclencheur & Fréquence
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Déclencheur
                    </label>
                    <select
                      value={form.trigger_type || "after_delay"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          trigger_type: e.target.value as any,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                    >
                      <option value="on_load">Au chargement de la page</option>
                      <option value="after_delay">Après un délai</option>
                      <option value="on_scroll">Après un scroll</option>
                      <option value="on_exit_intent">
                        À l'intention de sortie
                      </option>
                    </select>
                  </div>

                  {form.trigger_type === "after_delay" && (
                    <div>
                      <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                        Délai (secondes)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={form.trigger_delay_seconds || 3}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            trigger_delay_seconds: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-bold"
                      />
                    </div>
                  )}

                  {form.trigger_type === "on_scroll" && (
                    <div>
                      <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                        Scroll (%)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={form.trigger_scroll_percent || 50}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            trigger_scroll_percent: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Fréquence
                    </label>
                    <select
                      value={form.frequency || "once"}
                      onChange={(e) =>
                        setForm({ ...form, frequency: e.target.value as any })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                    >
                      <option value="once">1 fois par navigateur</option>
                      <option value="session">1 fois par session</option>
                      <option value="per_day">1 fois par jour</option>
                      <option value="always">À chaque visite</option>
                      <option value="custom">Répéter après X heures</option>
                    </select>
                  </div>

                  {form.frequency === "custom" && (
                    <div>
                      <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                        Répéter après (heures)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={form.frequency_custom_hours || 24}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            frequency_custom_hours: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-bold"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* === ⭐ PROGRAMMATION AVANCÉE === */}
              <section className="space-y-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900">
                <h4 className="font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  8. Programmation avancée (optionnel)
                </h4>
                <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                  Restreindre l'affichage à certains jours et heures. Laissez
                  vide pour afficher en permanence.
                </p>

                {/* Jours de la semaine */}
                <div>
                  <label className="block font-semibold mb-1.5 text-[#111B21] dark:text-white">
                    Jours de la semaine (vide = tous les jours)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { v: 0, l: "Lun" },
                      { v: 1, l: "Mar" },
                      { v: 2, l: "Mer" },
                      { v: 3, l: "Jeu" },
                      { v: 4, l: "Ven" },
                      { v: 5, l: "Sam" },
                      { v: 6, l: "Dim" },
                    ].map((d) => {
                      const isSelected = (form.schedule_days || []).includes(
                        d.v,
                      );
                      return (
                        <button
                          key={d.v}
                          type="button"
                          onClick={() => {
                            const days = form.schedule_days || [];
                            setForm({
                              ...form,
                              schedule_days: days.includes(d.v)
                                ? days.filter((x) => x !== d.v)
                                : [...days, d.v].sort(),
                            });
                          }}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                            isSelected
                              ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] border-transparent"
                              : "bg-white dark:bg-[#111B21] text-[#667781] dark:text-[#8696A0] border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]"
                          }`}
                        >
                          {d.l}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Plage horaire */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Heure de début (vide = 00:00)
                    </label>
                    <input
                      type="time"
                      value={form.schedule_hours_start || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          schedule_hours_start: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                      Heure de fin (vide = 23:59)
                    </label>
                    <input
                      type="time"
                      value={form.schedule_hours_end || ""}
                      onChange={(e) =>
                        setForm({ ...form, schedule_hours_end: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Dates spécifiques */}
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Dates spécifiques (une par ligne : YYYY-MM-DD ou MM-DD)
                  </label>
                  <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mb-1.5">
                    Ex : <code className="font-mono">2025-12-25</code> (Noël
                    2025) ou <code className="font-mono">12-31</code> (tous les
                    31 décembre). Laissez vide pour ignorer ce filtre.
                  </p>
                  <textarea
                    rows={3}
                    value={(form.schedule_specific_dates || []).join("\n")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        schedule_specific_dates: e.target.value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="2025-12-25&#10;2026-01-01"
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white font-mono text-[11px]"
                  />
                </div>

                {/* Résumé */}
                {((form.schedule_days || []).length > 0 ||
                  (form.schedule_hours_start && form.schedule_hours_end) ||
                  (form.schedule_specific_dates || []).length > 0) && (
                  <div className="p-2.5 bg-white dark:bg-[#111B21] rounded-lg border border-blue-200 dark:border-blue-800 text-[11px] text-[#111B21] dark:text-white">
                    <strong>📅 Programmation active :</strong>{" "}
                    {(form.schedule_days || []).length > 0 && (
                      <>
                        {(form.schedule_days || [])
                          .map(
                            (d) =>
                              ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][
                                d
                              ],
                          )
                          .join(", ")}
                      </>
                    )}
                    {form.schedule_hours_start && form.schedule_hours_end && (
                      <>
                        {" "}
                        de {form.schedule_hours_start} à{" "}
                        {form.schedule_hours_end}
                      </>
                    )}
                    {(form.schedule_specific_dates || []).length > 0 && (
                      <>
                        {" "}
                        · dates :{" "}
                        {(form.schedule_specific_dates || []).join(", ")}
                      </>
                    )}
                  </div>
                )}
              </section>

              {/* === STATUT === */}
              <section className="space-y-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#111B21] dark:text-white">
                  <input
                    type="checkbox"
                    checked={form.is_active !== false}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="w-4 h-4 text-[#25D366] rounded"
                  />
                  Campagne active (visible pour les utilisateurs ciblés)
                </label>
              </section>

              {/* Actions */}
              <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shadow-xs disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 min-w-44"
                >
                  {saving && <InlineSpinner className="text-[#075E54]" />}
                  {saving
                    ? "Enregistrement..."
                    : editingId
                      ? "Enregistrer les modifications"
                      : "Créer la campagne"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                Confirmer la suppression
              </h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                Supprimer définitivement la campagne{" "}
                <strong>« {deleteConfirm.title} »</strong> et tous ses logs
                (vues/clics) ?
              </p>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-[#667781]"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-60 inline-flex items-center gap-2"
              >
                {deleting && <InlineSpinner className="text-white" />}
                {deleting ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
