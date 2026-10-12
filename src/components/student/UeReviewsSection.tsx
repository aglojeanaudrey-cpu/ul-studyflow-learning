import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { UEReview, UEReviewsResponse } from "../../types";
import {
  Star,
  MessageSquare,
  Trash2,
  Send,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface UeReviewsSectionProps {
  ueId: string;
  ueCode: string;
  ueTitle: string;
  /** Est-ce que l'étudiant a complété 100% de l'UE ? (calculé côté parent) */
  canReviewByCompletion?: boolean;
}

const StarRating: React.FC<{
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}> = ({ value, onChange, readOnly = false, size = "md" }) => {
  const [hovered, setHovered] = useState(0);
  const sizeClass =
    size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-7 h-7" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onClick={() => !readOnly && onChange?.(star)}
            className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
          >
            <Star
              className={`${sizeClass} ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-[#E9EDEF] dark:text-[#222E35]"
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const UeReviewsSection: React.FC<UeReviewsSectionProps> = ({
  ueId,
  ueCode,
  ueTitle,
  canReviewByCompletion,
}) => {
  const [data, setData] = useState<UEReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.getUeReviews(ueId);
      setData(res);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [ueId]);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.submitUeReview(ueId, rating, comment.trim());
      setSuccess(
        res.isNew ? "Merci pour votre avis !" : "Votre avis a été mis à jour.",
      );
      setTimeout(() => setSuccess(null), 3500);
      setFormOpen(false);
      setComment("");
      setRating(5);
      await loadReviews();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi de l'avis.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await api.deleteMyUeReview(reviewId);
      setDeleteConfirmId(null);
      setSuccess("Avis supprimé.");
      setTimeout(() => setSuccess(null), 3000);
      await loadReviews();
    } catch (err: any) {
      setError(err.message || "Erreur de suppression.");
    }
  };

  const openEditForm = () => {
    if (data?.myReviewId) {
      const myReview = data.reviews.find((r) => r.id === data.myReviewId);
      if (myReview) {
        setRating(myReview.rating);
        setComment(myReview.comment);
      }
    }
    setFormOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 space-y-3">
        <div className="h-5 w-32 bg-[#E9EDEF] dark:bg-[#222E35] rounded animate-pulse"></div>
        <div className="h-3 w-48 bg-[#E9EDEF] dark:bg-[#222E35] rounded animate-pulse"></div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, reviews, canReview, hasReviewed } = data;
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-[#111B21] dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#25D366]" />
            Avis des étudiants
          </h3>
          {stats.totalReviews > 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={stats.averageRating || 0} readOnly size="sm" />
              <span className="text-sm font-bold text-[#111B21] dark:text-white">
                {stats.averageRating?.toFixed(1)}
              </span>
              <span className="text-xs text-[#667781] dark:text-[#8696A0]">
                · {stats.totalReviews} avis
              </span>
            </div>
          ) : (
            <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
              Aucun avis pour le moment.
            </p>
          )}
        </div>

        {/* Bouton d'action */}
        {canReview && !formOpen && (
          <button
            onClick={hasReviewed ? openEditForm : () => setFormOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shrink-0"
          >
            {hasReviewed ? (
              <>
                <Edit2 className="w-3.5 h-3.5" />
                Modifier mon avis
              </>
            ) : (
              <>
                <Star className="w-3.5 h-3.5" />
                Laisser un avis
              </>
            )}
          </button>
        )}
      </div>

      {/* Info : pas encore éligible */}
      {!canReview && !hasReviewed && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Terminez toutes les séances de cette UE pour pouvoir laisser un
            avis.
          </span>
        </div>
      )}

      {/* Messages */}
      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-[11px] text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Formulaire d'avis */}
      {formOpen && (
        <div className="p-4 bg-[#F0F2F5] dark:bg-[#1F2C34] rounded-xl space-y-3 border border-[#E9EDEF] dark:border-[#222E35]">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-[#111B21] dark:text-white">
              {hasReviewed
                ? "Modifier mon avis"
                : "Laisser un avis sur cette UE"}
            </h4>
            <button
              onClick={() => setFormOpen(false)}
              className="p-1 rounded text-[#667781] hover:bg-white dark:hover:bg-[#2A3942]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#111B21] dark:text-white mb-1.5">
              Votre note *
            </label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#111B21] dark:text-white mb-1.5">
              Votre commentaire (optionnel)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience sur cette UE : contenu, qualité pédagogique, utilité..."
              maxLength={2000}
              className="w-full p-2.5 text-xs rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white focus:outline-none focus:border-[#25D366] resize-none"
            />
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-1 text-right">
              {comment.length}/2000
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setFormOpen(false)}
              disabled={submitting}
              className="px-3 py-2 text-xs font-semibold text-[#667781] hover:text-[#111B21] dark:hover:text-white"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || rating < 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting
                ? "Envoi..."
                : hasReviewed
                  ? "Mettre à jour"
                  : "Publier mon avis"}
            </button>
          </div>
        </div>
      )}

      {/* Liste des avis */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {displayedReviews.map((review) => {
            const isMine = data.myReviewId === review.id;
            return (
              <div
                key={review.id}
                className={`p-3.5 rounded-xl border transition-colors ${
                  isMine
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                    : "bg-[#FAFAFA] dark:bg-[#0B141A]/50 border-[#E9EDEF] dark:border-[#222E35]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold text-xs shrink-0">
                      {review.userName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[#111B21] dark:text-white truncate">
                        {review.userName}
                        {isMine && (
                          <span className="ml-1.5 text-[9px] font-bold text-[#25D366]">
                            (Vous)
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                        {review.userLevel} · {review.userDepartment}
                      </p>
                    </div>
                  </div>
                  <StarRating value={review.rating} readOnly size="sm" />
                </div>

                {review.comment && (
                  <p className="text-xs text-[#111B21] dark:text-[#E9EDEF] leading-relaxed whitespace-pre-line">
                    {review.comment}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
                  <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                    {formatDate(review.createdAt)}
                  </span>

                  {isMine && (
                    <button
                      onClick={() => setDeleteConfirmId(review.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {reviews.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-center py-2 text-xs font-semibold text-[#075E54] dark:text-[#25D366] hover:underline flex items-center justify-center gap-1"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Voir moins d'avis
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Voir tous les avis ({reviews.length})
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                  Supprimer mon avis ?
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                  Votre avis sera définitivement supprimé. Vous pourrez en
                  publier un nouveau à tout moment.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-2 text-xs font-semibold text-[#667781]"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
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
