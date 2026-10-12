import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../lib/api";
import { TrashItem, TrashObjectType } from "../../types";
import {
  Trash2,
  RotateCcw,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Layers,
  FileText,
  Users,
  Megaphone,
  ClipboardList,
  Clock,
  Eraser,
  Filter,
  Shield,
  Info,
  X,
} from "lucide-react";

const TYPE_CONFIG: Record<
  TrashObjectType,
  { label: string; icon: any; color: string; bg: string }
> = {
  ue: {
    label: "UE",
    icon: BookOpen,
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  session: {
    label: "Séance",
    icon: Layers,
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  chapter: {
    label: "Chapitre",
    icon: FileText,
    color: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  user: {
    label: "Utilisateur",
    icon: Users,
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  popup: {
    label: "Publicité",
    icon: Megaphone,
    color: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950",
  },
  form: {
    label: "Formulaire",
    icon: ClipboardList,
    color: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-sky-950",
  },
};

export const TrashBinView: React.FC = () => {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [totalInTrash, setTotalInTrash] = useState(0);
  const [stats, setStats] = useState<
    { object_type: TrashObjectType; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [purgeAllConfirm, setPurgeAllConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };
  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  const loadTrash = async () => {
    setLoading(true);
    try {
      const res = await api.getTrash({ type: typeFilter, q: search });
      setItems(res.items || []);
      setTotalInTrash(res.totalInTrash || 0);
      setStats(res.stats || []);
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Error loading trash:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, [typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTrash();
  };

  const handleRestore = async (trashId: string) => {
    setActionLoading(true);
    try {
      await api.restoreTrashItem(trashId);
      showSuccess("Élément restauré avec succès.");
      setRestoreConfirm(null);
      await loadTrash();
    } catch (err: any) {
      showError(err.message || "Erreur lors de la restauration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (trashId: string) => {
    setActionLoading(true);
    try {
      await api.deleteTrashItem(trashId);
      showSuccess("Élément supprimé définitivement.");
      setDeleteConfirm(null);
      await loadTrash();
    } catch (err: any) {
      showError(err.message || "Erreur lors de la suppression.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    try {
      const res = await api.bulkTrashAction("restore", Array.from(selectedIds));
      showSuccess(
        `${res.processed} élément(s) restauré(s).${res.errors.length > 0 ? ` ${res.errors.length} erreur(s).` : ""}`,
      );
      await loadTrash();
    } catch (err: any) {
      showError(err.message || "Erreur lors de la restauration en masse.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkPurge = async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Supprimer définitivement ${selectedIds.size} élément(s) ? Cette action est irréversible.`,
      )
    )
      return;
    setActionLoading(true);
    try {
      const res = await api.bulkTrashAction("purge", Array.from(selectedIds));
      showSuccess(`${res.processed} élément(s) supprimé(s) définitivement.`);
      await loadTrash();
    } catch (err: any) {
      showError(err.message || "Erreur lors de la suppression en masse.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePurgeAll = async () => {
    setActionLoading(true);
    try {
      const res = await api.purgeAllTrash();
      showSuccess(
        `Corbeille vidée : ${res.deletedCount} élément(s) supprimé(s) définitivement.`,
      );
      setPurgeAllConfirm(false);
      await loadTrash();
    } catch (err: any) {
      showError(err.message || "Erreur lors de la purge totale.");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExpiryColor = (days: number) => {
    if (days <= 3)
      return "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800";
    if (days <= 7)
      return "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800";
    return "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800";
  };

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[#25D366]" />
            Corbeille
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Les éléments supprimés sont conservés 30 jours avant purge
            automatique.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadTrash}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#075E54] dark:text-[#25D366] bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] dark:hover:bg-[#222E35] rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>

          {totalInTrash > 0 && (
            <button
              onClick={() => setPurgeAllConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-xl transition-colors"
            >
              <Eraser className="w-3.5 h-3.5" />
              Vider la corbeille ({totalInTrash})
            </button>
          )}
        </div>
      </div>

      {/* Alertes */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Bandeau info */}
      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-2 text-[11px] text-blue-900 dark:text-blue-300">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Comment ça marche ?</strong> Les éléments supprimés sont{" "}
          <strong>conservés 30 jours</strong> puis purgés automatiquement. Vous
          pouvez les <strong>restaurer avec toutes leurs dépendances</strong>{" "}
          (séances, chapitres, quiz, réponses) à tout moment avant expiration.
        </span>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom, code ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white focus:border-[#25D366] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-2.5 top-3" />
        </form>

        <div className="flex items-center gap-1 bg-white dark:bg-[#111B21] p-1 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-[#667781] dark:text-[#8696A0] ml-1 shrink-0" />
          <button
            onClick={() => setTypeFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              typeFilter === "ALL"
                ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]"
                : "text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
            }`}
          >
            Tout ({totalInTrash})
          </button>
          {stats.map((s) => {
            const config = TYPE_CONFIG[s.object_type];
            return (
              <button
                key={s.object_type}
                onClick={() => setTypeFilter(s.object_type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  typeFilter === s.object_type
                    ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]"
                    : "text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
                }`}
              >
                {config?.label || s.object_type} ({s.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Barre d'actions en masse */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span className="font-bold text-amber-900 dark:text-amber-300">
              {selectedIds.size} élément(s) sélectionné(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline"
            >
              Annuler
            </button>
            <button
              onClick={handleBulkRestore}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1faa54] rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurer la sélection
            </button>
            <button
              onClick={handleBulkPurge}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer définitivement
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111B21] rounded-2xl border border-dashed border-[#E9EDEF] dark:border-[#222E35] space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8 text-[#25D366]" />
          </div>
          <p className="text-sm font-bold text-[#111B21] dark:text-white">
            {search || typeFilter !== "ALL"
              ? "Aucun élément trouvé"
              : "La corbeille est vide"}
          </p>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            {search || typeFilter !== "ALL"
              ? "Essayez de modifier vos filtres ou votre recherche."
              : "Les éléments supprimés apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden shadow-xs">
          {/* Header avec checkbox tout sélectionner */}
          <div className="p-3 bg-[#F0F2F5] dark:bg-[#1F2C34] border-b border-[#E9EDEF] dark:border-[#222E35] flex items-center gap-3">
            <button
              onClick={toggleAll}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                allSelected
                  ? "bg-[#25D366] border-[#25D366]"
                  : "border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]"
              }`}
            >
              {allSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
            </button>
            <span className="text-xs font-bold text-[#667781] dark:text-[#8696A0]">
              {items.length} élément(s) affiché(s)
            </span>
          </div>

          <div className="divide-y divide-[#E9EDEF] dark:divide-[#222E35]">
            {items.map((item) => {
              const config = TYPE_CONFIG[item.objectType] || TYPE_CONFIG.ue;
              const Icon = config.icon;
              const isSelected = selectedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ${
                    isSelected
                      ? "bg-amber-50/50 dark:bg-amber-950/20"
                      : "hover:bg-[#F0F2F5]/50 dark:hover:bg-[#1F2C34]/50"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleOne(item.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "bg-[#25D366] border-[#25D366]"
                        : "border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366]"
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </button>

                  {/* Icône type */}
                  <div
                    className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.bg} ${config.color} border-current/20`}
                      >
                        {config.label}
                      </span>
                      {item.deletionReason && (
                        <span className="text-[10px] text-[#667781] dark:text-[#8696A0] italic">
                          {item.deletionReason}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-[#111B21] dark:text-white mt-1 truncate">
                      {item.displayName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5 flex-wrap">
                      <span>🗑️ {item.deletedByName}</span>
                      <span>·</span>
                      <span className="font-mono">
                        {formatDate(item.deletedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Jours restants */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${getExpiryColor(item.daysRemaining)}`}
                    >
                      <Clock className="w-3 h-3" />
                      {item.daysRemaining} jour
                      {item.daysRemaining > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() =>
                        setRestoreConfirm({
                          id: item.id,
                          name: item.displayName,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-lg transition-colors"
                      title="Restaurer cet élément"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurer
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          id: item.id,
                          name: item.displayName,
                        })
                      }
                      className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal : confirmation restauration */}
      {restoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                  Restaurer cet élément ?
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                  <strong>{restoreConfirm.name}</strong> sera restauré avec
                  toutes ses dépendances (séances, chapitres, quiz, réponses) et
                  redeviendra visible.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <button
                onClick={() => setRestoreConfirm(null)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-[#667781]"
              >
                Annuler
              </button>
              <button
                onClick={() => handleRestore(restoreConfirm.id)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl disabled:opacity-50"
              >
                {actionLoading ? "Restauration..." : "Restaurer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal : suppression définitive */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                  Supprimer définitivement ?
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                  <strong>{deleteConfirm.name}</strong> sera{" "}
                  <strong>définitivement supprimé</strong>. Cette action est
                  irréversible et ne peut pas être annulée.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-[#667781]"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
              >
                {actionLoading ? "Suppression..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal : vidage total */}
      {purgeAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-300 dark:border-rose-800 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                <Eraser className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-rose-900 dark:text-rose-200">
                  ⚠️ Vider toute la corbeille ?
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                  <strong>{totalInTrash} élément(s)</strong> seront{" "}
                  <strong>définitivement supprimés</strong>. Cette action est{" "}
                  <strong>irréversible</strong> et ne peut pas être annulée.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <button
                onClick={() => setPurgeAllConfirm(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-[#667781]"
              >
                Annuler
              </button>
              <button
                onClick={handlePurgeAll}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
              >
                {actionLoading ? "Purge en cours..." : "Vider définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
