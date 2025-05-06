
import { LessonType } from "./lesson";

export interface UserProgressData {
  lessonId: string;
  progress: number;
  lastActivity: string;
}

export interface CompletedLessonData {
  id: string;
  lessonId: string;
  title: string;
  completedDate: string;
  earnedPoints: number;
  difficulty?: string;
  scorePercentage?: number;
}

export interface PageCompletionData {
  lessonId: string;
  sectionId: string;
  pageId: string;
  completed: boolean;
}

export interface PointsHistoryData {
  date: string;
  coursePoints: number;
  referralPoints: number;
  quizPoints: number;
  testPoints?: number;
}

export interface ReferralHistoryData {
  id: string;
  referral_code_id: string;
  referee_id: string;
  status: string;
  points_earned: number;
  created_at: string;
  completed_at: string;
  referee?: {
    id: string;
    full_name: string | null;
    email: string | null;
    user_id: string;
  };
  referral_code?: {
    code: string;
    referrer_id: string;
  };
}
