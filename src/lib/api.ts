import {
  User,
  UE,
  Session,
  QuizAttempt,
  QuizCorrection,
  StudentProgressOverview,
  DynamicForm,
  FormSubmission,
  AuditLog,
  PlatformConfig,
  AppNotification,
  PaymentMethod,
  AdminStudentProgress,
  AdminProgressSummary,
  PopupCampaign,
  PopupStats,
  PopupViewLog,
  PopupClickLog,
  PopupTemplate,
  MyReferralData,
  Referral,
  ReferralStats,
} from "../types";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// ⭐ Lit un cookie par son nom (utilisé pour récupérer le CSRF token)
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// ⚠️ Les tokens sont désormais gérés par des cookies HttpOnly.
// Le front ne stocke plus rien → aucun risque XSS de vol de token.

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // ⭐ Ajouter le CSRF token pour les méthodes non-safe (POST, PUT, DELETE, PATCH)
  const method = (options.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }

  if (!res.ok) {
    throw new Error((data && data.error) || "Une erreur est survenue.");
  }

  return data as T;
}

export const api = {
  // ============ AUTH ============
  async register(payload: any): Promise<{ user: User }> {
    // ⭐ Le cookie est posé par le backend. Pas de token à stocker côté front.
    return request<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(phone: string, password: string): Promise<{ user: User }> {
    return request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>("/api/auth/me");
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (_) {}
  },

  // ============ ACADEMIC META ============
  async getAcademicMeta(): Promise<{
    departments: any[];
    programs: any[];
    academicYears: any[];
    levels: string[];
    config: PlatformConfig;
  }> {
    return request("/api/academic/meta");
  },

  // ============ COURSES & SESSIONS ============
  async getCourses(): Promise<{ courses: UE[] }> {
    return request<{ courses: UE[] }>("/api/courses");
  },

  async getMyCourses(): Promise<{ myCourses: UE[] }> {
    return request<{ myCourses: UE[] }>("/api/courses/my-courses");
  },

  async getUe(ueId: string): Promise<{ ue: UE; sessions: Session[] }> {
    return request<{ ue: UE; sessions: Session[] }>(`/api/courses/${ueId}`);
  },

  async getSession(sessionId: string): Promise<{
    session: Session;
    ueTitle: string;
    ueCode: string;
    progressStatus: string;
    lastQuizAttempt?: QuizAttempt;
  }> {
    return request(`/api/sessions/${sessionId}`);
  },

  async completeSession(sessionId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(
      `/api/sessions/${sessionId}/complete`,
      {
        method: "POST",
      },
    );
  },

  // ============ QUIZZES ============
  async submitQuiz(
    quizId: string,
    answers: Record<string, any>,
  ): Promise<{
    attempt: QuizAttempt;
    corrections: QuizCorrection[];
    passingScorePercent: number;
  }> {
    return request(`/api/quizzes/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },

  // ============ PROGRESS ============
  async getProgress(): Promise<StudentProgressOverview> {
    return request<StudentProgressOverview>("/api/progress");
  },

  // ============ AI ASSISTANT ============
  async askAi(
    message: string,
    history: { role: "user" | "model"; text: string }[] = [],
    contextSessionId?: string,
  ): Promise<{ reply: string }> {
    return request<{ reply: string }>("/api/ai/ask", {
      method: "POST",
      body: JSON.stringify({ message, history, contextSessionId }),
    });
  },

  // ============ DYNAMIC FORMS ============
  async getForms(): Promise<{ forms: DynamicForm[] }> {
    return request<{ forms: DynamicForm[] }>("/api/forms");
  },

  async getForm(id: string): Promise<{ form: DynamicForm }> {
    return request<{ form: DynamicForm }>(`/api/forms/${id}`);
  },

  async submitForm(
    id: string,
    data: Record<string, any>,
    guestName?: string,
    guestPhone?: string,
  ): Promise<{ success: boolean }> {
    return request(`/api/forms/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ data, guestName, guestPhone }),
    });
  },

  // ============ CONTACT ============
  async sendContact(
    name: string,
    phone: string,
    subject: string,
    message: string,
  ): Promise<{ success: boolean; message: string }> {
    return request("/api/contact", {
      method: "POST",
      body: JSON.stringify({ name, phone, subject, message }),
    });
  },

  // ============ ADMIN ============
  async getAdminStats(): Promise<any> {
    return request("/api/admin/stats");
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>("/api/admin/users");
  },

  async createAdminUser(
    data: Partial<User> & { password?: string },
  ): Promise<{ success: boolean; user: User }> {
    return request("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAdminUser(
    userId: string,
    data: Partial<User> & { password?: string },
  ): Promise<{ success: boolean; user: User }> {
    return request(`/api/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteAdminUser(userId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/users/${userId}`, { method: "DELETE" });
  },

  async toggleUserUeAccess(
    userId: string,
    ueId: string,
    action: "grant" | "revoke",
  ): Promise<{
    success: boolean;
    userId: string;
    ueId: string;
    status: string;
    grantedUeIds: string[];
  }> {
    return request(`/api/admin/users/${userId}/access`, {
      method: "POST",
      body: JSON.stringify({ ueId, action }),
    });
  },

  async getAdminUserAccess(
    userId: string,
  ): Promise<{ success: boolean; userId: string; grantedUeIds: string[] }> {
    return request(`/api/admin/users/${userId}/access`);
  },

  // ============ COURSES ADMIN ============
  async saveUe(payload: any): Promise<{ success: boolean }> {
    return request("/api/admin/ues", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async toggleSuspendUe(
    ueId: string,
  ): Promise<{ success: boolean; isSuspended: boolean }> {
    return request(`/api/admin/ues/${ueId}/suspend`, { method: "PUT" });
  },

  async deleteUe(ueId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/ues/${ueId}`, { method: "DELETE" });
  },

  async saveSession(payload: any): Promise<{ success: boolean }> {
    return request("/api/admin/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async toggleSuspendSession(
    sessionId: string,
  ): Promise<{ success: boolean; isSuspended: boolean }> {
    return request(`/api/admin/sessions/${sessionId}/suspend`, {
      method: "PUT",
    });
  },

  async toggleSessionAccess(
    sessionId: string,
    isLocked?: boolean,
  ): Promise<{ success: boolean; isLockedForUsers: boolean; message: string }> {
    return request(`/api/admin/sessions/${sessionId}/toggle-access`, {
      method: "PUT",
      body: JSON.stringify({ isLocked }),
    });
  },

  async deleteSession(sessionId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/sessions/${sessionId}`, { method: "DELETE" });
  },

  async saveChapter(
    payload: any,
  ): Promise<{ success: boolean; chapter?: any }> {
    return request("/api/admin/chapters", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async deleteChapter(chapterId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/chapters/${chapterId}`, { method: "DELETE" });
  },

  // ============ ACADEMIC STRUCTURE ============
  async saveDepartment(payload: any): Promise<{ success: boolean }> {
    return request("/api/admin/departments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async toggleSuspendDepartment(
    deptId: string,
  ): Promise<{ success: boolean; isSuspended: boolean }> {
    return request(`/api/admin/departments/${deptId}/suspend`, {
      method: "PUT",
    });
  },

  async deleteDepartment(deptId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/departments/${deptId}`, { method: "DELETE" });
  },

  async saveProgram(payload: any): Promise<{ success: boolean }> {
    return request("/api/admin/programs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async toggleSuspendProgram(
    progId: string,
  ): Promise<{ success: boolean; isSuspended: boolean }> {
    return request(`/api/admin/programs/${progId}/suspend`, { method: "PUT" });
  },

  async deleteProgram(progId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/programs/${progId}`, { method: "DELETE" });
  },

  async saveAcademicYear(payload: any): Promise<{ success: boolean }> {
    return request("/api/admin/academic-years", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAcademicYear(
    id: string,
    payload: any,
  ): Promise<{ success: boolean }> {
    return request(`/api/admin/academic-years/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteAcademicYear(id: string): Promise<{ success: boolean }> {
    return request(`/api/admin/academic-years/${id}`, { method: "DELETE" });
  },

  // ============ FORMS ADMIN ============
  async createForm(
    payload: any,
  ): Promise<{ success: boolean; form: DynamicForm }> {
    return request("/api/admin/forms", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateForm(
    id: string,
    payload: any,
  ): Promise<{ success: boolean; form: DynamicForm }> {
    return request(`/api/admin/forms/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getAdminForms(): Promise<{ forms: DynamicForm[] }> {
    return request<{ forms: DynamicForm[] }>("/api/admin/forms");
  },

  async deleteForm(id: string): Promise<{ success: boolean }> {
    return request(`/api/admin/forms/${id}`, { method: "DELETE" });
  },

  async getFormSubmissions(
    formId: string,
  ): Promise<{ submissions: FormSubmission[] }> {
    return request(`/api/admin/forms/${formId}/submissions`);
  },

  getFormExportUrl(formId: string): string {
    return `/api/admin/forms/${formId}/export`;
  },

  // ============ PROMO CODES ============
  async validatePromoCode(code: string): Promise<{
    valid: boolean;
    code?: string;
    discountPercent?: number;
    applicableTo?: string;
    error?: string;
  }> {
    return request(`/api/promo-codes/validate/${encodeURIComponent(code)}`);
  },

  async getAdminPromoCodes(): Promise<{ promoCodes: any[] }> {
    return request("/api/admin/promo-codes");
  },

  async createAdminPromoCode(payload: {
    code: string;
    discountPercent: number;
    applicableTo?: string;
  }): Promise<{ success: boolean; promoCode: any }> {
    return request("/api/admin/promo-codes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async toggleAdminPromoCode(
    id: string,
  ): Promise<{ success: boolean; isActive: boolean }> {
    return request(`/api/admin/promo-codes/${id}/toggle`, { method: "PUT" });
  },

  async deleteAdminPromoCode(id: string): Promise<{ success: boolean }> {
    return request(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
  },

  // ============ UNLOCK REQUESTS ============
  async submitUnlockRequest(payload: {
    nom: string;
    prenom: string;
    numero: string;
    ueIds: string[];
    promoCode?: string;
    paymentMethod?: string;
    notes?: string;
  }): Promise<{ success: boolean; request: any; instructions: any }> {
    return request("/api/unlock-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMyUnlockRequests(): Promise<{ requests: any[] }> {
    return request("/api/unlock-requests/my");
  },

  async getAdminUnlockRequests(): Promise<{ requests: any[] }> {
    return request("/api/admin/unlock-requests");
  },

  async approveUnlockRequest(
    id: string,
  ): Promise<{ success: boolean; request: any }> {
    return request(`/api/admin/unlock-requests/${id}/approve`, {
      method: "POST",
    });
  },

  async rejectUnlockRequest(
    id: string,
    reason?: string,
  ): Promise<{ success: boolean; request: any }> {
    return request(`/api/admin/unlock-requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // ============ NOTIFICATIONS ============
  async getNotifications(): Promise<{
    notifications: AppNotification[];
    unreadCount: number;
    totalCount: number;
  }> {
    return request<{
      notifications: AppNotification[];
      unreadCount: number;
      totalCount: number;
    }>("/api/notifications");
  },

  async markNotificationRead(
    notifId: string,
  ): Promise<{ success: boolean; notificationId: string }> {
    return request<{ success: boolean; notificationId: string }>(
      `/api/notifications/${notifId}/read`,
      { method: "POST" },
    );
  },

  async markAllNotificationsRead(): Promise<{
    success: boolean;
    message: string;
  }> {
    return request<{ success: boolean; message: string }>(
      "/api/notifications/read-all",
      { method: "POST" },
    );
  },

  async deleteNotification(
    notifId: string,
  ): Promise<{ success: boolean; message: string }> {
    return request(`/api/notifications/${notifId}/delete`, {
      method: "DELETE",
    });
  },

  async bulkDeleteNotifications(
    ids?: string[],
  ): Promise<{ success: boolean; deletedCount: number }> {
    return request("/api/notifications/bulk-delete", {
      method: "DELETE",
      body: JSON.stringify(ids ? { ids } : { all: true }),
    });
  },

  async getAdminNotifications(): Promise<{ notifications: AppNotification[] }> {
    return request<{ notifications: AppNotification[] }>(
      "/api/admin/notifications",
    );
  },

  async createAdminNotification(payload: {
    title: string;
    message: string;
    type?: string;
    priority?: string;
    targetType?: string;
    targetRole?: string;
    targetDepartment?: string;
    targetLevel?: string;
    actionUrl?: string;
    scheduledFor?: string | null;
    recipientUserIds?: string[];
  }): Promise<{ success: boolean; notification: AppNotification }> {
    return request("/api/admin/notifications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAdminNotification(
    notifId: string,
    payload: Partial<AppNotification> & { recipientUserIds?: string[] },
  ): Promise<{ success: boolean; notification: AppNotification }> {
    return request(`/api/admin/notifications/${notifId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteAdminNotification(
    notifId: string,
  ): Promise<{ success: boolean; message: string }> {
    return request(`/api/admin/notifications/${notifId}`, { method: "DELETE" });
  },

  async sendAdminNotificationNow(
    notifId: string,
  ): Promise<{ success: boolean; notification: AppNotification }> {
    return request(`/api/admin/notifications/${notifId}/send-now`, {
      method: "POST",
    });
  },

  // ============ AUDIT LOGS ============
  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return request("/api/admin/audit-logs");
  },

  async deleteAuditLogs(
    ids: string[],
  ): Promise<{ success: boolean; deletedCount: number }> {
    return request("/api/admin/audit-logs", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  },

  async purgeAllAuditLogs(): Promise<{
    success: boolean;
    deletedCount: number;
  }> {
    return request("/api/admin/audit-logs", {
      method: "DELETE",
      body: JSON.stringify({ all: true }),
    });
  },

  async downloadAuditLogsCsv(): Promise<Blob> {
    // ⭐ Le cookie HttpOnly sera envoyé automatiquement par le navigateur
    const res = await fetch(`${API_URL}/api/admin/export/audit?format=csv`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Erreur lors de l'export CSV.");
    return res.blob();
  },

  // ⭐ Exports admin (users, progress, quiz_attempts, submissions, audit)
  async getExportJson(exportType: string): Promise<any> {
    return request(`/api/admin/export/${exportType}/?format=json`);
  },

  async downloadExportCsv(exportType: string): Promise<Blob> {
    const res = await fetch(
      `${API_URL}/api/admin/export/${exportType}/?format=csv`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!res.ok) {
      if (res.status === 403) {
        let errMsg = "Vous n'êtes pas autorisé à effectuer cette action.";
        try {
          const data = await res.json();
          if (data.error || data.detail) errMsg = data.error || data.detail;
        } catch (_) {}
        const err: any = new Error(errMsg);
        err.status = 403;
        throw err;
      }
      throw new Error("Erreur lors de l'export CSV.");
    }

    return res.blob();
  },

  // ============ ADMIN CONFIG ============
  async getAdminConfig(): Promise<{ config: PlatformConfig }> {
    return request("/api/admin/config");
  },

  async updateAdminConfig(
    config: Partial<PlatformConfig>,
  ): Promise<{ success: boolean; config: PlatformConfig }> {
    return request("/api/admin/config", {
      method: "PUT",
      body: JSON.stringify(config),
    });
  },

  // ============ PAYMENT METHODS ============
  async getPaymentMethods(): Promise<{ paymentMethods: PaymentMethod[] }> {
    return request("/api/payment-methods");
  },

  async getAdminPaymentMethods(): Promise<{ paymentMethods: PaymentMethod[] }> {
    return request("/api/admin/payment-methods");
  },

  async createAdminPaymentMethod(
    payload: Partial<PaymentMethod>,
  ): Promise<{ success: boolean; paymentMethod: PaymentMethod }> {
    return request("/api/admin/payment-methods", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAdminPaymentMethod(
    id: string,
    payload: Partial<PaymentMethod>,
  ): Promise<{ success: boolean; paymentMethod: PaymentMethod }> {
    return request(`/api/admin/payment-methods/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteAdminPaymentMethod(id: string): Promise<{ success: boolean }> {
    return request(`/api/admin/payment-methods/${id}`, { method: "DELETE" });
  },

  async toggleAdminPaymentMethod(
    id: string,
  ): Promise<{ success: boolean; isActive: boolean }> {
    return request(`/api/admin/payment-methods/${id}/toggle`, {
      method: "PUT",
    });
  },

  // ============ STUDENT PROGRESS (ADMIN) ============
  async getAdminUsersProgress(
    params: {
      q?: string;
      level?: string;
      department?: string;
      program?: string;
    } = {},
  ): Promise<{
    students: AdminStudentProgress[];
    summary: AdminProgressSummary;
  }> {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.level && params.level !== "ALL")
      query.set("level", params.level);
    if (params.department && params.department !== "ALL")
      query.set("department", params.department);
    if (params.program && params.program !== "ALL")
      query.set("program", params.program);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/api/admin/progress${qs}`);
  },

  async getAdminUserProgressDetail(userId: string): Promise<{
    student: {
      id: string;
      fullName: string;
      phone: string;
      level: string;
      department: string;
      program: string;
    };
    ues: {
      ueId: string;
      ueCode: string;
      ueTitle: string;
      level: string;
      sessions: {
        sessionId: string;
        sessionNumber: number;
        title: string;
        status: string;
        lastAccessedAt?: string;
        completedAt?: string;
        quizAttemptsCount: number;
        bestScore: number | null;
      }[];
    }[];
    recentAttempts: QuizAttempt[];
  }> {
    return request(`/api/admin/progress/${userId}`);
  },

  // ============ HELPERS ============
  getFormPublicUrl(formId: string): string {
    const base = window.location.origin + window.location.pathname;
    return `${base}?form=${formId}`;
  },

  // ============ POPUPS / PUBLICITÉS (Public) ============
  async getActivePopup(page: string): Promise<{ popup: PopupCampaign | null }> {
    return request<{ popup: PopupCampaign | null }>(
      `/api/popups/active?page=${encodeURIComponent(page)}`,
    );
  },

  async trackPopupView(
    popupId: string,
    page: string,
  ): Promise<{ success: boolean }> {
    return request(`/api/popups/${popupId}/view`, {
      method: "POST",
      body: JSON.stringify({ page }),
    });
  },

  async trackPopupClick(
    popupId: string,
    buttonType: "primary" | "secondary" | "dismiss",
    page: string,
  ): Promise<{ success: boolean }> {
    return request(`/api/popups/${popupId}/click`, {
      method: "POST",
      body: JSON.stringify({ button_type: buttonType, page }),
    });
  },

  // ============ POPUPS / PUBLICITÉS (Admin) ============
  async getAdminPopups(): Promise<{ popups: PopupCampaign[] }> {
    return request<{ popups: PopupCampaign[] }>("/api/admin/popups");
  },

  async getAdminPopup(popupId: string): Promise<{ popup: PopupCampaign }> {
    return request<{ popup: PopupCampaign }>(`/api/admin/popups/${popupId}`);
  },

  async createAdminPopup(
    payload: Partial<PopupCampaign>,
  ): Promise<{ success: boolean; popup: PopupCampaign }> {
    return request("/api/admin/popups", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAdminPopup(
    popupId: string,
    payload: Partial<PopupCampaign>,
  ): Promise<{ success: boolean; popup: PopupCampaign }> {
    return request(`/api/admin/popups/${popupId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteAdminPopup(popupId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/popups/${popupId}`, {
      method: "DELETE",
    });
  },

  async toggleAdminPopup(
    popupId: string,
  ): Promise<{ success: boolean; isActive: boolean }> {
    return request(`/api/admin/popups/${popupId}/toggle`, {
      method: "PUT",
    });
  },

  async getAdminPopupStats(
    popupId: string,
    range: "day" | "week" | "month" | "year" = "week",
  ): Promise<PopupStats> {
    return request<PopupStats>(
      `/api/admin/popups/${popupId}/stats?range=${range}`,
    );
  },

  async getAdminPopupViewers(
    popupId: string,
  ): Promise<{ views: PopupViewLog[] }> {
    return request<{ views: PopupViewLog[] }>(
      `/api/admin/popups/${popupId}/viewers`,
    );
  },

  // ============ POPUP TEMPLATES (Admin) ============
  async getAdminPopupTemplates(): Promise<{ templates: PopupTemplate[] }> {
    return request<{ templates: PopupTemplate[] }>(
      "/api/admin/popup-templates",
    );
  },

  async getAdminPopupTemplate(
    templateId: string,
  ): Promise<{ template: PopupTemplate }> {
    return request<{ template: PopupTemplate }>(
      `/api/admin/popup-templates/${templateId}`,
    );
  },

  async createAdminPopupTemplate(
    payload: Partial<PopupTemplate>,
  ): Promise<{ success: boolean; template: PopupTemplate }> {
    return request("/api/admin/popup-templates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAdminPopupTemplate(
    templateId: string,
    payload: Partial<PopupTemplate>,
  ): Promise<{ success: boolean; template: PopupTemplate }> {
    return request(`/api/admin/popup-templates/${templateId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteAdminPopupTemplate(
    templateId: string,
  ): Promise<{ success: boolean }> {
    return request(`/api/admin/popup-templates/${templateId}`, {
      method: "DELETE",
    });
  },

  // ============ PARRAINAGE (Étudiant) ============
  async getMyReferral(): Promise<MyReferralData> {
    return request<MyReferralData>("/api/referrals/me");
  },

  // ============ PARRAINAGE (Admin) ============
  async getAdminReferrals(
    params: { status?: string; q?: string } = {},
  ): Promise<{ referrals: Referral[]; total: number }> {
    const query = new URLSearchParams();
    if (params.status && params.status !== "ALL")
      query.set("status", params.status);
    if (params.q) query.set("q", params.q);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<{ referrals: Referral[]; total: number }>(
      `/api/admin/referrals${qs}`,
    );
  },

  async getAdminReferralStats(): Promise<ReferralStats> {
    return request<ReferralStats>("/api/admin/referrals/stats");
  },

  async forceValidateReferral(
    referralId: string,
  ): Promise<{ success: boolean; referral: Referral }> {
    return request(`/api/admin/referrals/${referralId}/validate`, {
      method: "POST",
    });
  },

  async rejectReferral(
    referralId: string,
    reason?: string,
  ): Promise<{ success: boolean; referral: Referral }> {
    return request(`/api/admin/referrals/${referralId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};
