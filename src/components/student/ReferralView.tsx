import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { MyReferralData, Referral } from "../../types";
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Award,
  TrendingUp,
  ExternalLink,
  Crown,
  Star,
  Target,
} from "lucide-react";

export const ReferralView: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<MyReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getMyReferral();
        setData(res);
      } catch (err) {
        console.error("Error loading referral data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const referralLink = `${window.location.origin}/?ref=${data.code.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data.code.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const message = `📚 Salut ! Je révise mes cours sur UL StudyFlow (la plateforme des étudiants de Lomé) 🎓\n\nInscris-toi avec mon lien, tu auras accès à des UE gratuites :\n👉 ${referralLink}\n\nMon code de parrainage : ${data.code.code}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const validatedCount = data.code.validated_referrals;
  const nextMilestone = data.code.nextMilestone;

  // Calcul de progression vers le prochain palier
  const previousThreshold = (() => {
    if (validatedCount >= 25) return 25;
    if (validatedCount >= 5) return 5;
    if (validatedCount >= 3) return 3;
    if (validatedCount >= 1) return 1;
    return 0;
  })();

  const progressPercent = nextMilestone
    ? Math.min(
        100,
        ((validatedCount - previousThreshold) /
          (nextMilestone.threshold - previousThreshold)) *
          100,
      )
    : 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Validé
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
            <XCircle className="w-3 h-3" /> Expiré
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            <XCircle className="w-3 h-3" /> Rejeté
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] dark:from-[#111B21] dark:to-[#1F2C34] text-white p-5 sm:p-6 rounded-3xl shadow-md space-y-3 border border-emerald-800 dark:border-[#222E35]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 flex items-center justify-center">
            <Gift className="w-6 h-6 text-[#25D366]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Mon Parrainage</h1>
            <p className="text-xs text-emerald-100/90 dark:text-[#8696A0]">
              Partagez UL StudyFlow et gagnez des récompenses exclusives 🎁
            </p>
          </div>
        </div>
      </div>

      {/* Mon code */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#25D366]" />
            Mon code de parrainage
          </h2>
        </div>

        <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-50/40 dark:from-emerald-950/40 dark:to-emerald-950/20 rounded-2xl border-2 border-dashed border-[#25D366]/40 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase text-[#667781] dark:text-[#8696A0] mb-1">
                Mon code unique
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[#075E54] dark:text-[#25D366] font-mono tracking-wider truncate">
                {data.code.code}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-3 rounded-xl bg-[#25D366] text-white hover:bg-[#1faa54] transition-all shadow-sm shrink-0"
              title="Copier le code"
            >
              {copiedCode ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="pt-3 border-t border-[#E9EDEF]/60 dark:border-[#222E35]">
            <p className="text-[10px] font-bold uppercase text-[#667781] dark:text-[#8696A0] mb-1.5">
              Mon lien de partage
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[11px] font-mono text-[#075E54] dark:text-[#25D366] truncate"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
          </div>
        </div>

        {/* Boutons de partage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            Partager sur WhatsApp
          </button>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] rounded-xl transition-all"
          >
            <Copy className="w-4 h-4" />
            Copier le lien
          </button>
        </div>
      </div>

      {/* Progression */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#25D366]" />
            Ma progression
          </h2>
          <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] tabular-nums">
            {validatedCount} parrainage{validatedCount > 1 ? "s" : ""} validé
            {validatedCount > 1 ? "s" : ""}
          </span>
        </div>

        {nextMilestone ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#667781] dark:text-[#8696A0]">
                Palier actuel
              </span>
              <span className="font-bold text-[#075E54] dark:text-[#25D366]">
                {previousThreshold} / {nextMilestone.threshold}
              </span>
            </div>

            <div className="w-full h-3 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-2">
              <Target className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-900 dark:text-amber-300">
                <strong>Prochaine récompense :</strong> {nextMilestone.label}
                <br />
                <span className="text-[10px] opacity-80">
                  Plus que{" "}
                  <strong>{nextMilestone.threshold - validatedCount}</strong>{" "}
                  parrainage(s) validé(s) !
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/40 dark:to-amber-950/40 rounded-xl border border-[#25D366]/30 text-center space-y-2">
            <Crown className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-bold text-[#075E54] dark:text-[#25D366]">
              🏆 Félicitations, vous avez atteint le palier maximum !
            </p>
            <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">
              Merci pour votre engagement exceptionnel envers UL Study Flow.
            </p>
          </div>
        )}

        {/* Paliers */}
        <div className="pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
          <p className="text-[10px] font-bold uppercase text-[#667781] dark:text-[#8696A0] mb-2.5">
            Tous les paliers
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { count: 1, label: "Code -10%", icon: Star },
              { count: 3, label: "Code -20%", icon: Star },
              { count: 5, label: "1 UE offerte", icon: Award },
              { count: 25, label: "1 mois sponsorisé", icon: Crown },
            ].map((milestone) => {
              const achieved = validatedCount >= milestone.count;
              const Icon = milestone.icon;
              return (
                <div
                  key={milestone.count}
                  className={`p-2.5 rounded-xl text-center border transition-all ${
                    achieved
                      ? "bg-[#25D366]/10 border-[#25D366]/40"
                      : "bg-[#F0F2F5] dark:bg-[#1F2C34] border-[#E9EDEF] dark:border-[#222E35] opacity-60"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mx-auto mb-1 ${achieved ? "text-[#25D366]" : "text-[#667781]"}`}
                  />
                  <p
                    className={`text-[10px] font-bold ${achieved ? "text-[#075E54] dark:text-[#25D366]" : "text-[#667781] dark:text-[#8696A0]"}`}
                  >
                    {milestone.count} parrain{milestone.count > 1 ? "s" : ""}
                  </p>
                  <p className="text-[9px] text-[#667781] dark:text-[#8696A0] mt-0.5">
                    {milestone.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mes récompenses */}
      {data.rewards.length > 0 && (
        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Mes récompenses ({data.rewards.length})
          </h2>
          <div className="space-y-2">
            {data.rewards.map((reward) => (
              <div
                key={reward.id}
                className="p-3 bg-gradient-to-r from-amber-50 to-amber-50/30 dark:from-amber-950/30 dark:to-amber-950/10 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-amber-900 dark:text-amber-300">
                    🎁 {reward.rewardLabel}
                  </p>
                  <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-0.5">
                    Palier {reward.milestone} · Obtenu le{" "}
                    {new Date(reward.granted_at).toLocaleDateString("fr-FR")}
                    {reward.expires_at &&
                      ` · Expire le ${new Date(reward.expires_at).toLocaleDateString("fr-FR")}`}
                  </p>
                  {reward.promo_code && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                        Code :
                      </span>
                      <code className="text-[11px] font-bold font-mono text-amber-900 dark:text-amber-300 bg-white dark:bg-[#111B21] px-2 py-0.5 rounded">
                        {reward.promo_code}
                      </code>
                    </div>
                  )}
                </div>
                {reward.is_used ? (
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 shrink-0">
                    Utilisé
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                    Disponible
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mes filleuls */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-[#111B21] dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#25D366]" />
            Mes filleuls ({data.referrals.length})
          </h2>
        </div>

        {data.referrals.length === 0 ? (
          <div className="p-8 text-center bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl space-y-2">
            <Users className="w-10 h-10 text-[#667781] mx-auto opacity-50" />
            <p className="text-xs font-medium text-[#111B21] dark:text-white">
              Aucun filleul pour le moment
            </p>
            <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">
              Partagez votre lien pour commencer à parrainer !
            </p>
            <button
              onClick={handleShareWhatsApp}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Partager maintenant
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E9EDEF] dark:divide-[#222E35]">
            {data.referrals.map((ref) => (
              <div
                key={ref.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-[#111B21] dark:text-white truncate">
                    {ref.refereeName}
                  </p>
                  <p className="text-[10px] text-[#667781] dark:text-[#8696A0] font-mono">
                    {ref.refereePhone} · Inscrit le{" "}
                    {new Date(ref.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  {ref.status === "pending" && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                      ⏳ Expire le{" "}
                      {new Date(ref.expires_at).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                  {ref.status === "validated" && ref.validated_at && (
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      ✅ Validé le{" "}
                      {new Date(ref.validated_at).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
                {getStatusBadge(ref.status)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Si je suis moi-même un filleul */}
      {data.iAmReferee && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900 p-4">
          <p className="text-xs text-blue-900 dark:text-blue-300">
            <strong>ℹ️ Info :</strong> Vous avez été parrainé par{" "}
            {data.iAmReferee.referrerName}.
            {data.iAmReferee.status === "pending" &&
              " Votre parrainage sera validé après votre premier déblocage d'UE."}
            {data.iAmReferee.status === "validated" &&
              " Merci d'avoir rejoint UL StudyFlow !"}
          </p>
        </div>
      )}
    </div>
  );
};
