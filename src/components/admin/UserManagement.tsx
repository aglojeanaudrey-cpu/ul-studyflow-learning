import React, { useState, useEffect } from 'react';
import { User, UE } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Shield,
  KeyRound,
  CheckCircle,
  XCircle,
  X,
  Lock,
  Unlock,
  AlertCircle,
  UserPlus,
  Edit2,
  Trash2,
  Gift,
  Bot,
  BotOff,
  Crown,
  Sparkles,
  Check
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<UE[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Notification state
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // UE Access Modal State
  const [accessModalUser, setAccessModalUser] = useState<User | null>(null);
  const [userAccessLoading, setUserAccessLoading] = useState(false);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    department: 'FASEG',
    program: 'Économie',
    level: 'L1',
    role: 'USER' as 'USER' | 'STAFF' | 'SUPERUSER',
    password: '',
    isSponsored: false,
    isAiSuspended: false
  });

  // Edit User Modal State
  const [editModalUser, setEditModalUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    department: '',
    program: '',
    level: 'L1',
    role: 'USER' as 'USER' | 'STAFF' | 'SUPERUSER',
    isActive: true,
    isSponsored: false,
    isAiSuspended: false,
    newPassword: ''
  });

  // Delete User Confirmation State
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  const isSuperuser = currentUser?.role === 'SUPERUSER';

  const loadData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        api.getAdminUsers(),
        api.getCourses()
      ]);
      setUsers(uRes.users);
      setCourses(cRes.courses);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const showError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 4500);
  };

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminUser(createForm);
      showSuccess(`Utilisateur ${createForm.firstName} ${createForm.lastName} créé avec succès.`);
      setCreateModalOpen(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        department: 'FASEG',
        program: 'Économie',
        level: 'L1',
        role: 'USER' as 'USER' | 'STAFF' | 'SUPERUSER',
        password: '',
        isSponsored: false,
        isAiSuspended: false
      });
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la création du compte.');
    }
  };

  // Open Edit Modal
  const openEditModal = (u: User) => {
    setEditModalUser(u);
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.displayPhone || u.phone,
      email: u.email || '',
      department: u.department || 'FASEG',
      program: u.program || 'Général',
      level: u.level || 'L1',
      role: u.role,
      isActive: u.isActive,
      isSponsored: Boolean(u.isSponsored),
      isAiSuspended: Boolean(u.isAiSuspended),
      newPassword: ''
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;
    try {
      const payload: any = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        email: editForm.email,
        department: editForm.department,
        program: editForm.program,
        level: editForm.level,
        role: editForm.role,
        isActive: editForm.isActive
      };
      if (isSuperuser) {
        payload.isSponsored = editForm.isSponsored;
        payload.isAiSuspended = editForm.isAiSuspended;
      }
      if (editForm.newPassword.trim()) {
        payload.password = editForm.newPassword.trim();
      }

      await api.updateAdminUser(editModalUser.id, payload);
      showSuccess(`Compte de ${editForm.firstName} mis à jour avec succès.`);
      setEditModalUser(null);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la modification.');
    }
  };

  // Handle Delete User
  const handleDeleteSubmit = async () => {
    if (!deleteConfirmUser) return;
    try {
      await api.deleteAdminUser(deleteConfirmUser.id);
      showSuccess(`Utilisateur ${deleteConfirmUser.firstName} ${deleteConfirmUser.lastName} supprimé.`);
      setDeleteConfirmUser(null);
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Impossible de supprimer cet utilisateur.');
    }
  };

  // Quick Sponsor Toggle (SUPERUSER ONLY)
  const handleToggleSponsor = async (u: User) => {
    if (!isSuperuser) return;
    try {
      const nextVal = !u.isSponsored;
      await api.updateAdminUser(u.id, { isSponsored: nextVal });
      await loadData();
      showSuccess(nextVal 
        ? `⭐ ${u.firstName} ${u.lastName} est maintenant Sponsorisé (Accès 100% gratuit à toute la plateforme).`
        : `Accès gratuit sponsorisé révoqué pour ${u.firstName}.`
      );
    } catch (err: any) {
      showError(err.message || 'Action impossible.');
    }
  };

  // Quick AI Assistant Toggle (SUPERUSER ONLY)
  const handleToggleAiAccess = async (u: User) => {
    if (!isSuperuser) return;
    try {
      const nextVal = !u.isAiSuspended;
      await api.updateAdminUser(u.id, { isAiSuspended: nextVal });
      await loadData();
      showSuccess(nextVal
        ? `Accès à l'assistant IA suspendu pour ${u.firstName}.`
        : `Accès à l'assistant IA rétabli pour ${u.firstName}.`
      );
    } catch (err: any) {
      showError(err.message || 'Action impossible.');
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.updateAdminUser(userId, { isActive: !currentStatus });
      await loadData();
      showSuccess(`Statut utilisateur mis à jour (${!currentStatus ? 'Actif' : 'Suspendu'}).`);
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la modification du statut.');
    }
  };

  const handleToggleUeAccess = async (ueId: string, action: 'grant' | 'revoke') => {
    if (!accessModalUser) return;
    setUserAccessLoading(true);
    try {
      await api.toggleUserUeAccess(accessModalUser.id, ueId, action);
      await loadData();
      showSuccess(`Accès ${action === 'grant' ? 'attribué' : 'révoqué'} avec succès.`);
    } catch (err: any) {
      showError(err.message || "Erreur d'attribution.");
    } finally {
      setUserAccessLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.displayPhone.includes(search) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));

    let matchesRole = true;
    if (filterRole === 'SPONSORED') {
      matchesRole = Boolean(u.isSponsored);
    } else if (filterRole !== 'ALL') {
      matchesRole = u.role === filterRole;
    }

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] dark:text-white">Utilisateurs & Accès</h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Création, modification et suppression des comptes · Attribution des UE · Parrainage/Sponsoring et contrôle IA.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#25D366] text-[#075E54] hover:bg-[#1faa54] transition-all shadow-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Créer un utilisateur
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#25D366] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, téléphone (+228) ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white focus:border-[#25D366] focus:outline-none shadow-2xs"
          />
          <Search className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-2.5 top-3" />
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-[#111B21] p-1 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] overflow-x-auto">
          {['ALL', 'USER', 'STAFF', 'SUPERUSER', 'SPONSORED'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterRole === r ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] shadow-2xs' : 'text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white'
              }`}
            >
              {r === 'ALL' ? 'Tous' : r === 'SPONSORED' ? '⭐ Sponsorisés' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0] font-semibold uppercase tracking-wider border-b border-[#E9EDEF] dark:border-[#222E35]">
              <tr>
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Filière / Niveau</th>
                <th className="p-4">Rôle & Privilèges</th>
                <th className="p-4">Accès Contenu</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDEF] dark:divide-[#222E35]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#667781] dark:text-[#8696A0]">
                    Chargement des comptes...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#667781] dark:text-[#8696A0]">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isProtectedSuperuser = u.id === 'usr_super_1';
                  const canEditThisUser = isSuperuser || (currentUser?.role === 'STAFF' && u.role !== 'SUPERUSER');

                  return (
                    <tr key={u.id} className="hover:bg-[#F0F2F5]/60 dark:hover:bg-[#1F2C34]/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#111B21] dark:text-white flex items-center gap-1.5">
                          {u.firstName} {u.lastName}
                          {u.role === 'SUPERUSER' && (
                            <span title="Super-Administrateur">
                              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            </span>
                          )}
                          {u.isSponsored && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-0.5"
                              title="Compte Sponsorisé : Accès 100% gratuit au site"
                            >
                              <Gift className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                              Sponsorisé
                            </span>
                          )}
                        </div>
                        {u.email && <div className="text-[11px] text-[#667781] dark:text-[#8696A0] truncate">{u.email}</div>}
                      </td>

                      <td className="p-4 font-mono text-[#667781] dark:text-[#8696A0]">
                        {u.displayPhone}
                      </td>

                      <td className="p-4 text-[#667781] dark:text-[#8696A0]">
                        <span className="font-medium text-[#111B21] dark:text-white">{u.department}</span> · {u.level}
                        <div className="text-[10px]">{u.program}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            u.role === 'SUPERUSER'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300/40'
                              : u.role === 'STAFF'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-300/40'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] border border-emerald-300/40'
                          }`}>
                            {u.role}
                          </span>

                          {u.isAiSuspended && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                              <BotOff className="w-2.5 h-2.5" />
                              IA Suspendue
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        {u.isSponsored ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Accès Total Illimité
                          </span>
                        ) : (
                          <button
                            onClick={() => setAccessModalUser(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                          >
                            <KeyRound className="w-3 h-3 text-[#25D366]" />
                            {u.accessCount || 0} UE active(s)
                          </button>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            u.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          }`}
                        >
                          {u.isActive ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Superuser actions: Sponsoriser & IA toggle */}
                          {isSuperuser && !isProtectedSuperuser && (
                            <>
                              <button
                                onClick={() => handleToggleSponsor(u)}
                                title={u.isSponsored ? 'Révoquer le sponsoring' : 'Sponsoriser ce compte (accès gratuit illimité)'}
                                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  u.isSponsored
                                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                    : 'text-[#667781] hover:bg-amber-50 hover:text-amber-700'
                                }`}
                              >
                                <Gift className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleAiAccess(u)}
                                title={u.isAiSuspended ? 'Réactiver l\'assistance IA' : 'Suspendre/Limiter l\'assistance IA'}
                                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  u.isAiSuspended
                                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                    : 'text-[#667781] hover:bg-emerald-50 hover:text-[#075E54]'
                                }`}
                              >
                                {u.isAiSuspended ? <BotOff className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                              </button>
                            </>
                          )}

                          {/* Edit User Button */}
                          {canEditThisUser && (
                            <button
                              onClick={() => openEditModal(u)}
                              title="Modifier les informations"
                              className="p-1.5 rounded-lg text-[#075E54] hover:bg-emerald-50 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Suspend / Reactivate */}
                          {!isProtectedSuperuser && canEditThisUser && (
                            <button
                              onClick={() => handleToggleActive(u.id, u.isActive)}
                              title={u.isActive ? 'Suspendre le compte' : 'Réactiver le compte'}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                u.isActive
                                  ? 'text-amber-700 hover:bg-amber-50'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {u.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete User Button */}
                          {!isProtectedSuperuser && canEditThisUser && (
                            <button
                              onClick={() => setDeleteConfirmUser(u)}
                              title="Supprimer définitivement"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] space-y-4 my-8 max-h-[90vh] overflow-y-auto transition-colors">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#111B21] dark:text-white">Créer un compte utilisateur</h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0]">Ajout direct d'un étudiant, enseignant staff ou superuser.</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Yawo"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:outline-none focus:border-[#25D366]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mensah"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Téléphone (+228) *</label>
                  <input
                    type="text"
                    required
                    placeholder="90 12 34 56 ou +228 90..."
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:outline-none focus:border-[#25D366]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Email (Optionnel)</label>
                  <input
                    type="email"
                    placeholder="etudiant@domaine.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Faculté / Dép.</label>
                  <input
                    type="text"
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Filière</label>
                  <input
                    type="text"
                    value={createForm.program}
                    onChange={(e) => setCreateForm({ ...createForm, program: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Niveau</label>
                  <select
                    value={createForm.level}
                    onChange={(e) => setCreateForm({ ...createForm, level: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  >
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Rôle</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'USER' | 'STAFF' | 'SUPERUSER' })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] focus:bg-white dark:focus:bg-[#111B21] font-bold text-[#075E54] dark:text-[#25D366]"
                  >
                    <option value="USER">USER (Étudiant)</option>
                    <option value="STAFF">STAFF (Tuteur/Enseignant)</option>
                    {isSuperuser && <option value="SUPERUSER">SUPERUSER (Admin)</option>}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Mot de passe *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 caractères"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>

              {/* Superuser Special Options */}
              {isSuperuser && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                  <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 text-xs">
                    <Crown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    Options réservées au Superuser
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={createForm.isSponsored}
                      onChange={(e) => setCreateForm({ ...createForm, isSponsored: e.target.checked })}
                      className="w-4 h-4 text-[#25D366] rounded"
                    />
                    <span className="font-semibold text-amber-900 dark:text-amber-300">
                      Sponsoriser l'utilisateur (Donner accès gratuit à toutes les UE du site)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={createForm.isAiSuspended}
                      onChange={(e) => setCreateForm({ ...createForm, isAiSuspended: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-rose-800 dark:text-rose-300">
                      Limiter ou suspendre l'accès à l'assistance IA
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shadow-xs"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] space-y-4 my-8 max-h-[90vh] overflow-y-auto transition-colors">
            <button
              onClick={() => setEditModalUser(null)}
              className="absolute top-4 right-4 text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold">
                <Edit2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#111B21] dark:text-white">
                  Modifier le compte de {editModalUser.firstName} {editModalUser.lastName}
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0]">Édition des coordonnées, du rôle et des privilèges d'accès.</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Prénom</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Nom de famille</label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Téléphone (+228)</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Faculté / Dép.</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Filière</label>
                  <input
                    type="text"
                    value={editForm.program}
                    onChange={(e) => setEditForm({ ...editForm, program: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Niveau</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  >
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Rôle</label>
                  <select
                    value={editForm.role}
                    disabled={editModalUser.id === 'usr_super_1'}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'USER' | 'STAFF' | 'SUPERUSER' })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] focus:bg-white dark:focus:bg-[#111B21] font-bold text-[#075E54] dark:text-[#25D366]"
                  >
                    <option value="USER">USER (Étudiant)</option>
                    <option value="STAFF">STAFF (Tuteur/Enseignant)</option>
                    {isSuperuser && <option value="SUPERUSER">SUPERUSER (Admin)</option>}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">Statut du compte</label>
                  <select
                    value={editForm.isActive ? 'active' : 'suspended'}
                    disabled={editModalUser.id === 'usr_super_1'}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                    className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21]"
                  >
                    <option value="active">Actif</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111B21] dark:text-white">
                  Nouveau mot de passe (Laisser vide pour ne pas modifier)
                </label>
                <input
                  type="password"
                  placeholder="Nouveau mot de passe..."
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:outline-none focus:border-[#25D366]"
                />
              </div>

              {/* Superuser Special Sponsorship & AI Settings */}
              {isSuperuser && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2.5">
                  <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 text-xs">
                    <Crown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    Privilèges exclusifs Superuser
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={editForm.isSponsored}
                      onChange={(e) => setEditForm({ ...editForm, isSponsored: e.target.checked })}
                      className="w-4 h-4 text-[#25D366] rounded"
                    />
                    <span className="font-bold text-amber-900 dark:text-amber-300">
                      ⭐ Sponsoriser cet utilisateur (Accès 100% gratuit au site sans paiement d'UE)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={editForm.isAiSuspended}
                      onChange={(e) => setEditForm({ ...editForm, isAiSuspended: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="font-medium text-rose-800 dark:text-rose-300">
                      Limiter ou suspendre l'accès à l'assistance IA pour cet étudiant
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shadow-xs"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] space-y-4 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#111B21] dark:text-white">Confirmer la suppression</h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le compte de{' '}
                <strong className="text-[#111B21] dark:text-white">{deleteConfirmUser.firstName} {deleteConfirmUser.lastName}</strong> ({deleteConfirmUser.displayPhone}) ?
                Cette action supprimera également ses progressions et soumissions associées.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Supprimer le compte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grant / Revoke UE Access Modal */}
      {accessModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] space-y-4 max-h-[90vh] overflow-y-auto transition-colors">
            <button
              onClick={() => setAccessModalUser(null)}
              className="absolute top-4 right-4 text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5 text-[#25D366]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                  Gestion des accès UE : {accessModalUser.firstName} {accessModalUser.lastName}
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0]">
                  Activer ou révoquer les Unités d'Enseignement pour cet utilisateur.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {courses.map((course) => {
                return (
                  <div
                    key={course.id}
                    className="p-3 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-between gap-3 bg-[#F0F2F5]/50 dark:bg-[#1F2C34]/50 hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#075E54] dark:text-[#25D366]">{course.code}</span>
                        <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">({course.level})</span>
                      </div>
                      <p className="text-xs font-medium text-[#111B21] dark:text-white truncate">{course.title}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        disabled={userAccessLoading}
                        onClick={() => handleToggleUeAccess(course.id, 'grant')}
                        className="px-2.5 py-1 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Unlock className="w-3 h-3" />
                        Accorder
                      </button>
                      <button
                        disabled={userAccessLoading}
                        onClick={() => handleToggleUeAccess(course.id, 'revoke')}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" />
                        Révoquer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex justify-end">
              <button
                onClick={() => setAccessModalUser(null)}
                className="px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl"
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
