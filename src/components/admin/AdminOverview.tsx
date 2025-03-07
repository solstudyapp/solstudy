
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, Award } from "lucide-react";
import StatCard from "./dashboard/StatCard";
import ChartCard from "./dashboard/ChartCard";
import { generateDateData, mockStats } from "./dashboard/dashboardUtils";

const AdminOverview = () => {
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");
  const [chartData, setChartData] = useState(generateDateData());
  
  // Update chart data when period changes
  useEffect(() => {
    setChartData(generateDateData());
  }, [period]);
  
  return (
    <div className="space-y-6">
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Dashboard Overview</CardTitle>
            <CardDescription className="text-white/70">
              Platform metrics and statistics
            </CardDescription>
          </div>
          <Tabs defaultValue={period} onValueChange={(v) => setPeriod(v as "7" | "30" | "90")}>
            <TabsList className="bg-black/60">
              <TabsTrigger value="7">7d</TabsTrigger>
              <TabsTrigger value="30">30d</TabsTrigger>
              <TabsTrigger value="90">90d</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Users" 
              value={mockStats.totalUsers} 
              description={`${mockStats.activeUsers} currently active`}
              icon={<Users size={16} className="text-white" />}
              trend={mockStats.userGrowth}
            />
            <StatCard 
              title="Lessons Completed" 
              value={mockStats.completedLessons} 
              description={`Out of ${mockStats.totalLessons} total lessons`}
              icon={<BookOpen size={16} className="text-white" />}
              trend={mockStats.lessonCompletionGrowth}
            />
            <StatCard 
              title="Points Earned" 
              value={mockStats.totalPointsEarned} 
              description={`${mockStats.lastMonthPointsEarned} in the last month`}
              icon={<Award size={16} className="text-white" />}
              trend={mockStats.pointsGrowth}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <ChartCard 
              title="User Activity"
              data={chartData}
              dataProp="users"
            />
            <ChartCard 
              title="Points Distribution"
              data={chartData}
              dataProp="points"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
