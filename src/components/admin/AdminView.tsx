import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Shield,
  School,
  ArrowLeft,
  CreditCard,
  Bell,
  TrendingUp,
  Lock,
  Megaphone,
  Gift,
} from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";
import { UserManagement } from "./UserManagement";
import { CourseManagement } from "./CourseManagement";
import { FormBuilderView } from "./FormBuilderView";
import { AuditLogsView } from "./AuditLogsView";
import { ConfigPricingView } from "./ConfigPricingView";
import { AcademicStructureView } from "./AcademicStructureView";
import { NotificationManagementView } from "./NotificationManagementView";
import { UserProgressView } from "./UserProgressView";
import { AdsManagerView } from "./AdsManagerView";
import { AdsTemplatesView } from "./AdsTemplatesView";
import { AdminReferralsView } from "./AdminReferralsView";

interface AdminViewProps {
  onBackToStudent: () => void;
}

interface AdminNavTab {
  id: string;
  label: string;
  icon: React.ElementType;
  superuserOnly?: boolean;
}

export const ADMIN_NAV_TABS: AdminNavTab[] = [
  { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
  { id: "users", label: "Utilisateurs & Accès", icon: Users },
  { id: "courses", label: "UE & Séances / Chapitres", icon: BookOpen },
  { id: "progress", label: "Progression des Étudiants", icon: TrendingUp },
  { id: "structure", label: "Structure LMD", icon: School },
  { id: "forms", label: "Formulaires & Enquêtes", icon: FileText },
  { id: "config", label: "Tarifs & Moyens de Paiement", icon: CreditCard },
  { id: "notifications", label: "Notifications & Alertes", icon: Bell },
  { id: "ads", label: "Publicités & Annonces", icon: Megaphone },
  { id: "referrals", label: "Parrainage", icon: Gift },
  { id: "audit", label: "Audit Logs", icon: Shield, superuserOnly: true },
];

type AdsSubTab = "campaigns" | "templates";

const AdsSection: React.FC = () => {
  const [subTab, setSubTab] = useState<AdsSubTab>("campaigns");

  return (
    <div className="space-y-5">
      {/* Sous-navigation */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#111B21] p-1 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] w-fit">
        <button
          onClick={() => setSubTab("campaigns")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === "campaigns"
              ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]"
              : "text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          Campagnes
        </button>
        <button
          onClick={() => setSubTab("templates")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === "templates"
              ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]"
              : "text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Templates
        </button>
      </div>

      {subTab === "campaigns" && <AdsManagerView />}
      {subTab === "templates" && <AdsTemplatesView />}
    </div>
  );
};

export const AdminView: React.FC<AdminViewProps> = ({ onBackToStudent }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  if (!user || (user.role !== "STAFF" && user.role !== "SUPERUSER")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#111B21] rounded-2xl border border-rose-200 dark:border-rose-900 text-center space-y-4 shadow-sm">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-bold text-lg text-[#111B21] dark:text-white">
          Accès Restreint
        </h2>
        <p className="text-xs text-[#667781] dark:text-[#8696A0]">
          Cet espace est réservé aux coordinateurs pédagogiques et
          administrateurs de la plateforme UL Study Flow.
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

  const isSuperuser = user.role === "SUPERUSER";

  // Granular check function
  const hasAccessToTab = (tabId: string): boolean => {
    if (isSuperuser) return true;
    const perms = user.adminPermissions || [];
    if (perms.length === 0) {
      // Default initial permissions for staff without explicit restrictions
      return ["dashboard", "courses", "progress"].includes(tabId);
    }
    return perms.includes(tabId);
  };

  // Filter tabs visible to this specific user
  const visibleTabs = ADMIN_NAV_TABS.filter((tab) => {
    if (tab.superuserOnly && !isSuperuser) {
      return (user.adminPermissions || []).includes(tab.id);
    }
    return hasAccessToTab(tab.id);
  });

  // Ensure current active section is allowed, otherwise switch to first allowed
  useEffect(() => {
    if (visibleTabs.length > 0 && !hasAccessToTab(activeSection)) {
      setActiveSection(visibleTabs[0].id);
    }
  }, [activeSection, visibleTabs]);

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
          Connecté en tant que{" "}
          {user.role === "SUPERUSER"
            ? "Super-Administrateur UL"
            : "Personnel Enseignant / Staff"}
        </span>
      </div>

      {/* Admin Horizontal Subnav Bar - Granular permissions filtered */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E9EDEF] dark:border-[#222E35]">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54]"
                  : "text-[#667781] dark:text-[#8696A0] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] hover:text-[#111B21] dark:hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Render active section */}
      <div>
        {activeSection === "dashboard" && hasAccessToTab("dashboard") && (
          <AdminDashboard onNavigateSection={(sec) => setActiveSection(sec)} />
        )}
        {activeSection === "users" && hasAccessToTab("users") && (
          <UserManagement />
        )}
        {activeSection === "courses" && hasAccessToTab("courses") && (
          <CourseManagement />
        )}
        {activeSection === "progress" && hasAccessToTab("progress") && (
          <UserProgressView />
        )}
        {activeSection === "structure" && hasAccessToTab("structure") && (
          <AcademicStructureView />
        )}
        {activeSection === "forms" && hasAccessToTab("forms") && (
          <FormBuilderView />
        )}
        {activeSection === "config" && hasAccessToTab("config") && (
          <ConfigPricingView />
        )}
        {activeSection === "notifications" &&
          hasAccessToTab("notifications") && <NotificationManagementView />}
        {activeSection === "ads" && hasAccessToTab("ads") && <AdsSection />}
        {activeSection === "referrals" && hasAccessToTab("users") && (
          <AdminReferralsView />
        )}
        {activeSection === "audit" && hasAccessToTab("audit") && (
          <AuditLogsView />
        )}

        {/* Fallback if unauthorized tab entered */}
        {!hasAccessToTab(activeSection) && (
          <div className="bg-white dark:bg-[#111B21] p-12 rounded-2xl border border-rose-200 dark:border-rose-900 text-center space-y-3">
            <Lock className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="font-bold text-base text-[#111B21] dark:text-white">
              Accès Non Autorisé
            </h3>
            <p className="text-xs text-[#667781] dark:text-[#8696A0]">
              Votre compte staff ne dispose pas des permissions nécessaires pour
              accéder à cette rubrique. Veuillez contacter le
              Super-Administrateur.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
