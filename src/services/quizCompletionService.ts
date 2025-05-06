
import { supabase } from "@/lib/supabase";

/**
 * Service for managing quiz completions
 */
export const quizCompletionService = {
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
  }
};
