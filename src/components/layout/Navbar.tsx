import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UlStudyFlowLogo } from '../brand/UlStudyFlowLogo';
import { DownloadLogoModal } from '../brand/DownloadLogoModal';
import { NotificationBell } from '../notifications/NotificationBell';
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
  Download
} from 'lucide-react';

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
  onOpenRegister
}) => {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#075E54] dark:bg-[#0B141A] text-white border-b border-[#128C7E] dark:border-[#222E35] shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Motto */}
          <button
            onClick={() => handleNav(user ? 'student_home' : 'home')}
            className="flex items-center text-left focus:outline-none group"
            title="UL StudyFlow Accueil"
          >
            <UlStudyFlowLogo size="md" lightText showTagline />
          </button>

          {/* Desktop Navigation Links (hidden on tablet & mobile, visible on lg: 1024px+) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-emerald-100">
            {!user ? (
              <>
                <button
                  onClick={() => handleNav('home')}
                  className={`hover:text-white transition-colors ${currentTab === 'home' ? 'text-[#25D366] font-semibold' : ''}`}
                >
                  Accueil
                </button>
                <button
                  onClick={() => handleNav('features')}
                  className={`hover:text-white transition-colors ${currentTab === 'features' ? 'text-[#25D366] font-semibold' : ''}`}
                >
                  Fonctionnalités
                </button>
                <button
                  onClick={() => handleNav('how_it_works')}
                  className={`hover:text-white transition-colors ${currentTab === 'how_it_works' ? 'text-[#25D366] font-semibold' : ''}`}
                >
                  Comment ça marche
                </button>
                <button
                  onClick={() => handleNav('pricing')}
                  className={`hover:text-white transition-colors ${currentTab === 'pricing' ? 'text-[#25D366] font-semibold' : ''}`}
                >
                  Tarifs
                </button>
                <button
                  onClick={() => handleNav('faq')}
                  className={`hover:text-white transition-colors ${currentTab === 'faq' ? 'text-[#25D366] font-semibold' : ''}`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => handleNav('about')}
                  className={`hover:text-white transition-colors ${currentTab === 'about' ? 'text-[#25D366] font-semibold' : ''}`}
                >
                  À propos
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('student_home')}
                  className={`flex items-center gap-1.5 hover:text-white transition-colors ${currentTab === 'student_home' ? 'text-[#25D366] font-semibold' : ''}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Tableau de bord
                </button>
                <button
                  onClick={() => handleNav('student_courses')}
                  className={`flex items-center gap-1.5 hover:text-white transition-colors ${currentTab === 'student_courses' ? 'text-[#25D366] font-semibold' : ''}`}
                >
                  <BookOpen className="w-4 h-4" />
                  Mes UE
                </button>
                <button
                  onClick={() => handleNav('student_progress')}
                  className={`hover:text-white transition-colors ${currentTab === 'student_progress' ? 'text-[#25D366] font-semibold' : ''}`}
                >
                  Progression
                </button>
                <button
                  onClick={() => handleNav('student_ai')}
                  className={`hover:text-white transition-colors ${currentTab === 'student_ai' ? 'text-[#25D366] font-semibold' : ''}`}
                >
                  <Sparkles className="w-4 h-4 text-[#25D366]" />
                  Assistant IA
                </button>
                {(user.role === 'STAFF' || user.role === 'SUPERUSER') && (
                  <button
                    onClick={() => handleNav('admin')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#128C7E] dark:bg-[#1F2C34] text-white text-xs font-semibold hover:bg-emerald-600 transition-colors ${currentTab.startsWith('admin') ? 'ring-1 ring-[#25D366]' : ''}`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#25D366]" />
                    Administration
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Desktop Right Actions (Theme toggle + Notifications + Superuser Logo + Auth/Profile) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={resolvedTheme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-[#128C7E]/70 dark:hover:bg-[#1F2C34] transition-colors focus:outline-none"
              aria-label="Basculer le mode sombre"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-200" />
              )}
            </button>

            {/* Notifications Bell for Logged-in Users */}
            {user && <NotificationBell onNavigate={onNavigate} />}

            {/* Superuser Logo Download Quick Action */}
            {user && user.role === 'SUPERUSER' && (
              <button
                onClick={() => setLogoModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#25D366]/20 text-white hover:text-[#25D366] text-xs font-bold border border-emerald-400/30 transition-all shadow-xs active:scale-95"
                title="Télécharger le logo et le kit de marque officiel"
              >
                <Download className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Logo HD</span>
              </button>
            )}

            {!user ? (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 text-sm font-medium text-white hover:text-[#25D366] transition-colors"
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNav('student_profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#128C7E]/70 dark:bg-[#1F2C34] hover:bg-[#128C7E] text-white text-xs transition-colors border border-transparent dark:border-[#222E35]"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  <span className="font-medium max-w-[120px] truncate">{user.firstName}</span>
                  <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded text-emerald-200 uppercase font-mono">
                    {user.level}
                  </span>
                </button>
                <button
                  onClick={logout}
                  title="Déconnexion"
                  className="p-2 text-emerald-200 hover:text-white hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Trigger Header (visible on < lg: phones and tablets) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            {/* Quick theme toggle on mobile/tablet */}
            <button
              onClick={toggleTheme}
              title={resolvedTheme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] transition-colors"
              aria-label="Basculer le mode sombre"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-200" />
              )}
            </button>

            {/* Mobile Notification Bell */}
            {user && <NotificationBell onNavigate={onNavigate} />}

            {/* Mobile Superuser Logo Quick Button */}
            {user && user.role === 'SUPERUSER' && (
              <button
                onClick={() => setLogoModalOpen(true)}
                className="p-2 rounded-xl text-[#25D366] bg-[#128C7E]/40 hover:bg-[#128C7E] transition-colors"
                title="Télécharger le logo"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {user && (
              <button
                onClick={() => handleNav('student_profile')}
                className="w-8 h-8 rounded-xl bg-[#128C7E] dark:bg-[#1F2C34] text-white text-xs font-bold flex items-center justify-center border border-emerald-400/30"
              >
                {user.firstName[0]}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-emerald-100 hover:text-white rounded-xl focus:outline-none hover:bg-[#128C7E] dark:hover:bg-[#1F2C34]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Slide Drawer (< lg screens) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#075E54] dark:bg-[#0B141A] border-t border-[#128C7E] dark:border-[#222E35] px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {!user ? (
            <>
              <button
                onClick={() => handleNav('home')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] hover:text-white font-medium"
              >
                Accueil
              </button>
              <button
                onClick={() => handleNav('features')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] hover:text-white font-medium"
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => handleNav('how_it_works')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] hover:text-white font-medium"
              >
                Comment ça marche
              </button>
              <button
                onClick={() => handleNav('pricing')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] hover:text-white font-medium"
              >
                Tarifs
              </button>
              <button
                onClick={() => handleNav('faq')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] hover:text-white font-medium"
              >
                FAQ
              </button>
              <button
                onClick={() => handleNav('about')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] hover:text-white font-medium"
              >
                À propos
              </button>
              <div className="pt-3 border-t border-[#128C7E] dark:border-[#222E35] flex flex-col gap-2">
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
            <>
              <button
                onClick={() => handleNav('student_home')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#25D366]" />
                <span>Tableau de bord</span>
              </button>
              <button
                onClick={() => handleNav('student_courses')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#25D366]" />
                <span>Mes UE & Cours</span>
              </button>
              <button
                onClick={() => handleNav('student_progress')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34]"
              >
                Ma Progression
              </button>
              <button
                onClick={() => handleNav('student_ai')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#25D366]" />
                <span>Assistant IA</span>
              </button>
              <button
                onClick={() => handleNav('student_profile')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm text-emerald-100 hover:bg-[#128C7E] dark:hover:bg-[#1F2C34] flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-[#25D366]" />
                <span>Mon Profil ({user.firstName})</span>
              </button>
              {user.role === 'SUPERUSER' && (
                <button
                  onClick={() => {
                    setLogoModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-bold text-[#25D366] bg-[#128C7E]/40 dark:bg-[#1F2C34] flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#25D366]" />
                  <span>Télécharger le logo officiel HD</span>
                </button>
              )}
              {(user.role === 'STAFF' || user.role === 'SUPERUSER') && (
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full text-left py-2.5 px-3.5 rounded-xl text-sm font-semibold text-[#25D366] bg-[#128C7E]/40 dark:bg-[#1F2C34] flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-[#25D366]" />
                  <span>Espace Administration</span>
                </button>
              )}
              <div className="pt-2 border-t border-[#128C7E] dark:border-[#222E35]">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3.5 text-left text-sm text-rose-300 hover:text-rose-200 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Superuser Brand Logo Download Modal */}
      <DownloadLogoModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
      />
    </header>
  );
};
