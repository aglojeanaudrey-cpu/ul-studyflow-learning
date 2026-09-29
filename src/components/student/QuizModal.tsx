import React, { useState } from 'react';
import { Quiz, QuizAttempt, QuizCorrection } from '../../types';
import { api } from '../../lib/api';
import { X, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  quiz: Quiz;
  onClose: () => void;
  onSuccess: (attempt: QuizAttempt) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  quiz,
  onClose,
  onSuccess
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    attempt: QuizAttempt;
    corrections: QuizCorrection[];
    passingScorePercent: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleSelectOption = (questionId: string, optionIndex: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.submitQuiz(quiz.id, answers);
      setResult(res);
      onSuccess(res.attempt);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la soumission du quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1.5 rounded-lg hover:bg-[#F0F2F5]"
        >
          <X className="w-5 h-5" />
        </button>

        {result ? (
          /* Écran de Correction Détaillée (Section 35) */
          <div className="space-y-6">
            <div className="text-center space-y-2 pb-4 border-b border-[#E9EDEF]">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                  result.attempt.passed ? 'bg-emerald-100 text-[#075E54]' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {result.attempt.passed ? (
                  <Award className="w-8 h-8 text-[#25D366]" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                )}
              </div>

              <h2 className="text-xl font-extrabold text-[#111B21]">
                {result.attempt.passed ? 'Félicitations ! Questionnaire Réussi' : 'À retravailler pour progresser'}
              </h2>

              <p className="text-sm font-bold text-[#075E54] tabular-nums">
                Score obtenu : {result.attempt.score} / {result.attempt.maxScore} ({result.attempt.percentage}%)
              </p>
              <p className="text-xs text-[#667781]">
                Seuil de réussite exigé : {result.passingScorePercent}%
              </p>
            </div>

            {/* Questions Corrections Pas à Pas */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#111B21]">
                Correction détaillée question par question :
              </h3>

              {result.corrections.map((corr, idx) => (
                <div
                  key={corr.questionId}
                  className={`p-4 rounded-xl border space-y-2 text-xs ${
                    corr.isCorrect
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-rose-50/70 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-[#111B21]">
                      Question {idx + 1} : {corr.questionText}
                    </p>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] shrink-0 ${
                        corr.isCorrect
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-rose-200 text-rose-800'
                      }`}
                    >
                      {corr.earnedPoints} / {corr.points} pts
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className={corr.isCorrect ? 'text-emerald-800 font-medium' : 'text-rose-800 font-medium'}>
                      Votre réponse : {String(corr.userAnswer !== undefined ? corr.userAnswer : 'Non répondue')}
                    </p>
                    {!corr.isCorrect && (
                      <p className="text-emerald-800 font-medium">
                        Bonne réponse attendue : {String(corr.correctAnswer)}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-black/5 text-slate-700 italic">
                    <strong>Explication pédagogique :</strong> {corr.explanation}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E9EDEF]">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#667781] hover:text-[#111B21] bg-[#F0F2F5] rounded-xl hover:bg-[#E9EDEF]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Recommencer le test
              </button>

              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shadow-sm"
              >
                Fermer et continuer
              </button>
            </div>
          </div>
        ) : (
          /* Formulaire de Test Actif */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#111B21]">
                {quiz.title}
              </h2>
              <p className="text-xs text-[#667781] mt-1">
                {quiz.description} Répondez à toutes les questions avant de valider.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {quiz.questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#075E54]">
                      Question {idx + 1}
                    </span>
                    <span className="text-[11px] text-[#667781]">
                      {q.points} points
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[#111B21]">
                    {q.text}
                  </p>

                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === String(optIdx);
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, String(optIdx))}
                          className={`w-full p-3 rounded-lg text-left text-xs font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50 border-2 border-[#25D366] text-[#075E54] font-bold shadow-xs'
                              : 'bg-white border border-[#E9EDEF] text-slate-800 hover:bg-[#F0F2F5]'
                          }`}
                        >
                          <span>{opt}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                              isSelected
                                ? 'border-[#25D366] bg-[#25D366] text-[#075E54]'
                                : 'border-[#E9EDEF]'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9EDEF]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#667781] hover:text-[#111B21]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Correction en cours...' : 'Valider mes réponses'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
