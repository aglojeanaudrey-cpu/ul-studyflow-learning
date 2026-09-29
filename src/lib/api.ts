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
  AppNotification
} from '../types';

const TOKEN_KEY = 'ulsf_token';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Une erreur est survenue.');
  }

  return data;
}

export const api = {
  // Auth
  async register(payload: any): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setStoredToken(data.token);
    return data;
  },

  async login(phone: string, password: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  logout() {
    setStoredToken(null);
  },

  // Academic Meta
  async getAcademicMeta(): Promise<{
    departments: any[];
    programs: any[];
    academicYears: any[];
    levels: string[];
    config: PlatformConfig;
  }> {
    return request('/api/academic/meta');
  },

  // Courses & Sessions
  async getCourses(): Promise<{ courses: UE[] }> {
    return request<{ courses: UE[] }>('/api/courses');
  },

  async getMyCourses(): Promise<{ myCourses: UE[] }> {
    return request<{ myCourses: UE[] }>('/api/courses/my-courses');
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
    return request<{ success: boolean }>(`/api/sessions/${sessionId}/complete`, {
      method: 'POST'
    });
  },

  // Quizzes
  async submitQuiz(quizId: string, answers: Record<string, any>): Promise<{
    attempt: QuizAttempt;
    corrections: QuizCorrection[];
    passingScorePercent: number;
  }> {
    return request(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  // Progress
  async getProgress(): Promise<StudentProgressOverview> {
    return request<StudentProgressOverview>('/api/progress');
  },

  // AI Assistant
  async askAi(message: string, history: { role: 'user' | 'model'; text: string }[] = [], contextSessionId?: string): Promise<{ reply: string }> {
    return request<{ reply: string }>('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ message, history, contextSessionId })
    });
  },

  // Dynamic Forms
  async getForms(): Promise<{ forms: DynamicForm[] }> {
    return request<{ forms: DynamicForm[] }>('/api/forms');
  },

  async getForm(id: string): Promise<{ form: DynamicForm }> {
    return request<{ form: DynamicForm }>(`/api/forms/${id}`);
  },

  async submitForm(id: string, data: Record<string, any>, guestName?: string, guestPhone?: string): Promise<{ success: boolean }> {
    return request(`/api/forms/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ data, guestName, guestPhone })
    });
  },

  // Contact
  async sendContact(name: string, phone: string, subject: string, message: string): Promise<{ success: boolean; message: string }> {
    return request('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name, phone, subject, message })
    });
  },

  // Admin
  async getAdminStats(): Promise<any> {
    return request('/api/admin/stats');
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/api/admin/users');
  },

  async createAdminUser(data: Partial<User> & { password?: string }): Promise<{ success: boolean; user: User }> {
    return request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminUser(userId: string, data: Partial<User> & { password?: string }): Promise<{ success: boolean; user: User }> {
    return request(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminUser(userId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  async toggleUserUeAccess(userId: string, ueId: string, action: 'grant' | 'revoke'): Promise<{ success: boolean }> {
    return request(`/api/admin/users/${userId}/access`, {
      method: 'POST',
      body: JSON.stringify({ ueId, action })
    });
  },

  // Courses & Sessions
  async saveUe(payload: any): Promise<{ success: boolean }> {
    return request('/api/admin/ues', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async toggleSuspendUe(ueId: string): Promise<{ success: boolean; isSuspended: boolean }> {
    return request(`/api/admin/ues/${ueId}/suspend`, {
      method: 'PUT'
    });
  },

  async deleteUe(ueId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/ues/${ueId}`, {
      method: 'DELETE'
    });
  },

  async saveSession(payload: any): Promise<{ success: boolean }> {
    return request('/api/admin/sessions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async toggleSuspendSession(sessionId: string): Promise<{ success: boolean; isSuspended: boolean }> {
    return request(`/api/admin/sessions/${sessionId}/suspend`, {
      method: 'PUT'
    });
  },

  async toggleSessionAccess(sessionId: string, isLocked?: boolean): Promise<{ success: boolean; isLockedForUsers: boolean; message: string }> {
    return request(`/api/admin/sessions/${sessionId}/toggle-access`, {
      method: 'PUT',
      body: JSON.stringify({ isLocked })
    });
  },

  async deleteSession(sessionId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  },

  // Academic Structure LMD
  async saveDepartment(payload: any): Promise<{ success: boolean }> {
    return request('/api/admin/departments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async toggleSuspendDepartment(deptId: string): Promise<{ success: boolean; isSuspended: boolean }> {
    return request(`/api/admin/departments/${deptId}/suspend`, {
      method: 'PUT'
    });
  },

  async deleteDepartment(deptId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/departments/${deptId}`, {
      method: 'DELETE'
    });
  },

  async saveProgram(payload: any): Promise<{ success: boolean }> {
    return request('/api/admin/programs', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async toggleSuspendProgram(progId: string): Promise<{ success: boolean; isSuspended: boolean }> {
    return request(`/api/admin/programs/${progId}/suspend`, {
      method: 'PUT'
    });
  },

  async deleteProgram(progId: string): Promise<{ success: boolean }> {
    return request(`/api/admin/programs/${progId}`, {
      method: 'DELETE'
    });
  },

  async saveAcademicYear(payload: any): Promise<{ success: boolean }> {
    return request('/api/admin/academic-years', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateAcademicYear(id: string, payload: any): Promise<{ success: boolean }> {
    return request(`/api/admin/academic-years/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteAcademicYear(id: string): Promise<{ success: boolean }> {
    return request(`/api/admin/academic-years/${id}`, {
      method: 'DELETE'
    });
  },

  // Forms
  async createForm(payload: any): Promise<{ success: boolean; form: DynamicForm }> {
    return request('/api/admin/forms', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateForm(id: string, payload: any): Promise<{ success: boolean; form: DynamicForm }> {
    return request(`/api/admin/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteForm(id: string): Promise<{ success: boolean }> {
    return request(`/api/admin/forms/${id}`, {
      method: 'DELETE'
    });
  },

  async getFormSubmissions(formId: string): Promise<{ submissions: FormSubmission[] }> {
    return request(`/api/admin/forms/${formId}/submissions`);
  },

  getFormExportUrl(formId: string): string {
    return `/api/admin/forms/${formId}/export`;
  },

  // Promo Codes
  async validatePromoCode(code: string): Promise<{ valid: boolean; code?: string; discountPercent?: number; applicableTo?: string; error?: string }> {
    return request(`/api/promo-codes/validate/${encodeURIComponent(code)}`);
  },

  async getAdminPromoCodes(): Promise<{ promoCodes: any[] }> {
    return request('/api/admin/promo-codes');
  },

  async createAdminPromoCode(payload: { code: string; discountPercent: number; applicableTo?: string }): Promise<{ success: boolean; promoCode: any }> {
    return request('/api/admin/promo-codes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async toggleAdminPromoCode(id: string): Promise<{ success: boolean; isActive: boolean }> {
    return request(`/api/admin/promo-codes/${id}/toggle`, {
      method: 'PUT'
    });
  },

  async deleteAdminPromoCode(id: string): Promise<{ success: boolean }> {
    return request(`/api/admin/promo-codes/${id}`, {
      method: 'DELETE'
    });
  },

  // Unlock Requests ('Débloquer UE')
  async submitUnlockRequest(payload: {
    nom: string;
    prenom: string;
    numero: string;
    ueIds: string[];
    promoCode?: string;
    paymentMethod?: string;
    notes?: string;
  }): Promise<{ success: boolean; request: any; instructions: any }> {
    return request('/api/unlock-requests', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getMyUnlockRequests(): Promise<{ requests: any[] }> {
    return request('/api/unlock-requests/my');
  },

  async getAdminUnlockRequests(): Promise<{ requests: any[] }> {
    return request('/api/admin/unlock-requests');
  },

  async approveUnlockRequest(id: string): Promise<{ success: boolean; request: any }> {
    return request(`/api/admin/unlock-requests/${id}/approve`, {
      method: 'POST'
    });
  },

  async rejectUnlockRequest(id: string, reason?: string): Promise<{ success: boolean; request: any }> {
    return request(`/api/admin/unlock-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Notifications (Internes & Programmées)
  async getNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number; totalCount: number }> {
    return request<{ notifications: AppNotification[]; unreadCount: number; totalCount: number }>('/api/notifications');
  },

  async markNotificationRead(notifId: string): Promise<{ success: boolean; notificationId: string }> {
    return request<{ success: boolean; notificationId: string }>(`/api/notifications/${notifId}/read`, {
      method: 'POST'
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/notifications/read-all', {
      method: 'POST'
    });
  },

  async getAdminNotifications(): Promise<{ notifications: AppNotification[] }> {
    return request<{ notifications: AppNotification[] }>('/api/admin/notifications');
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
    return request('/api/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateAdminNotification(notifId: string, payload: Partial<AppNotification> & { recipientUserIds?: string[] }): Promise<{ success: boolean; notification: AppNotification }> {
    return request(`/api/admin/notifications/${notifId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteAdminNotification(notifId: string): Promise<{ success: boolean; message: string }> {
    return request(`/api/admin/notifications/${notifId}`, {
      method: 'DELETE'
    });
  },

  async sendAdminNotificationNow(notifId: string): Promise<{ success: boolean; notification: AppNotification }> {
    return request(`/api/admin/notifications/${notifId}/send-now`, {
      method: 'POST'
    });
  },

  // Admin Logs & Config
  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return request('/api/admin/audit-logs');
  },

  async getAdminConfig(): Promise<{ config: PlatformConfig }> {
    return request('/api/admin/config');
  },

  async updateAdminConfig(config: Partial<PlatformConfig>): Promise<{ success: boolean; config: PlatformConfig }> {
    return request('/api/admin/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }
};
