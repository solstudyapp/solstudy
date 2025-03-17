import { supabase } from "@/lib/supabase";
import { LessonType } from "@/types/lesson";

export interface UserProgressData {
  lessonId: string;
  progress: number;
  lastActivity: string;
}

export interface CompletedLessonData {
  lessonId: string;
  completedDate: string;
  earnedPoints: number;
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

/**
 * Service for managing user progress in lessons
 */
export const userProgressService = {
  /**
   * Get courses in progress for the current user
   */
  getCoursesInProgress: async (): Promise<UserProgressData[]> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }
      
      // Get all lessons with progress data
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select(`
          lesson_id,
          completed,
          updated_at,
          lessons:lesson_id (
            id,
            title,
            difficulty,
            category,
            points
          )
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      
      if (progressError) {
        console.error("Error fetching user progress:", progressError);
        return [];
      }
      
      if (!progressData || progressData.length === 0) {
        return [];
      }
      
      // Group by lesson_id and calculate progress
      const lessonProgressMap = new Map<string, { 
        totalPages: number; 
        completedPages: number; 
        lastActivity: string;
        lesson: any;
      }>();
      
      // First, get all unique lesson IDs
      const lessonIds = [...new Set(progressData.map(p => p.lesson_id))];
      
      // For each lesson, get the total number of pages
      for (const lessonId of lessonIds) {
        if (!lessonId) continue;
        
        // Get the lesson data from the first entry
        const lessonData = progressData.find(p => p.lesson_id === lessonId)?.lessons;
        
        if (!lessonData) continue;
        
        // Get total pages for this lesson
        const { data: pagesData, error: pagesError } = await supabase
          .from("pages")
          .select("id")
          .eq("section_id", supabase.from("sections").select("id").eq("lesson_id", lessonId));
        
        if (pagesError) {
          console.error(`Error fetching pages for lesson ${lessonId}:`, pagesError);
          continue;
        }
        
        const totalPages = pagesData?.length || 0;
        
        // Count completed pages for this lesson
        const completedPages = progressData
          .filter(p => p.lesson_id === lessonId && p.completed)
          .length;
        
        // Get the most recent activity
        const lastActivity = progressData
          .filter(p => p.lesson_id === lessonId)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]?.updated_at;
        
        lessonProgressMap.set(lessonId, {
          totalPages,
          completedPages,
          lastActivity: lastActivity || new Date().toISOString(),
          lesson: lessonData
        });
      }
      
      // Convert to array and calculate progress percentage
      return Array.from(lessonProgressMap.entries())
        .map(([lessonId, data]) => {
          const progress = data.totalPages > 0 
            ? Math.round((data.completedPages / data.totalPages) * 100) 
            : 0;
          
          // Only include lessons that are in progress (not 0% and not 100%)
          if (progress > 0 && progress < 100) {
            return {
              lessonId,
              progress,
              lastActivity: data.lastActivity,
              ...data.lesson
            };
          }
          return null;
        })
        .filter(Boolean) as UserProgressData[];
    } catch (error) {
      console.error("Error in getCoursesInProgress:", error);
      return [];
    }
  },
  
  /**
   * Get completed courses for the current user
   */
  getCompletedCourses: async (): Promise<CompletedLessonData[]> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }
      
      // Get all lessons with progress data
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select(`
          lesson_id,
          completed,
          updated_at,
          lessons:lesson_id (
            id,
            title,
            difficulty,
            category,
            points
          )
        `)
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("updated_at", { ascending: false });
      
      if (progressError) {
        console.error("Error fetching completed courses:", progressError);
        return [];
      }
      
      if (!progressData || progressData.length === 0) {
        return [];
      }
      
      // Group by lesson_id
      const lessonCompletionMap = new Map<string, { 
        totalPages: number; 
        completedPages: number; 
        completedDate: string;
        lesson: any;
      }>();
      
      // First, get all unique lesson IDs
      const lessonIds = [...new Set(progressData.map(p => p.lesson_id))];
      
      // For each lesson, get the total number of pages
      for (const lessonId of lessonIds) {
        if (!lessonId) continue;
        
        // Get the lesson data from the first entry
        const lessonData = progressData.find(p => p.lesson_id === lessonId)?.lessons;
        
        if (!lessonData) continue;
        
        // Get total pages for this lesson
        const { data: pagesData, error: pagesError } = await supabase
          .from("pages")
          .select("id")
          .eq("section_id", supabase.from("sections").select("id").eq("lesson_id", lessonId));
        
        if (pagesError) {
          console.error(`Error fetching pages for lesson ${lessonId}:`, pagesError);
          continue;
        }
        
        const totalPages = pagesData?.length || 0;
        
        // Count completed pages for this lesson
        const completedPages = progressData
          .filter(p => p.lesson_id === lessonId && p.completed)
          .length;
        
        // Get the most recent completion date
        const completedDate = progressData
          .filter(p => p.lesson_id === lessonId && p.completed)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]?.updated_at;
        
        lessonCompletionMap.set(lessonId, {
          totalPages,
          completedPages,
          completedDate: completedDate || new Date().toISOString(),
          lesson: lessonData
        });
      }
      
      // Convert to array and filter for completed lessons (100% progress)
      return Array.from(lessonCompletionMap.entries())
        .map(([lessonId, data]) => {
          const progress = data.totalPages > 0 
            ? Math.round((data.completedPages / data.totalPages) * 100) 
            : 0;
          
          // Only include lessons that are completed (100%)
          if (progress === 100) {
            return {
              lessonId,
              completedDate: new Date(data.completedDate).toLocaleDateString(),
              earnedPoints: data.lesson.points || 0,
              ...data.lesson
            };
          }
          return null;
        })
        .filter(Boolean) as CompletedLessonData[];
    } catch (error) {
      console.error("Error in getCompletedCourses:", error);
      return [];
    }
  },
  
  /**
   * Update user progress for a specific page
   */
  async updateProgress(
    lessonId: string,
    sectionId: string,
    pageId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Updating progress for lesson ${lessonId}, section ${sectionId}, page ${pageId}`);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return { success: false, error: "Not authenticated" };
      }
      
      // Check if a progress record already exists
      const { data: existingProgress, error: fetchError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();
      
      if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 is "no rows returned" which is fine
        console.error("Error fetching progress:", fetchError);
        return { success: false, error: fetchError.message };
      }
      
      // If progress exists, update it; otherwise, create a new record
      if (existingProgress) {
        const { error: updateError } = await supabase
          .from("user_progress")
          .update({
            current_section_id: sectionId,
            current_page_id: pageId,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", existingProgress.id);
        
        if (updateError) {
          console.error("Error updating progress:", updateError);
          return { success: false, error: updateError.message };
        }
      } else {
        const { error: insertError } = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            current_section_id: sectionId,
            current_page_id: pageId,
            completed_sections: [],
            completed_quizzes: [],
            is_completed: false,
            points_earned: 0,
            last_accessed_at: new Date().toISOString(),
          });
        
        if (insertError) {
          console.error("Error creating progress:", insertError);
          return { success: false, error: insertError.message };
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error in updateProgress:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },
  
  /**
   * Mark a section as completed
   */
  async completeSection(
    lessonId: string,
    sectionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Completing section ${sectionId} for lesson ${lessonId}`);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return { success: false, error: "Not authenticated" };
      }
      
      // Get the current progress
      const { data: progress, error: fetchError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching progress:", fetchError);
        return { success: false, error: fetchError.message };
      }
      
      if (!progress) {
        // Create a new progress record with this section completed
        const { error: insertError } = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            current_section_id: sectionId,
            current_page_id: "",
            completed_sections: [sectionId],
            completed_quizzes: [],
            is_completed: false,
            points_earned: 0,
            last_accessed_at: new Date().toISOString(),
          });
        
        if (insertError) {
          console.error("Error creating progress with completed section:", insertError);
          return { success: false, error: insertError.message };
        }
      } else {
        // Update the existing progress record
        const completedSections = progress.completed_sections || [];
        
        // Only add the section if it's not already in the list
        if (!completedSections.includes(sectionId)) {
          completedSections.push(sectionId);
        }
        
        const { error: updateError } = await supabase
          .from("user_progress")
          .update({
            completed_sections: completedSections,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", progress.id);
        
        if (updateError) {
          console.error("Error updating completed sections:", updateError);
          return { success: false, error: updateError.message };
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error in completeSection:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },
  
  /**
   * Mark a quiz as completed and award points
   */
  async completeQuiz(
    lessonId: string,
    quizId: string,
    score: number,
    totalPoints: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Completing quiz ${quizId} for lesson ${lessonId} with score ${score}/${totalPoints}`);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return { success: false, error: "Not authenticated" };
      }
      
      // Calculate earned points based on score percentage
      const earnedPoints = Math.round((score / 100) * totalPoints);
      
      // Get the current progress
      const { data: progress, error: fetchError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();
      
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching progress:", fetchError);
        return { success: false, error: fetchError.message };
      }
      
      if (!progress) {
        // Create a new progress record with this quiz completed
        const { error: insertError } = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            current_section_id: "",
            current_page_id: "",
            completed_sections: [],
            completed_quizzes: [quizId],
            is_completed: false,
            points_earned: earnedPoints,
            last_accessed_at: new Date().toISOString(),
          });
        
        if (insertError) {
          console.error("Error creating progress with completed quiz:", insertError);
          return { success: false, error: insertError.message };
        }
      } else {
        // Update the existing progress record
        const completedQuizzes = progress.completed_quizzes || [];
        let totalPoints = progress.points_earned || 0;
        
        // Only add the quiz and points if it's not already completed
        if (!completedQuizzes.includes(quizId)) {
          completedQuizzes.push(quizId);
          totalPoints += earnedPoints;
        }
        
        const { error: updateError } = await supabase
          .from("user_progress")
          .update({
            completed_quizzes: completedQuizzes,
            points_earned: totalPoints,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", progress.id);
        
        if (updateError) {
          console.error("Error updating completed quizzes:", updateError);
          return { success: false, error: updateError.message };
        }
      }
      
      // Also update the user's total points in the users table
      await this.updateUserTotalPoints(user.id);
      
      return { success: true };
    } catch (error) {
      console.error("Error in completeQuiz:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },
  
  /**
   * Mark a lesson as completed
   */
  async completeLesson(
    lessonId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Marking lesson ${lessonId} as completed`);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return { success: false, error: "Not authenticated" };
      }
      
      // Get the current progress
      const { data: progress, error: fetchError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();
      
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching progress:", fetchError);
        return { success: false, error: fetchError.message };
      }
      
      if (!progress) {
        // Create a new progress record with the lesson marked as completed
        const { error: insertError } = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            current_section_id: "",
            current_page_id: "",
            completed_sections: [],
            completed_quizzes: [],
            is_completed: true,
            points_earned: 0,
            last_accessed_at: new Date().toISOString(),
          });
        
        if (insertError) {
          console.error("Error creating completed lesson progress:", insertError);
          return { success: false, error: insertError.message };
        }
      } else {
        // Update the existing progress record
        const { error: updateError } = await supabase
          .from("user_progress")
          .update({
            is_completed: true,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", progress.id);
        
        if (updateError) {
          console.error("Error marking lesson as completed:", updateError);
          return { success: false, error: updateError.message };
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error in completeLesson:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  },
  
  /**
   * Get total points for the current user
   */
  async getTotalPoints(): Promise<number> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return 0;
      }
  
      const { data: userPoints, error } = await supabase
        .from("user_profiles")
        .select("points")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching completed lessons:", error);
        return 0;
      }
      
      return userPoints[0].points;
    } catch (error) {
      console.error("Error in getTotalPoints:", error);
      return 0;
    }
  },
  
  /**
   * Update the user's total points in the users table
   */
  async updateUserTotalPoints(userId: string): Promise<void> {
    try {
      // Get all completed lessons for this user
      const { data: completedLessons, error } = await supabase
        .from("user_progress")
        .select("points_earned")
        .eq("user_id", userId);
      
      if (error) {
        console.error("Error fetching completed lessons:", error);
        return;
      }
      
      // Sum up points from all completed lessons
      const totalPoints = completedLessons.reduce((sum, lesson: any) => {
        return sum + (lesson.points_earned || 0);
      }, 0);
      
      // Update the user's total points
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ points: totalPoints })
        .eq("id", userId);
      
      if (updateError) {
        console.error("Error updating user total points:", updateError);
      }
    } catch (error) {
      console.error("Error in updateUserTotalPoints:", error);
    }
  },
  
  /**
   * Get points history for the last 30 days
   */
  getPointsHistory: async (): Promise<PointsHistoryData[]> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }
      
      // Calculate date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 29); // 30 days including today
      
      // Get all completed lessons with points in the date range
      const { data: completedLessons, error: completedError } = await supabase
        .from("user_progress")
        .select(`
          lesson_id,
          updated_at,
          lessons:lesson_id (
            points
          )
        `)
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("updated_at", startDate.toISOString())
        .lte("updated_at", endDate.toISOString())
        .order("updated_at", { ascending: true });
      
      if (completedError) {
        console.error("Error fetching points history:", completedError);
        return [];
      }
      
      // Create a map of dates to points
      const pointsMap = new Map<string, { coursePoints: number, referralPoints: number }>();
      
      // Initialize all dates in the range with zero points
      for (let i = 0; i <= 29; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        pointsMap.set(dateStr, { coursePoints: 0, referralPoints: 0 });
      }
      
      // Add course points
      if (completedLessons && completedLessons.length > 0) {
        completedLessons.forEach((lesson: any) => {
          const date = new Date(lesson.updated_at);
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const points = lesson.lessons?.points || 0;
          
          const existing = pointsMap.get(dateStr) || { coursePoints: 0, referralPoints: 0 };
          pointsMap.set(dateStr, {
            ...existing,
            coursePoints: existing.coursePoints + points
          });
        });
      }
      
      // Add referral points - commented out until referral table exists
      // This is a placeholder for future implementation
      /*
      try {
        const { data: referralData, error: referralError } = await supabase
          .from("referrals")
          .select("points, created_at")
          .eq("referrer_id", user.id)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .order("created_at", { ascending: true });
        
        if (referralError) {
          console.error("Error fetching referral points:", referralError);
        } else if (referralData && referralData.length > 0) {
          referralData.forEach((referral: { points: number; created_at: string }) => {
            const date = new Date(referral.created_at);
            const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const points = referral.points || 0;
            
            const existing = pointsMap.get(dateStr) || { coursePoints: 0, referralPoints: 0 };
            pointsMap.set(dateStr, {
              ...existing,
              referralPoints: existing.referralPoints + points
            });
          });
        }
      } catch (error) {
        console.error("Error processing referral data:", error);
      }
      */
      
      // Convert map to array and sort by date
      const result: PointsHistoryData[] = Array.from(pointsMap.entries())
        .map(([date, points]) => ({
          date,
          coursePoints: points.coursePoints,
          referralPoints: points.referralPoints
        }))
        .sort((a, b) => {
          // Convert "Jan 1" format to Date for sorting
          const dateA = new Date(a.date + ", " + new Date().getFullYear());
          const dateB = new Date(b.date + ", " + new Date().getFullYear());
          return dateA.getTime() - dateB.getTime();
        });
      
      return result;
    } catch (error) {
      console.error("Error in getPointsHistory:", error);
      return [];
    }
  },
  
  /**
   * Check if a page is completed
   */
  isPageCompleted: async (lessonId: string, sectionId: string, pageId: string): Promise<boolean> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }
      
      // Check if this page is completed
      const { data, error } = await supabase
        .from("user_progress")
        .select("completed")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .eq("section_id", sectionId)
        .eq("page_id", pageId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return false;
        }
        console.error("Error checking page completion:", error);
        return false;
      }
      
      return data?.completed || false;
    } catch (error) {
      console.error("Error in isPageCompleted:", error);
      return false;
    }
  },

  /**
   * Get referral history for the current user
   */
  getReferralHistory: async (): Promise<ReferralHistoryData[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      // First get the user's referral codes
      const { data: referralCodes, error: codesError } = await supabase
        .from("referral_codes")
        .select("id")
        .eq("referrer_id", user.id);
      
      if (codesError) {
        console.error("Error fetching referral codes:", codesError);
        return [];
      }
      
      if (!referralCodes || referralCodes.length === 0) {
        return [];
      }
      
      // Get all referrals that use any of these codes
      const referralCodeIds = referralCodes.map(code => code.id);
      
      const { data, error } = await supabase
        .from("referrals")
        .select(`
          *,
          referee:user_profiles!referee_id(
            id,
            full_name,
            email,
            user_id
          ),
          referral_code:referral_codes!referral_code_id(
            code,
            referrer_id
          )
        `)
        .in("referral_code_id", referralCodeIds)
        .order("created_at", { ascending: false });

      console.log("Referral history:", data);
      if (error) {
        console.error("Error fetching referral history:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getReferralHistory:", error);
      return [];
    }
  }
}; 