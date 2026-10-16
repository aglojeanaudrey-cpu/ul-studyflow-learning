import React, { useEffect, useState } from "react";
import {
  Mail,
  MessageSquare,
  Trash2,
  Filter,
  Clock,
  Phone,
  CheckCircle2,
  Archive,
} from "lucide-react";
import { api } from "../../lib/api";

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  admin_note: string;
  created_at: string;
}

export const AdminContactsView: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [newCount, setNewCount] = useState(0);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminContactMessages(filter);
      setMessages(res.messages || []);
      setNewCount(res.newCount || 0);
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
      await api.updateAdminContactMessage(id, { status });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const saveNote = async () => {
    if (!selected) return;
    try {
      await api.updateAdminContactMessage(selected.id, { adminNote: noteDraft });
      setSelected(null);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    try {
      await api.deleteAdminContactMessage(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      new: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
      read: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
      replied: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      archived: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };
    const labels: Record<string, string> = {
      new: "Nouveau",
      read: "Lu",
      replied: "Répondu",
      archived: "Archivé",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#25D366]" />
            Messages de contact
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
            {newCount > 0 ? `${newCount} nouveau(x) message(s)` : "Aucun nouveau message"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#667781]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
          >
            <option value="ALL">Tous</option>
            <option value="new">Nouveaux</option>
            <option value="read">Lus</option>
            <option value="replied">Répondus</option>
            <option value="archived">Archivés</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-[#667781]">Chargement...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 space-y-2 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
          <Mail className="w-10 h-10 mx-auto text-[#667781]" />
          <p className="text-sm font-bold text-[#111B21] dark:text-white">
            Aucun message
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white dark:bg-[#111B21] rounded-2xl border p-4 hover:shadow-md transition-shadow ${
                msg.status === "new"
                  ? "border-[#25D366]/40 dark:border-[#25D366]/30"
                  : "border-[#E9EDEF] dark:border-[#222E35]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-[#111B21] dark:text-white">
                      {msg.name}
                    </h3>
                    {statusBadge(msg.status)}
                    <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                      {msg.subject}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[#667781] dark:text-[#8696A0] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {msg.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[#3B4A54] dark:text-[#E9EDEF] line-clamp-2">
                    {msg.message}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setSelected(msg);
                    setNoteDraft(msg.admin_note || "");
                    if (msg.status === "new") updateStatus(msg.id, "read");
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg text-[#667781] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
                >
                  Lire
                </button>
                {msg.status !== "replied" && (
                  <button
                    onClick={() => updateStatus(msg.id, "replied")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#25D366] text-[#075E54] font-semibold hover:bg-[#1faa54] flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Marquer répondu
                  </button>
                )}
                {msg.status !== "archived" && (
                  <button
                    onClick={() => updateStatus(msg.id, "archived")}
                    className="text-xs px-3 py-1.5 rounded-lg text-[#667781] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] flex items-center gap-1"
                  >
                    <Archive className="w-3 h-3" /> Archiver
                  </button>
                )}
                <button
                  onClick={() => remove(msg.id)}
                  className="text-xs px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                {selected.name}
              </h3>
              {statusBadge(selected.status)}
            </div>

            <div className="space-y-1 text-xs text-[#667781] dark:text-[#8696A0]">
              <p>
                <strong className="text-[#075E54] dark:text-[#25D366]">Téléphone :</strong>{" "}
                {selected.phone}
              </p>
              {selected.email && (
                <p>
                  <strong className="text-[#075E54] dark:text-[#25D366]">Email :</strong>{" "}
                  {selected.email}
                </p>
              )}
              <p>
                <strong className="text-[#075E54] dark:text-[#25D366]">Sujet :</strong>{" "}
                {selected.subject}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#075E54] dark:text-[#25D366] mb-1">
                Message :
              </p>
              <p className="text-xs bg-[#F0F2F5] dark:bg-[#1F2C34] p-3 rounded-xl whitespace-pre-wrap text-[#111B21] dark:text-[#E9EDEF]">
                {selected.message}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#075E54] dark:text-[#25D366] mb-1">
                Note interne :
              </p>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#0B141A] text-[#111B21] dark:text-white"
              />
              <button
                onClick={saveNote}
                className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-[#128C7E] text-white hover:bg-[#0a6b5f]"
              >
                Enregistrer
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