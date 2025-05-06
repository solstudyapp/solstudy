
import { supabase } from "@/lib/supabase";
import { UserProgressData, CompletedLessonData } from "@/types/progress";

/**
 * Service for tracking user progress through lessons
 */
export const progressTrackingService = {
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
      
      // Convert to CompletedLessonData format
      return progressData.map(entry => {
        // Get the lesson data - ensure it's properly typed
        const lessonData = entry.lessons;
        
        if (!lessonData) {
          console.warn(`No lesson data found for lesson_id: ${entry.lesson_id}`);
          return null;
        }
        
        // Get completion date from updated_at
        const completedDate = entry.updated_at || new Date().toISOString();
        
        // Get earned points (use points_earned if available, otherwise use lesson.points)
        // Make sure we safely access properties that might not exist
        const earnedPoints = entry.points_earned || 
                            (typeof lessonData === 'object' && 'points' in lessonData ? lessonData.points : 0);
        
        // Extract properties safely, with fallbacks
        const title = typeof lessonData === 'object' && 'title' in lessonData ? 
                      lessonData.title as string : 
                      `Lesson ${entry.lesson_id}`;
                      
        const difficulty = typeof lessonData === 'object' && 'difficulty' in lessonData ? 
                          lessonData.difficulty as string : 
                          undefined;
        
        return {
          id: entry.lesson_id,
          lessonId: entry.lesson_id,
          completedDate: new Date(completedDate).toLocaleDateString(),
          earnedPoints: earnedPoints,
          title: title,
          difficulty: difficulty,
          scorePercentage: 0, // Default value
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
   * Mark a lesson as completed
   */
  async completeLesson(lessonId: string): Promise<{ success: boolean; error?: string }> {
    try {
      
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
   * Check if a page is completed
   */
  isPageCompleted: async (
    lessonId: string,
    sectionId: string,
    pageId: string | number
  ): Promise<boolean> => {
    try {
      // Ensure pageId is a string for consistency
      const pageIdStr = String(pageId);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }

      // Get the user progress record directly
      const { data, error } = await supabase
        .from("user_progress")
        .select("completed_pages")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();
      
      if (error) {
        console.error("Error checking page completion:", error);
        return false;
      }
      
      // Check if the page is in the completed_pages array
      if (data && data.completed_pages) {
        // Ensure completed_pages is an array
        const completedPages = Array.isArray(data.completed_pages) 
          ? data.completed_pages 
          : [];
        
        // Make sure all IDs are strings for comparison
        const normalizedCompletedPages = completedPages.map(id => String(id));
        
        const isCompleted = normalizedCompletedPages.includes(pageIdStr);
        return isCompleted;
      }
      
      return false;
    } catch (error) {
      console.error("Error in isPageCompleted:", error);
      return false;
    }
  },

  /**
   * Mark a page as completed for the user
   */
  markPageCompleted: async (
    lessonId: string,
    sectionId: string,
    pageId: string | number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Ensure pageId is a string for consistency
      const pageIdStr = String(pageId);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return { success: false, error: "No authenticated user found" };
      }

      // First check if the page is already completed
      const isAlreadyCompleted = await progressTrackingService.isPageCompleted(
        lessonId,
        sectionId,
        pageIdStr
      );
      
      if (isAlreadyCompleted) {
        return { success: true };
      }

      // First check if the user already has progress for this lesson
      const { data: existingProgress, error: checkError } = await supabase
        .from("user_progress")
        .select("id, completed_pages")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // Some other error occurred
        console.error("Error checking existing progress:", checkError);
        return { success: false, error: checkError.message };
      }

      if (existingProgress) {
        // User has existing progress, update the completed_pages array
        let completedPages = existingProgress.completed_pages || [];
        
        // Make sure we have an array even if the database value is malformed
        if (!Array.isArray(completedPages)) {
          completedPages = [];
        }
        
        // Make sure all IDs are strings for comparison
        const normalizedCompletedPages = completedPages.map(id => String(id));
        
        // Only add the page ID if it's not already in the array
        if (!normalizedCompletedPages.includes(pageIdStr)) {
          normalizedCompletedPages.push(pageIdStr);
        }

        // Update the progress record
        const { error: updateError } = await supabase
          .from("user_progress")
          .update({
            completed_pages: normalizedCompletedPages,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingProgress.id);

        if (updateError) {
          console.error("Error updating completed pages:", updateError);
          return { success: false, error: updateError.message };
        }
        
      } else {
        // No existing progress, create a new progress record
        const { error: insertError } = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            current_section_id: sectionId,
            current_page_id: pageIdStr,
            completed_pages: [pageIdStr],
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("Error creating progress record:", insertError);
          return { success: false, error: insertError.message };
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error in markPageCompleted:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  /**
   * Get all completed pages for a lesson
   */
  getCompletedPages: async (
    lessonId: string
  ): Promise<string[]> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      // Get the completed pages from user_progress
      const { data, error } = await supabase
        .from("user_progress")
        .select("completed_pages")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();
      
      if (error) {
        console.error("Error getting completed pages:", error);
        return [];
      }
      
      // Return the completed pages array, or an empty array if none exists
      if (data && data.completed_pages && Array.isArray(data.completed_pages)) {
        return data.completed_pages;
      }
      
      return [];
    } catch (error) {
      console.error("Error in getCompletedPages:", error);
      return [];
    }
  }
};
