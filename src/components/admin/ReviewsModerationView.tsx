import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { UEReview } from "../../types";
import {
  Star,
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Filter,
  User,
  BookOpen,
} from "lucide-react";

export const ReviewsModerationView: React.FC = () => {
  const [reviews, setReviews] = useState<UEReview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("ALL");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    user: string;
  } | null>(null);
  const [hideModal, setHideModal] = useState<{
    id: string;
    user: string;
  } | null>(null);
  const [hideReason, setHideReason] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };
  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4500);
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminReviews({
        visibility: visibilityFilter !== "ALL" ? visibilityFilter : undefined,
        q: search || undefined,
      });
      setReviews(res.reviews || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [visibilityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadReviews();
  };

  const handleToggleVisibility = async (review: UEReview, reason?: string) => {
    try {
      const res = await api.toggleAdminReviewVisibility(review.id, reason);
      showSuccess(
        res.isVisible
          ? "Avis réaffiché publiquement."
          : "Avis masqué avec succès.",
      );
      setHideModal(null);
      setHideReason("");
      await loadReviews();
    } catch (err: any) {
      showError(err.message || "Erreur lors de la modification.");
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await api.deleteAdminReview(reviewId);
      showSuccess("Avis supprimé définitivement.");
      setDeleteConfirm(null);
      await loadReviews();
    } catch (err: any) {
      showError(err.message || "Erreur de suppression.");
    }
  };

  const StarRating = ({
    value,
    size = "sm",
  }: {
    value: number;
    size?: "sm" | "md";
  }) => {
    const sizeClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`${sizeClass} ${
              s <= value
                ? "fill-amber-400 text-amber-400"
                : "text-[#E9EDEF] dark:text-[#222E35]"
            }`}
          />
        ))}
      </div>
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#25D366]" />
            Modération des Avis
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Gérez les avis des étudiants sur les UE : masquez les contenus
            inappropriés ou supprimez-les.
          </p>
        </div>

        <button
          onClick={loadReviews}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#075E54] dark:text-[#25D366] bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-[#E9EDEF] dark:hover:bg-[#222E35] rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      {/* Alerts */}
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

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, code UE ou contenu de l'avis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white focus:border-[#25D366] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-2.5 top-3" />
        </form>

        <div className="flex items-center gap-1 bg-white dark:bg-[#111B21] p-1 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-[#667781] dark:text-[#8696A0] ml-1 shrink-0" />
          {[
            { value: "ALL", label: "Tous" },
            { value: "visible", label: "Visibles" },
            { value: "hidden", label: "Masqués" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVisibilityFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                visibilityFilter === opt.value
                  ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]"
                  : "text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compteur */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#667781] dark:text-[#8696A0]">
          <strong className="text-[#111B21] dark:text-white">{total}</strong>{" "}
          avis trouvé{total > 1 ? "s" : ""}
        </span>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111B21] rounded-2xl border border-dashed border-[#E9EDEF] dark:border-[#222E35] space-y-3">
          <MessageSquare className="w-10 h-10 text-[#667781] mx-auto opacity-50" />
          <p className="text-sm font-medium text-[#111B21] dark:text-white">
            Aucun avis trouvé
          </p>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Les avis des étudiants apparaîtront ici dès qu'ils en publieront.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`p-4 rounded-2xl border shadow-xs space-y-3 transition-colors ${
                review.is_visible
                  ? "bg-white dark:bg-[#111B21] border-[#E9EDEF] dark:border-[#222E35]"
                  : "bg-[#F0F2F5]/60 dark:bg-[#1F2C34]/40 border-dashed border-gray-300 dark:border-gray-700 opacity-70"
              }`}
            >
              {/* En-tête */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold text-sm shrink-0">
                    {review.userName?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-[#111B21] dark:text-white">
                        {review.userName}
                      </p>
                      <StarRating value={review.rating} />
                      {!review.is_visible && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <EyeOff className="w-2.5 h-2.5" />
                          Masqué
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#667781] dark:text-[#8696A0] font-mono mt-0.5">
                      {review.userPhone} · {review.userLevel} ·{" "}
                      {review.userDepartment}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {review.is_visible ? (
                    <button
                      onClick={() =>
                        setHideModal({ id: review.id, user: review.userName })
                      }
                      title="Masquer cet avis"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg transition-colors"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      Masquer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleVisibility(review)}
                      title="Réafficher cet avis"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Réafficher
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setDeleteConfirm({ id: review.id, user: review.userName })
                    }
                    title="Supprimer définitivement"
                    className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Contexte UE */}
              <div className="flex items-center gap-2 text-[11px] text-[#667781] dark:text-[#8696A0] pb-2 border-b border-[#E9EDEF] dark:border-[#222E35]">
                <BookOpen className="w-3 h-3 text-[#25D366]" />
                <span className="font-semibold text-[#075E54] dark:text-[#25D366]">
                  {review.ueCode}
                </span>
                <span>·</span>
                <span className="truncate">{review.ueTitle}</span>
              </div>

              {/* Contenu */}
              {review.comment ? (
                <p className="text-xs text-[#111B21] dark:text-[#E9EDEF] leading-relaxed whitespace-pre-line">
                  {review.comment}
                </p>
              ) : (
                <p className="text-xs text-[#667781] dark:text-[#8696A0] italic">
                  (Aucun commentaire, note seule)
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
                <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                  Publié le {formatDate(review.createdAt)}
                </span>
                {review.updated_at !== review.created_at && (
                  <span className="text-[10px] text-[#667781] dark:text-[#8696A0] italic">
                    Modifié
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal : masquer avec motif */}
      {hideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                  Masquer cet avis ?
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                  L'avis de <strong>{hideModal.user}</strong> ne sera plus
                  visible publiquement. Vous pourrez le réafficher à tout
                  moment.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111B21] dark:text-white mb-1.5">
                Motif (optionnel, pour traçabilité interne)
              </label>
              <input
                type="text"
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                placeholder="Ex : Contenu inapproprié, spam, hors-sujet..."
                className="w-full p-2.5 text-xs rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white focus:outline-none focus:border-[#25D366]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <button
                onClick={() => {
                  setHideModal(null);
                  setHideReason("");
                }}
                className="px-4 py-2 text-xs font-semibold text-[#667781]"
              >
                Annuler
              </button>
              <button
                onClick={() =>
                  handleToggleVisibility(
                    reviews.find((r) => r.id === hideModal.id)!,
                    hideReason,
                  )
                }
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
              >
                Masquer l'avis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal : confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                  Supprimer définitivement ?
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                  L'avis de <strong>{deleteConfirm.user}</strong> sera
                  définitivement supprimé. Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-[#667781]"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
