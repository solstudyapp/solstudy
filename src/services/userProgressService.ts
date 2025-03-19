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
  quizPoints: number;
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
          id,
          lesson_id,
          is_completed,
          updated_at,
          completed_sections,
          completed_quizzes,
          current_section_id,
          current_page_id,
          lessons:lesson_id (
            id,
            title,
            difficulty,
            category,
            points
          )
        `)
        .eq("user_id", user.id)
        .eq("is_completed", false) // Only get lessons not marked as completed
        .order("updated_at", { ascending: false });
      
      if (progressError) {
        console.error("Error fetching user progress:", progressError);
        return [];
      }
      
      if (!progressData || progressData.length === 0) {
        return [];
      }
      
      console.log("Found courses in progress:", progressData.length, progressData);
      
      // Process each lesson in progress
      const userProgressData: UserProgressData[] = [];
      
      for (const entry of progressData) {
        try {
          const lessonData = entry.lessons;
          
          if (!lessonData) {
            console.warn(`No lesson data found for lesson_id: ${entry.lesson_id}`);
            continue;
          }
          
          // Get the lesson ID
          const lessonId = entry.lesson_id;
          
          // Get the most recent activity timestamp
          const lastActivity = entry.updated_at || new Date().toISOString();
          
          // Safely handle potentially malformed JSON data
          let completedSections: string[] = [];
          if (entry.completed_sections) {
            try {
              // If it's already an array, use it directly
              if (Array.isArray(entry.completed_sections)) {
                completedSections = entry.completed_sections;
              } 
              // If it's a string (malformed JSON), try to parse it
              else if (typeof entry.completed_sections === 'string') {
                // Handle malformed JSON by extracting IDs using regex
                const matches = entry.completed_sections.match(/"([^"]+)"/g);
                if (matches) {
                  completedSections = matches.map(m => m.replace(/"/g, ''));
                }
              }
            } catch (e) {
              console.error(`Error parsing completed_sections for lesson ${lessonId}:`, e);
            }
          }
          
          // Get all sections for this lesson to calculate progress
          const { data: sectionsData, error: sectionsError } = await supabase
            .from("sections")
            .select("id")
            .eq("lesson_id", lessonId);
          
          if (sectionsError) {
            console.error(`Error fetching sections for lesson ${lessonId}:`, sectionsError);
            continue;
          }
          
          const totalSections = sectionsData?.length || 0;
          if (totalSections === 0) continue; // Skip lessons with no sections
          
          // Calculate progress as a percentage of completed sections
          const progress = totalSections > 0 
            ? Math.round((completedSections.length / totalSections) * 100) 
            : 0;
          
          // Only include if progress is between 0 and 99%
          if (progress >= 0 && progress < 100) {
            userProgressData.push({
              lessonId,
              progress,
              lastActivity,
              ...lessonData
            });
          }
        } catch (error) {
          console.error(`Error processing lesson progress for ${entry.lesson_id}:`, error);
        }
      }
      
      return userProgressData;
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
          id,
          lesson_id,
          is_completed,
          updated_at,
          completed_sections,
          completed_quizzes,
          points_earned,
          lessons:lesson_id (
            id,
            title,
            difficulty,
            category,
            points
          )
        `)
        .eq("user_id", user.id)
        .eq("is_completed", true)
        .order("updated_at", { ascending: false });
      
      if (progressError) {
        console.error("Error fetching completed courses:", progressError);
        return [];
      }
      
      if (!progressData || progressData.length === 0) {
        return [];
      }
      
      console.log("Found completed courses:", progressData.length, progressData);
      
      // Convert to CompletedLessonData format
      return progressData.map(entry => {
        // Get the lesson data
        const lessonData = entry.lessons;
        
        if (!lessonData) {
          console.warn(`No lesson data found for lesson_id: ${entry.lesson_id}`);
          return null;
        }
        
        // Get completion date from updated_at
        const completedDate = entry.updated_at || new Date().toISOString();
        
        // Get earned points (use points_earned if available, otherwise use lesson.points)
        const earnedPoints = entry.points_earned || (lessonData as any).points || 0;
        
        return {
          lessonId: entry.lesson_id,
          completedDate: new Date(completedDate).toLocaleDateString(),
          earnedPoints: earnedPoints,
          ...lessonData
        };
      }).filter(Boolean) as CompletedLessonData[];
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
        if (progress.is_completed) {
          return { success: true };
        }
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
    earnedPoints: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Completing quiz ${quizId} for lesson ${lessonId} with score ${score} and earned points ${earnedPoints}`);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return { success: false, error: "Not authenticated" };
      }
      
      // First check if the user has already completed this quiz
      const { data: existingCompletion, error: checkError } = await supabase
        .from("user_quizzes")
        .select("id, points_earned, completed_at")
        .eq("user_id", user.id)
        .eq("quiz_id", quizId)
        .single();
      
      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing quiz completion:", checkError);
        return { success: false, error: checkError.message };
      }
      
      // If the user has already completed this quiz, return early
      if (existingCompletion) {
        console.log(`User has already completed quiz ${quizId} on ${existingCompletion.completed_at} and earned ${existingCompletion.points_earned} points`);
        return { success: true, error: "Quiz already completed" };
      }
      
      // Record the quiz completion in user_quizzes table
      const { error: insertError } = await supabase
        .from("user_quizzes")
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          lesson_id: lessonId,
          score: score, // score as percentage
          points_earned: earnedPoints,
          completed_at: new Date().toISOString(),
        });
      
      if (insertError) {
        console.error("Error recording quiz completion:", insertError);
        return { success: false, error: insertError.message };
      }
      
      console.log(`Recorded quiz completion for user ${user.id}, quiz ${quizId}, earned ${earnedPoints} points`);
      
      // Also update the user_progress table to mark this quiz as completed
      // This is helpful for tracking overall lesson progress
      const { data: progress, error: fetchError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();
      
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching user progress:", fetchError);
        // Continue even if this fails, as the important part is the user_quizzes record
      }
      
      if (progress) {
        // Update the existing progress record
        const completedQuizzes = progress.completed_quizzes || [];
        
        // Only add the quiz if it's not already in the list
        if (!completedQuizzes.includes(quizId)) {
          completedQuizzes.push(quizId);
          
          const { error: updateError } = await supabase
            .from("user_progress")
            .update({
              completed_quizzes: completedQuizzes,
              last_accessed_at: new Date().toISOString(),
            })
            .eq("id", progress.id);
          
          if (updateError) {
            console.error("Error updating user progress:", updateError);
            // Continue even if this fails
          }
        }
      }
      
      // The database trigger will automatically update the user's total points
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
      
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("points")
        .eq("id", lessonId)
        .single();
        
      if (lessonError) {
        console.error("Error fetching lesson:", lessonError);
        return { success: false, error: lessonError.message };
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
            points_earned: lesson.points,
            last_accessed_at: new Date().toISOString(),
          });
        
        if (insertError) {
          console.error("Error creating completed lesson progress:", insertError);
          return { success: false, error: insertError.message };
        }
      } else {
        if (progress.is_completed) {
          return { success: true };
        }
        // Update the existing progress record
        const { error: updateError } = await supabase
          .from("user_progress")
          .update({
            is_completed: true,
            points_earned: lesson.points,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", progress.id);
        
        if (updateError) {
          console.error("Error marking lesson as completed:", updateError);
          return { success: false, error: updateError.message };
        }
      }
      
      // The database trigger now handles updating the user's total points
      
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
        console.error("Error fetching user points:", error);
        return 0;
      }
      
      return userPoints[0].points;
    } catch (error) {
      console.error("Error in getTotalPoints:", error);
      return 0;
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
      
      // Create a map of dates to points
      const pointsMap = new Map<string, { coursePoints: number, referralPoints: number, quizPoints: number }>();
      
      // Initialize all dates in the range with zero points
      for (let i = 0; i <= 29; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        pointsMap.set(dateStr, { coursePoints: 0, referralPoints: 0, quizPoints: 0 });
      }
      
      // 1. Get course points from user_progress table
      const { data: userProgressPoints, error: progressError } = await supabase
        .from("user_progress")
        .select("points_earned, updated_at")
        .eq("user_id", user.id)
        .gte("updated_at", startDate.toISOString())
        .lte("updated_at", endDate.toISOString())
        .order("updated_at", { ascending: true });
      
      if (progressError) {
        console.error("Error fetching user progress points:", progressError);
      } else if (userProgressPoints && userProgressPoints.length > 0) {
        userProgressPoints.forEach((progress: { points_earned: number; updated_at: string }) => {
          const date = new Date(progress.updated_at);
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const points = progress.points_earned || 0;
          
          const existing = pointsMap.get(dateStr) || { coursePoints: 0, referralPoints: 0, quizPoints: 0 };
          pointsMap.set(dateStr, {
            ...existing,
            coursePoints: existing.coursePoints + points
          });
        });
      }
      
      // 2. Get referral points
      // First get the user's referral codes
      const { data: referralCodes, error: codesError } = await supabase
        .from("referral_codes")
        .select("id")
        .eq("referrer_id", user.id);
      
      if (codesError) {
        console.error("Error fetching referral codes:", codesError);
      } else if (referralCodes && referralCodes.length > 0) {
        // Get points from referrals using these codes
        const referralCodeIds = referralCodes.map(code => code.id);
        
        const { data: referralPoints, error: referralError } = await supabase
          .from("referrals")
          .select("points_earned, created_at, status")
          .in("referral_code_id", referralCodeIds)
          .eq("status", "completed") // Only count completed referrals
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .order("created_at", { ascending: true });
        
        if (referralError) {
          console.error("Error fetching referral points:", referralError);
        } else if (referralPoints && referralPoints.length > 0) {
          referralPoints.forEach((referral: { points_earned: number; created_at: string }) => {
            const date = new Date(referral.created_at);
            const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const points = referral.points_earned || 0;
            
            const existing = pointsMap.get(dateStr) || { coursePoints: 0, referralPoints: 0, quizPoints: 0 };
            pointsMap.set(dateStr, {
              ...existing,
              referralPoints: existing.referralPoints + points
            });
          });
        }
      }
      
      // 3. Get quiz points from user_quizzes table
      const { data: quizPoints, error: quizError } = await supabase
        .from("user_quizzes")
        .select("points_earned, completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", startDate.toISOString())
        .lte("completed_at", endDate.toISOString())
        .order("completed_at", { ascending: true });
      
      if (quizError) {
        console.error("Error fetching quiz points:", quizError);
      } else if (quizPoints && quizPoints.length > 0) {
        quizPoints.forEach((quiz: { points_earned: number; completed_at: string }) => {
          const date = new Date(quiz.completed_at);
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const points = quiz.points_earned || 0;
          
          const existing = pointsMap.get(dateStr) || { coursePoints: 0, referralPoints: 0, quizPoints: 0 };
          pointsMap.set(dateStr, {
            ...existing,
            quizPoints: existing.quizPoints + points
          });
        });
      }
      
      // Convert map to array and sort by date
      const result: PointsHistoryData[] = Array.from(pointsMap.entries())
        .map(([date, points]) => ({
          date,
          coursePoints: points.coursePoints,
          referralPoints: points.referralPoints,
          quizPoints: points.quizPoints
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