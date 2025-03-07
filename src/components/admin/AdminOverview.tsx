
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, Users, BookOpen, Award, Activity, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Function to generate dates for the last 30 days
const generateDateData = () => {
  const data = [];
  const today = new Date();
  
  // Generate data for the last 30 days
  for (let i = 30; i >= 0; i -= 5) {
    const date = subDays(today, i);
    const formattedDate = format(date, "MMM d");
    
    data.push({
      date: formattedDate,
      day: i === 0 ? "Today" : `${i}d ago`,
      users: Math.floor(Math.random() * 15) + 3, // Random data between 3-18
      lessons: Math.floor(Math.random() * 30) + 10, // Random data between 10-40
      points: Math.floor(Math.random() * 800) + 150, // Random data between 150-950
    });
  }
  
  return data;
};

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

const StatCard = ({ title, value, description, icon, trend }: { 
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
}) => (
  <Card className="admin-card">
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

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 p-2 border border-white/20 rounded text-xs">
        <p className="font-medium text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const ChartCard = ({ title, data, dataProp }: { 
  title: string; 
  data: Array<{ date: string; day: string; [key: string]: number | string }>; 
  dataProp: string;
}) => {
  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-white/70">Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataProp} 
                stroke="#9945FF" 
                activeDot={{ r: 6, fill: "#14F195" }}
                strokeWidth={2}
                dot={{ r: 4, fill: "#9945FF", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

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
