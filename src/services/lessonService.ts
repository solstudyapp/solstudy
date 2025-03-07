
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
      // Initialize with appropriate first section/page based on lesson type
      let initialSectionId = "section1";
      let initialPageId = "page1";
      
      // For daily bonus lesson, use different initial values
      if (lessonId === "daily-bonus-lesson") {
        initialSectionId = "daily-bonus-section1";
        initialPageId = "daily-bonus-page1";
      }
      
      userProgressStore[key] = {
        userId: CURRENT_USER_ID,
        lessonId,
        currentSectionId: initialSectionId,
        currentPageId: initialPageId,
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
    console.log(`Progress updated for ${lessonId}: Section ${sectionId}, Page ${pageId}`);
  },
  
  // Mark a section as completed
  completeSection: (lessonId: string, sectionId: string): void => {
    const key = `${CURRENT_USER_ID}-${lessonId}`;
    const progress = lessonService.getUserProgress(lessonId);
    
    if (!progress.completedSections.includes(sectionId)) {
      progress.completedSections.push(sectionId);
      console.log(`Section ${sectionId} completed for lesson ${lessonId}`);
    }
    
    userProgressStore[key] = progress;
  },
  
  // Mark a quiz as completed and award points
  completeQuiz: (quiz: Quiz, score: number): void => {
    if (!quiz) {
      console.error("Cannot complete quiz: quiz is undefined");
      return;
    }
    
    const key = `${CURRENT_USER_ID}-${quiz.lessonId}`;
    const progress = lessonService.getUserProgress(quiz.lessonId);
    
    if (!progress.completedQuizzes.includes(quiz.id)) {
      progress.completedQuizzes.push(quiz.id);
      
      // Calculate points based on score
      const earnedPoints = Math.round((score / quiz.questions.length) * quiz.rewardPoints);
      progress.earnedPoints += earnedPoints;
      
      // Update user total points
      userPointsStore[CURRENT_USER_ID] = (userPointsStore[CURRENT_USER_ID] || 0) + earnedPoints;
      
      console.log(`Quiz ${quiz.id} completed with score ${score}/${quiz.questions.length} and earned ${earnedPoints} points`);
    }
    
    userProgressStore[key] = progress;
  },
  
  // Mark the final test as completed
  completeFinalTest: (lessonId: string): void => {
    const key = `${CURRENT_USER_ID}-${lessonId}`;
    const progress = lessonService.getUserProgress(lessonId);
    
    progress.testCompleted = true;
    userProgressStore[key] = progress;
    console.log(`Final test completed for lesson ${lessonId}`);
  },
  
  // Save user feedback for a lesson
  saveFeedback: (lessonId: string, rating: number): void => {
    userFeedbackStore[`${CURRENT_USER_ID}-${lessonId}`] = rating;
    console.log(`Feedback saved for lesson ${lessonId}: rating ${rating}`);
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
