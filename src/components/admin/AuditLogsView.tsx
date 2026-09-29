import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { api } from '../../lib/api';
import { Shield, Search, RefreshCw } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs();
      setLogs(res.logs);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    (l.userPhone && l.userPhone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21]">Journal de Sécurité & Audit</h2>
          <p className="text-xs text-[#667781]">
            Traçabilité des connexions, attributions de droits, validations de quiz et modifications administratives.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#075E54] bg-[#F0F2F5] hover:bg-[#E9EDEF] rounded-xl self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Filtrer les logs par action, téléphone ou ressource..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E9EDEF] bg-white focus:border-[#25D366] focus:outline-none"
        />
        <Search className="w-4 h-4 text-[#667781] absolute left-2.5 top-3" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E9EDEF] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F2F5] text-[#667781] font-semibold uppercase tracking-wider border-b border-[#E9EDEF]">
              <tr>
                <th className="p-3.5">Horodatage</th>
                <th className="p-3.5">Acteur</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Ressource</th>
                <th className="p-3.5">Détails de l'opération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDEF]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#667781]">
                    Chargement des journaux de sécurité...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#667781]">
                    Aucun événement d'audit répertorié.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F0F2F5]/50">
                    <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-[#667781]">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-semibold text-[#111B21]">
                        {log.userPhone || 'Système'}
                      </span>
                      {log.userRole && (
                        <span className="ml-1.5 text-[10px] bg-emerald-50 text-[#075E54] px-1.5 py-0.5 rounded font-bold">
                          {log.userRole}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-mono font-bold text-[#075E54]">
                      {log.action}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-[#667781]">
                      {log.resource}
                    </td>
                    <td className="p-3.5 text-[#111B21] max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
