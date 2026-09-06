export type EdictoType = 'announcement' | 'xp_event' | 'challenge_quest' | 'reminder' | 'honor_shoutout';
export type EdictoPriority = 'normal' | 'urgent' | 'pinned';

export interface ClassroomEdicto {
  id: string;
  teacherId: string;
  teacherName: string;
  groupId: string;
  groupName: string;
  title: string;
  content: string;
  type: EdictoType;
  priority: EdictoPriority;
  xpBonusPercent?: number; // e.g. 50 (+50% XP)
  coinsBonus?: number;
  linkedActivityId?: string;
  linkedActivityTitle?: string;
  createdAt: string;
  likesCount: number;
  likedByStudentIds: string[];
  comments: EdictoComment[];
}

export interface EdictoComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'teacher' | 'student';
  authorAvatarUrl?: string;
  text: string;
  createdAt: string;
  isHelperAwarded?: boolean; // Medalla "Compañero Solidario"
}

export type SocioemotionalMood = 'energized' | 'motivated' | 'peaceful' | 'tired' | 'support_needed';

export interface SocioemotionalCheckin {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  mood: SocioemotionalMood;
  note?: string;
  createdAt: string;
}

export interface LivePollOption {
  id: string;
  text: string;
  votesCount: number;
  voterStudentIds: string[];
}

export interface LivePoll {
  id: string;
  question: string;
  groupId: string;
  options: LivePollOption[];
  isActive: boolean;
  timeLimitSeconds: number;
  createdAt: string;
}

export interface RandomHeroPickerLog {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  rewardGiven: {
    xp: number;
    coins: number;
    badgeName?: string;
  };
}

export type EvidenceType = 'image' | 'audio' | 'link' | 'text_document' | 'interactive_canvas';

export interface MetacognitiveReflection {
  mainChallengeFaced: string; // ¿Qué fue lo más retador?
  strategyUsed: string; // ¿Cómo lograste resolverlo?
  satisfactionRating: number; // 1 to 5 stars
  prideHighlight: string; // ¿De qué te sientes más orgulloso de tu trabajo?
}

export interface StudentSubmission {
  id: string;
  questId: string;
  questTitle: string;
  studentId: string;
  studentName: string;
  groupId: string;
  submittedAt: string;
  dueDate: string;
  isSubmittedOnTime: boolean;
  evidenceType: EvidenceType;
  evidenceUrl?: string;
  evidenceText?: string;
  audioRecordingUrl?: string;
  reflection: MetacognitiveReflection;
  status: 'pending_review' | 'reviewed' | 'needs_revision';
  teacherFeedback?: string;
  evaluatedRubricLevels?: Record<string, string>; // criterionKey -> levelKey (e.g. 'technical' -> 'avanzado')
  xpAwarded: number;
  coinsAwarded: number;
}

export interface ImportedStudentRow {
  firstName: string;
  lastName: string;
  groupName: string;
  guardianEmail?: string;
  guardianPhone?: string;
  notes?: string;
}
