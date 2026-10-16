import React, { useEffect, useState } from "react";
import {
  Handshake,
  Check,
  X,
  Clock,
  Trash2,
  User as UserIcon,
  Phone,
  Mail,
  GraduationCap,
  MessageSquare,
  Filter,
} from "lucide-react";
import { api } from "../../lib/api";

interface PartnershipRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  department: string;
  program: string;
  level: string;
  is_delegate: boolean;
  motivation: string;
  contribution: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  admin_note: string;
  created_at: string;
  user_phone?: string;
}

export const AdminPartnershipsView: React.FC = () => {
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [pendingCount, setPendingCount] = useState(0);
  const [selected, setSelected] = useState<PartnershipRequest | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminPartnershipRequests(filter);
      setRequests(res.requests || []);
      setPendingCount(res.pendingCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.updateAdminPartnershipRequest(id, { status });
      load();
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const saveNote = async () => {
    if (!selected) return;
    try {
      await api.updateAdminPartnershipRequest(selected.id, {
        adminNote: noteDraft,
      });
      setSelected(null);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer définitivement cette demande ?")) return;
    try {
      await api.deleteAdminPartnershipRequest(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
      reviewing: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
      accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      rejected: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
    };
    const labels: Record<string, string> = {
      pending: "En attente",
      reviewing: "En examen",
      accepted: "Acceptée",
      rejected: "Refusée",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[#25D366]" />
            Demandes de partenariat
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
            {pendingCount > 0
              ? `${pendingCount} demande(s) en attente`
              : "Aucune demande en attente"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#667781]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
          >
            <option value="ALL">Toutes</option>
            <option value="pending">En attente</option>
            <option value="reviewing">En examen</option>
            <option value="accepted">Acceptées</option>
            <option value="rejected">Refusées</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12 text-xs text-[#667781]">Chargement...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 space-y-2 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
          <Handshake className="w-10 h-10 mx-auto text-[#667781]" />
          <p className="text-sm font-bold text-[#111B21] dark:text-white">
            Aucune demande
          </p>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Les étudiants qui proposent leur filière apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-[#111B21] dark:text-white">
                      {req.full_name}
                    </h3>
                    {statusBadge(req.status)}
                    {req.is_delegate && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366]">
                        Délégué(e)
                      </span>
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#667781] dark:text-[#8696A0]">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {req.department} · {req.program} · {req.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {req.phone}
                    </span>
                    {req.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {req.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(req.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[#3B4A54] dark:text-[#E9EDEF] line-clamp-2">
                    <MessageSquare className="w-3 h-3 inline mr-1" />
                    {req.motivation}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setSelected(req);
                    setNoteDraft(req.admin_note || "");
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg text-[#667781] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
                >
                  Détails
                </button>
                {req.status !== "accepted" && (
                  <button
                    onClick={() => updateStatus(req.id, "accepted")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#25D366] text-[#075E54] font-semibold hover:bg-[#1faa54] flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Accepter
                  </button>
                )}
                {req.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus(req.id, "rejected")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Refuser
                  </button>
                )}
                <button
                  onClick={() => remove(req.id)}
                  className="text-xs px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal détail */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-[#111B21] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                {selected.full_name}
              </h3>
              {statusBadge(selected.status)}
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-[#075E54] dark:text-[#25D366]">Filière :</span>{" "}
                {selected.department} · {selected.program} · {selected.level}
              </div>
              <div>
                <span className="font-bold text-[#075E54] dark:text-[#25D366]">Téléphone :</span>{" "}
                {selected.phone}
              </div>
              {selected.email && (
                <div>
                  <span className="font-bold text-[#075E54] dark:text-[#25D366]">Email :</span>{" "}
                  {selected.email}
                </div>
              )}
              <div>
                <span className="font-bold text-[#075E54] dark:text-[#25D366]">Délégué(e) :</span>{" "}
                {selected.is_delegate ? "Oui" : "Non"}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#075E54] dark:text-[#25D366] mb-1">
                Motivation :
              </p>
              <p className="text-xs bg-[#F0F2F5] dark:bg-[#1F2C34] p-3 rounded-xl whitespace-pre-wrap text-[#111B21] dark:text-[#E9EDEF]">
                {selected.motivation}
              </p>
            </div>

            {selected.contribution && (
              <div>
                <p className="text-xs font-bold text-[#075E54] dark:text-[#25D366] mb-1">
                  Contribution envisagée :
                </p>
                <p className="text-xs bg-[#F0F2F5] dark:bg-[#1F2C34] p-3 rounded-xl whitespace-pre-wrap text-[#111B21] dark:text-[#E9EDEF]">
                  {selected.contribution}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-[#075E54] dark:text-[#25D366] mb-1">
                Note interne :
              </p>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#0B141A] text-[#111B21] dark:text-white"
                placeholder="Notes visibles uniquement par l'admin..."
              />
              <button
                onClick={saveNote}
                className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-[#128C7E] text-white hover:bg-[#0a6b5f]"
              >
                Enregistrer la note
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <button
                onClick={() => setSelected(null)}
                className="text-xs px-4 py-2 rounded-lg text-[#667781] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};