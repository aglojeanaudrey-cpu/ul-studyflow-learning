import React, { useState, useEffect } from 'react';
import { Department, Program, AcademicYear } from '../../types';
import { api } from '../../lib/api';
import {
  School,
  Calendar,
  Layers,
  Archive,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  X,
  BookOpen
} from 'lucide-react';

export const AcademicStructureView: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Department Modal State
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    faculty: 'Campus de Lomé (Togo)',
    description: '',
    isSuspended: false
  });

  // Program Modal State
  const [progModalOpen, setProgModalOpen] = useState(false);
  const [editingProgId, setEditingProgId] = useState<string | null>(null);
  const [progForm, setProgForm] = useState({
    departmentId: '',
    code: '',
    name: '',
    description: '',
    isSuspended: false
  });

  // Academic Year Modal State
  const [ayModalOpen, setAyModalOpen] = useState(false);
  const [ayForm, setAyForm] = useState({
    label: '',
    isCurrent: false
  });

  // Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'dept' | 'prog' | 'ay';
    id: string;
    name: string;
  } | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4500);
  };

  const loadData = async () => {
    try {
      const res = await api.getAcademicMeta();
      setDepartments(res.departments);
      setPrograms(res.programs);
      setAcademicYears(res.academicYears);
    } catch (err) {
      console.error('Error loading academic structure:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Department Handlers
  const openCreateDeptModal = () => {
    setEditingDeptId(null);
    setDeptForm({
      code: '',
      name: '',
      faculty: 'Campus de Lomé (Togo)',
      description: '',
      isSuspended: false
    });
    setDeptModalOpen(true);
  };

  const openEditDeptModal = (d: Department) => {
    setEditingDeptId(d.id);
    setDeptForm({
      code: d.code,
      name: d.name,
      faculty: d.faculty || 'Campus de Lomé (Togo)',
      description: d.description || '',
      isSuspended: Boolean(d.isSuspended)
    });
    setDeptModalOpen(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveDepartment({ ...deptForm, id: editingDeptId || undefined });
      setDeptModalOpen(false);
      showSuccess(editingDeptId ? `Département ${deptForm.code} mis à jour.` : `Département ${deptForm.code} ajouté.`);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de l\'enregistrement du département.');
    }
  };

  const handleToggleSuspendDept = async (d: Department) => {
    try {
      const res = await api.toggleSuspendDepartment(d.id);
      showSuccess(`Département ${d.code} ${res.isSuspended ? 'suspendu' : 'réactivé'}.`);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors du changement de statut.');
    }
  };

  const handleDeleteDept = async (id: string) => {
    try {
      await api.deleteDepartment(id);
      showSuccess('Département et filières associées supprimés.');
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur de suppression.');
    }
  };

  // Program Handlers
  const openCreateProgModal = (deptId?: string) => {
    setEditingProgId(null);
    setProgForm({
      departmentId: deptId || departments[0]?.id || '',
      code: '',
      name: '',
      description: '',
      isSuspended: false
    });
    setProgModalOpen(true);
  };

  const openEditProgModal = (p: Program) => {
    setEditingProgId(p.id);
    setProgForm({
      departmentId: p.departmentId,
      code: p.code,
      name: p.name,
      description: p.description || '',
      isSuspended: Boolean(p.isSuspended)
    });
    setProgModalOpen(true);
  };

  const handleSaveProg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveProgram({ ...progForm, id: editingProgId || undefined });
      setProgModalOpen(false);
      showSuccess(editingProgId ? `Filière ${progForm.name} mise à jour.` : `Filière ${progForm.name} ajoutée.`);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de l\'enregistrement de la filière.');
    }
  };

  const handleToggleSuspendProg = async (p: Program) => {
    try {
      const res = await api.toggleSuspendProgram(p.id);
      showSuccess(`Filière ${p.code} ${res.isSuspended ? 'suspendue' : 'réactivée'}.`);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur de changement de statut.');
    }
  };

  const handleDeleteProg = async (id: string) => {
    try {
      await api.deleteProgram(id);
      showSuccess('Filière supprimée avec succès.');
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur de suppression.');
    }
  };

  // Academic Year Handlers
  const handleSaveAy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveAcademicYear(ayForm);
      setAyModalOpen(false);
      setAyForm({ label: '', isCurrent: false });
      showSuccess(`Année académique ${ayForm.label} ajoutée.`);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur d\'ajout d\'année académique.');
    }
  };

  const handleSetCurrentAy = async (ay: AcademicYear) => {
    try {
      await api.updateAcademicYear(ay.id, { isCurrent: true });
      showSuccess(`Année ${ay.label} définie comme année académique active.`);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur.');
    }
  };

  const handleToggleArchiveAy = async (ay: AcademicYear) => {
    try {
      await api.updateAcademicYear(ay.id, { isArchived: !ay.isArchived });
      showSuccess(`Année ${ay.label} ${!ay.isArchived ? 'archivée' : 'désarchivée'}.`);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur.');
    }
  };

  const handleDeleteAy = async (id: string) => {
    try {
      await api.deleteAcademicYear(id);
      showSuccess('Année académique supprimée.');
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Impossible de supprimer cette année.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21]">Structure LMD & Années Académiques</h2>
          <p className="text-xs text-[#667781]">
            Ajout, modification, suspension et suppression des départements, filières et gestion des années universitaires.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setAyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#075E54] bg-[#F0F2F5] hover:bg-[#E9EDEF] rounded-xl transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            + Année Académique
          </button>
          <button
            onClick={openCreateDeptModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nouveau Département
          </button>
        </div>
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

      {/* SECTION 1 : ANNÉES ACADÉMIQUES */}
      <div className="bg-white rounded-2xl border border-[#E9EDEF] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#667781] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#075E54]" />
            Années Académiques LMD ({academicYears.length})
          </h3>
          <span className="text-[11px] text-[#667781]">Sélectionnez l'année en cours active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {academicYears.map((ay) => (
            <div
              key={ay.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                ay.isCurrent
                  ? 'bg-emerald-50/70 border-[#25D366] shadow-2xs'
                  : ay.isArchived
                  ? 'bg-[#F0F2F5] border-[#E9EDEF] opacity-75'
                  : 'bg-white border-[#E9EDEF]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-extrabold text-sm text-[#111B21]">{ay.label}</span>
                  <p className="text-[10px] text-[#667781] mt-0.5">
                    {ay.isCurrent ? 'Année active en cours' : ay.isArchived ? 'Année archivée' : 'Année future'}
                  </p>
                </div>
                {ay.isCurrent ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Active
                  </span>
                ) : ay.isArchived ? (
                  <span className="text-[10px] font-bold text-[#667781] bg-[#E9EDEF] px-2 py-0.5 rounded flex items-center gap-1">
                    <Archive className="w-2.5 h-2.5" /> Archivée
                  </span>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#E9EDEF]/60 text-xs">
                {!ay.isCurrent && (
                  <button
                    onClick={() => handleSetCurrentAy(ay)}
                    className="px-2 py-1 rounded bg-[#25D366] text-[#075E54] font-bold text-[11px] hover:bg-[#1faa54]"
                  >
                    Définir active
                  </button>
                )}
                {!ay.isCurrent && (
                  <button
                    onClick={() => handleToggleArchiveAy(ay)}
                    title={ay.isArchived ? 'Désarchiver' : 'Archiver'}
                    className="p-1 text-[#667781] hover:text-[#111B21] rounded"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                )}
                {!ay.isCurrent && (
                  <button
                    onClick={() => setDeleteConfirm({ type: 'ay', id: ay.id, name: `Année ${ay.label}` })}
                    title="Supprimer"
                    className="p-1 text-rose-600 hover:text-rose-800 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2 : DÉPARTEMENTS ET LEURS FILIÈRES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#667781] flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-[#075E54]" />
            Départements & Filières ({departments.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const deptPrograms = programs.filter(p => p.departmentId === dept.id);

            return (
              <div
                key={dept.id}
                className={`p-5 bg-white rounded-2xl border shadow-xs space-y-4 transition-all ${
                  dept.isSuspended ? 'border-rose-200 bg-rose-50/20' : 'border-[#E9EDEF] hover:border-[#25D366]'
                }`}
              >
                {/* Dept Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#075E54] bg-emerald-50 px-2 py-0.5 rounded border border-[#E9EDEF]">
                        {dept.code}
                      </span>
                      {dept.isSuspended && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          Suspendu
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-[#111B21] mt-1">{dept.name}</h4>
                    <p className="text-[11px] text-[#667781]">{dept.faculty}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditDeptModal(dept)}
                      title="Modifier le département"
                      className="p-1 rounded text-[#075E54] hover:bg-emerald-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleSuspendDept(dept)}
                      title={dept.isSuspended ? 'Réactiver le département' : 'Suspendre le département'}
                      className="p-1 rounded text-amber-700 hover:bg-amber-50"
                    >
                      {dept.isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'dept', id: dept.id, name: `${dept.code} - ${dept.name}` })}
                      title="Supprimer le département"
                      className="p-1 rounded text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {dept.description && (
                  <p className="text-xs text-[#667781] line-clamp-2">{dept.description}</p>
                )}

                {/* Programs under this Department */}
                <div className="pt-3 border-t border-[#E9EDEF] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111B21] flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#075E54]" />
                      Filières ({deptPrograms.length})
                    </span>
                    <button
                      onClick={() => openCreateProgModal(dept.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075E54] bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Ajouter filière
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {deptPrograms.length === 0 ? (
                      <p className="text-[11px] text-[#667781] italic">Aucune filière configurée pour ce département.</p>
                    ) : (
                      deptPrograms.map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl bg-[#F0F2F5]/70 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-[#111B21]">{p.name}</span>
                            <span className="text-[#667781] ml-1.5 font-mono text-[10px]">({p.code})</span>
                            {p.isSuspended && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1 py-0.5 rounded ml-1.5">
                                Suspendue
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditProgModal(p)}
                              title="Modifier la filière"
                              className="p-1 rounded text-[#075E54] hover:bg-white"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleToggleSuspendProg(p)}
                              title={p.isSuspended ? 'Réactiver' : 'Suspendre'}
                              className="p-1 rounded text-amber-700 hover:bg-white"
                            >
                              {p.isSuspended ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'prog', id: p.id, name: `${p.code} - ${p.name}` })}
                              title="Supprimer la filière"
                              className="p-1 rounded text-rose-600 hover:bg-white"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL AJOUT / ÉDITION DÉPARTEMENT */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#E9EDEF] space-y-4">
            <button
              onClick={() => setDeptModalOpen(false)}
              className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-[#111B21]">
              {editingDeptId ? 'Modifier le Département' : 'Ajouter un Département'}
            </h3>

            <form onSubmit={handleSaveDept} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Code Département *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: FASEG, FLLA, FDS..."
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Faculté des Lettres, Langues et Arts"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Faculté / Campus</label>
                <input
                  type="text"
                  value={deptForm.faculty}
                  onChange={(e) => setDeptForm({ ...deptForm, faculty: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#667781]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJOUT / ÉDITION FILIÈRE */}
      {progModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#E9EDEF] space-y-4">
            <button
              onClick={() => setProgModalOpen(false)}
              className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-[#111B21]">
              {editingProgId ? 'Modifier la Filière' : 'Ajouter une Filière'}
            </h3>

            <form onSubmit={handleSaveProg} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Département de rattachement *</label>
                <select
                  value={progForm.departmentId}
                  onChange={(e) => setProgForm({ ...progForm, departmentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white font-bold"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Code Filière *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ANG, ECO, GEO..."
                  value={progForm.code}
                  onChange={(e) => setProgForm({ ...progForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nom de la filière *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Études Anglophones (Anglais)"
                  value={progForm.name}
                  onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={progForm.description}
                  onChange={(e) => setProgForm({ ...progForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProgModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#667781]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJOUT ANNÉE ACADÉMIQUE */}
      {ayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-[#E9EDEF] space-y-4">
            <button
              onClick={() => setAyModalOpen(false)}
              className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-[#111B21]">Nouvelle Année Académique</h3>

            <form onSubmit={handleSaveAy} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Libellé de l'année *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 2026-2027"
                  value={ayForm.label}
                  onChange={(e) => setAyForm({ ...ayForm, label: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] bg-[#F0F2F5] focus:bg-white font-bold"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={ayForm.isCurrent}
                  onChange={(e) => setAyForm({ ...ayForm, isCurrent: e.target.checked })}
                  className="w-4 h-4 text-[#25D366] rounded"
                />
                <span className="font-semibold text-[#111B21]">Définir immédiatement comme année active</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAyModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#667781]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
                >
                  Ajouter l'année
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUPPRESSION */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#E9EDEF] space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#111B21]">Confirmer la suppression</h3>
              <p className="text-xs text-[#667781] mt-1 leading-relaxed">
                Êtes-vous certain de vouloir supprimer : <strong>{deleteConfirm.name}</strong> ?
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
                onClick={() => {
                  if (deleteConfirm.type === 'dept') handleDeleteDept(deleteConfirm.id);
                  else if (deleteConfirm.type === 'prog') handleDeleteProg(deleteConfirm.id);
                  else handleDeleteAy(deleteConfirm.id);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
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
