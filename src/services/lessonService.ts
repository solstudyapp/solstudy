
import { Quiz, Section, UserProgress } from "@/types/lesson";

// Mock data storage - in a real app, this would be a database
const userProgressStore: Record<string, UserProgress> = {};
const completedQuizzesStore: Record<string, string[]> = {};
const userPointsStore: Record<string, number> = {};
const userFeedbackStore: Record<string, number> = {};

// For demo, we'll use a fixed user ID
const CURRENT_USER_ID = "user-123";

export const lessonService = {
  // Get or initialize user progress for a lesson
  getUserProgress: (lessonId: string): UserProgress => {
    const key = `${CURRENT_USER_ID}-${lessonId}`;
    
    if (!userProgressStore[key]) {
      userProgressStore[key] = {
        userId: CURRENT_USER_ID,
        lessonId,
        currentSectionId: "section1",
        currentPageId: "page1",
        completedSections: [],
        completedQuizzes: [],
        testCompleted: false,
        earnedPoints: 0
      };
    }
    
    return userProgressStore[key];
  },
  
  // Update user progress
  updateProgress: (lessonId: string, sectionId: string, pageId: string): void => {
    const key = `${CURRENT_USER_ID}-${lessonId}`;
    const progress = lessonService.getUserProgress(lessonId);
    
    progress.currentSectionId = sectionId;
    progress.currentPageId = pageId;
    
    userProgressStore[key] = progress;
  },
  
  // Mark a section as completed
  completeSection: (lessonId: string, sectionId: string): void => {
    const key = `${CURRENT_USER_ID}-${lessonId}`;
    const progress = lessonService.getUserProgress(lessonId);
    
    if (!progress.completedSections.includes(sectionId)) {
      progress.completedSections.push(sectionId);
    }
    
    userProgressStore[key] = progress;
  },
  
  // Mark a quiz as completed and award points
  completeQuiz: (quiz: Quiz, score: number): void => {
    const key = `${CURRENT_USER_ID}-${quiz.lessonId}`;
    const progress = lessonService.getUserProgress(quiz.lessonId);
    
    if (!progress.completedQuizzes.includes(quiz.id)) {
      progress.completedQuizzes.push(quiz.id);
      
      // Calculate points based on score
      const earnedPoints = Math.round((score / quiz.questions.length) * quiz.rewardPoints);
      progress.earnedPoints += earnedPoints;
      
      // Update user total points
      userPointsStore[CURRENT_USER_ID] = (userPointsStore[CURRENT_USER_ID] || 0) + earnedPoints;
    }
    
    userProgressStore[key] = progress;
  },
  
  // Mark the final test as completed
  completeFinalTest: (lessonId: string): void => {
    const key = `${CURRENT_USER_ID}-${lessonId}`;
    const progress = lessonService.getUserProgress(lessonId);
    
    progress.testCompleted = true;
    userProgressStore[key] = progress;
  },
  
  // Save user feedback for a lesson
  saveFeedback: (lessonId: string, rating: number): void => {
    userFeedbackStore[`${CURRENT_USER_ID}-${lessonId}`] = rating;
  },
  
  // Get total points for user
  getUserPoints: (): number => {
    return userPointsStore[CURRENT_USER_ID] || 0;
  },
  
  // Check if a section is completed
  isSectionCompleted: (lessonId: string, sectionId: string): boolean => {
    const progress = lessonService.getUserProgress(lessonId);
    return progress.completedSections.includes(sectionId);
  },
  
  // Check if a quiz is completed
  isQuizCompleted: (lessonId: string, quizId: string): boolean => {
    const progress = lessonService.getUserProgress(lessonId);
    return progress.completedQuizzes.includes(quizId);
  },
  
  // Check if final test is completed
  isFinalTestCompleted: (lessonId: string): boolean => {
    const progress = lessonService.getUserProgress(lessonId);
    return progress.testCompleted;
  },
  
  // Calculate overall lesson progress percentage
  calculateLessonProgress: (lessonId: string, totalSections: number): number => {
    const progress = lessonService.getUserProgress(lessonId);
    return Math.round((progress.completedSections.length / totalSections) * 100);
  }
};
