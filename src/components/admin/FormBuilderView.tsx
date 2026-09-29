import React, { useState, useEffect } from 'react';
import { DynamicForm, FormField, FormSubmission } from '../../types';
import { api } from '../../lib/api';
import {
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Eye,
  X,
  Edit2,
  Download,
  Palette,
  Smile,
  CheckSquare,
  AlertCircle
} from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Vert UL', hex: '#075E54' },
  { name: 'Émeraude Vif', hex: '#25D366' },
  { name: 'Bleu Royal', hex: '#2563EB' },
  { name: 'Violet Sombre', hex: '#7C3AED' },
  { name: 'Ambre Chaud', hex: '#D97706' },
  { name: 'Rose / Rouge', hex: '#E11D48' },
  { name: 'Ardoise / Indigo', hex: '#475569' }
];

export const FormBuilderView: React.FC = () => {
  const [forms, setForms] = useState<DynamicForm[]>([]);
  const [loading, setLoading] = useState(true);

  // Submissions Modal State
  const [selectedFormForSubmissions, setSelectedFormForSubmissions] = useState<DynamicForm | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Creator / Editor State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#075E54');
  const [fields, setFields] = useState<FormField[]>([]);

  // Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4500);
  };

  const loadForms = async () => {
    try {
      const res = await api.getForms();
      setForms(res.forms);
    } catch (err) {
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const openCreateModal = () => {
    setEditingFormId(null);
    setTitle('');
    setDescription('');
    setThemeColor('#075E54');
    setFields([
      { id: 'f_1', label: 'Nom complet de l\'étudiant', type: 'text', required: true, order: 1 },
      { id: 'f_2', label: 'Numéro WhatsApp (+228)', type: 'phone', required: true, order: 2 },
      {
        id: 'f_3',
        label: 'Matières souhaitées',
        type: 'options',
        required: false,
        options: ['ANG 101 (Anglais)', 'ECO 102 (Macroéconomie)', 'MTH 101 (Mathématiques)'],
        order: 3
      },
      {
        id: 'f_4',
        label: 'Votre niveau de satisfaction / Réaction',
        type: 'emoji_rating',
        required: false,
        options: ['😡', '🙁', '😐', '😊', '🤩'],
        order: 4
      }
    ]);
    setModalOpen(true);
  };

  const openEditModal = (form: DynamicForm) => {
    setEditingFormId(form.id);
    setTitle(form.title);
    setDescription(form.description);
    setThemeColor(form.themeColor || '#075E54');
    setFields(form.fields || []);
    setModalOpen(true);
  };

  const handleAddField = (type: FormField['type'] = 'text') => {
    let defaultOptions: string[] | undefined = undefined;
    if (type === 'options') {
      defaultOptions = ['Option 1', 'Option 2', 'Option 3'];
    } else if (type === 'emoji_rating') {
      defaultOptions = ['😡', '🙁', '😐', '😊', '🤩'];
    } else if (type === 'select') {
      defaultOptions = ['Choix 1', 'Choix 2'];
    }

    const newField: FormField = {
      id: 'f_' + Date.now(),
      label: type === 'options' 
        ? 'Sélectionnez vos options' 
        : type === 'emoji_rating' 
        ? 'Votre réaction' 
        : 'Nouveau champ',
      type,
      required: false,
      options: defaultOptions,
      order: fields.length + 1
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleFieldChange = (id: string, key: keyof FormField, val: any) => {
    setFields(fields.map(f => (f.id === id ? { ...f, [key]: val } : f)));
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFormId) {
        await api.updateForm(editingFormId, {
          title,
          description,
          themeColor,
          fields
        });
        showSuccess(`Formulaire "${title}" mis à jour avec succès.`);
      } else {
        await api.createForm({
          title,
          description,
          themeColor,
          fields
        });
        showSuccess(`Formulaire "${title}" créé avec succès.`);
      }
      setModalOpen(false);
      await loadForms();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de l\'enregistrement du formulaire.');
    }
  };

  const handleDeleteForm = async (id: string) => {
    try {
      await api.deleteForm(id);
      showSuccess('Formulaire et ses soumissions supprimés.');
      setDeleteConfirm(null);
      await loadForms();
    } catch (err: any) {
      showError(err.message || 'Erreur de suppression.');
    }
  };

  const handleViewSubmissions = async (form: DynamicForm) => {
    setSelectedFormForSubmissions(form);
    setSubmissionsLoading(true);
    try {
      const res = await api.getFormSubmissions(form.id);
      setSubmissions(res.submissions);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleExportCsv = (formId: string) => {
    window.location.href = api.getFormExportUrl(formId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21]">Form Builder Dynamique</h2>
          <p className="text-xs text-[#667781]">
            Création, modification, suppression et export CSV de formulaires personnalisés avec sélection d'options et réactions emojis.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Nouveau Formulaire
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map((form) => {
          const formColor = form.themeColor || '#075E54';

          return (
            <div
              key={form.id}
              className="p-5 bg-white rounded-2xl border border-[#E9EDEF] shadow-xs space-y-4 hover:border-[#25D366] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                      style={{ backgroundColor: formColor }}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#111B21] truncate">{form.title}</h3>
                      <p className="text-[11px] text-[#667781] mt-0.5 line-clamp-1">{form.description}</p>
                    </div>
                  </div>

                  <span className="text-[10px] bg-emerald-50 text-[#075E54] font-bold px-2 py-0.5 rounded shrink-0">
                    Actif
                  </span>
                </div>

                <div className="text-xs text-[#667781] mt-3 space-y-1">
                  <p>Nombre de champs : <strong>{form.fields.length}</strong></p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px]">Couleur :</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block border border-black/10"
                      style={{ backgroundColor: formColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#E9EDEF] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(form)}
                    title="Modifier le formulaire"
                    className="p-1.5 rounded-lg text-[#075E54] hover:bg-emerald-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExportCsv(form.id)}
                    title="Exporter les données en CSV"
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: form.id, title: form.title })}
                    title="Supprimer le formulaire"
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleViewSubmissions(form)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#075E54] bg-[#F0F2F5] hover:bg-[#E9EDEF] rounded-xl transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Voir les soumissions
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-bold text-lg text-[#111B21]">
                {editingFormId ? 'Modifier le Formulaire' : 'Nouveau Formulaire Dynamique'}
              </h3>
              <p className="text-xs text-[#667781]">
                Personnalisez le titre, la couleur du thème, et ajoutez des champs classiques, d'options ou des réactions emojis.
              </p>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Titre du formulaire *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Inscription aux Séances de Tutorat en Ligne"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Consignes</label>
                <textarea
                  rows={2}
                  placeholder="Instructions pour les étudiants..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                />
              </div>

              {/* Theme Color Selector */}
              <div className="p-3 bg-[#F0F2F5] rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-[#111B21]">
                  <Palette className="w-4 h-4 text-[#075E54]" />
                  <span>Couleur du thème du formulaire</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setThemeColor(c.hex)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                        themeColor === c.hex
                          ? 'border-black bg-white shadow-xs font-bold'
                          : 'border-transparent bg-white/70 hover:bg-white'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-[10px] text-[#667781]">Code Hex :</span>
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-20 p-1 text-[11px] rounded border border-[#E9EDEF] bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Fields Builder */}
              <div className="space-y-3 pt-2 border-t border-[#E9EDEF]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold uppercase tracking-wider text-[#667781]">
                    Champs configurés ({fields.length})
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddField('text')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075E54] bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100"
                    >
                      <Plus className="w-3 h-3" /> Texte
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddField('options')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100"
                      title="Champ pour la sélection d'un ou plusieurs éléments"
                    >
                      <CheckSquare className="w-3 h-3" /> Champ d'Options
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddField('emoji_rating')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg hover:bg-amber-100"
                      title="Champ de réaction basé sur les emojis"
                    >
                      <Smile className="w-3 h-3" /> Réaction Emoji
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {fields.map((f) => (
                    <div key={f.id} className="p-3 bg-[#F0F2F5] rounded-xl space-y-2 border border-[#E9EDEF]">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={f.label}
                          placeholder="Intitulé du champ..."
                          onChange={(e) => handleFieldChange(f.id, 'label', e.target.value)}
                          className="flex-1 p-2 rounded-lg bg-white border border-[#E9EDEF] font-semibold"
                        />
                        <select
                          value={f.type}
                          onChange={(e) => handleFieldChange(f.id, 'type', e.target.value)}
                          className="p-2 rounded-lg bg-white border border-[#E9EDEF] font-medium"
                        >
                          <option value="text">Texte court</option>
                          <option value="textarea">Texte long</option>
                          <option value="number">Nombre</option>
                          <option value="phone">Téléphone</option>
                          <option value="email">Email</option>
                          <option value="select">Liste déroulante</option>
                          <option value="options">☑ Champ d'Options (Choix multiple)</option>
                          <option value="emoji_rating">😍 Champ Réaction Emoji</option>
                        </select>
                        <label className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={f.required}
                            onChange={(e) => handleFieldChange(f.id, 'required', e.target.checked)}
                            className="w-3.5 h-3.5 text-[#25D366] rounded"
                          />
                          Obligatoire
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(f.id)}
                          className="text-rose-600 hover:text-rose-800 p-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* If type is options or select or emoji_rating, allow editing choices */}
                      {(f.type === 'options' || f.type === 'select' || f.type === 'emoji_rating') && (
                        <div className="pl-2 pt-1 border-t border-[#E9EDEF]">
                          <label className="block text-[10px] font-bold text-[#667781] mb-1">
                            {f.type === 'emoji_rating'
                              ? 'Emojis de réaction (séparés par une virgule ou espace) :'
                              : 'Options de sélection (séparées par une virgule) :'}
                          </label>
                          <input
                            type="text"
                            value={(f.options || []).join(', ')}
                            onChange={(e) =>
                              handleFieldChange(
                                f.id,
                                'options',
                                e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              )
                            }
                            placeholder={f.type === 'emoji_rating' ? '😡, 🙁, 😐, 😊, 🤩' : 'Option 1, Option 2, Option 3'}
                            className="w-full p-1.5 rounded-lg bg-white border border-[#E9EDEF] text-xs font-mono"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E9EDEF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#667781]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shadow-xs"
                >
                  {editingFormId ? 'Enregistrer les modifications' : 'Publier le formulaire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SUBMISSIONS MODAL */}
      {selectedFormForSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedFormForSubmissions(null)}
              className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-lg text-[#111B21]">
                  Soumissions : {selectedFormForSubmissions.title}
                </h3>
                <p className="text-xs text-[#667781]">
                  {submissions.length} réponse(s) enregistrée(s).
                </p>
              </div>

              <button
                onClick={() => handleExportCsv(selectedFormForSubmissions.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#075E54] rounded-xl hover:bg-[#064e46] transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Exporter en CSV
              </button>
            </div>

            {submissionsLoading ? (
              <div className="py-12 text-center text-xs text-[#667781]">
                Chargement des réponses...
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center bg-[#F0F2F5] rounded-xl text-xs text-[#667781]">
                Aucune réponse reçue pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#E9EDEF] rounded-xl">
                <table className="w-full text-left text-xs divide-y divide-[#E9EDEF]">
                  <thead className="bg-[#F0F2F5] text-[#667781] font-semibold">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Étudiant</th>
                      <th className="p-3">Téléphone</th>
                      {selectedFormForSubmissions.fields.map(f => (
                        <th key={f.id} className="p-3">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EDEF]">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#F0F2F5]/50">
                        <td className="p-3 text-[11px] text-[#667781] whitespace-nowrap">
                          {new Date(sub.submittedAt).toLocaleDateString('fr-FR')} {new Date(sub.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3 font-bold text-[#111B21] whitespace-nowrap">
                          {sub.userName}
                        </td>
                        <td className="p-3 text-[#667781] font-mono whitespace-nowrap">
                          {sub.userPhone}
                        </td>
                        {selectedFormForSubmissions.fields.map(f => {
                          const val = sub.data?.[f.id];
                          const displayVal = Array.isArray(val) ? val.join(', ') : val !== undefined ? String(val) : '-';
                          return (
                            <td key={f.id} className="p-3 text-[#111B21]">
                              {displayVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE FORM CONFIRMATION */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#E9EDEF] space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#111B21]">Supprimer ce formulaire</h3>
              <p className="text-xs text-[#667781] mt-1 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le formulaire <strong>"{deleteConfirm.title}"</strong> et toutes ses réponses associées ?
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-[#667781]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDeleteForm(deleteConfirm.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
