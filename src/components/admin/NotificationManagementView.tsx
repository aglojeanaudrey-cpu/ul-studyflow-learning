import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Send,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen,
  Trash2,
  RefreshCw,
  Search,
  Check,
  X,
  ExternalLink,
  Shield,
  Eye,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { AppNotification, User } from '../../types';

export const NotificationManagementView: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'sent'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'alert' | 'reminder'>('info');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [targetType, setTargetType] = useState<'ALL' | 'USERS' | 'ROLE' | 'DEPARTMENT' | 'LEVEL'>('ALL');
  const [targetDepartment, setTargetDepartment] = useState('FASEG');
  const [targetLevel, setTargetLevel] = useState('L1');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [actionUrl, setActionUrl] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifsRes, usersRes] = await Promise.all([
        api.getAdminNotifications(),
        api.getAdminUsers()
      ]);
      setNotifications(notifsRes.notifications || []);
      setUsers(usersRes.users || []);
    } catch (err: any) {
      console.error('Error loading admin notifications:', err);
      setActionErrorMessage(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setType('info');
    setPriority('normal');
    setTargetType('ALL');
    setTargetDepartment('FASEG');
    setTargetLevel('L1');
    setSelectedUserIds([]);
    setUserSearchQuery('');
    setIsScheduled(false);
    setScheduledDate('');
    setActionUrl('');
    setActionErrorMessage(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleToggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllFilteredUsers = () => {
    const filteredIds = filteredUsersList.map((u) => u.id);
    const allSelected = filteredIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSetQuickSchedule = (hoursAhead: number) => {
    const target = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
    // Format to datetime-local (YYYY-MM-DDTHH:mm)
    const localIso = new Date(target.getTime() - target.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setIsScheduled(true);
    setScheduledDate(localIso);
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setActionErrorMessage('Veuillez remplir le titre et le contenu du message.');
      return;
    }

    if (targetType === 'USERS' && selectedUserIds.length === 0) {
      setActionErrorMessage('Veuillez sélectionner au moins un destinataire.');
      return;
    }

    let scheduledForIso: string | null = null;
    if (isScheduled && scheduledDate) {
      const selected = new Date(scheduledDate);
      if (selected.getTime() <= Date.now()) {
        setActionErrorMessage('La date programmée doit être dans le futur.');
        return;
      }
      scheduledForIso = selected.toISOString();
    }

    setSubmitting(true);
    setActionErrorMessage(null);

    try {
      await api.createAdminNotification({
        title: title.trim(),
        message: message.trim(),
        type,
        priority,
        targetType,
        targetDepartment: targetType === 'DEPARTMENT' ? targetDepartment : undefined,
        targetLevel: targetType === 'LEVEL' ? targetLevel : undefined,
        actionUrl: actionUrl.trim() || undefined,
        scheduledFor: scheduledForIso,
        recipientUserIds: targetType === 'USERS' ? selectedUserIds : undefined
      });

      setActionSuccessMessage(
        isScheduled
          ? 'Notification programmée avec succès !'
          : 'Notification envoyée instantanément à tous les destinataires !'
      );
      setIsModalOpen(false);
      resetForm();
      loadData();
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: any) {
      setActionErrorMessage(err.message || "Erreur lors de la création de la notification");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer / annuler cette notification ?')) return;
    try {
      await api.deleteAdminNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setActionSuccessMessage('Notification supprimée.');
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression.');
    }
  };

  const handleSendNow = async (id: string) => {
    try {
      const res = await api.sendAdminNotificationNow(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? res.notification : n))
      );
      setActionSuccessMessage('Notification diffusée immédiatement !');
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi immédiat.");
    }
  };

  const filteredUsersList = users.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.program && u.program.toLowerCase().includes(q))
    );
  });

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'scheduled') return n.status === 'SCHEDULED';
    if (activeTab === 'sent') return n.status === 'SENT';
    return true;
  });

  const scheduledCount = notifications.filter((n) => n.status === 'SCHEDULED').length;
  const sentCount = notifications.filter((n) => n.status === 'SENT').length;

  return (
    <div className="space-y-6">
      {/* Notifications Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111B21] p-6 rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#075E54] dark:text-[#25D366] text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-3.5 h-3.5" /> Centre de Messagerie & Notifications
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111B21] dark:text-white">
            Notifications Internes & Messages Programmés
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5">
            Diffusez des alertes en direct ou planifiez des rappels ciblés pour un ou plusieurs étudiants.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1faa54] text-[#075E54] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Envoyer / Programmer une Notification
        </button>
      </div>

      {/* Success Alert */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-[#25D366]/20 border border-[#25D366] text-[#075E54] dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#25D366]" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
          <span className="text-xs text-[#667781] dark:text-[#8696A0] font-semibold">Total Créées</span>
          <p className="text-2xl font-black text-[#111B21] dark:text-white mt-1">{notifications.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
          <span className="text-xs text-[#667781] dark:text-[#8696A0] font-semibold">Messages Programmés</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{scheduledCount}</p>
        </div>
        <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
          <span className="text-xs text-[#667781] dark:text-[#8696A0] font-semibold">Notifications Envoyées</span>
          <p className="text-2xl font-black text-[#075E54] dark:text-[#25D366] mt-1">{sentCount}</p>
        </div>
        <div className="p-4 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
          <span className="text-xs text-[#667781] dark:text-[#8696A0] font-semibold">Utilisateurs Enregistrés</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{users.length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#E9EDEF] dark:border-[#222E35] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
                : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'scheduled'
                ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
                : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]'
            }`}
          >
            Programmées ({scheduledCount})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'sent'
                ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
                : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]'
            }`}
          >
            Envoyées ({sentCount})
          </button>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl text-[#667781] hover:text-[#075E54] dark:hover:text-[#25D366] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] transition-colors"
          title="Rafraîchir"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Notifications Table / Cards */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#111B21] rounded-3xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3">
          <Bell className="w-12 h-12 text-[#667781] dark:text-[#8696A0] mx-auto opacity-50" />
          <p className="font-bold text-sm text-[#111B21] dark:text-white">Aucune notification dans cette section</p>
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Cliquez sur "Envoyer / Programmer une Notification" pour lancer un message.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs hover:border-[#25D366] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {notif.status === 'SCHEDULED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[11px] font-bold">
                      <Clock className="w-3 h-3" /> Programmé pour le{' '}
                      {notif.scheduledFor
                        ? new Date(notif.scheduledFor).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Bientôt'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                      <CheckCircle className="w-3 h-3" /> Diffusé en direct
                    </span>
                  )}

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#667781] dark:text-[#8696A0]">
                    Type: {notif.type}
                  </span>

                  {notif.priority === 'high' && (
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      Priorité Haute
                    </span>
                  )}

                  <span className="text-[10px] font-medium text-[#667781] dark:text-[#8696A0]">
                    Créé le {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#111B21] dark:text-white leading-tight">
                  {notif.title}
                </h3>

                <p className="text-xs text-[#3B4A54] dark:text-[#8696A0] leading-relaxed line-clamp-2">
                  {notif.message}
                </p>

                {/* Target & Read stats */}
                <div className="flex items-center gap-4 text-xs text-[#667781] dark:text-[#8696A0] pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#075E54] dark:text-[#25D366]" />
                    <span>
                      Cible :{' '}
                      <strong className="text-[#111B21] dark:text-white">
                        {notif.targetType === 'ALL'
                          ? 'Tous les utilisateurs'
                          : notif.targetType === 'USERS'
                          ? `${notif.recipientsCount} utilisateur(s) sélectionné(s)`
                          : notif.targetType === 'DEPARTMENT'
                          ? `Département ${notif.targetDepartment}`
                          : notif.targetType === 'LEVEL'
                          ? `Niveau ${notif.targetLevel}`
                          : notif.targetType}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      Lu par :{' '}
                      <strong className="text-[#111B21] dark:text-white">
                        {notif.readCount || 0} / {notif.recipientsCount || 1}
                      </strong>
                    </span>
                  </div>

                  {notif.actionUrl && (
                    <div className="flex items-center gap-1 text-[11px] text-[#075E54] dark:text-[#25D366] font-semibold">
                      <span>Lien : {notif.actionUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E9EDEF] dark:border-[#222E35]">
                {notif.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleSendNow(notif.id)}
                    className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1faa54] text-[#075E54] font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                    title="Envoyer maintenant sans attendre la date programmée"
                  >
                    <Send className="w-3 h-3" />
                    Envoyer maintenant
                  </button>
                )}

                <button
                  onClick={() => handleDeleteNotification(notif.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                  title="Supprimer la notification"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="md:hidden">Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation & Scheduling Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#111B21] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#075E54] dark:bg-[#1F2C34] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/10">
                  <Bell className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    Créer une Notification Interne / Message Programmé
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Ciblez un ou plusieurs étudiants et choisissez l'heure d'envoi.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateNotification} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              
              {actionErrorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-300 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionErrorMessage}</span>
                </div>
              )}

              {/* Titre & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-[#111B21] dark:text-white">
                    Titre de la notification <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Séance 02 d'Économie disponible, Rappel Examen..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#111B21] dark:text-white">Type de message</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  >
                    <option value="info">ℹ️ Information</option>
                    <option value="reminder">📚 Rappel Pédagogique</option>
                    <option value="success">✅ Succès / Félicitations</option>
                    <option value="warning">⚠️ Avertissement</option>
                    <option value="alert">🔔 Alerte Urgente</option>
                  </select>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-1">
                <label className="font-bold text-[#111B21] dark:text-white">
                  Contenu du message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Rédigez le texte complet de la notification destiné aux étudiants..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  required
                />
              </div>

              {/* Destinataires (Ciblage) */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] border border-[#E9EDEF] dark:border-[#222E35]">
                <label className="font-bold text-[#075E54] dark:text-[#25D366] flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Destinataires Ciblés
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTargetType('ALL')}
                    className={`p-2.5 rounded-xl font-bold border transition-all text-center ${
                      targetType === 'ALL'
                        ? 'bg-[#075E54] text-white border-[#075E54] shadow-xs'
                        : 'bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white border-[#E9EDEF] dark:border-[#222E35]'
                    }`}
                  >
                    Tous ({users.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('USERS')}
                    className={`p-2.5 rounded-xl font-bold border transition-all text-center ${
                      targetType === 'USERS'
                        ? 'bg-[#075E54] text-white border-[#075E54] shadow-xs'
                        : 'bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white border-[#E9EDEF] dark:border-[#222E35]'
                    }`}
                  >
                    Utilisateurs ({selectedUserIds.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('DEPARTMENT')}
                    className={`p-2.5 rounded-xl font-bold border transition-all text-center ${
                      targetType === 'DEPARTMENT'
                        ? 'bg-[#075E54] text-white border-[#075E54] shadow-xs'
                        : 'bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white border-[#E9EDEF] dark:border-[#222E35]'
                    }`}
                  >
                    Par Faculté
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('LEVEL')}
                    className={`p-2.5 rounded-xl font-bold border transition-all text-center ${
                      targetType === 'LEVEL'
                        ? 'bg-[#075E54] text-white border-[#075E54] shadow-xs'
                        : 'bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white border-[#E9EDEF] dark:border-[#222E35]'
                    }`}
                  >
                    Par Niveau LMD
                  </button>
                </div>

                {/* Sub-selector for Specific Users */}
                {targetType === 'USERS' && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#667781]" />
                        <input
                          type="text"
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          placeholder="Rechercher par nom, téléphone, filière..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSelectAllFilteredUsers}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] font-bold text-[11px] text-[#075E54] dark:text-[#25D366] hover:bg-gray-50 shrink-0"
                      >
                        {filteredUsersList.every((u) => selectedUserIds.includes(u.id))
                          ? 'Tout décocher'
                          : 'Tout cocher'}
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto divide-y divide-[#E9EDEF] dark:divide-[#222E35] border border-[#E9EDEF] dark:border-[#222E35] rounded-xl bg-white dark:bg-[#111B21]">
                      {filteredUsersList.length === 0 ? (
                        <p className="p-3 text-center text-[#667781] dark:text-[#8696A0]">
                          Aucun utilisateur ne correspond à la recherche.
                        </p>
                      ) : (
                        filteredUsersList.map((u) => {
                          const isSelected = selectedUserIds.includes(u.id);
                          return (
                            <div
                              key={u.id}
                              onClick={() => handleToggleUserSelection(u.id)}
                              className={`p-2 px-3 flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer transition-colors ${
                                isSelected ? 'bg-emerald-50/70 dark:bg-emerald-950/40 font-bold' : ''
                              }`}
                            >
                              <div>
                                <p className="text-xs text-[#111B21] dark:text-white">
                                  {u.firstName} {u.lastName}
                                </p>
                                <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                                  {u.displayPhone || u.phone} · {u.program} ({u.level})
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366]"
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-selector for Department */}
                {targetType === 'DEPARTMENT' && (
                  <div className="pt-2">
                    <label className="font-bold text-[#111B21] dark:text-white">Faculté / Département</label>
                    <select
                      value={targetDepartment}
                      onChange={(e) => setTargetDepartment(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                    >
                      <option value="FASEG">FASEG (Faculté des Sciences Économiques et de Gestion)</option>
                      <option value="FDS">FDS (Faculté des Sciences)</option>
                      <option value="FLLA">FLLA (Lettres, Langues et Arts)</option>
                      <option value="FDD">FDD (Droit)</option>
                      <option value="ENSI">ENSI (Sciences de l'Ingénieur)</option>
                    </select>
                  </div>
                )}

                {/* Sub-selector for Level */}
                {targetType === 'LEVEL' && (
                  <div className="pt-2">
                    <label className="font-bold text-[#111B21] dark:text-white">Niveau LMD</label>
                    <select
                      value={targetLevel}
                      onChange={(e) => setTargetLevel(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white"
                    >
                      <option value="L1">Licence 1 (L1)</option>
                      <option value="L2">Licence 2 (L2)</option>
                      <option value="L3">Licence 3 (L3)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Planification & Horaires (Message Programmé) */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] border border-[#E9EDEF] dark:border-[#222E35]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#075E54] dark:text-[#25D366] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Planification d'Envoi (Message Programmé)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                      {isScheduled ? 'Envoi Différé' : 'Envoi Immédiat'}
                    </span>
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366]"
                    />
                  </div>
                </div>

                {isScheduled && (
                  <div className="space-y-2 pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
                    <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                      Choisissez la date et l'heure précise à laquelle les étudiants recevront cette alerte.
                    </p>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white text-xs font-mono"
                      required={isScheduled}
                    />

                    {/* Quick presets */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">Raccourcis :</span>
                      <button
                        type="button"
                        onClick={() => handleSetQuickSchedule(1)}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#111B21] text-[10px] font-bold hover:bg-gray-100"
                      >
                        +1 Heure
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetQuickSchedule(3)}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#111B21] text-[10px] font-bold hover:bg-gray-100"
                      >
                        +3 Heures
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetQuickSchedule(24)}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#111B21] text-[10px] font-bold hover:bg-gray-100"
                      >
                        Demain même heure
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Link & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#111B21] dark:text-white">
                    Lien d'action interne (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="Ex: student_courses ou student_ai..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#1F2C34] text-[#111B21] dark:text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#111B21] dark:text-white">Niveau de Priorité</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#1F2C34] text-[#111B21] dark:text-white text-xs"
                  >
                    <option value="normal">Priorité Normale</option>
                    <option value="high">🚨 Priorité Haute / Urgente</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-[#1F2C34] text-[#111B21] dark:text-white hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#25D366] hover:bg-[#1faa54] text-[#075E54] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isScheduled ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {isScheduled ? 'Programmer le message' : 'Envoyer la notification'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
