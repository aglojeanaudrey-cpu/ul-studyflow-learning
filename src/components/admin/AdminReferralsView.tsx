import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Referral, ReferralStats } from "../../types";
import {
  Users,
  TrendingUp,
  Award,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Target,
  Zap,
  Crown,
  Star,
  Gift,
  BarChart3,
  DollarSign,
} from "lucide-react";

export const AdminReferralsView: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [tab, setTab] = useState<"overview" | "list">("overview");
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

  const loadAll = async () => {
    setLoading(true);
    try {
      const [refsRes, statsRes] = await Promise.all([
        api.getAdminReferrals({ status: filterStatus, q: search }),
        api.getAdminReferralStats(),
      ]);
      setReferrals(refsRes.referrals || []);
      setTotal(refsRes.total || 0);
      setStats(statsRes);
    } catch (err) {
      console.error("Error loading referrals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAll();
  };

  const handleForceValidate = async (ref: Referral) => {
    if (
      !window.confirm(
        `Forcer la validation du parrainage ${ref.referrerName} → ${ref.refereeName} ?`,
      )
    )
      return;
    try {
      await api.forceValidateReferral(ref.id);
      showSuccess("Parrainage validé avec succès.");
      await loadAll();
    } catch (err: any) {
      showError(err.message || "Erreur lors de la validation.");
    }
  };

  const handleReject = async (ref: Referral) => {
    const reason = window.prompt("Motif du rejet :");
    if (reason === null) return;
    try {
      await api.rejectReferral(ref.id, reason || "Rejeté par admin");
      showSuccess("Parrainage rejeté.");
      await loadAll();
    } catch (err: any) {
      showError(err.message || "Erreur lors du rejet.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Validé
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600">
            <XCircle className="w-3 h-3" /> Expiré
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            <XCircle className="w-3 h-3" /> Rejeté
          </span>
        );
      default:
        return null;
    }
  };

  if (loading && !stats) {
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
            Parrainage & Affiliation
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Suivi des parrainages, top parrains et statistiques de croissance
            virale.
          </p>
        </div>

        <button
          onClick={loadAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#075E54] dark:text-[#25D366] bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-600" />
          {errorMsg}
        </div>
      )}

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
          onClick={() => setTab("list")}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px ${
            tab === "list"
              ? "border-[#25D366] text-[#075E54] dark:text-[#25D366]"
              : "border-transparent text-[#667781] dark:text-[#8696A0]"
          }`}
        >
          Tous les parrainages ({total})
        </button>
      </div>

      {tab === "overview" && stats && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#667781] dark:text-[#8696A0] uppercase">
                  Total parrainages
                </span>
                <Users className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
              </div>
              <p className="text-2xl font-extrabold text-[#111B21] dark:text-white tabular-nums">
                {stats.totalReferrals}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#667781] dark:text-[#8696A0] uppercase">
                  Validés
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                {stats.totalValidated}
              </p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-1">
                Taux : {stats.conversionRate}%
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#667781] dark:text-[#8696A0] uppercase">
                  En attente
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-amber-600 tabular-nums">
                {stats.totalPending}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#667781] dark:text-[#8696A0] uppercase">
                  K-factor
                </span>
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-extrabold text-purple-600 tabular-nums">
                {stats.kFactor}
              </p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-1">
                {stats.kFactor >= 0.5
                  ? "🚀 Viral"
                  : stats.kFactor >= 0.2
                    ? "📈 Croissance"
                    : "🌱 Démarrage"}
              </p>
            </div>
          </div>

          {/* Top parrains */}
          {stats.topReferrers.length > 0 && (
            <div className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3">
              <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Top 10 parrains
              </h3>
              <div className="space-y-1.5">
                {stats.topReferrers.map((r, i) => (
                  <div
                    key={r.code}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        i === 0
                          ? "bg-amber-500 text-white"
                          : i === 1
                            ? "bg-gray-400 text-white"
                            : i === 2
                              ? "bg-amber-700 text-white"
                              : "bg-[#075E54]/15 text-[#075E54] dark:text-[#25D366]"
                      }`}
                    >
                      {i === 0 ? <Crown className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-[#111B21] dark:text-white truncate">
                        {r.userName}
                      </p>
                      <p className="text-[10px] text-[#667781] dark:text-[#8696A0] font-mono">
                        {r.code} · {r.department} {r.level} · {r.userPhone}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-[#25D366] tabular-nums">
                        {r.validatedCount}
                      </p>
                      <p className="text-[9px] text-[#667781] dark:text-[#8696A0]">
                        / {r.totalCount} total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Récompenses distribuées */}
          {stats.rewardsDistributed.length > 0 && (
            <div className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3">
              <h3 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#25D366]" />
                Récompenses distribuées
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.rewardsDistributed.map((r) => (
                  <div
                    key={r.rewardType}
                    className="p-3 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl text-center"
                  >
                    <p className="text-xl font-extrabold text-[#111B21] dark:text-white tabular-nums">
                      {r.count}
                    </p>
                    <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5 font-mono">
                      {r.rewardType}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "list" && (
        <>
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone ou code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white focus:border-[#25D366] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-2.5 top-3" />
            </form>

            <div className="flex items-center gap-1 bg-white dark:bg-[#111B21] p-1 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] overflow-x-auto">
              {["ALL", "pending", "validated", "expired", "rejected"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      filterStatus === s
                        ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]"
                        : "text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
                    }`}
                  >
                    {s === "ALL"
                      ? "Tous"
                      : s === "pending"
                        ? "En attente"
                        : s === "validated"
                          ? "Validés"
                          : s === "expired"
                            ? "Expirés"
                            : "Rejetés"}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Liste */}
          <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden">
            {referrals.length === 0 ? (
              <p className="p-8 text-center text-xs text-[#667781] dark:text-[#8696A0]">
                Aucun parrainage trouvé.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Parrain</th>
                      <th className="p-3">Filleul</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3">Dates</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EDEF] dark:divide-[#222E35]">
                    {referrals.map((ref) => (
                      <tr
                        key={ref.id}
                        className="hover:bg-[#F0F2F5]/50 dark:hover:bg-[#1F2C34]/50"
                      >
                        <td className="p-3">
                          <p className="font-bold text-[#111B21] dark:text-white">
                            {ref.referrerName}
                          </p>
                          <p className="text-[10px] text-[#667781] dark:text-[#8696A0] font-mono">
                            {ref.referrerPhone}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-[#111B21] dark:text-white">
                            {ref.refereeName}
                          </p>
                          <p className="text-[10px] text-[#667781] dark:text-[#8696A0] font-mono">
                            {ref.refereePhone}
                          </p>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-xs font-bold text-[#075E54] dark:text-[#25D366]">
                            {ref.referral_code}
                          </span>
                        </td>
                        <td className="p-3">{getStatusBadge(ref.status)}</td>
                        <td className="p-3 text-[10px] text-[#667781] dark:text-[#8696A0]">
                          Inscrit :{" "}
                          {new Date(ref.created_at).toLocaleDateString("fr-FR")}
                          {ref.validated_at && (
                            <>
                              <br />
                              Validé :{" "}
                              {new Date(ref.validated_at).toLocaleDateString(
                                "fr-FR",
                              )}
                            </>
                          )}
                          {ref.status === "pending" && (
                            <>
                              <br />
                              Expire :{" "}
                              {new Date(ref.expires_at).toLocaleDateString(
                                "fr-FR",
                              )}
                            </>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {ref.status === "pending" && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleForceValidate(ref)}
                                title="Forcer la validation"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleReject(ref)}
                                title="Rejeter"
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
