
// Import all domain-specific services
import { progressTrackingService } from './progressTrackingService';
import { quizCompletionService } from './quizCompletionService';
import { pointsService } from './pointsService';
import { referralsService } from './referralsService';

// Re-export types from the central types file
export { 
  UserProgressData,
  CompletedLessonData,
  PageCompletionData,
  PointsHistoryData,
  ReferralHistoryData
} from '@/types/progress';

/**
 * Combined service for managing user progress
 * Acts as a facade to the domain-specific services
 */
export const userProgressService = {
  // Progress tracking methods
  getCoursesInProgress: progressTrackingService.getCoursesInProgress,
  getCompletedCourses: progressTrackingService.getCompletedCourses,
  updateProgress: progressTrackingService.updateProgress,
  completeSection: progressTrackingService.completeSection,
  completeLesson: progressTrackingService.completeLesson,
  isPageCompleted: progressTrackingService.isPageCompleted,
  markPageCompleted: progressTrackingService.markPageCompleted,
  getCompletedPages: progressTrackingService.getCompletedPages,
  
  // Quiz completion methods
  completeQuiz: quizCompletionService.completeQuiz,
  
  // Points management methods
  getTotalPoints: pointsService.getTotalPoints,
  getPointsHistory: pointsService.getPointsHistory,
  
  // Referral management methods
  getReferralHistory: referralsService.getReferralHistory
};
