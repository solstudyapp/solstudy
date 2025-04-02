import { supabase } from "@/lib/supabase";

export interface UserQuizCompletion {
  id: string;
  quiz_id: string;
  lesson_id: string;
  score: number;
  points_earned: number;
  completed_at: string;
  quiz?: {
    title: string;
  };
  lesson?: {
    title: string;
  };
}

/**
 * Service for managing quizzes and user quiz completions
 */
export const quizService = {
  /**
   * Get all quizzes completed by the current user
   */
  async getCompletedQuizzes(): Promise<UserQuizCompletion[]> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }
      
      const { data, error } = await supabase
        .from("user_quizzes")
        .select(`
          *,
          quiz:quiz_id (
            title
          ),
          lesson:lesson_id (
            title
          )
        `)
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching completed quizzes:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in getCompletedQuizzes:", error);
      return [];
    }
  },
  
  /**
   * Check if a user has completed a specific quiz
   */
  async hasCompletedQuiz(quizId: string): Promise<boolean> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }
      
      const { data, error } = await supabase
        .from("user_quizzes")
        .select("id")
        .eq("user_id", user.id)
        .eq("quiz_id", quizId)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error checking quiz completion:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Error in hasCompletedQuiz:", error);
      return false;
    }
  },
  
  /**
   * Get the total points earned from quizzes
   */
  async getTotalQuizPoints(): Promise<number> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return 0;
      }
      
      const { data, error } = await supabase
        .from("user_quizzes")
        .select("points_earned")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching quiz points:", error);
        return 0;
      }
      
      // Sum up points
      return data?.reduce((sum, item) => sum + (item.points_earned || 0), 0) || 0;
    } catch (error) {
      console.error("Error in getTotalQuizPoints:", error);
      return 0;
    }
  },
  
  /**
   * Get a user's points for a specific quiz
   */
  async getQuizPoints(quizId: string): Promise<number> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return 0;
      }
      
      const { data, error } = await supabase
        .from("user_quizzes")
        .select("points_earned")
        .eq("user_id", user.id)
        .eq("quiz_id", quizId)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") { // No rows returned
          return 0;
        }
        console.error("Error fetching quiz points:", error);
        return 0;
      }
      
      return data?.points_earned || 0;
    } catch (error) {
      console.error("Error in getQuizPoints:", error);
      return 0;
    }
  }
}; 