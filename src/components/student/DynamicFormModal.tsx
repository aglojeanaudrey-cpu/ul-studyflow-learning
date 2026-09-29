import React, { useState } from 'react';
import { DynamicForm } from '../../types';
import { api } from '../../lib/api';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface DynamicFormModalProps {
  isOpen: boolean;
  form: DynamicForm;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_EMOJIS = ['😡', '🙁', '😐', '😊', '🤩'];

export const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
  isOpen,
  form,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const themeColor = form.themeColor || '#075E54';

  const handleChange = (fieldId: string, val: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleToggleOption = (fieldId: string, option: string) => {
    const current = (formData[fieldId] as string[]) || [];
    if (current.includes(option)) {
      setFormData(prev => ({ ...prev, [fieldId]: current.filter(o => o !== option) }));
    } else {
      setFormData(prev => ({ ...prev, [fieldId]: [...current, option] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.submitForm(form.id, formData);
      setSubmitted(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E9EDEF] my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1.5 rounded-lg hover:bg-[#F0F2F5]"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
            >
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#111B21]">Formulaire envoyé avec succès !</h3>
            <p className="text-xs text-[#667781]">
              Votre réponse a été enregistrée auprès de l'équipe de coordination UL Study Flow.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs"
              style={{ backgroundColor: themeColor }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-l-4 pl-3" style={{ borderColor: themeColor }}>
              <h3 className="font-bold text-lg text-[#111B21]">{form.title}</h3>
              <p className="text-xs text-[#667781] mt-0.5">{form.description}</p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <div className="space-y-4 pt-2">
              {form.fields.sort((a, b) => a.order - b.order).map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-xs font-semibold text-[#111B21]">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>

                  {/* 1. TEXTAREA */}
                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      rows={3}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white focus:outline-none"
                    />
                  ) : field.type === 'select' ? (
                    /* 2. SELECT */
                    <select
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white focus:outline-none"
                    >
                      <option value="">Sélectionnez une option</option>
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'options' ? (
                    /* 3. MULTI-SELECT OPTIONS (SELECTION D'UN OU PLUSIEURS ELEMENTS) */
                    <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF] space-y-2">
                      <p className="text-[10px] text-[#667781]">Sélectionnez une ou plusieurs options :</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(field.options && field.options.length > 0 ? field.options : ['Option 1', 'Option 2', 'Option 3']).map((opt, i) => {
                          const isChecked = Array.isArray(formData[field.id]) && formData[field.id].includes(opt);
                          return (
                            <label
                              key={i}
                              onClick={() => handleToggleOption(field.id, opt)}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors border ${
                                isChecked
                                  ? 'bg-white border-emerald-500 font-semibold text-[#075E54]'
                                  : 'bg-white/60 border-transparent hover:bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // handled by parent label click
                                className="w-4 h-4 text-[#25D366] rounded pointer-events-none"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : field.type === 'emoji_rating' ? (
                    /* 4. REACTION BASEE SUR LES EMOJIS */
                    <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF] space-y-2">
                      <p className="text-[10px] text-[#667781]">Cliquez sur un emoji pour réagir :</p>
                      <div className="flex items-center justify-around gap-2 pt-1">
                        {(field.options && field.options.length > 0 ? field.options : DEFAULT_EMOJIS).map((emoji, i) => {
                          const isSelected = formData[field.id] === emoji;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleChange(field.id, emoji)}
                              className={`w-11 h-11 text-2xl rounded-2xl flex items-center justify-center transition-transform hover:scale-115 active:scale-95 ${
                                isSelected
                                  ? 'bg-white shadow-md border-2 border-emerald-500 scale-110'
                                  : 'bg-white/60 hover:bg-white'
                              }`}
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </div>
                      {formData[field.id] && (
                        <p className="text-center text-[11px] font-bold text-[#075E54] pt-1">
                          Réaction sélectionnée : {formData[field.id]}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* 5. STANDARD INPUTS (text, number, phone, email) */
                    <input
                      type={field.type === 'number' ? 'number' : field.type === 'phone' ? 'tel' : 'text'}
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E9EDEF]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#667781]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Envoi...' : 'Soumettre le formulaire'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
