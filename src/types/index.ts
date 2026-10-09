export interface User {
  id: string;
  phone: string;
  displayPhone: string;
  email?: string;
  firstName: string;
  lastName: string;
  department: string;
  program: string;
  level: string;
  role: "USER" | "STAFF" | "SUPERUSER";
  isActive: boolean;
  isSponsored?: boolean;
  isAiSuspended?: boolean;
  adminPermissions?: string[];
  createdAt: string;
  lastLoginAt?: string;
  accessCount?: number;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  faculty: string;
  description: string;
  isSuspended?: boolean;
}

export interface Program {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  description: string;
  isSuspended?: boolean;
}

export interface AcademicYear {
  id: string;
  label: string;
  isCurrent: boolean;
  isArchived: boolean;
}

export interface UE {
  id: string;
  code: string;
  title: string;
  description: string;
  objective?: string;
  departmentId: string;
  programId: string;
  level: "L1" | "L2" | "L3";
  semester: string;
  academicYear: string;
  isPublished: boolean;
  isSuspended?: boolean;
  priceFcfa: number;
  order: number;
  imageUrl?: string;
  coefficient?: number;
  creditEcts?: number;
  isUnlocked?: boolean;
  expiresAt?: string | null;
  isExpired?: boolean;
  daysRemaining?: number | null;
  accessGrantedAt?: string | null;
  sessionsCount?: number;
  completedSessionsCount?: number;
  progressPercent?: number;
  departmentName?: string;
  programName?: string;
}

export interface SessionContent {
  summaryText: string;
  video?: {
    title: string;
    url: string;
    duration: string;
    provider: "embed" | "mp4" | "youtube";
    driveFileUrl?: string;
  };
  audio?: {
    title: string;
    url: string;
    duration: string;
    speaker: string;
    driveFileUrl?: string;
  };
  pdf?: {
    title: string;
    url: string;
    pages: number;
    sizeMb: number;
    summaryMarkdown: string;
  };
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: "single" | "multiple" | "boolean";
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  sessionId?: string;
  chapterId?: string;
  title: string;
  description: string;
  passingScorePercent: number;
  questions: QuizQuestion[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export interface Chapter {
  id: string;
  sessionId: string;
  number: number;
  title: string;
  objectives?: string;
  order?: number;
  summaryText?: string;
  video?: {
    title: string;
    url: string;
    duration?: string;
    provider?: "embed" | "mp4" | "youtube";
    driveFileUrl?: string;
  };
  audio?: {
    title: string;
    url: string;
    duration?: string;
    speaker?: string;
    driveFileUrl?: string;
  };
  pdf?: {
    title: string;
    url?: string;
    pages?: number;
    sizeMb?: number;
    summaryMarkdown?: string;
  };
  flashcards?: Flashcard[];
  quiz?: Quiz;
  hasQuiz?: boolean;
}

export interface Session {
  id: string;
  ueId: string;
  sessionNumber: number;
  title: string;
  description: string;
  objective?: string;
  estimatedMinutes: number;
  order: number;
  isPublished: boolean;
  isSuspended?: boolean;
  chapters?: Chapter[];
  chaptersCount?: number;
  content?: SessionContent;
  quiz?: Quiz;
  flashcards?: Flashcard[];
  hasQuiz?: boolean;
  status?: "not_started" | "in_progress" | "completed";
  isFreeChapter?: boolean;
  isLocked?: boolean;
  isLockedForUsers?: boolean;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  sessionId: string;
  ueId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  userAnswers: Record<string, any>;
  submittedAt: string;
}

export interface QuizCorrection {
  questionId: string;
  questionText: string;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  explanation: string;
  points: number;
  earnedPoints: number;
}

export interface StudentProgressOverview {
  globalProgress: number;
  totalSessionsAll: number;
  totalCompletedAll: number;
  totalQuizzesTaken: number;
  ueBreakdown: {
    ueId: string;
    ueCode: string;
    ueTitle: string;
    totalSessions: number;
    completedSessions: number;
    progressPercent: number;
    avgQuizScore: number | null;
  }[];
  recentActivities: {
    type: "session" | "quiz";
    date: string;
    title: string;
    subtitle: string;
    status: string;
  }[];
}

export interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "phone"
    | "email"
    | "select"
    | "checkbox"
    | "options"
    | "emoji_rating";
  required: boolean;
  options?: string[];
  order: number;
}

export interface DynamicForm {
  id: string;
  title: string;
  description: string;
  themeColor?: string;
  isActive: boolean;
  createdAt: string;
  fields: FormField[];
  // ⭐ Nouveaux champs (calculés par le backend)
  submissionsCount?: number;
  lastSubmissionAt?: string | null;
  hasNewSubmissions?: boolean;
}

export interface FormSubmission {
  id: string;
  formId: string;
  userId: string;
  userName: string;
  userPhone: string;
  data: Record<string, any>;
  submittedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  applicableTo: "all" | "ue_unlock" | "tutoring";
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface UnlockRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  studentName?: string;
  studentPhone?: string;
  ueIds: string[];
  ueCodes: string[];
  promoCode?: string;
  appliedPromoCode?: string;
  discountPercent?: number;
  subtotalFcfa: number;
  transactionFeeFcfa: number;
  totalFcfa: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userPhone?: string;
  userRole?: string;
  action: string;
  resource: string;
  details: string;
  ip?: string;
}

export interface PlatformConfig {
  defaultUePriceFcfa: number;
  discountedUePriceFcfa?: number;
  onlineAssistancePerHourFcfa: number;
  inPersonAssistancePerHourFcfa?: number;
  firstChapterFreeEnabled: boolean;
  allowSelfRegistration: boolean;
  universityName: string;
  academicYearCurrent: string;
  contactPhones?: string[];
  contactEmail?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "alert" | "reminder";
  priority: "low" | "normal" | "high";
  targetType: "ALL" | "USERS" | "ROLE" | "DEPARTMENT" | "LEVEL";
  targetRole?: string;
  targetDepartment?: string;
  targetLevel?: string;
  status: "DRAFT" | "SCHEDULED" | "SENT" | "CANCELLED";
  actionUrl?: string;
  createdAt: string;
  scheduledFor?: string;
  isRead?: boolean;
  readAt?: string;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
  recipientsCount?: number;
  readCount?: number;
  recipientUserIds?: string[];
  recipientNames?: string[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: "phone_account" | "payment_link" | "qr_code" | "other";
  accountNumber?: string;
  paymentUrl?: string;
  qrCodeImage?: string;
  logoUrl?: string;
  instructions?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminStudentProgressUe {
  ueId: string;
  ueCode: string;
  ueTitle: string;
  level: string;
  totalSessions: number;
  completedSessions: number;
  progressPercent: number;
  avgQuizScore: number | null;
}

export interface AdminStudentProgress {
  id: string;
  phone: string;
  rawPhone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  department: string;
  program: string;
  level: string;
  isSponsored?: boolean;
  isActive: boolean;
  createdAt?: string;
  lastActivityAt?: string;
  globalProgressPercent: number;
  completedSessionsCount: number;
  totalSessions: number;
  totalQuizzesTaken: number;
  passedQuizzesCount: number;
  avgQuizScore: number;
  accessibleUesCount: number;
  ueBreakdown: AdminStudentProgressUe[];
}

export interface AdminProgressSummary {
  totalStudents: number;
  averageCompletionRate: number;
  totalCompletedSessions: number;
  totalQuizzesTaken: number;
}

// =============================================================================
// POPUPS / PUBLICITÉS / ANNONCES
// =============================================================================

export type PopupType =
  | "info"
  | "promo"
  | "ad"
  | "survey"
  | "alert"
  | "announcement";
export type PopupMediaType = "none" | "image" | "video" | "video_autoplay";
export type PopupButtonAction = "link" | "close" | "scroll";
export type PopupSize = "sm" | "md" | "lg" | "xl";
export type PopupPosition =
  | "center"
  | "top"
  | "bottom"
  | "bottom_right"
  | "bottom_left";
export type PopupAnimation =
  | "fade"
  | "slide_up"
  | "slide_down"
  | "zoom"
  | "none";
export type PopupTargetAudience =
  | "all"
  | "anonymous"
  | "logged_in"
  | "students"
  | "sponsored";
export type PopupTriggerType =
  | "on_load"
  | "after_delay"
  | "on_scroll"
  | "on_exit_intent";
export type PopupFrequency =
  | "once"
  | "session"
  | "per_day"
  | "always"
  | "custom";

export interface PopupCampaign {
  id: string;
  title: string;
  message: string;
  popup_type: PopupType;

  // Média
  media_type: PopupMediaType;
  media_url?: string | null;
  media_thumbnail?: string | null;

  // Boutons
  primary_button_text?: string;
  primary_button_action: PopupButtonAction;
  primary_button_url?: string | null;
  secondary_button_text?: string;
  secondary_button_action: PopupButtonAction;
  secondary_button_url?: string | null;

  // Style
  size: PopupSize;
  position: PopupPosition;
  accent_color: string;
  animation: PopupAnimation;
  is_dismissible: boolean;

  // Ciblage pages & users
  target_pages: string[];
  target_audience: PopupTargetAudience;
  target_departments: string[];
  target_programs: string[];
  target_levels: string[];

  // Déclencheur
  trigger_type: PopupTriggerType;
  trigger_delay_seconds: number;
  trigger_scroll_percent: number;

  // Fréquence
  frequency: PopupFrequency;
  frequency_custom_hours: number;

  // Statut
  is_active: boolean;
  priority: number;
  starts_at?: string | null;
  ends_at?: string | null;

  // Stats (admin seulement)
  views_count?: number;
  clicks_count?: number;
  clickThroughRate?: number;
  isCurrentlyValid?: boolean;

  // Meta
  created_at: string;
  created_by?: string;

  template_used?: string;
  schedule_days: number[]; // 0=Lundi, 6=Dimanche
  schedule_hours_start: string; // "HH:MM" ou ""
  schedule_hours_end: string; // "HH:MM" ou ""
  schedule_specific_dates: string[]; // ["2025-12-25", "12-31", ...]
  schedule_timezone: string;
}

export interface PopupViewLog {
  id: string;
  campaign: string;
  campaignTitle?: string;
  user?: string | null;
  user_phone: string;
  user_role: string;
  user_department: string;
  user_program: string;
  user_level: string;
  page: string;
  ip: string;
  user_agent: string;
  viewed_at: string;
}

export interface PopupClickLog {
  id: string;
  campaign: string;
  campaignTitle?: string;
  user?: string | null;
  user_phone: string;
  button_type: "primary" | "secondary" | "dismiss";
  page: string;
  ip: string;
  clicked_at: string;
}

export interface PopupStats {
  popup: {
    id: string;
    title: string;
    type: PopupType;
  };
  range: "day" | "week" | "month" | "year";
  totalViews: number;
  totalClicks: number;
  ctr: number;
  periodViews: number;
  periodClicks: number;
  viewsByDay: { date: string; count: number }[];
  clicksByDay: { date: string; count: number }[];
  clicksByButton: { button_type: string; count: number }[];
  topUsers: {
    user_phone: string;
    user_department: string;
    user_level: string;
    view_count: number;
  }[];
}

// =============================================================================
// TEMPLATES DE POPUPS
// =============================================================================

export interface PopupTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // Nom d'icône lucide-react
  preset: Partial<PopupCampaign>; // Configuration pré-remplie
  is_system: boolean; // Template système (superuser only pour supprimer)
  created_at: string;
  created_by?: string;
}

// =============================================================================
// PARRAINAGE & AFFILIATION
// =============================================================================

export type ReferralStatus = "pending" | "validated" | "expired" | "rejected";
export type ReferralRewardType =
  | "discount_10"
  | "discount_20"
  | "free_ue"
  | "sponsored_1m";

export interface ReferralCode {
  id: string;
  code: string;
  userId: string;
  userName: string;
  total_referrals: number;
  validated_referrals: number;
  nextMilestone: {
    threshold: number;
    reward: string;
    label: string;
  } | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer: string;
  referee: string;
  referral_code: string;
  referrerName: string;
  referrerPhone: string;
  refereeName: string;
  refereePhone: string;
  status: ReferralStatus;
  created_at: string;
  expires_at: string;
  validated_at?: string | null;
  rejection_reason?: string;
  validation_reason?: string;
}

export interface ReferralReward {
  id: string;
  reward_type: ReferralRewardType;
  rewardLabel: string;
  milestone: number;
  promo_code?: string | null;
  granted_at: string;
  expires_at?: string | null;
  is_used: boolean;
  used_at?: string | null;
}

export interface MyReferralData {
  code: ReferralCode;
  referrals: Referral[];
  rewards: ReferralReward[];
  iAmReferee: Referral | null;
}

export interface ReferralStats {
  totalReferrals: number;
  totalValidated: number;
  totalPending: number;
  totalExpired: number;
  validatedThisMonth: number;
  conversionRate: number;
  kFactor: number;
  topReferrers: {
    code: string;
    userName: string;
    userPhone: string;
    department: string;
    level: string;
    validatedCount: number;
    totalCount: number;
  }[];
  rewardsDistributed: {
    rewardType: ReferralRewardType;
    count: number;
  }[];
}
