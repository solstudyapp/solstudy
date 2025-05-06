
import { supabase } from "@/lib/supabase";

/**
 * Service for managing user points
 */
export const pointsService = {
  /**
   * Get total points for the current user
   */
  getTotalPoints: async (): Promise<number> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return 0;
      }
      
      // Get user profile which contains the total points
      const { data, error } = await supabase
        .from("user_profiles")
        .select("points")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user points:", error);
        return 0;
      }
      
      return data?.points || 0;
    } catch (error) {
      console.error("Error in getTotalPoints:", error);
      return 0;
    }
  },
  
  /**
   * Get points history for the current user
   */
  getPointsHistory: async (): Promise<any[]> => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }
      
      // Fetch points from various sources and combine them
      
      // 1. Fetch course points from user_progress
      const { data: progressPoints, error: progressError } = await supabase
        .from("user_progress")
        .select("points_earned, updated_at")
        .eq("user_id", user.id)
        .not("points_earned", "is", null)
        .order("updated_at", { ascending: false });
      
      if (progressError) {
        console.error("Error fetching progress points:", progressError);
      }
      
      // 2. Fetch quiz points from user_quizzes
      const { data: quizPoints, error: quizError } = await supabase
        .from("user_quizzes")
        .select("points_earned, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      
      if (quizError) {
        console.error("Error fetching quiz points:", quizError);
      }
      
      // 3. Fetch referral points
      const { data: referralPoints, error: referralError } = await supabase
        .from("referrals")
        .select(`
          points_earned, 
          completed_at,
          referral_code:referral_codes(
            referrer_id
          )
        `)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });
      
      if (referralError) {
        console.error("Error fetching referral points:", referralError);
      }
      
      // Filter referrals to only include those where the user is the referrer
      const userReferrals = referralPoints?.filter(
        ref => ref.referral_code?.referrer_id === user.id
      ) || [];
      
      // Combine all points data
      const pointsHistory = [];
      
      // Add course progress points
      if (progressPoints) {
        for (const progress of progressPoints) {
          if (progress.points_earned) {
            pointsHistory.push({
              date: progress.updated_at,
              amount: progress.points_earned,
              type: 'course'
            });
          }
        }
      }
      
      // Add quiz points
      if (quizPoints) {
        for (const quiz of quizPoints) {
          pointsHistory.push({
            date: quiz.completed_at,
            amount: quiz.points_earned,
            type: 'quiz'
          });
        }
      }
      
      // Add referral points
      if (userReferrals) {
        for (const referral of userReferrals) {
          pointsHistory.push({
            date: referral.completed_at,
            amount: referral.points_earned,
            type: 'referral'
          });
        }
      }
      
      // Sort by date (newest first)
      pointsHistory.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Limit to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return pointsHistory.filter(item => 
        new Date(item.date) >= thirtyDaysAgo
      );
    } catch (error) {
      console.error("Error in getPointsHistory:", error);
      return [];
    }
  }
};
