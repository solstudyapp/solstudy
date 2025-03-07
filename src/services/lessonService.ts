import { Quiz, Section, UserProgress } from "@/types/lesson";

// Mock data storage - in a real app, this would be a database
const userProgressStore: Record<string, UserProgress> = {};
const completedQuizzesStore: Record<string, string[]> = {};
const userPointsStore: Record<string, number> = {};
const userFeedbackStore: Record<string, number> = {};
const completedCoursesStore: Record<string, string[]> = {};

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
      
      // Mark final test completion if applicable
      if (quiz.isFinalTest) {
        progress.testCompleted = true;
      }
    }
    
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
  
  // Calculate overall lesson progress percentage
  calculateLessonProgress: (lessonId: string, totalSections: number): number => {
    const progress = lessonService.getUserProgress(lessonId);
    return Math.round((progress.completedSections.length / totalSections) * 100);
  },
  
  // Mark a course as fully completed
  completeCourse: (lessonId: string): void => {
    const key = `${CURRENT_USER_ID}-${lessonId}`;
    const progress = lessonService.getUserProgress(lessonId);
    
    // Mark test as completed
    progress.testCompleted = true;
    
    // Add to completed courses
    if (!completedCoursesStore[CURRENT_USER_ID]) {
      completedCoursesStore[CURRENT_USER_ID] = [];
    }
    
    if (!completedCoursesStore[CURRENT_USER_ID].includes(lessonId)) {
      completedCoursesStore[CURRENT_USER_ID].push(lessonId);
    }
    
    userProgressStore[key] = progress;
  },
  
  // Check if a course is completed
  isCourseCompleted: (lessonId: string): boolean => {
    return completedCoursesStore[CURRENT_USER_ID]?.includes(lessonId) || false;
  }
};
