
import { useState, useEffect } from "react";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Zap, 
  Award, 
  Clock, 
  BookOpen
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { PointsChart } from "./PointsChart";
import { userProgressService } from "@/services/userProgressService";
import { pointsService } from "@/services/pointsService";
import { supabase } from "@/lib/supabase";

export function OverviewTab() {
  const [pointsData, setPointsData] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    loginStreak: 0,
    lastActive: "",
    referralsCount: 0,
    percentileRank: 0,
    lessonsCompleted: 0,
    pointsChange7d: 0,
    pointsChange30d: 0,
    rankPercentile: 0,
    referralPointsEarned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch points history - real data
        const pointsHistoryData = await pointsService.getPointsHistory();
        
        if (pointsHistoryData && pointsHistoryData.length > 0) {
          // Transform the data for the chart
          const chartData = pointsHistoryData.map(item => {
            // Format date for display
            const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            
            return {
              date: formattedDate,
              [item.type + 'Points']: item.amount,
              total: item.amount
            };
          });
          
          setPointsData(chartData);
        }

        // Fetch real user stats
        const totalPoints = await pointsService.getTotalPoints();
        
        // Get referrals data
        const { data: referralsData, error: refError } = await supabase
          .from("referrals")
          .select(`
            id,
            points_earned,
            referral_code:referral_codes!referral_code_id (
              referrer_id
            )
          `)
          .eq("status", "completed");
          
        if (refError) {
          console.error("Error fetching referrals:", refError);
        }
        
        // Filter to get only the user's referrals
        const { data: { user } } = await supabase.auth.getUser();
        const userReferrals = referralsData?.filter(
          ref => ref.referral_code?.referrer_id === user?.id
        ) || [];
        
        // Get completed courses
        const completedCourses = await userProgressService.getCompletedCourses();
        
        // Get login streak from user_profiles
        const { data: userProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("login_streak, last_login")
          .eq("user_id", user?.id)
          .single();
          
        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching user profile:", profileError);
        }
        
        // Calculate points percentile (estimate using ranking)
        const { data: userRank, error: rankError } = await supabase
          .rpc('get_user_points_rank', { user_id_param: user?.id });
          
        let percentile = 50; // Default to middle if we can't calculate
        
        if (!rankError && userRank) {
          percentile = Math.round(userRank * 100);
          if (percentile > 99) percentile = 99; // Cap at 99%
          if (percentile < 1) percentile = 1; // Minimum 1%
        }
        
        // Calculate points change (last 7 days vs previous 7 days)
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);
        
        // Find points in these periods
        const pointsLast7Days = pointsHistoryData
          .filter(p => new Date(p.date) >= sevenDaysAgo)
          .reduce((sum, p) => sum + p.amount, 0);
          
        const pointsPrevious7Days = pointsHistoryData
          .filter(p => new Date(p.date) >= fourteenDaysAgo && new Date(p.date) < sevenDaysAgo)
          .reduce((sum, p) => sum + p.amount, 0);
        
        // Calculate percent change, handle division by zero
        let pointsChange7d = 0;
        if (pointsPrevious7Days > 0) {
          pointsChange7d = Math.round(((pointsLast7Days - pointsPrevious7Days) / pointsPrevious7Days) * 100);
        } else if (pointsLast7Days > 0) {
          pointsChange7d = 100; // Infinite growth, cap at 100%
        }
        
        // Calculate points change (last 30 days vs previous 30 days)
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        const sixtyDaysAgo = new Date(now);
        sixtyDaysAgo.setDate(now.getDate() - 60);
        
        const pointsLast30Days = pointsHistoryData
          .filter(p => new Date(p.date) >= thirtyDaysAgo)
          .reduce((sum, p) => sum + p.amount, 0);
          
        const pointsPrevious30Days = pointsHistoryData
          .filter(p => new Date(p.date) >= sixtyDaysAgo && new Date(p.date) < thirtyDaysAgo)
          .reduce((sum, p) => sum + p.amount, 0);
        
        let pointsChange30d = 0;
        if (pointsPrevious30Days > 0) {
          pointsChange30d = Math.round(((pointsLast30Days - pointsPrevious30Days) / pointsPrevious30Days) * 100);
        } else if (pointsLast30Days > 0) {
          pointsChange30d = 100; // Infinite growth, cap at 100%
        }
        
        // Get referral points earned
        const referralPointsEarned = userReferrals.reduce((sum, ref) => sum + (ref.points_earned || 0), 0);
        
        setUserStats({
          totalPoints,
          loginStreak: userProfile?.login_streak || 0,
          lastActive: userProfile?.last_login ? new Date(userProfile.last_login).toLocaleDateString() : new Date().toLocaleDateString(),
          referralsCount: userReferrals.length,
          percentileRank: percentile,
          lessonsCompleted: completedCourses.length,
          pointsChange7d,
          pointsChange30d,
          rankPercentile: percentile,
          referralPointsEarned
        });
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Points"
          value={userStats.totalPoints}
          description="Across all activities"
          icon={Trophy}
          gradientClass="from-[#14F195] to-[#9945FF]"
        />
        <StatsCard
          title="Login Streak"
          value={`${userStats.loginStreak} days`}
          description="Keep it going!"
          icon={Zap}
          gradientClass="from-[#FF4500] to-[#FFA500]"
        />
        <StatsCard
          title="Points Percentile"
          value={`Top ${userStats.percentileRank}%`}
          description="Among all users"
          icon={Award}
          trend={{ value: userStats.pointsChange7d, label: "past 7 days", positive: userStats.pointsChange7d >= 0 }}
          gradientClass="from-[#0EA5E9] to-[#6366F1]"
        />
        <StatsCard
          title="Referrals"
          value={userStats.referralsCount}
          description={`Earned ${userStats.referralPointsEarned} points`}
          icon={Users}
          gradientClass="from-[#F97316] to-[#FBBF24]"
        />
      </div>

      <PointsChart data={pointsData} title="Points Earned (Last 30 Days)" />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Last Active"
          value={userStats.lastActive}
          icon={Clock}
          gradientClass="from-[#EC4899] to-[#D946EF]"
        />
        <StatsCard
          title="Lessons Completed"
          value={userStats.lessonsCompleted}
          icon={BookOpen}
          gradientClass="from-[#8B5CF6] to-[#D946EF]"
        />
        <StatsCard
          title="Monthly Change"
          value={`${userStats.pointsChange30d >= 0 ? '+' : ''}${userStats.pointsChange30d}%`}
          description="Points growth"
          icon={TrendingUp}
          trend={{ value: userStats.pointsChange30d, label: "past 30 days", positive: userStats.pointsChange30d >= 0 }}
          gradientClass="from-[#10B981] to-[#34D399]"
        />
      </div>
    </div>
  );
}
