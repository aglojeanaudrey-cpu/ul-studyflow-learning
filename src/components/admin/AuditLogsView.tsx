import React, { useState, useEffect, useMemo } from 'react';
import { AuditLog } from '../../types';
import { api } from '../../lib/api';
import {
  Shield, Search, RefreshCw, Trash2, CheckSquare, Square,
  AlertCircle, CheckCircle2, X, Filter, Download,
  Calendar, ListFilter, ChevronDown
} from 'lucide-react';

type DateFilter = 'all' | 'today' | '7d' | '30d';

// Labels lisibles pour les actions (optionnel — sinon on affiche le code brut)
const ACTION_LABELS: Record<string, string> = {
  'USER_LOGIN': 'Connexion utilisateur',
  'USER_LOGOUT': 'Déconnexion',
  'USER_REGISTER': 'Inscription',
  'USER_CREATE': 'Création utilisateur',
  'USER_UPDATE': 'Modification utilisateur',
  'USER_DELETE': 'Suppression utilisateur',
  'ACCESS_CHANGE': 'Changement d\'accès UE',
  'UNLOCK_REQUEST': 'Demande de déblocage',
  'UNLOCK_APPROVE': 'Validation de déblocage',
  'CONFIG_UPDATE': 'Mise à jour config',
  'FORM_SUBMIT': 'Soumission formulaire',
  'PAYMENT_METHOD_CREATE': 'Ajout moyen de paiement',
  'PAYMENT_METHOD_UPDATE': 'Modif moyen de paiement',
  'PAYMENT_METHOD_DELETE': 'Suppression moyen de paiement',
  'AUDIT_LOGS_DELETE': 'Suppression de logs',
  'AUDIT_LOGS_PURGE_ALL': 'Purge totale des logs',
  'CONTACT_MESSAGE': 'Message de contact',
};

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ⭐ Nouveaux filtres
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // Sélection & suppression
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'selection' | 'all'; count: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs();
      setLogs(res.logs);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4500);
  };

  // ⭐ Liste unique des actions présentes dans les logs (pour le dropdown)
  const availableActions = useMemo(() => {
    const set = new Set(logs.map(l => l.action).filter(Boolean));
    return Array.from(set).sort();
  }, [logs]);

  // ⭐ Filtrage combiné : search + action + date
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return logs.filter(l => {
      // 1. Recherche texte
      const matchesSearch =
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.details.toLowerCase().includes(search.toLowerCase()) ||
        (l.userPhone && l.userPhone.includes(search)) ||
        (l.resource && l.resource.toLowerCase().includes(search.toLowerCase()));

      // 2. Filtre action
      const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;

      // 3. Filtre date
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const logTime = new Date(l.timestamp).getTime();
        const diff = now - logTime;
        if (dateFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          matchesDate = logTime >= today.getTime();
        } else if (dateFilter === '7d') {
          matchesDate = diff <= 7 * oneDay;
        } else if (dateFilter === '30d') {
          matchesDate = diff <= 30 * oneDay;
        }
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [logs, search, actionFilter, dateFilter]);

  // Toggle une ligne
  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allFilteredSelected = filteredLogs.length > 0 && filteredLogs.every(l => selectedIds.has(l.id));

  const toggleAll = () => {
    if (allFilteredSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredLogs.map(l => l.id)));
  };

  const resetFilters = () => {
    setSearch('');
    setActionFilter('ALL');
    setDateFilter('all');
  };

  const hasActiveFilters = search !== '' || actionFilter !== 'ALL' || dateFilter !== 'all';

  // Suppression ciblée
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      const res = await api.deleteAuditLogs(Array.from(selectedIds));
      showSuccess(`${res.deletedCount} log(s) supprimé(s) avec succès.`);
      setDeleteConfirm(null);
      await loadLogs();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleting(false);
    }
  };

  // Purge totale
  const handlePurgeAll = async () => {
    setDeleting(true);
    try {
      const res = await api.purgeAllAuditLogs();
      showSuccess(`Purge totale effectuée : ${res.deletedCount} log(s) supprimé(s).`);
      setDeleteConfirm(null);
      await loadLogs();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la purge.');
    } finally {
      setDeleting(false);
    }
  };

  // ⭐ Export CSV des logs filtrés (côté client, à partir de filteredLogs)
  const handleExportCsv = async () => {
    if (filteredLogs.length === 0) return;
    setExporting(true);
    try {
      // Construction CSV côté client (garantit d'exporter EXACTEMENT ce qui est filtré)
      const headers = ['Horodatage', 'Téléphone', 'Rôle', 'Action', 'Ressource', 'Détails', 'IP'];
      const escapeCsv = (val: any) => {
        const s = String(val ?? '');
        if (s.includes(';') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const lines = [headers.join(';')];
      filteredLogs.forEach(l => {
        lines.push([
          new Date(l.timestamp).toLocaleString('fr-FR'),
          l.userPhone || '',
          l.userRole || '',
          l.action,
          l.resource,
          l.details,
          l.ip || ''
        ].map(escapeCsv).join(';'));
      });

      // UTF-8 BOM pour Excel
      const csvContent = '\ufeff' + lines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `audit_logs_${dateStr}_${filteredLogs.length}entrees.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess(`${filteredLogs.length} log(s) exporté(s) en CSV.`);
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'export CSV.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white">Journal de Sécurité & Audit</h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Traçabilité des connexions, attributions de droits, validations de quiz et modifications administratives.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleExportCsv}
            disabled={exporting || filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-xl transition-colors disabled:opacity-50"
            title={`Exporter les ${filteredLogs.length} logs filtrés`}
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? 'Export...' : `Export CSV (${filteredLogs.length})`}
          </button>

          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#075E54] dark:text-[#25D366] bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] dark:hover:bg-[#222E35] rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>

          {logs.length > 0 && (
            <button
              onClick={() => setDeleteConfirm({ type: 'all', count: logs.length })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-xl transition-colors"
              title="Purger tous les logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purger tout
            </button>
          )}
        </div>
      </div>

      {/* Alertes */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ⭐ BARRE DE FILTRES COMPLÈTE */}
      <div className="bg-white dark:bg-[#111B21] p-3.5 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3">
        {/* Ligne 1 : Search + Action + Reset */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Recherche */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher par action, téléphone, ressource, détails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-2.5 top-3" />
          </div>

          {/* Dropdown Action */}
          <div className="relative min-w-[200px]">
            <ListFilter className="w-3.5 h-3.5 text-[#667781] dark:text-[#8696A0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full text-xs pl-8 pr-8 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none appearance-none cursor-pointer font-medium"
            >
              <option value="ALL">Toutes les actions ({availableActions.length})</option>
              {availableActions.map(a => (
                <option key={a} value={a}>
                  {ACTION_LABELS[a] || a}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#667781] dark:text-[#8696A0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset filtres */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] rounded-xl transition-colors"
              title="Réinitialiser tous les filtres"
            >
              <X className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Ligne 2 : Filtres date (chips) */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-3.5 h-3.5 text-[#667781] dark:text-[#8696A0] shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0]">
            Période :
          </span>
          {([
            { key: 'all', label: 'Tout' },
            { key: 'today', label: "Aujourd'hui" },
            { key: '7d', label: '7 jours' },
            { key: '30d', label: '30 jours' },
          ] as { key: DateFilter; label: string }[]).map(opt => (
            <button
              key={opt.key}
              onClick={() => setDateFilter(opt.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                dateFilter === opt.key
                  ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] shadow-xs'
                  : 'bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}

          <span className="ml-auto text-[10px] text-[#667781] dark:text-[#8696A0]">
            <strong className="text-[#111B21] dark:text-white">{filteredLogs.length}</strong> / {logs.length} entrées
          </span>
        </div>
      </div>

      {/* Barre d'action sélection */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span className="font-bold text-amber-900 dark:text-amber-300">
              {selectedIds.size} log(s) sélectionné(s)
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
              onClick={() => setDeleteConfirm({ type: 'selection', count: selectedIds.size })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer la sélection
            </button>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0] font-semibold uppercase tracking-wider border-b border-[#E9EDEF] dark:border-[#222E35]">
              <tr>
                <th className="p-3.5 w-10">
                  {filteredLogs.length > 0 && (
                    <button onClick={toggleAll} className="flex items-center justify-center">
                      {allFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#25D366]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#667781]" />
                      )}
                    </button>
                  )}
                </th>
                <th className="p-3.5">Horodatage</th>
                <th className="p-3.5">Acteur</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Ressource</th>
                <th className="p-3.5">Détails de l'opération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDEF] dark:divide-[#222E35]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#667781] dark:text-[#8696A0]">
                    Chargement des journaux de sécurité...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#667781] dark:text-[#8696A0]">
                    {hasActiveFilters
                      ? 'Aucun log ne correspond à vos filtres.'
                      : "Aucun événement d'audit répertorié."}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = selectedIds.has(log.id);
                  return (
                    <tr
                      key={log.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-amber-50/60 dark:bg-amber-950/20'
                          : 'hover:bg-[#F0F2F5]/50 dark:hover:bg-[#1F2C34]/50'
                      }`}
                    >
                      <td className="p-3.5">
                        <button onClick={() => toggleOne(log.id)} className="flex items-center justify-center">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#25D366]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#667781] dark:text-[#8696A0] hover:text-[#25D366]" />
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-[#667781] dark:text-[#8696A0]">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-semibold text-[#111B21] dark:text-white">
                          {log.userPhone || 'Système'}
                        </span>
                        {log.userRole && (
                          <span className="ml-1.5 text-[10px] bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] px-1.5 py-0.5 rounded font-bold">
                            {log.userRole}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#075E54] dark:text-[#25D366]">
                          {log.action}
                        </span>
                        {ACTION_LABELS[log.action] && (
                          <div className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">
                            {ACTION_LABELS[log.action]}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-[#667781] dark:text-[#8696A0]">
                        {log.resource}
                      </td>
                      <td className="p-3.5 text-[#111B21] dark:text-white max-w-md truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMATION */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                  {deleteConfirm.type === 'all' ? 'Purger tous les logs ?' : 'Supprimer la sélection ?'}
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1 leading-relaxed">
                  {deleteConfirm.type === 'all' ? (
                    <>
                      Vous êtes sur le point de supprimer <strong className="text-rose-600">{deleteConfirm.count}</strong> entrée(s) du journal d'audit.{' '}
                      <strong>Cette action est irréversible.</strong>
                    </>
                  ) : (
                    <>
                      Vous allez supprimer <strong className="text-rose-600">{deleteConfirm.count}</strong> log(s) sélectionné(s).{' '}
                      <strong>Cette action est irréversible.</strong>
                    </>
                  )}
                </p>
                <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-2 italic">
                  💡 Une entrée de traçabilité sera automatiquement créée pour cette suppression.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={deleteConfirm.type === 'all' ? handlePurgeAll : handleDeleteSelected}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};