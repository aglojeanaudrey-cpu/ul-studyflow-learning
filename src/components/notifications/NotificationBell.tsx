import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ExternalLink,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../../lib/api';
import { AppNotification } from '../../types';

interface NotificationBellProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh every 30 seconds to deliver scheduled messages automatically
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
    if (notif.actionUrl && onNavigate) {
      onNavigate(notif.actionUrl);
      setIsOpen(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} j`;
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const getTypeIcon = (type: string, priority: string) => {
    if (priority === 'high' || type === 'alert') {
      return (
        <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500 dark:text-rose-400 shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    }
    switch (type) {
      case 'warning':
        return (
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'success':
        return (
          <div className="p-2 rounded-xl bg-[#25D366]/20 text-[#25D366] dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'reminder':
        return (
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-xl bg-sky-500/15 text-sky-500 dark:text-sky-400 shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        title="Notifications internes"
        className="relative p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-[#128C7E]/70 dark:hover:bg-[#1F2C34] transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[420px] bg-white dark:bg-[#111B21] rounded-3xl shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] z-50 overflow-hidden flex flex-col max-h-[520px] animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="p-4 bg-[#075E54] dark:bg-[#1F2C34] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-white/10">
                <Bell className="w-4 h-4 text-[#25D366]" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Notifications Internes</h3>
                <p className="text-[10px] text-emerald-200">
                  {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Toutes les alertes sont lues'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white/15 hover:bg-white/25 rounded-lg transition-colors flex items-center gap-1 text-emerald-100"
                title="Tout marquer comme lu"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#25D366]" />
                Tout lire
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#F0F2F5] dark:bg-[#1F2C34]/60 border-b border-[#E9EDEF] dark:border-[#222E35] text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  filter === 'all'
                    ? 'bg-white dark:bg-[#111B21] text-[#075E54] dark:text-[#25D366] shadow-xs'
                    : 'text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white'
                }`}
              >
                Toutes ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  filter === 'unread'
                    ? 'bg-white dark:bg-[#111B21] text-[#075E54] dark:text-[#25D366] shadow-xs'
                    : 'text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white'
                }`}
              >
                Non lues ({unreadCount})
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-[#667781] dark:text-[#8696A0] hover:text-rose-500 p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto divide-y divide-[#E9EDEF] dark:divide-[#222E35] flex-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#F0F2F5] dark:bg-[#1F2C34] flex items-center justify-center text-[#667781] dark:text-[#8696A0]">
                  <CheckCheck className="w-6 h-6 text-[#25D366]" />
                </div>
                <p className="text-xs font-bold text-[#111B21] dark:text-white">
                  {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                </p>
                <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                  Vous recevrez ici les annonces de cours, rappels et messages de l'administration.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 sm:p-4 hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]/70 transition-colors cursor-pointer flex items-start gap-3 ${
                    !notif.isRead
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'bg-white dark:bg-[#111B21]'
                  }`}
                >
                  {getTypeIcon(notif.type, notif.priority)}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-bold truncate ${
                          !notif.isRead
                            ? 'text-[#075E54] dark:text-[#25D366]'
                            : 'text-[#111B21] dark:text-white'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-[#667781] dark:text-[#8696A0] whitespace-nowrap shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-[#3B4A54] dark:text-[#8696A0] line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Metadata / Tags */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {notif.priority === 'high' && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                          Urgent
                        </span>
                      )}

                      {notif.actionUrl && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#075E54] dark:text-[#25D366]">
                          Accéder <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}

                      {!notif.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="ml-auto text-[10px] text-[#667781] hover:text-[#075E54] dark:hover:text-[#25D366] font-semibold underline"
                        >
                          Marquer lu
                        </button>
                      )}
                    </div>
                  </div>

                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#25D366] shrink-0 mt-1.5"></span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-[#F0F2F5] dark:bg-[#1F2C34] text-center border-t border-[#E9EDEF] dark:border-[#222E35]">
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
              Système de communication interne direct · UL Study Flow
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
