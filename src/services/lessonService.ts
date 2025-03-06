
import { Quiz, Section, UserProgress } from "@/types/lesson";
import { supabase } from "@/lib/supabase";

export const lessonService = {
  // Get or initialize user progress for a lesson
  getUserProgress: async (lessonId: string): Promise<UserProgress> => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const userId = user.id;
    
    // Try to fetch existing progress
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('userId', userId)
      .eq('lessonId', lessonId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching progress:', error);
    }
    
    // If no progress exists, create a new one
    if (!data) {
      const newProgress: UserProgress = {
        userId,
        lessonId,
        currentSectionId: "section1",
        currentPageId: "page1",
        completedSections: [],
        completedQuizzes: [],
        testCompleted: false,
        earnedPoints: 0
      };
      
      const { error: insertError } = await supabase
        .from('user_progress')
        .insert(newProgress);
      
      if (insertError) {
        console.error('Error creating progress:', insertError);
      }
      
      return newProgress;
    }
    
    return data as UserProgress;
  },
  
  // Update user progress
  updateProgress: async (lessonId: string, sectionId: string, pageId: string): Promise<void> => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('user_progress')
      .update({
        currentSectionId: sectionId,
        currentPageId: pageId
      })
      .eq('userId', user.id)
      .eq('lessonId', lessonId);
    
    if (error) {
      console.error('Error updating progress:', error);
    }
  },
  
  // Mark a section as completed
  completeSection: async (lessonId: string, sectionId: string): Promise<void> => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get current progress
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('completedSections')
      .eq('userId', user.id)
      .eq('lessonId', lessonId)
      .single();
    
    if (!progressData) return;
    
    // Add to completed sections if not already there
    let completedSections = progressData.completedSections || [];
    if (!completedSections.includes(sectionId)) {
      completedSections.push(sectionId);
      
      const { error } = await supabase
        .from('user_progress')
        .update({ completedSections })
        .eq('userId', user.id)
        .eq('lessonId', lessonId);
      
      if (error) {
        console.error('Error completing section:', error);
      }
    }
  },
  
  // Mark a quiz as completed and award points
  completeQuiz: async (quiz: Quiz, score: number): Promise<void> => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get current progress
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('completedQuizzes, earnedPoints')
      .eq('userId', user.id)
      .eq('lessonId', quiz.lessonId)
      .single();
    
    if (!progressData) return;
    
    // Add to completed quizzes if not already there
    let completedQuizzes = progressData.completedQuizzes || [];
    let earnedPoints = progressData.earnedPoints || 0;
    
    if (!completedQuizzes.includes(quiz.id)) {
      completedQuizzes.push(quiz.id);
      
      // Calculate points based on score
      const newPoints = Math.round((score / quiz.questions.length) * quiz.rewardPoints);
      earnedPoints += newPoints;
      
      // Update progress
      const { error } = await supabase
        .from('user_progress')
        .update({
          completedQuizzes,
          earnedPoints,
          testCompleted: quiz.isFinalTest ? true : undefined
        })
        .eq('userId', user.id)
        .eq('lessonId', quiz.lessonId);
      
      if (error) {
        console.error('Error completing quiz:', error);
      }
      
      // Update user total points
      await supabase.rpc('increment_user_points', {
        user_id: user.id,
        points_to_add: newPoints
      });
    }
  },
  
  // Save user feedback for a lesson
  saveFeedback: async (lessonId: string, rating: number): Promise<void> => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('lesson_feedback')
      .upsert({
        userId: user.id,
        lessonId,
        rating
      }, {
        onConflict: 'userId, lessonId'
      });
    
    if (error) {
      console.error('Error saving feedback:', error);
    }
  },
  
  // Get total points for user
  getUserPoints: async (): Promise<number> => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return 0;
    }
    
    const { data } = await supabase
      .from('user_profiles')
      .select('total_points')
      .eq('id', user.id)
      .single();
    
    return data?.total_points || 0;
  },
  
  // Check if a section is completed
  isSectionCompleted: async (lessonId: string, sectionId: string): Promise<boolean> => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return false;
    }
    
    const { data } = await supabase
      .from('user_progress')
      .select('completedSections')
      .eq('userId', user.id)
      .eq('lessonId', lessonId)
      .single();
    
    return data?.completedSections?.includes(sectionId) || false;
  },
  
  // Check if a quiz is completed
  isQuizCompleted: async (lessonId: string, quizId: string): Promise<boolean> => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return false;
    }
    
    const { data } = await supabase
      .from('user_progress')
      .select('completedQuizzes')
      .eq('userId', user.id)
      .eq('lessonId', lessonId)
      .single();
    
    return data?.completedQuizzes?.includes(quizId) || false;
  },
  
  // Calculate overall lesson progress percentage
  calculateLessonProgress: async (lessonId: string, totalSections: number): Promise<number> => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return 0;
    }
    
    const { data } = await supabase
      .from('user_progress')
      .select('completedSections')
      .eq('userId', user.id)
      .eq('lessonId', lessonId)
      .single();
    
    if (!data || !data.completedSections) return 0;
    
    return Math.round((data.completedSections.length / totalSections) * 100);
  }
};
