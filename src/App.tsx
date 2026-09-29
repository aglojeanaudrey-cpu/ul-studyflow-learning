import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Marketing Views
import { HeroSection } from './components/marketing/HeroSection';
import { FeaturesSection } from './components/marketing/FeaturesSection';
import { HowItWorksSection } from './components/marketing/HowItWorksSection';
import { PricingSection } from './components/marketing/PricingSection';
import { FaqSection } from './components/marketing/FaqSection';
import { AboutSection } from './components/marketing/AboutSection';
import { ContactModal } from './components/marketing/ContactModal';
import { LegalModal } from './components/marketing/LegalModal';

// Auth Modals
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { MyCoursesView } from './components/student/MyCoursesView';
import { UeDetailView } from './components/student/UeDetailView';
import { SessionView } from './components/student/SessionView';
import { ProgressView } from './components/student/ProgressView';
import { AiAssistantView } from './components/student/AiAssistantView';
import { StudentProfileView } from './components/student/StudentProfileView';

// Admin View
import { AdminView } from './components/admin/AdminView';

// Mobile Bottom Nav Icons
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Sparkles,
  User as UserIcon
} from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeUeId, setActiveUeId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [aiContextSessionId, setAiContextSessionId] = useState<string | undefined>(undefined);

  // Modals State
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  // Automatic redirect to dashboard upon connection
  const prevUserRef = React.useRef<typeof user>(user);
  React.useEffect(() => {
    if (!prevUserRef.current && user) {
      // User just logged in
      setCurrentTab(user.role === 'SUPERUSER' ? 'admin' : 'student_home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (prevUserRef.current && !user) {
      // User logged out
      setCurrentTab('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (user && currentTab === 'home') {
      // Authenticated user landed on home
      setCurrentTab(user.role === 'SUPERUSER' ? 'admin' : 'student_home');
    }
    prevUserRef.current = user;
  }, [user, currentTab]);

  // Handlers for switching views
  const handleOpenUe = (ueId: string) => {
    setActiveUeId(ueId);
    setCurrentTab('student_ue_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentTab('student_session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskAiWithSession = (sessionId: string) => {
    setAiContextSessionId(sessionId);
    setCurrentTab('student_ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If loading session check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-[#075E54] tracking-wider uppercase">
            UL Study Flow Learning...
          </span>
        </div>
      </div>
    );
  }

  // Choose appropriate view based on authentication & currentTab
  const renderMainView = () => {
    // 1. Administration Mode
    if (currentTab === 'admin') {
      return (
        <AdminView
          onBackToStudent={() => {
            setCurrentTab('student_home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }

    // 2. Student Mode (When logged in and viewing student tabs)
    if (user && currentTab.startsWith('student_')) {
      switch (currentTab) {
        case 'student_home':
          return (
            <StudentDashboard
              onOpenUe={handleOpenUe}
              onOpenSession={handleOpenSession}
              onNavigateTab={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          );
        case 'student_courses':
          return <MyCoursesView onOpenUe={handleOpenUe} />;
        case 'student_ue_detail':
          return activeUeId ? (
            <UeDetailView
              ueId={activeUeId}
              onBack={() => {
                setCurrentTab('student_courses');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenSession={handleOpenSession}
            />
          ) : (
            <MyCoursesView onOpenUe={handleOpenUe} />
          );
        case 'student_session':
          return activeSessionId ? (
            <SessionView
              sessionId={activeSessionId}
              onBack={() => {
                setCurrentTab(activeUeId ? 'student_ue_detail' : 'student_courses');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAskAiWithContext={handleAskAiWithSession}
            />
          ) : (
            <MyCoursesView onOpenUe={handleOpenUe} />
          );
        case 'student_progress':
          return <ProgressView onOpenUe={handleOpenUe} />;
        case 'student_ai':
          return <AiAssistantView initialSessionContextId={aiContextSessionId} />;
        case 'student_profile':
          return <StudentProfileView />;
        default:
          return (
            <StudentDashboard
              onOpenUe={handleOpenUe}
              onOpenSession={handleOpenSession}
              onNavigateTab={setCurrentTab}
            />
          );
      }
    }

    // 3. Public Marketing Mode
    switch (currentTab) {
      case 'features':
        return (
          <FeaturesSection
            onStart={() => (user ? setCurrentTab('student_home') : setRegisterOpen(true))}
          />
        );
      case 'how_it_works':
        return (
          <HowItWorksSection
            onStart={() => (user ? setCurrentTab('student_home') : setRegisterOpen(true))}
          />
        );
      case 'pricing':
        return (
          <PricingSection
            onStart={() => (user ? setCurrentTab('student_home') : setRegisterOpen(true))}
            onContact={() => setContactOpen(true)}
          />
        );
      case 'faq':
        return <FaqSection />;
      case 'about':
        return <AboutSection />;
      case 'home':
      default:
        return (
          <HeroSection
            onGetStarted={() => (user ? setCurrentTab('student_home') : setRegisterOpen(true))}
            onExploreCourses={() => {
              if (user) {
                setCurrentTab('student_courses');
              } else {
                setCurrentTab('features');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5] dark:bg-[#0B141A] text-[#111B21] dark:text-[#E9EDEF] font-sans pb-16 lg:pb-0 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenRegister={() => setRegisterOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1">{renderMainView()}</main>

      {/* Mobile & Tablet Bottom Navigation (visible on < lg: screens, < 15% height) */}
      {user && currentTab !== 'admin' && (
        <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-[#111B21] border-t border-[#E9EDEF] dark:border-[#222E35] z-40 lg:hidden flex items-center justify-around h-14 px-2 shadow-lg transition-colors">
          <button
            onClick={() => setCurrentTab('student_home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
              currentTab === 'student_home' ? 'text-[#075E54] dark:text-[#25D366] font-bold' : 'text-[#667781] dark:text-[#8696A0]'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${currentTab === 'student_home' ? 'text-[#25D366]' : ''}`} />
            <span>Accueil</span>
          </button>

          <button
            onClick={() => setCurrentTab('student_courses')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
              currentTab === 'student_courses' || currentTab === 'student_ue_detail' || currentTab === 'student_session'
                ? 'text-[#075E54] dark:text-[#25D366] font-bold'
                : 'text-[#667781] dark:text-[#8696A0]'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${currentTab === 'student_courses' ? 'text-[#25D366]' : ''}`} />
            <span>Mes UE</span>
          </button>

          <button
            onClick={() => setCurrentTab('student_progress')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
              currentTab === 'student_progress' ? 'text-[#075E54] dark:text-[#25D366] font-bold' : 'text-[#667781] dark:text-[#8696A0]'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${currentTab === 'student_progress' ? 'text-[#25D366]' : ''}`} />
            <span>Progression</span>
          </button>

          <button
            onClick={() => setCurrentTab('student_ai')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
              currentTab === 'student_ai' ? 'text-[#075E54] dark:text-[#25D366] font-bold' : 'text-[#667781] dark:text-[#8696A0]'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${currentTab === 'student_ai' ? 'text-[#25D366]' : ''}`} />
            <span>Assistant IA</span>
          </button>

          <button
            onClick={() => setCurrentTab('student_profile')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
              currentTab === 'student_profile' ? 'text-[#075E54] dark:text-[#25D366] font-bold' : 'text-[#667781] dark:text-[#8696A0]'
            }`}
          >
            <UserIcon className={`w-5 h-5 ${currentTab === 'student_profile' ? 'text-[#25D366]' : ''}`} />
            <span>Profil</span>
          </button>
        </div>
      )}

      {/* Footer (Rendered ONLY when user is NOT logged in) */}
      {!user && (
        <Footer
          onNavigate={(tab) => {
            if (tab === 'privacy' || tab === 'terms') {
              setLegalModalType(tab);
            } else {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onOpenContact={() => setContactOpen(true)}
        />
      )}

      {/* Auth Modals */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onSuccess={() => {
          setCurrentTab('student_home');
        }}
      />

      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />

      {/* Legal Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
