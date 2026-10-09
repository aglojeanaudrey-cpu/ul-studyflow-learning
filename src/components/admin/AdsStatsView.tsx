import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { PopupStats, PopupViewLog } from "../../types";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  MousePointerClick,
  Sparkles,
  Users,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-react";

interface AdsStatsViewProps {
  popupId: string;
  onBack: () => void;
}

type RangeType = "day" | "week" | "month" | "year";

export const AdsStatsView: React.FC<AdsStatsViewProps> = ({
  popupId,
  onBack,
}) => {
  const [stats, setStats] = useState<PopupStats | null>(null);
  const [viewers, setViewers] = useState<PopupViewLog[]>([]);
  const [range, setRange] = useState<RangeType>("week");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "viewers">("overview");

  const loadStats = async () => {
    setLoading(true);
    try {
      const [statsRes, viewersRes] = await Promise.all([
        api.getAdminPopupStats(popupId, range),
        api.getAdminPopupViewers(popupId),
      ]);
      setStats(statsRes);
      setViewers(viewersRes.views || []);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [popupId, range]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading || !stats) {
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
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#075E54] dark:text-[#25D366] hover:bg-[#E9EDEF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#111B21] dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#25D366]" />
              Statistiques : {stats.popup.title}
            </h2>
            <p className="text-xs text-[#667781] dark:text-[#8696A0]">
              Analyse détaillée des vues et clics
            </p>
          </div>
        </div>

        {/* Filtre de période */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#111B21] p-1 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] self-start sm:self-auto">
          {(["day", "week", "month", "year"] as RangeType[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                range === r
                  ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]"
                  : "text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
              }`}
            >
              {r === "day"
                ? "24h"
                : r === "week"
                  ? "7j"
                  : r === "month"
                    ? "30j"
                    : "1an"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E9EDEF] dark:border-[#222E35]">
        <button
          onClick={() => setTab("overview")}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px ${
            tab === "overview"
              ? "border-[#25D366] text-[#075E54] dark:text-[#25D366]"
              : "border-transparent text-[#667781] dark:text-[#8696A0]"
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setTab("viewers")}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px ${
            tab === "viewers"
              ? "border-[#25D366] text-[#075E54] dark:text-[#25D366]"
              : "border-transparent text-[#667781] dark:text-[#8696A0]"
          }`}
        >
          Vues détaillées ({viewers.length})
        </button>
      </div>

      {tab === "overview" && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#667781] dark:text-[#8696A0] uppercase">
                  Vues totales
                </span>
                <Eye className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
              </div>
              <p className="text-2xl font-extrabold text-[#111B21] dark:text-white tabular-nums">
                {stats.totalViews}
              </p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-1">
                Période : {stats.periodViews}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#667781] dark:text-[#8696A0] uppercase">
                  Clics totaux
                </span>
                <MousePointerClick className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#111B21] dark:text-white tabular-nums">
                {stats.totalClicks}
              </p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-1">
                Période : {stats.periodClicks}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#667781] dark:text-[#8696A0] uppercase">
                  Taux de clic (CTR)
                </span>
                <Sparkles className="w-4 h-4 text-[#D97706]" />
              </div>
              <p className="text-2xl font-extrabold text-[#075E54] dark:text-[#25D366] tabular-nums">
                {stats.ctr}%
              </p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-1">
                Global depuis création
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#667781] dark:text-[#8696A0] uppercase">
                  Utilisateurs uniques
                </span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#111B21] dark:text-white tabular-nums">
                {new Set(viewers.map((v) => v.user_phone).filter(Boolean)).size}
              </p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-1">
                Parmi {viewers.length} vues
              </p>
            </div>
          </div>

          {/* Graphique simple : vues par jour */}
          <div className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3">
            <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#25D366]" />
              Évolution sur la période
            </h3>

            {stats.viewsByDay.length === 0 ? (
              <p className="text-xs text-[#667781] dark:text-[#8696A0] py-4 text-center">
                Aucune vue sur cette période.
              </p>
            ) : (
              <div className="space-y-1.5">
                {stats.viewsByDay.map((item) => {
                  const maxCount = Math.max(
                    ...stats.viewsByDay.map((v) => v.count),
                    1,
                  );
                  const pct = (item.count / maxCount) * 100;
                  return (
                    <div
                      key={item.date}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="w-20 text-[10px] text-[#667781] dark:text-[#8696A0] font-mono">
                        {item.date
                          ? new Date(item.date).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "—"}
                      </span>
                      <div className="flex-1 h-5 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded overflow-hidden">
                        <div
                          className="h-full bg-[#25D366] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-[#111B21] dark:text-white tabular-nums">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Répartition par bouton */}
          {stats.clicksByButton.length > 0 && (
            <div className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3">
              <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-blue-600" />
                Répartition par bouton
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {stats.clicksByButton.map((b) => (
                  <div
                    key={b.button_type}
                    className="p-3 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl text-center"
                  >
                    <p className="text-[10px] font-bold uppercase text-[#667781] dark:text-[#8696A0]">
                      {b.button_type === "primary"
                        ? "Principal"
                        : b.button_type === "secondary"
                          ? "Secondaire"
                          : "Fermeture"}
                    </p>
                    <p className="text-xl font-extrabold text-[#111B21] dark:text-white tabular-nums mt-1">
                      {b.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top users */}
          {stats.topUsers.length > 0 && (
            <div className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3">
              <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Top 5 utilisateurs
              </h3>
              <div className="divide-y divide-[#E9EDEF] dark:divide-[#222E35]">
                {stats.topUsers.map((u, i) => (
                  <div
                    key={u.user_phone || i}
                    className="flex items-center justify-between py-2 text-xs"
                  >
                    <div>
                      <span className="font-mono text-[#111B21] dark:text-white font-bold">
                        {u.user_phone || "Anonyme"}
                      </span>
                      <span className="ml-2 text-[10px] text-[#667781] dark:text-[#8696A0]">
                        {u.user_department} · {u.user_level}
                      </span>
                    </div>
                    <span className="font-bold text-[#25D366] tabular-nums">
                      {u.view_count} vue(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "viewers" && (
        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden">
          {viewers.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#667781] dark:text-[#8696A0]">
              Aucune vue enregistrée pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0] font-semibold uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="p-3">Date & Heure</th>
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Rôle</th>
                    <th className="p-3">Département</th>
                    <th className="p-3">Niveau</th>
                    <th className="p-3">Page</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDEF] dark:divide-[#222E35]">
                  {viewers.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-[#F0F2F5]/50 dark:hover:bg-[#1F2C34]/50"
                    >
                      <td className="p-3 whitespace-nowrap font-mono text-[11px] text-[#667781] dark:text-[#8696A0]">
                        {formatDate(v.viewed_at)}
                      </td>
                      <td className="p-3 font-mono text-[#111B21] dark:text-white">
                        {v.user_phone || "Anonyme"}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366]">
                          {v.user_role || "ANONYME"}
                        </span>
                      </td>
                      <td className="p-3 text-[#667781] dark:text-[#8696A0]">
                        {v.user_department || "—"}
                      </td>
                      <td className="p-3 text-[#667781] dark:text-[#8696A0]">
                        {v.user_level || "—"}
                      </td>
                      <td className="p-3 text-[#667781] dark:text-[#8696A0] font-mono text-[11px]">
                        {v.page || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
