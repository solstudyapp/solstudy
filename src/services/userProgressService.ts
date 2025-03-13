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

interface ReferralData {
  points: number;
  created_at: string;
}

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
   * Update user progress when a page is completed
   */
  updatePageProgress: async (pageData: PageCompletionData): Promise<boolean> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }
      
      // Check if this progress entry already exists
      const { data: existingProgress, error: checkError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", pageData.lessonId)
        .eq("section_id", pageData.sectionId)
        .eq("page_id", pageData.pageId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected if no entry exists
        console.error("Error checking existing progress:", checkError);
        return false;
      }
      
      // If entry exists, update it
      if (existingProgress) {
        const { error: updateError } = await supabase
          .from("user_progress")
          .update({
            completed: pageData.completed,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id)
          .eq("lesson_id", pageData.lessonId)
          .eq("section_id", pageData.sectionId)
          .eq("page_id", pageData.pageId);
        
        if (updateError) {
          console.error("Error updating progress:", updateError);
          return false;
        }
      } else {
        // If no entry exists, create a new one
        const { error: insertError } = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            lesson_id: pageData.lessonId,
            section_id: pageData.sectionId,
            page_id: pageData.pageId,
            completed: pageData.completed,
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error("Error inserting progress:", insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error in updatePageProgress:", error);
      return false;
    }
  },
  
  /**
   * Mark a section as completed
   */
  completeSectionProgress: async (lessonId: string, sectionId: string): Promise<boolean> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }
      
      // Get all pages for this section
      const { data: pages, error: pagesError } = await supabase
        .from("pages")
        .select("id")
        .eq("section_id", sectionId);
      
      if (pagesError) {
        console.error("Error fetching pages:", pagesError);
        return false;
      }
      
      if (!pages || pages.length === 0) {
        console.error("No pages found for section:", sectionId);
        return false;
      }
      
      // Mark all pages as completed
      const updatePromises = pages.map(page => {
        return userProgressService.updatePageProgress({
          lessonId,
          sectionId,
          pageId: page.id,
          completed: true
        });
      });
      
      await Promise.all(updatePromises);
      
      return true;
    } catch (error) {
      console.error("Error in completeSectionProgress:", error);
      return false;
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
        completedLessons.forEach(lesson => {
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
   * Get total points earned by the user
   */
  getTotalPoints: async (): Promise<number> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return 0;
      }
      
      // Get all completed lessons
      const { data: completedLessons, error: completedError } = await supabase
        .from("user_progress")
        .select(`
          lesson_id,
          lessons:lesson_id (
            points
          )
        `)
        .eq("user_id", user.id)
        .eq("completed", true);
      
      if (completedError) {
        console.error("Error fetching completed lessons:", completedError);
        return 0;
      }
      
      if (!completedLessons || completedLessons.length === 0) {
        return 0;
      }
      
      // Sum up points from all completed lessons
      const totalPoints = completedLessons.reduce((sum, lesson: any) => {
        return sum + (lesson.lessons?.points || 0);
      }, 0);
      
      return totalPoints;
    } catch (error) {
      console.error("Error in getTotalPoints:", error);
      return 0;
    }
  }
}; 