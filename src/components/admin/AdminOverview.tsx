
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, Users, BookOpen, Award, Activity, TrendingUp } from "lucide-react";

// Mock data for dashboard stats
const mockStats = {
  totalUsers: 126,
  activeUsers: 89,
  totalLessons: 24,
  completedLessons: 187,
  totalPointsEarned: 15750,
  lastMonthPointsEarned: 4250,
  userGrowth: 12,
  lessonCompletionGrowth: 8,
  pointsGrowth: 15,
}

// Mock chart data for the past 30 days
const mockChartData = [
  { day: "1", users: 4, lessons: 12, points: 250 },
  { day: "5", users: 6, lessons: 15, points: 320 },
  { day: "10", users: 8, lessons: 22, points: 420 },
  { day: "15", users: 10, lessons: 28, points: 520 },
  { day: "20", users: 12, lessons: 32, points: 650 },
  { day: "25", users: 14, lessons: 36, points: 780 },
  { day: "30", users: 18, lessons: 42, points: 950 },
];

const StatCard = ({ title, value, description, icon, trend }: { 
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
}) => (
  <Card className="backdrop-blur-md bg-white/10 border-white/10 text-white">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="p-2 bg-white/10 rounded-full">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-white/70 mt-1">{description}</p>
      {trend !== undefined && (
        <div className="flex items-center mt-4">
          <div className={`text-xs flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
            <ArrowUpRight size={14} className="ml-1" />
          </div>
          <div className="text-xs text-white/50 ml-2">from last month</div>
        </div>
      )}
    </CardContent>
  </Card>
);

const ChartCard = ({ title, data, dataProp }: { 
  title: string; 
  data: Array<{ day: string; [key: string]: number | string }>; 
  dataProp: string;
}) => {
  // Simple visual representation of the chart
  const maxValue = Math.max(...data.map(item => Number(item[dataProp])));
  
  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-white/70">Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = ((Number(item[dataProp]) / maxValue) * 100);
            return (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-gradient-to-t from-purple-500/50 to-purple-500 rounded-t-sm" 
                  style={{ height: `${height}%` }}
                ></div>
                <div className="text-xs mt-2 text-white/70">{item.day}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const AdminOverview = () => {
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");
  
  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-md bg-white/10 border-white/10 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Dashboard Overview</CardTitle>
            <CardDescription className="text-white/70">
              Platform metrics and statistics
            </CardDescription>
          </div>
          <Tabs defaultValue={period} onValueChange={(v) => setPeriod(v as "7" | "30" | "90")}>
            <TabsList className="bg-white/10">
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
              data={mockChartData}
              dataProp="users"
            />
            <ChartCard 
              title="Points Distribution"
              data={mockChartData}
              dataProp="points"
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Platform Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-white/70">User Engagement</span>
                  <span className="text-sm font-medium">70%</span>
                </div>
                <Progress value={70} className="h-2 bg-white/10" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-white/70">Lesson Completion Rate</span>
                  <span className="text-sm font-medium">65%</span>
                </div>
                <Progress value={65} className="h-2 bg-white/10" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-white/70">Quiz Participation</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2 bg-white/10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
