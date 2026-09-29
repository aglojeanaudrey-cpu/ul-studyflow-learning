import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Users,
  BookOpen,
  Award,
  Shield,
  FileSpreadsheet,
  Download,
  Settings,
  Layers,
  FileText,
  CreditCard,
  Bell,
  Sparkles
} from 'lucide-react';
import { DownloadLogoModal } from '../brand/DownloadLogoModal';

interface AdminDashboardProps {
  onNavigateSection: (section: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateSection }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAdminStats();
        setStats(res);
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = (type: string, format: 'json' | 'csv') => {
    window.open(`/api/admin/export/${type}?format=${format}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#075E54] dark:bg-[#111B21] text-white p-6 rounded-3xl shadow-sm border border-emerald-800 dark:border-[#222E35] transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#128C7E] dark:bg-[#1F2C34] text-[11px] font-bold uppercase tracking-wider text-emerald-100 mb-1 border border-emerald-400/20">
            <Shield className="w-3 h-3 text-[#25D366]" /> Administration UL Study Flow
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            Tableau de Bord Administratif & Pédagogique
          </h1>
          <p className="text-xs text-emerald-100/90 dark:text-[#8696A0] mt-0.5">
            Supervision académique, accès étudiants, gestion des cours et déblocages.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-200 dark:text-[#8696A0]">Année Académique Active</span>
          <p className="text-lg font-bold text-[#25D366] tabular-nums">
            {stats?.activeYear || '2025-2026'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateSection('users')}
          className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs text-left hover:border-[#25D366] transition-all"
        >
          <div className="flex items-center justify-between text-[#667781] dark:text-[#8696A0] mb-2">
            <span className="text-xs font-semibold">Étudiants Inscrits</span>
            <Users className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
          </div>
          <p className="text-2xl font-extrabold text-[#111B21] dark:text-white tabular-nums">
            {stats?.studentsCount || 0}
          </p>
          <p className="text-[10px] text-[#25D366] font-semibold mt-1">Gérer les comptes →</p>
        </button>

        <button
          onClick={() => onNavigateSection('courses')}
          className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs text-left hover:border-[#25D366] transition-all"
        >
          <div className="flex items-center justify-between text-[#667781] dark:text-[#8696A0] mb-2">
            <span className="text-xs font-semibold">UE Publiées</span>
            <BookOpen className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
          </div>
          <p className="text-2xl font-extrabold text-[#111B21] dark:text-white tabular-nums">
            {stats?.uesCount || 0}
          </p>
          <p className="text-[10px] text-[#25D366] font-semibold mt-1">Voir les matières →</p>
        </button>

        <button
          onClick={() => onNavigateSection('courses')}
          className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs text-left hover:border-[#25D366] transition-all"
        >
          <div className="flex items-center justify-between text-[#667781] dark:text-[#8696A0] mb-2">
            <span className="text-xs font-semibold">Séances de Cours</span>
            <Layers className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
          </div>
          <p className="text-2xl font-extrabold text-[#111B21] dark:text-white tabular-nums">
            {stats?.sessionsCount || 0}
          </p>
          <p className="text-[10px] text-[#25D366] font-semibold mt-1">Séance 01 offerte · QCM →</p>
        </button>

        <button
          onClick={() => onNavigateSection('forms')}
          className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-xs text-left hover:border-[#25D366] transition-all"
        >
          <div className="flex items-center justify-between text-[#667781] dark:text-[#8696A0] mb-2">
            <span className="text-xs font-semibold">Formulaires / Retours</span>
            <FileText className="w-4 h-4 text-[#075E54] dark:text-[#25D366]" />
          </div>
          <p className="text-2xl font-extrabold text-[#111B21] dark:text-white tabular-nums">
            {stats?.submissionsCount || 0}
          </p>
          <p className="text-[10px] text-[#25D366] font-semibold mt-1">Consulter les réponses →</p>
        </button>
      </div>

      {/* Quick Admin Actions & Exports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Navigation Rapide */}
        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 shadow-xs space-y-3 transition-colors">
          <h3 className="font-bold text-sm text-[#111B21] dark:text-white">Actions Administratives Clés</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateSection('users')}
              className="p-3 text-left bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
            >
              <p className="font-bold text-xs text-[#075E54] dark:text-[#25D366]">Gestion Utilisateurs</p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">Rôles, sponsor, séances</p>
            </button>
            <button
              onClick={() => onNavigateSection('courses')}
              className="p-3 text-left bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
            >
              <p className="font-bold text-xs text-[#075E54] dark:text-[#25D366]">UE & Séances</p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">Accès séances, QCM, PDF</p>
            </button>
            <button
              onClick={() => onNavigateSection('notifications')}
              className="p-3 text-left bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
            >
              <p className="font-bold text-xs text-[#075E54] dark:text-[#25D366] flex items-center gap-1">
                <Bell className="w-3 h-3" /> Notifications & Messages
              </p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">Programmation, diffusion</p>
            </button>
            <button
              onClick={() => onNavigateSection('config')}
              className="p-3 text-left bg-[#F0F2F5] dark:bg-[#1F2C34] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
            >
              <p className="font-bold text-xs text-[#075E54] dark:text-[#25D366]">Tarifs & Déblocages</p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">Validation sous 12h, promos</p>
            </button>
          </div>

          {/* Superuser Brand Kit & Logo Download Banner */}
          <div className="pt-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-[#25D366]/30 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[#075E54] dark:text-[#25D366] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Identité & Logo Officiel
                </p>
                <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                  Téléchargez le logo HD (PNG, SVG, Favicon)
                </p>
              </div>
              <button
                onClick={() => setLogoModalOpen(true)}
                className="px-3 py-1.5 bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] rounded-lg text-xs font-bold flex items-center gap-1 hover:opacity-90 shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Télécharger
              </button>
            </div>
          </div>
        </div>

        {/* Exports en 1 Clic */}
        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-5 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#111B21] dark:text-white">Exports de Données (CSV / JSON)</h3>
            <span className="text-[10px] text-[#25D366] font-bold">1 clic</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#F0F2F5] dark:bg-[#1F2C34]">
              <span className="font-medium text-[#111B21] dark:text-white">Liste des Étudiants inscrits</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleExport('users', 'csv')}
                  className="px-2.5 py-1 bg-white dark:bg-[#111B21] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] rounded-lg text-[11px] font-bold text-[#075E54] dark:text-[#25D366] border border-[#E9EDEF] dark:border-[#222E35]"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('users', 'json')}
                  className="px-2.5 py-1 bg-white dark:bg-[#111B21] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] rounded-lg text-[11px] font-bold text-[#075E54] dark:text-[#25D366] border border-[#E9EDEF] dark:border-[#222E35]"
                >
                  JSON
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-[#F0F2F5] dark:bg-[#1F2C34]">
              <span className="font-medium text-[#111B21] dark:text-white">Statistiques de Progression</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleExport('progress', 'csv')}
                  className="px-2.5 py-1 bg-white dark:bg-[#111B21] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] rounded-lg text-[11px] font-bold text-[#075E54] dark:text-[#25D366] border border-[#E9EDEF] dark:border-[#222E35]"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('progress', 'json')}
                  className="px-2.5 py-1 bg-white dark:bg-[#111B21] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] rounded-lg text-[11px] font-bold text-[#075E54] dark:text-[#25D366] border border-[#E9EDEF] dark:border-[#222E35]"
                >
                  JSON
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-[#F0F2F5] dark:bg-[#1F2C34]">
              <span className="font-medium text-[#111B21] dark:text-white">Journal de Sécurité (Audit Logs)</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleExport('audit', 'csv')}
                  className="px-2.5 py-1 bg-white dark:bg-[#111B21] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] rounded-lg text-[11px] font-bold text-[#075E54] dark:text-[#25D366] border border-[#E9EDEF] dark:border-[#222E35]"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('audit', 'json')}
                  className="px-2.5 py-1 bg-white dark:bg-[#111B21] hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942] rounded-lg text-[11px] font-bold text-[#075E54] dark:text-[#25D366] border border-[#E9EDEF] dark:border-[#222E35]"
                >
                  JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Superuser Logo Download Modal */}
      <DownloadLogoModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
      />
    </div>
  );
};
