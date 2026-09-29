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
  role: 'USER' | 'STAFF' | 'SUPERUSER';
  isActive: boolean;
  isSponsored?: boolean;
  isAiSuspended?: boolean;
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
  level: 'L1' | 'L2' | 'L3';
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
    provider: 'embed' | 'mp4' | 'youtube';
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
  type: 'single' | 'multiple' | 'boolean';
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  sessionId: string;
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
  content: SessionContent;
  quiz?: Quiz;
  flashcards?: Flashcard[];
  hasQuiz?: boolean;
  status?: 'not_started' | 'in_progress' | 'completed';
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
    type: 'session' | 'quiz';
    date: string;
    title: string;
    subtitle: string;
    status: string;
  }[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'phone' | 'email' | 'select' | 'checkbox' | 'options' | 'emoji_rating';
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
  applicableTo: 'all' | 'ue_unlock' | 'tutoring';
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
  status: 'pending' | 'approved' | 'rejected';
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
  type: 'info' | 'warning' | 'success' | 'alert' | 'reminder';
  priority: 'low' | 'normal' | 'high';
  targetType: 'ALL' | 'USERS' | 'ROLE' | 'DEPARTMENT' | 'LEVEL';
  targetRole?: string;
  targetDepartment?: string;
  targetLevel?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED';
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

