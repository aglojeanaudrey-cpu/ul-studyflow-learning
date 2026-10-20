import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { UlStudyFlowLogo } from "../brand/UlStudyFlowLogo";
import { DownloadLogoModal } from "../brand/DownloadLogoModal";
import { NotificationBell } from "../notifications/NotificationBell";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { InstallInstructionsModal } from "../ui/InstallInstructionsModal";
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Shield,
  BookOpen,
  LayoutDashboard,
  Sun,
  Moon,
  Sparkles,
  Download,
  Gift,
  TrendingUp,
  ChevronDown,
  Phone,
  Home,
  Route,
  Coins,
  HelpCircle,
  Info,
  Smartphone,
  ArrowLeft,
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenLogin,
  onOpenRegister,
}) => {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
  };

  const handleInstallClick = async () => {
    if (canInstall) {
      // Chrome/Edge supportent le prompt natif → on tente
      const accepted = await promptInstall();
      if (!accepted) {
        // L'utilisateur a refusé le prompt natif → on propose les instructions
        setInstallModalOpen(true);
      }
    } else {
      // Pas de prompt natif (iOS, ou Chrome bloque) → on affiche le modal
      setInstallModalOpen(true);
    }
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const { canInstall, isInstalled, promptInstall, platform } =
    useInstallPrompt();
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // ⭐ Items de navigation étudiante (réutilisés desktop + tablette)
  const studentNavItems = [
    {
      id: "student_home",
      label: "Tableau de bord",
      shortLabel: "Tableau",
      icon: LayoutDashboard,
    },
    {
      id: "student_courses",
      label: "Mes UE",
      shortLabel: "Mes UE",
      icon: BookOpen,
    },
    {
      id: "student_progress",
      label: "Progression",
      shortLabel: "Progress.",
      icon: TrendingUp,
    },
    {
      id: "student_ai",
      label: "Assistant IA",
      shortLabel: "IA",
      icon: Sparkles,
      isHighlight: true,
    },
    {
      id: "student_referral",
      label: "Parrainage",
      shortLabel: "Parrain.",
      icon: Gift,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#075E54] dark:bg-[#0B141A] text-white border-b border-[#128C7E] dark:border-[#222E35] shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* ============ LOGO ============ */}
          <button
            onClick={() => handleNav(user ? "student_home" : "home")}
            className="flex items-center text-left focus:outline-none group shrink-0"
            title="UL StudyFlow Accueil"
          >
            <UlStudyFlowLogo size="md" lightText showTagline />
          </button>

          {/* ============ DESKTOP NAV (lg+) ============ */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-emerald-100">
            {!user ? (
              <>
                <button
                  onClick={() => handleNav("home")}
                  className={`px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "home"
                      ? "text-[#25D366] font-semibold bg-white/5"
                      : ""
                  }`}
                >
                  Accueil
                </button>
                <button
                  onClick={() => handleNav("features")}
                  className={`px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "features"
                      ? "text-[#25D366] font-semibold bg-white/5"
                      : ""
                  }`}
                >
                  Fonctionnalités
                </button>
                <button
                  onClick={() => handleNav("how_it_works")}
                  className={`px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "how_it_works"
                      ? "text-[#25D366] font-semibold bg-white/5"
                      : ""
                  }`}
                >
                  Comment ça marche
                </button>
                <button
                  onClick={() => handleNav("pricing")}
                  className={`px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "pricing"
                      ? "text-[#25D366] font-semibold bg-white/5"
                      : ""
                  }`}
                >
                  Tarifs
                </button>
                <button
                  onClick={() => handleNav("faq")}
                  className={`px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "faq"
                      ? "text-[#25D366] font-semibold bg-white/5"
                      : ""
                  }`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => handleNav("about")}
                  className={`px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "about"
                      ? "text-[#25D366] font-semibold bg-white/5"
                      : ""
                  }`}
                >
                  À propos
                </button>
              </>
            ) : (
              <>
                {studentNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                        isActive
                          ? "text-[#25D366] font-semibold bg-white/5"
                          : ""
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${item.isHighlight ? "text-[#25D366]" : ""}`}
                      />
                      {item.label}
                    </button>
                  );
                })}

                {(user.role === "STAFF" || user.role === "SUPERUSER") && (
                  <button
                    onClick={() => handleNav("admin")}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#128C7E] dark:bg-[#1F2C34] text-white text-xs font-semibold hover:bg-emerald-600 transition-colors ${
                      currentTab.startsWith("admin")
                        ? "ring-1 ring-[#25D366]"
                        : ""
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#25D366]" />
                    Admin
                  </button>
                )}
              </>
            )}
          </nav>

          {/* ============ TABLET NAV (md → lg) : icônes compactes ============ */}
          <nav className="hidden md:flex lg:hidden items-center gap-0.5 text-emerald-100">
            {!user ? (
              <>
                <button
                  onClick={() => handleNav("home")}
                  title="Accueil"
                  className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "home" ? "text-[#25D366] bg-white/5" : ""
                  }`}
                >
                  <Home className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNav("features")}
                  title="Fonctionnalités"
                  className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "features" ? "text-[#25D366] bg-white/5" : ""
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNav("how_it_works")}
                  title="Comment ça marche"
                  className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "how_it_works"
                      ? "text-[#25D366] bg-white/5"
                      : ""
                  }`}
                >
                  <Route className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNav("pricing")}
                  title="Tarifs"
                  className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "pricing" ? "text-[#25D366] bg-white/5" : ""
                  }`}
                >
                  <Coins className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNav("faq")}
                  title="FAQ"
                  className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "faq" ? "text-[#25D366] bg-white/5" : ""
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNav("about")}
                  title="À propos"
                  className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                    currentTab === "about" ? "text-[#25D366] bg-white/5" : ""
                  }`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {studentNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      title={item.label}
                      className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                        isActive ? "text-[#25D366] bg-white/5" : ""
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${item.isHighlight ? "text-[#25D366]" : ""}`}
                      />
                    </button>
                  );
                })}
                {(user.role === "STAFF" || user.role === "SUPERUSER") && (
                  <button
                    onClick={() => handleNav("admin")}
                    title="Administration"
                    className={`p-2 rounded-lg bg-[#128C7E] dark:bg-[#1F2C34] text-white hover:bg-emerald-600 transition-colors ${
                      currentTab.startsWith("admin")
                        ? "ring-1 ring-[#25D366]"
                        : ""
                    }`}
                  >
                    <Shield className="w-4 h-4 text-[#25D366]" />
                  </button>
                )}
              </>
            )}
          </nav>

          {/* ============ RIGHT SIDE (Desktop md+) ============ */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={
                resolvedTheme === "dark"
                  ? "Activer le mode clair"
                  : "Activer le mode sombre"
              }
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-[#128C7E]/70 dark:hover:bg-[#1F2C34] transition-colors"
              aria-label="Basculer le mode sombre"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-200" />
              )}
            </button>

            {/* Notifications */}
            {user && <NotificationBell onNavigate={onNavigate} />}

            {/* Auth buttons (non connecté) */}
            {!user ? (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 text-sm font-medium text-white hover:text-[#25D366] transition-colors"
                >
                  Connexion
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-4 py-2 text-sm font-semibold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] transition-all shadow-sm active:scale-95"
                >
                  Créer un compte
                </button>
              </>
            ) : (
              /* DROPDOWN PROFIL */
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors border ${
                    profileDropdownOpen
                      ? "bg-[#128C7E] border-[#25D366]/40"
                      : "bg-[#128C7E]/70 dark:bg-[#1F2C34] hover:bg-[#128C7E] border-transparent dark:border-[#222E35]"
                  }`}
                  aria-haspopup="true"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-lg bg-[#25D366]/20 flex items-center justify-center shrink-0">
                    <UserIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  </div>
                  <span className="font-medium text-xs max-w-25 truncate hidden lg:inline">
                    {user.firstName}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-emerald-200 transition-transform ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#111B21] rounded-2xl shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header profil */}
                    <div className="p-4 bg-linear-to-br from-[#075E54] to-[#128C7E] dark:from-[#1F2C34] dark:to-[#222E35] text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#25D366]/25 flex items-center justify-center shrink-0">
                          <UserIcon className="w-5 h-5 text-[#25D366]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-[10px] text-emerald-100 uppercase tracking-wider">
                            {user.role === "SUPERUSER"
                              ? "Super-Admin"
                              : user.role === "STAFF"
                                ? "Staff"
                                : "Étudiant"}{" "}
                            · {user.department} · {user.level}
                          </p>
                          {user.displayPhone && (
                            <p className="text-[10px] text-emerald-100/80 font-mono mt-0.5 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" />
                              {user.displayPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                      {/* Bouton Installer l'application */}
                      {!isInstalled && (
                        <button
                          onClick={handleInstallClick}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center shrink-0">
                            <Smartphone className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block">
                              Installer l'application
                            </span>
                            <span className="block text-[10px] font-normal text-[#667781] dark:text-[#8696A0]">
                              Accès rapide + hors ligne
                            </span>
                          </div>
                          <Download className="w-3 h-3 text-[#25D366] shrink-0" />
                        </button>
                      )}
                      <button
                        onClick={() => handleNav("student_profile")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#128C7E]/15 text-[#128C7E] dark:text-[#25D366] flex items-center justify-center shrink-0">
                          <UserIcon className="w-3.5 h-3.5" />
                        </div>
                        Mon Profil
                      </button>

                      {user.role === "SUPERUSER" && (
                        <button
                          onClick={() => {
                            setLogoModalOpen(true);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                            <Download className="w-3.5 h-3.5" />
                          </div>
                          Télécharger Logo HD
                        </button>
                      )}
                    </div>

                    {/* Séparateur + Déconnexion */}
                    <div className="p-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <LogOut className="w-3.5 h-3.5" />
                        </div>
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============ MOBILE RIGHT (md-) ============ */}
          {/* ============ MOBILE RIGHT (md-) ============ */}
          <div className="flex md:hidden items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={
                resolvedTheme === "dark"
                  ? "Activer le mode clair"
                  : "Activer le mode sombre"
              }
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] transition-colors"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-200" />
              )}
            </button>

            {/* Notifications */}
            {user && <NotificationBell onNavigate={onNavigate} />}

            {/* Burger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-emerald-100 hover:text-white rounded-xl hover:bg-[#128C7E] dark:hover:bg-[#1F2C34]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============ MOBILE DRAWER (md-) ============ */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#075E54] dark:bg-[#0B141A] border-t border-[#128C7E] dark:border-[#222E35] max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-4 space-y-4">
            {!user ? (
              /* ============ NON CONNECTÉ ============ */
              <>
                <div>
                  <p className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-wider px-2 mb-2">
                    Navigation
                  </p>
                  <div className="space-y-0.5">
                    {[
                      { id: "home", label: "Accueil" },
                      { id: "features", label: "Fonctionnalités" },
                      { id: "how_it_works", label: "Comment ça marche" },
                      { id: "pricing", label: "Tarifs" },
                      { id: "faq", label: "FAQ" },
                      { id: "about", label: "À propos" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                          currentTab === item.id
                            ? "bg-[#128C7E] text-[#25D366] font-bold"
                            : "text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#128C7E] dark:border-[#222E35] space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-[#128C7E] dark:bg-[#1F2C34] text-white"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenRegister();
                    }}
                    className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-[#25D366] text-[#075E54]"
                  >
                    Créer un compte
                  </button>
                </div>
              </>
            ) : (
              /* ============ CONNECTÉ ============ */
              <>
                {currentTab.startsWith("admin") && (
                  <button
                    onClick={() => handleNav("student_home")}
                    className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] transition-colors flex items-center gap-3"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#25D366]" />
                    Retour à l'Espace Étudiant
                  </button>
                )}
                {/* Section Navigation */}
                <div>
                  <p className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-wider px-2 mb-2">
                    Navigation
                  </p>
                  <div className="space-y-0.5">
                    {studentNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNav(item.id)}
                          className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${
                            isActive
                              ? "bg-[#128C7E] text-[#25D366] font-bold"
                              : "text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34]"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${item.isHighlight ? "text-[#25D366]" : ""}`}
                          />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Admin (uniquement si admin/staff ET pas déjà sur l'admin) */}
                {(user.role === "STAFF" || user.role === "SUPERUSER") &&
                  !currentTab.startsWith("admin") && (
                    <div>
                      <p className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-wider px-2 mb-2">
                        Espace Admin
                      </p>
                      <button
                        onClick={() => handleNav("admin")}
                        className="w-full py-2.5 px-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors bg-[#25D366] text-[#075E54] hover:bg-[#1faa54]"
                      >
                        <Shield className="w-4 h-4 text-[#075E54]" />
                        Administration
                      </button>
                    </div>
                  )}

                {/* Section Compte */}
                <div>
                  <p className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-wider px-2 mb-2">
                    Compte
                  </p>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => handleNav("student_profile")}
                      className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${
                        currentTab === "student_profile"
                          ? "bg-[#128C7E] text-[#25D366] font-bold"
                          : "text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34]"
                      }`}
                    >
                      <UserIcon className="w-4 h-4 text-[#25D366]" />
                      Mon Profil ({user.firstName})
                    </button>

                    {/* le bouton */}
                    {!isInstalled && (
                      <button
                        onClick={handleInstallClick}
                        className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] transition-colors flex items-center gap-3"
                      >
                        <Smartphone className="w-4 h-4 text-[#25D366]" />
                        Installer l'application
                      </button>
                    )}

                    {user.role === "SUPERUSER" && (
                      <button
                        onClick={() => {
                          setLogoModalOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] transition-colors flex items-center gap-3"
                      >
                        <Download className="w-4 h-4 text-[#25D366]" />
                        Télécharger Logo HD
                      </button>
                    )}
                  </div>
                </div>

                {/* Déconnexion */}
                <div className="pt-2 border-t border-[#128C7E] dark:border-[#222E35]">
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 px-3 rounded-xl text-left text-sm font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Logo Download Modal */}
      <DownloadLogoModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
      />

      {/* Modal des instructions d'installation */}
      <InstallInstructionsModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        platform={platform}
      />
    </header>
  );
};
