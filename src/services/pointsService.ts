
import { supabase } from "@/lib/supabase";
import { PointsHistoryData } from "@/types/progress";

/**
 * Service for managing user points
 */
export const pointsService = {
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
      const pointsMap = new Map<string, { coursePoints: number, referralPoints: number, quizPoints: number, testPoints: number }>();
      
      // Initialize all dates in the range with zero points
      for (let i = 0; i <= 29; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        pointsMap.set(dateStr, { coursePoints: 0, referralPoints: 0, quizPoints: 0, testPoints: 0 });
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
          
          const existing = pointsMap.get(dateStr) || { coursePoints: 0, referralPoints: 0, quizPoints: 0, testPoints: 0 };
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
            
            const existing = pointsMap.get(dateStr) || { coursePoints: 0, referralPoints: 0, quizPoints: 0, testPoints: 0 };
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
          
          const existing = pointsMap.get(dateStr) || { coursePoints: 0, referralPoints: 0, quizPoints: 0, testPoints: 0 };
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
          quizPoints: points.quizPoints,
          testPoints: points.testPoints
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
  }
};
