/**
 * Helper pour tracker les événements Umami de manière safe.
 * Si Umami n'est pas chargé (bloqué par AdBlock, pas encore prêt),
 * l'appel ne fait rien — pas de crash.
 */

export function trackEvent(
  eventName: string,
  data?: Record<string, string | number | boolean>,
): void {
  try {
    if (typeof window !== "undefined" && window.umami?.track) {
      window.umami.track(eventName, data);
      if (import.meta.env.DEV) {
        console.log(`📊 [Analytics] ${eventName}`, data);
      }
    }
  } catch (err) {
    // Silencieux : ne jamais casser l'app à cause d'analytics
  }
}

// ⭐ Liste centralisée des événements
export const ANALYTICS_EVENTS = {
  // Auth
  USER_SIGNUP: "user_signup",
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",

  // Cours
  UE_OPENED: "ue_opened",
  SESSION_OPENED: "session_opened",
  SESSION_COMPLETED: "session_completed",

  // Quiz
  QUIZ_STARTED: "quiz_started",
  QUIZ_PASSED: "quiz_passed",
  QUIZ_FAILED: "quiz_failed",

  // IA
  AI_MESSAGE_SENT: "ai_message_sent",

  // Monétisation
  UNLOCK_REQUEST_SUBMITTED: "unlock_request_submitted",
  UNLOCK_REQUEST_APPROVED: "unlock_request_approved",
  PROMO_CODE_USED: "promo_code_used",

  // Marketing
  CONTACT_FORM_SUBMITTED: "contact_form_submitted",
  PARTNERSHIP_REQUESTED: "partnership_requested",
  PRICING_VIEWED: "pricing_viewed",
} as const;
