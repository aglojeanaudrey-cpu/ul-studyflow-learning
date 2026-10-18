import React, { useState, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";

// Marketing Views
import { HeroSection } from "./components/marketing/HeroSection";
import { PricingPage } from "./components/marketing/pricing/ui/PricingPage";
import { FeaturesPage } from "./components/marketing/features/FeaturesPage";
import { FaqPage } from "./components/marketing/faq/FaqPage";
import { HowItWorksPage } from "./components/marketing/howitworks/HowItWorksPage";
import { AboutPage } from "./components/marketing/about/AboutPage";
import { ContactModal } from "./components/marketing/ContactModal";
import { LegalModal } from "./components/marketing/LegalModal";

// Auth Modals
import { LoginModal } from "./components/auth/LoginModal";
import { RegisterModal } from "./components/auth/RegisterModal";

// Student Views
import { StudentDashboard } from "./components/student/StudentDashboard";
import { MyCoursesView } from "./components/student/MyCoursesView";
import { UeDetailView } from "./components/student/UeDetailView";
import { ProgressView } from "./components/student/ProgressView";
import { StudentProfileView } from "./components/student/StudentProfileView";
import { ActivePopup } from "./components/marketing/ActivePopup";
import { ReferralView } from "./components/student/ReferralView";
import { PageProgressBar } from "./components/ui/PageProgressBar";
import { AppSplashScreen } from "./components/ui/AppSplashScreen";
import { useLoading, LoadingProvider } from "./context/LoadingContext";
import { PartnershipModal } from "./components/marketing/PartnershipModal";
import { trackEvent, ANALYTICS_EVENTS } from "./lib/analytics";

// Mobile Bottom Nav Icons
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Sparkles,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";

import { DynamicFormModal } from "./components/student/DynamicFormModal";
import { api } from "./lib/api";
import { DynamicForm, PopupCampaign } from "./types";

// Lazy imports
const AiAssistantView = lazy(() =>
  import("./components/student/AiAssistantView").then((m) => ({
    default: m.AiAssistantView,
  })),
);

const AdminView = lazy(() =>
  import("./components/admin/AdminView").then((m) => ({
    default: m.AdminView,
  })),
);

const SessionView = lazy(() =>
  import("./components/student/SessionView").then((m) => ({
    default: m.SessionView,
  })),
);

function AppContent() {
  const { user, loading } = useAuth();
  const { isLoading } = useLoading();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [activeUeId, setActiveUeId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [aiContextSessionId, setAiContextSessionId] = useState<
    string | undefined
  >(undefined);
  // Mémorise l'onglet précédent quand on ouvre l'IA (pour y retourner à la fermeture)
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  // Code promo en attente (depuis Mon Parrainage → déblocage UE)
  const [pendingPromoCode, setPendingPromoCode] = useState<string | null>(null);
  // Modals State
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<
    "privacy" | "terms" | "mentions" | null
  >(null);
  const [partnershipOpen, setPartnershipOpen] = useState(false);

  // Public Form State
  const [publicFormId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("form");
  });
  const [publicForm, setPublicForm] = useState<DynamicForm | null>(null);
  const [publicFormLoading, setPublicFormLoading] = useState(false);
  const [publicFormError, setPublicFormError] = useState<string | null>(null);

  // ⭐ Popup actif (publicité / annonce)
  const [activePopup, setActivePopup] = useState<PopupCampaign | null>(null);

  // Automatic redirect to dashboard upon connection
  // Automatic redirect based on auth state
  const prevUserRef = React.useRef<typeof user>(user);
  React.useEffect(() => {
    const wasLoggedIn = prevUserRef.current;
    const isLoggedIn = user;

    if (!wasLoggedIn && isLoggedIn) {
      // Just logged in
      setCurrentTab(user!.role === "SUPERUSER" ? "admin" : "student_home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (wasLoggedIn && !isLoggedIn) {
      // Just logged out : forcer la sortie de toute vue protégée
      setActiveUeId(null);
      setActiveSessionId(null);
      setAiContextSessionId(undefined);
      setCurrentTab("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (isLoggedIn && currentTab === "home") {
      // Authenticated user landed on home
      setCurrentTab(user!.role === "SUPERUSER" ? "admin" : "student_home");
    } else if (
      !isLoggedIn &&
      (currentTab === "admin" || currentTab.startsWith("student_"))
    ) {
      // Sécurité : si anonyme sur vue protégée → retour home
      setCurrentTab("home");
    }
    prevUserRef.current = user;
  }, [user, currentTab]);

  React.useEffect(() => {
    // Fallback : si on est sur un onglet inconnu, rediriger proprement
    const KNOWN_TABS = [
      "home",
      "features",
      "how_it_works",
      "pricing",
      "faq",
      "about",
      "student_home",
      "student_courses",
      "student_ue_detail",
      "student_session",
      "student_progress",
      "student_ai",
      "student_referral",
      "student_profile",
      "admin",
    ];
    const isKnownTab =
      KNOWN_TABS.includes(currentTab) ||
      currentTab.startsWith("admin/") ||
      currentTab.startsWith("student_");

    if (!isKnownTab && currentTab !== "") {
      console.warn(
        `[Nav] Onglet inconnu détecté: "${currentTab}". Redirection vers accueil.`,
      );
      setCurrentTab(
        user ? (user.role === "SUPERUSER" ? "admin" : "student_home") : "home",
      );
    }
  }, [currentTab, user]);

  // Handlers for switching views
  const handleOpenUe = (ueId: string) => {
    trackEvent(ANALYTICS_EVENTS.UE_OPENED, { ue_id: ueId });
    setActiveUeId(ueId);
    setCurrentTab("student_ue_detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentTab("student_session");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAskAiWithSession = (sessionId: string) => {
    // ⭐ Sauvegarder l'onglet actuel avant de basculer sur l'IA
    if (currentTab !== "student_ai") {
      setPreviousTab(currentTab);
    }
    setAiContextSessionId(sessionId);
    setCurrentTab("student_ai");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // Load public form from URL if present
  React.useEffect(() => {
    if (!publicFormId) return;
    setPublicFormLoading(true);
    api
      .getForm(publicFormId)
      .then((res) => setPublicForm(res.form))
      .catch((err) =>
        setPublicFormError(
          err.message || "Ce formulaire n'existe plus ou a été désactivé.",
        ),
      )
      .finally(() => setPublicFormLoading(false));
  }, [publicFormId]);

  // ⭐ Charger le popup actif à chaque changement de page
  React.useEffect(() => {
    // Ne rien faire si on est sur un formulaire public
    if (publicFormId) return;

    // Petit délai pour laisser le user voir la page
    const timer = setTimeout(() => {
      api
        .getActivePopup(currentTab)
        .then((res) => setActivePopup(res.popup))
        .catch(() => setActivePopup(null));
    }, 500);

    return () => clearTimeout(timer);
  }, [currentTab, publicFormId]);

  // ⭐ PRIORITÉ ABSOLUE : si un formulaire public est demandé, on l'affiche seul
  if (publicFormId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F2F5] dark:bg-[#0B141A] p-4">
        <div className="w-full max-w-xl">
          {publicFormLoading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-10 h-10 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-[#075E54] tracking-wider uppercase">
                Chargement du formulaire...
              </span>
            </div>
          )}

          {publicFormError && (
            <div className="bg-white dark:bg-[#111B21] rounded-2xl p-8 shadow-xl border border-[#E9EDEF] dark:border-[#222E35] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-lg text-[#111B21] dark:text-white">
                Formulaire indisponible
              </h2>
              <p className="text-xs text-[#667781] dark:text-[#8696A0]">
                {publicFormError}
              </p>
            </div>
          )}

          {publicForm && (
            <DynamicFormModal
              form={publicForm}
              isOpen={true}
              onClose={() => {
                window.history.replaceState({}, "", window.location.pathname);
                window.location.reload();
              }}
              onSuccess={() => {
                // Pas besoin de faire plus : le composant affiche déjà l'écran "Formulaire envoyé"
                // L'utilisateur fermera via le bouton qui appelle onClose
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // ⭐ Splash screen initial (chargement de la session)
  if (loading) {
    return <AppSplashScreen visible={true} />;
  }

  // Choose appropriate view based on authentication & currentTab
  // Choose appropriate view based on authentication & currentTab
  const renderMainView = () => {
    // ⭐ GARDE : si pas d'utilisateur, aucune vue admin/student n'est accessible
    if (
      !user &&
      (currentTab === "admin" || currentTab.startsWith("student_"))
    ) {
      return (
        <HeroSection
          onGetStarted={() => setRegisterOpen(true)}
          onExploreCourses={() => setCurrentTab("features")}
        />
      );
    }

    // 1. Administration Mode (inclut les sous-routes admin/xxx)
    if (currentTab === "admin" || currentTab.startsWith("admin/")) {
      if (!user || (user.role !== "SUPERUSER" && user.role !== "STAFF")) {
        return (
          <HeroSection
            onGetStarted={() =>
              user ? setCurrentTab("student_home") : setRegisterOpen(true)
            }
            onExploreCourses={() => {
              if (user) {
                setCurrentTab("student_courses");
              } else {
                setCurrentTab("features");
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        );
      }

      // Extraire la sous-section (ex: "admin/partnerships" → "partnerships")
      const adminSubSection = currentTab.includes("/")
        ? currentTab.split("/").slice(1).join("/")
        : "dashboard";

      return (
        <AdminView
          initialSection={adminSubSection}
          onBackToStudent={() => {
            setCurrentTab("student_home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      );
    }

    // 2. Student Mode (When logged in and viewing student tabs)
    if (user && currentTab.startsWith("student_")) {
      switch (currentTab) {
        case "student_home":
          return (
            <StudentDashboard
              onOpenUe={handleOpenUe}
              onOpenSession={handleOpenSession}
              onNavigateTab={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          );
        case "student_courses":
          return <MyCoursesView onOpenUe={handleOpenUe} />;
        case "student_ue_detail":
          return activeUeId ? (
            <UeDetailView
              ueId={activeUeId}
              onBack={() => {
                setCurrentTab("student_courses");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenSession={handleOpenSession}
            />
          ) : (
            <MyCoursesView onOpenUe={handleOpenUe} />
          );
        case "student_session":
          return activeSessionId ? (
            <SessionView
              sessionId={activeSessionId}
              onBack={() => {
                setCurrentTab(
                  activeUeId ? "student_ue_detail" : "student_courses",
                );
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onAskAiWithContext={handleAskAiWithSession}
            />
          ) : (
            <MyCoursesView onOpenUe={handleOpenUe} />
          );
        case "student_progress":
          return <ProgressView onOpenUe={handleOpenUe} />;
        case "student_ai":
          return (
            <AiAssistantView
              initialSessionContextId={aiContextSessionId}
              onClose={() => {
                // ⭐ Retourner à l'onglet d'origine, ou fallback sur student_home
                const returnTab = previousTab || "student_home";
                setCurrentTab(returnTab);
                setPreviousTab(null);
                setAiContextSessionId(undefined);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          );
        case "student_referral":
          return (
            <ReferralView
              onNavigateToUnlock={(promoCode) => {
                // Stocker le code et rediriger vers le déblocage
                setPendingPromoCode(promoCode);
                setCurrentTab("student_courses");
              }}
            />
          );
        case "student_profile":
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
      case "features":
        return (
          <FeaturesPage
            onGetStarted={() =>
              user ? setCurrentTab("student_home") : setRegisterOpen(true)
            }
          />
        );
      case "how_it_works":
        return (
          <HowItWorksPage
            onGetStarted={() =>
              user ? setCurrentTab("student_home") : setRegisterOpen(true)
            }
          />
        );
      case "pricing":
        return (
          <PricingPage
            onGetStarted={() =>
              user ? setCurrentTab("student_home") : setRegisterOpen(true)
            }
          />
        );
      case "faq":
        return (
          <FaqPage
            onGetStarted={() =>
              user ? setCurrentTab("student_home") : setRegisterOpen(true)
            }
          />
        );
      // Dans App.tsx, cas "about"
      case "about":
        return (
          <AboutPage
            onGetStarted={() =>
              user ? setCurrentTab("student_home") : setRegisterOpen(true)
            }
            onContactClick={() => setPartnershipOpen(true)}
          />
        );
      case "home":
      default:
        return (
          <HeroSection
            onGetStarted={() =>
              user ? setCurrentTab("student_home") : setRegisterOpen(true)
            }
            onExploreCourses={() => {
              if (user) {
                setCurrentTab("student_courses");
              } else {
                setCurrentTab("features");
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5] dark:bg-[#0B141A] text-[#111B21] dark:text-[#E9EDEF] font-sans pb-16 lg:pb-0 transition-colors duration-200">
      {/* Barre de progression globale en haut */}
      <PageProgressBar loading={isLoading} />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          // Si on navigue vers l'IA, mémoriser la page d'origine
          if (tab === "student_ai" && currentTab !== "student_ai") {
            setPreviousTab(currentTab);
          }
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenRegister={() => setRegisterOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="w-8 h-8 border-3 border-[#25D366] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          {renderMainView()}
        </Suspense>
      </main>

      {/* Mobile & Tablet Bottom Navigation (visible on < lg: screens, < 15% height) */}
      {user && currentTab !== "admin" && (
        <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-[#111B21] border-t border-[#E9EDEF] dark:border-[#222E35] z-40 lg:hidden flex items-center justify-around h-14 px-2 shadow-lg transition-colors">
          <button
            onClick={() => setCurrentTab("student_home")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
              currentTab === "student_home"
                ? "text-[#075E54] dark:text-[#25D366] font-bold"
                : "text-[#667781] dark:text-[#8696A0]"
            }`}
          >
            <LayoutDashboard
              className={`w-5 h-5 ${currentTab === "student_home" ? "text-[#25D366]" : ""}`}
            />
            <span>Accueil</span>
          </button>

          <button
            onClick={() => setCurrentTab("student_courses")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
              currentTab === "student_courses" ||
              currentTab === "student_ue_detail" ||
              currentTab === "student_session"
                ? "text-[#075E54] dark:text-[#25D366] font-bold"
                : "text-[#667781] dark:text-[#8696A0]"
            }`}
          >
            <BookOpen
              className={`w-5 h-5 ${currentTab === "student_courses" ? "text-[#25D366]" : ""}`}
            />
            <span>Mes UE</span>
          </button>

          <button
            onClick={() => setCurrentTab("student_progress")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
              currentTab === "student_progress"
                ? "text-[#075E54] dark:text-[#25D366] font-bold"
                : "text-[#667781] dark:text-[#8696A0]"
            }`}
          >
            <TrendingUp
              className={`w-5 h-5 ${currentTab === "student_progress" ? "text-[#25D366]" : ""}`}
            />
            <span>Progression</span>
          </button>

          <button
            onClick={() => setCurrentTab("student_ai")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
              currentTab === "student_ai"
                ? "text-[#075E54] dark:text-[#25D366] font-bold"
                : "text-[#667781] dark:text-[#8696A0]"
            }`}
          >
            <Sparkles
              className={`w-5 h-5 ${currentTab === "student_ai" ? "text-[#25D366]" : ""}`}
            />
            <span>Assistant IA</span>
          </button>

          <button
            onClick={() => setCurrentTab("student_profile")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-colors ${
              currentTab === "student_profile"
                ? "text-[#075E54] dark:text-[#25D366] font-bold"
                : "text-[#667781] dark:text-[#8696A0]"
            }`}
          >
            <UserIcon
              className={`w-5 h-5 ${currentTab === "student_profile" ? "text-[#25D366]" : ""}`}
            />
            <span>Profil</span>
          </button>
        </div>
      )}

      {/* Footer (Rendered ONLY when user is NOT logged in) */}
      {!user && (
        <Footer
          onNavigate={(tab) => {
            if (tab === "privacy" || tab === "terms" || tab === "mentions") {
              setLegalModalType(tab as "privacy" | "terms" | "mentions");
            } else {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: "smooth" });
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
          setCurrentTab("student_home");
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
      {/* Partnership Modal */}
      <PartnershipModal
        isOpen={partnershipOpen}
        onClose={() => setPartnershipOpen(false)}
      />

      {/* Legal Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* ⭐ Popup actif (publicités / annonces) */}
      <ActivePopup popup={activePopup} currentPage={currentTab} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}
