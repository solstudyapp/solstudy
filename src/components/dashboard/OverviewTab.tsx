
import { useState, useEffect } from "react";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Zap, 
  Award, 
  Calendar, 
  BookOpen, 
  CheckCircle,
  Clock
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { PointsChart } from "./PointsChart";
import { userProgressService } from "@/services/userProgressService";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch points history
        const pointsHistoryData = await userProgressService.getPointsHistory();
        if (pointsHistoryData.length > 0) {
          setPointsData(pointsHistoryData);
        } else {
          // Fallback to mock data
          setPointsData(generateMockPointsData());
        }

        // Fetch user stats
        const totalPoints = await userProgressService.getTotalPoints();
        const referrals = await userProgressService.getReferralHistory();
        const completedCourses = await userProgressService.getCompletedCourses();
        
        // Calculate percentile (mock for now)
        const percentile = Math.floor(Math.random() * 100);
        
        setUserStats({
          totalPoints,
          loginStreak: 5, // Mock data
          lastActive: new Date().toLocaleDateString(),
          referralsCount: referrals.filter(r => r.status === "completed").length,
          percentileRank: percentile,
          lessonsCompleted: completedCourses.length,
          pointsChange7d: 12, // Mock data
          pointsChange30d: 27, // Mock data
          rankPercentile: percentile,
          referralPointsEarned: referrals.filter(r => r.status === "completed")
            .reduce((sum, r) => sum + r.points_earned, 0)
        });
      } catch (error) {
        console.error("Error fetching overview data:", error);
      }
    };

    fetchData();
  }, []);

  const generateMockPointsData = () => {
    const data = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        coursePoints: Math.floor(Math.random() * 50) + 10,
        referralPoints: Math.floor(Math.random() * 30),
        quizPoints: Math.floor(Math.random() * 40) + 5,
        testPoints: Math.floor(Math.random() * 25) + 5,
      });
    }

    return data;
  };

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
          trend={{ value: userStats.pointsChange7d, label: "past 7 days", positive: true }}
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
          value={`+${userStats.pointsChange30d}%`}
          description="Points growth"
          icon={TrendingUp}
          trend={{ value: userStats.pointsChange30d, label: "past 30 days", positive: true }}
          gradientClass="from-[#10B981] to-[#34D399]"
        />
      </div>
    </div>
  );
}
