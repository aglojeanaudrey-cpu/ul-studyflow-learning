import React, { useState, useEffect } from "react";
import { PopupTemplate, PopupCampaign } from "../../types";
import { api } from "../../lib/api";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Lock,
  FileText,
  Sparkles,
  Gift,
  Megaphone,
  AlertTriangle,
  ClipboardList,
  BookOpen,
  Info,
  Video,
  Save,
  Eye,
} from "lucide-react";

// Mapping des icônes disponibles
const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Sparkles,
  Gift,
  Megaphone,
  AlertTriangle,
  ClipboardList,
  BookOpen,
  Info,
  Video,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

interface AdsTemplatesViewProps {
  onUseTemplate?: (template: PopupTemplate) => void;
}

export const AdsTemplatesView: React.FC<AdsTemplatesViewProps> = ({
  onUseTemplate,
}) => {
  const [templates, setTemplates] = useState<PopupTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PopupTemplate>>({
    name: "",
    description: "",
    icon: "FileText",
    preset: {},
    is_system: false,
  });
  const [presetJson, setPresetJson] = useState<string>("{}");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
    isSystem: boolean;
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };
  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4500);
  };

  const loadTemplates = async () => {
    try {
      const res = await api.getAdminPopupTemplates();
      setTemplates(res.templates || []);
    } catch (err) {
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      icon: "FileText",
      preset: {},
      is_system: false,
    });
    setPresetJson(
      '{\n  "title": "Mon titre",\n  "message": "Mon message",\n  "popup_type": "info",\n  "size": "md",\n  "position": "center",\n  "accent_color": "#25D366"\n}',
    );
    setModalOpen(true);
  };

  const openEdit = (tpl: PopupTemplate) => {
    setEditingId(tpl.id);
    setForm({
      name: tpl.name,
      description: tpl.description,
      icon: tpl.icon,
      preset: tpl.preset || {},
      is_system: tpl.is_system,
    });
    setPresetJson(JSON.stringify(tpl.preset || {}, null, 2));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      showError("Le nom du template est obligatoire.");
      return;
    }

    let parsedPreset: any = {};
    try {
      parsedPreset = JSON.parse(presetJson);
    } catch {
      showError("Le JSON de configuration est invalide.");
      return;
    }

    const payload: Partial<PopupTemplate> = {
      name: form.name.trim(),
      description: form.description?.trim() || "",
      icon: form.icon || "FileText",
      preset: parsedPreset,
      is_system: form.is_system || false,
    };

    try {
      if (editingId) {
        await api.updateAdminPopupTemplate(editingId, payload);
        showSuccess(`Template « ${payload.name} » mis à jour.`);
      } else {
        await api.createAdminPopupTemplate(payload);
        showSuccess(`Template « ${payload.name} » créé.`);
      }
      setModalOpen(false);
      await loadTemplates();
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.deleteAdminPopupTemplate(deleteConfirm.id);
      showSuccess(`Template « ${deleteConfirm.name} » supprimé.`);
      setDeleteConfirm(null);
      await loadTemplates();
    } catch (err: any) {
      showError(err.message || "Erreur de suppression.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white">
            Templates de popups
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Modèles pré-configurés pour créer vos campagnes en quelques clics.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau template
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

      {/* Grille de templates */}
      {templates.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111B21] rounded-2xl border border-dashed border-[#E9EDEF] dark:border-[#222E35] space-y-3">
          <FileText className="w-10 h-10 text-[#25D366] mx-auto opacity-60" />
          <p className="text-sm font-medium text-[#111B21] dark:text-white">
            Aucun template disponible
          </p>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Créez votre premier template ou vérifiez que le seed a bien été
            lancé.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const Icon = ICON_MAP[tpl.icon] || FileText;
            const presetType = (tpl.preset as any)?.popup_type || "info";
            const presetColor = (tpl.preset as any)?.accent_color || "#25D366";

            return (
              <div
                key={tpl.id}
                className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs space-y-3 hover:border-[#25D366] transition-all flex flex-col"
              >
                {/* En-tête */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${presetColor}20` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: presetColor }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#111B21] dark:text-white truncate">
                        {tpl.name}
                      </h3>
                      <p className="text-[10px] text-[#667781] dark:text-[#8696A0] truncate">
                        {presetType}
                      </p>
                    </div>
                  </div>

                  {tpl.is_system && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                      <Lock className="w-2.5 h-2.5" />
                      Système
                    </span>
                  )}
                </div>

                {/* Description */}
                {tpl.description && (
                  <p className="text-[11px] text-[#667781] dark:text-[#8696A0] line-clamp-2">
                    {tpl.description}
                  </p>
                )}

                {/* Aperçu du preset */}
                <div className="p-2.5 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-lg text-[10px] font-mono space-y-0.5">
                  {(tpl.preset as any)?.title && (
                    <p className="text-[#111B21] dark:text-white font-semibold truncate">
                      📝 {(tpl.preset as any).title}
                    </p>
                  )}
                  {(tpl.preset as any)?.message && (
                    <p className="text-[#667781] dark:text-[#8696A0] line-clamp-2 italic">
                      {(tpl.preset as any).message}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(tpl)}
                      title="Modifier"
                      className="p-1.5 rounded-lg text-[#075E54] dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          id: tpl.id,
                          name: tpl.name,
                          isSystem: tpl.is_system,
                        })
                      }
                      title="Supprimer"
                      className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {onUseTemplate && (
                    <button
                      onClick={() => onUseTemplate(tpl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] rounded-xl transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Utiliser
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Création / Édition */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="font-bold text-lg text-[#111B21] dark:text-white">
                {editingId
                  ? "Modifier le template"
                  : "Créer un nouveau template"}
              </h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                Configurez les valeurs par défaut qui seront pré-remplies lors
                de la création d'une campagne.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex : Promo rentrée"
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                    Icône
                  </label>
                  <select
                    value={form.icon || "FileText"}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white"
                  >
                    {ICON_OPTIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                  Description courte
                </label>
                <input
                  type="text"
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Ex : Bandeau haut avec code promo"
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                  Configuration JSON (preset)
                </label>
                <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mb-1.5">
                  Clés possibles : title, message, popup_type, size, position,
                  accent_color, animation, primary_button_text,
                  primary_button_url, target_pages, trigger_type, frequency,
                  etc.
                </p>
                <textarea
                  rows={12}
                  value={presetJson}
                  onChange={(e) => setPresetJson(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white font-mono text-[11px] leading-relaxed"
                  spellCheck={false}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#111B21] dark:text-white">
                <input
                  type="checkbox"
                  checked={form.is_system || false}
                  onChange={(e) =>
                    setForm({ ...form, is_system: e.target.checked })
                  }
                  className="w-4 h-4 text-[#25D366] rounded"
                />
                Template système (seul le superuser peut le supprimer)
              </label>

              <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#667781]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingId ? "Enregistrer" : "Créer le template"}
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
                Supprimer le template ?
              </h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                Le template <strong>« {deleteConfirm.name} »</strong> sera
                définitivement supprimé.
                {deleteConfirm.isSystem && (
                  <span className="block mt-2 text-rose-600 dark:text-rose-400 font-semibold">
                    ⚠️ Ceci est un template système. Seul le superuser peut le
                    supprimer.
                  </span>
                )}
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
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
