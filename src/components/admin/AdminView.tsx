import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Shield,
  Settings,
  School,
  ArrowLeft,
  CreditCard,
  Bell
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { CourseManagement } from './CourseManagement';
import { FormBuilderView } from './FormBuilderView';
import { AuditLogsView } from './AuditLogsView';
import { ConfigPricingView } from './ConfigPricingView';
import { AcademicStructureView } from './AcademicStructureView';
import { NotificationManagementView } from './NotificationManagementView';

interface AdminViewProps {
  onBackToStudent: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToStudent }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  if (!user || (user.role !== 'STAFF' && user.role !== 'SUPERUSER')) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#111B21] rounded-2xl border border-rose-200 dark:border-rose-900 text-center space-y-4 shadow-sm">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-bold text-lg text-[#111B21] dark:text-white">Accès Restreint</h2>
        <p className="text-xs text-[#667781] dark:text-[#8696A0]">
          Cet espace est réservé aux coordinateurs pédagogiques et administrateurs de la plateforme UL Study Flow.
        </p>
        <button
          onClick={onBackToStudent}
          className="px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
        >
          Retour à l'espace étudiant
        </button>
      </div>
    );
  }

  const isSuperuser = user.role === 'SUPERUSER';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Return to Student Mode Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToStudent}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'Espace Étudiant
        </button>
        <span className="text-xs bg-[#075E54] dark:bg-[#1F2C34] text-white px-3 py-1 rounded-full font-semibold border border-emerald-400/20">
          Connecté en tant que {user.role === 'SUPERUSER' ? 'Super-Administrateur UL' : 'Personnel Enseignant / Staff'}
        </span>
      </div>

      {/* Admin Horizontal Subnav Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E9EDEF] dark:border-[#222E35]">
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeSection === 'dashboard'
              ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
              : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] hover:text-[#111B21] dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Tableau de Bord
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeSection === 'users'
              ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
              : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] hover:text-[#111B21] dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Utilisateurs & Accès
        </button>

        <button
          onClick={() => setActiveSection('courses')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeSection === 'courses'
              ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
              : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] hover:text-[#111B21] dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          UE & Séances
        </button>

        <button
          onClick={() => setActiveSection('structure')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeSection === 'structure'
              ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
              : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] hover:text-[#111B21] dark:hover:text-white'
          }`}
        >
          <School className="w-3.5 h-3.5" />
          Structure LMD
        </button>

        <button
          onClick={() => setActiveSection('forms')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeSection === 'forms'
              ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
              : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] hover:text-[#111B21] dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Création de Formulaires
        </button>

        <button
          onClick={() => setActiveSection('config')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeSection === 'config'
              ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
              : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] hover:text-[#111B21] dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Tarifs, Offres & Déblocages
        </button>

        <button
          onClick={() => setActiveSection('notifications')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeSection === 'notifications'
              ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
              : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] hover:text-[#111B21] dark:hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Notifications & Messages
        </button>

        {isSuperuser && (
          <button
            onClick={() => setActiveSection('audit')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeSection === 'audit'
                ? 'bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]'
                : 'text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] hover:text-[#111B21] dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Audit Logs
          </button>
        )}
      </div>

      {/* Render active section */}
      <div>
        {activeSection === 'dashboard' && (
          <AdminDashboard onNavigateSection={(sec) => setActiveSection(sec)} />
        )}
        {activeSection === 'users' && <UserManagement />}
        {activeSection === 'courses' && <CourseManagement />}
        {activeSection === 'structure' && <AcademicStructureView />}
        {activeSection === 'forms' && <FormBuilderView />}
        {activeSection === 'config' && <ConfigPricingView />}
        {activeSection === 'notifications' && <NotificationManagementView />}
        {activeSection === 'audit' && isSuperuser && <AuditLogsView />}
      </div>
    </div>
  );
};
