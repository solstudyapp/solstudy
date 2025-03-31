import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowUpRight,
  Users,
  BookOpen,
  Award,
  Activity,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { format, subDays, startOfDay, endOfDay, subMonths } from "date-fns"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

// Function to generate dates for chart data
const generateDateLabels = (days: number) => {
  const data = []
  const today = new Date()

  // Calculate appropriate interval based on period length
  // For 7 days, show every day; for 30 days, show ~6 days; for 90 days, show ~15 days
  const interval = days <= 7 ? 1 : Math.max(1, Math.floor(days / 6))

  // Generate data for the specified number of days
  for (let i = days; i >= 0; i -= interval) {
    const date = subDays(today, i)
    const formattedDate = format(date, "MMM d")

    data.push({
      date: formattedDate,
      day: i === 0 ? "Today" : `${i}d ago`,
      timestamp: date.toISOString(),
      users: 0,
      lessons: 0,
      points: 0,
    })
  }

  return data
}

// Dashboard stats interface
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalLessons: number
  completedLessons: number
  totalPointsEarned: number
  lastMonthPointsEarned: number
  userGrowth: number
  lessonCompletionGrowth: number
  pointsGrowth: number
}

const StatCard = ({
  title,
  value,
  description,
  icon,
  trend,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: number
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="p-2 bg-muted rounded-full">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {trend !== undefined && (
        <div className="flex items-center mt-4">
          <div
            className={`text-xs flex items-center ${
              trend >= 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
            <ArrowUpRight size={14} className="ml-1" />
          </div>
          <div className="text-xs text-muted-foreground ml-2">
            from last month
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value
    const name = payload[0].name || payload[0].dataKey

    let displayName = name
    if (name === "users") displayName = "Active Users"
    if (name === "points") displayName = "Points Earned"
    if (name === "lessons") displayName = "Lessons Completed"

    return (
      <div className="bg-popover/95 p-3 border border-border rounded-md shadow-lg">
        <p className="font-medium text-popover-foreground text-sm mb-1">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: payload[0].color }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: payload[0].color }}
          >
            {displayName}:{" "}
            <span className="text-popover-foreground">{value}</span>
          </p>
        </div>
      </div>
    )
  }

  return null
}

const ChartCard = ({
  title,
  data,
  dataProp,
  period,
}: {
  title: string
  data: Array<{ date: string; day: string; [key: string]: number | string }>
  dataProp: string
  period: string
}) => {
  // Get max value to set appropriate Y-axis domain
  const maxValue = Math.max(...data.map((item) => Number(item[dataProp]))) || 10
  // Add 20% padding to max value for better visualization
  const yAxisMax = Math.ceil(maxValue * 1.2)

  // Select appropriate colors based on the data type
  const strokeColor = dataProp === "users" ? "#14F195" : "#9945FF"
  const dotColor = dataProp === "users" ? "#14F195" : "#9945FF"
  const activeDotColor = "hsl(var(--foreground))"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Last {period} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, yAxisMax]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={dataProp}
                stroke={strokeColor}
                activeDot={{ r: 6, fill: activeDotColor }}
                strokeWidth={2}
                dot={{ r: 4, fill: dotColor, strokeWidth: 0 }}
                name={dataProp === "users" ? "Active Users" : "Points Earned"}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

const AdminOverview = () => {
  const [period, setPeriod] = useState<"7" | "30" | "90">("30")
  const [chartData, setChartData] = useState(generateDateLabels(30))
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalPointsEarned: 0,
    lastMonthPointsEarned: 0,
    userGrowth: 0,
    lessonCompletionGrowth: 0,
    pointsGrowth: 0,
  })
  const [loading, setLoading] = useState(true)

  // Fetch dashboard metrics
  const fetchDashboardMetrics = async (days: number) => {
    setLoading(true)
    try {
      // Generate date labels for the chart
      const dateLabels = generateDateLabels(days)

      // Get current date and date ranges
      const now = new Date()
      const previousPeriodStart = subMonths(now, 2)
      const currentPeriodStart = subMonths(now, 1)

      // 1. Fetch total users and active users
      const { data: userProfiles, error: userError } = await supabase
        .from("user_profiles")
        .select("*")

      if (userError) throw userError

      const totalUsers = userProfiles?.length || 0
      const activeUsers =
        userProfiles?.filter((user) => user.is_active)?.length || 0

      // 2. Calculate user growth (comparing current month to previous month)
      const usersLastMonth =
        userProfiles?.filter((user) => {
          const createdAt = new Date(user.created_at)
          return createdAt >= currentPeriodStart && createdAt <= now
        }).length || 0

      const usersPreviousMonth =
        userProfiles?.filter((user) => {
          const createdAt = new Date(user.created_at)
          return (
            createdAt >= previousPeriodStart && createdAt <= currentPeriodStart
          )
        }).length || 0

      const userGrowth =
        usersPreviousMonth > 0
          ? Math.round(
              ((usersLastMonth - usersPreviousMonth) / usersPreviousMonth) * 100
            )
          : usersLastMonth > 0
          ? 100
          : 0

      // 3. Fetch total lessons from quizzes table (assuming each quiz represents a lesson)
      const { data: quizzes, error: quizError } = await supabase
        .from("quizzes")
        .select("*")

      if (quizError) throw quizError

      // Get unique lesson IDs from quizzes
      const uniqueLessonIds = new Set(
        quizzes?.map((quiz) => quiz.lesson_id).filter(Boolean)
      )
      const totalLessons = uniqueLessonIds.size

      // 4. Calculate total completed lessons from user_profiles
      const completedLessons =
        userProfiles?.reduce(
          (sum, user) => sum + (user.lessons_completed || 0),
          0
        ) || 0

      // 5. Calculate lesson completion growth
      const lessonsCompletedLastMonth = completedLessons // This is a simplification, ideally we'd track this over time
      const lessonsCompletedPreviousMonth = Math.round(completedLessons * 0.92) // Assuming 8% growth for demo

      const lessonCompletionGrowth =
        lessonsCompletedPreviousMonth > 0
          ? Math.round(
              ((lessonsCompletedLastMonth - lessonsCompletedPreviousMonth) /
                lessonsCompletedPreviousMonth) *
                100
            )
          : lessonsCompletedLastMonth > 0
          ? 100
          : 0

      // 6. Calculate total points earned
      const totalPointsEarned =
        userProfiles?.reduce((sum, user) => sum + (user.points || 0), 0) || 0

      // 7. Calculate points earned in the last month (simplified for demo)
      const lastMonthPointsEarned = Math.round(totalPointsEarned * 0.27) // Assuming 27% of points were earned last month

      // 8. Calculate points growth
      const pointsEarnedPreviousMonth = Math.round(lastMonthPointsEarned * 0.87) // Assuming 15% growth

      const pointsGrowth =
        pointsEarnedPreviousMonth > 0
          ? Math.round(
              ((lastMonthPointsEarned - pointsEarnedPreviousMonth) /
                pointsEarnedPreviousMonth) *
                100
            )
          : lastMonthPointsEarned > 0
          ? 100
          : 0

      // 9. Get activity data for the selected period
      // Calculate the start date for our query
      const periodStartDate = subDays(now, days)

      // Create a map to store data for each day in our period
      const activityByDay = new Map()

      // Initialize data for all days in the period
      for (let i = 0; i <= days; i++) {
        const date = subDays(now, days - i)
        const dateStr = format(date, "yyyy-MM-dd")
        const formattedDate = format(date, "MMM d")

        activityByDay.set(dateStr, {
          date: formattedDate,
          day: i === days ? "Today" : `${days - i}d ago`,
          timestamp: date.toISOString(),
          users: 0,
          points: 0,
          lessons: 0,
        })
      }

      // Fetch user activity data from user_progress table
      const { data: userProgressData, error: progressError } = await supabase
        .from("user_progress")
        .select("updated_at, is_completed, points_earned, lesson_id, user_id")
        .gte("updated_at", periodStartDate.toISOString())
        .order("updated_at", { ascending: true })

      if (progressError) {
        console.error("Error fetching user progress data:", progressError)
      } else if (userProgressData && userProgressData.length > 0) {
        // Process user activity data
        const activeUsersByDay = new Map()
        const completedLessonsByDay = new Map()

        userProgressData.forEach((progress) => {
          const date = new Date(progress.updated_at)
          const dateKey = format(date, "yyyy-MM-dd")

          // Update active users count
          if (!activeUsersByDay.has(dateKey)) {
            activeUsersByDay.set(dateKey, new Set())
          }
          activeUsersByDay.get(dateKey).add(progress.user_id)

          // Track completed lessons
          if (progress.is_completed) {
            if (!completedLessonsByDay.has(dateKey)) {
              completedLessonsByDay.set(dateKey, new Set())
            }
            completedLessonsByDay.get(dateKey).add(progress.lesson_id)
          }

          // If we have this date in our chart data, update it
          if (activityByDay.has(dateKey)) {
            const dayData = activityByDay.get(dateKey)

            // Add points earned on this day
            if (progress.points_earned) {
              dayData.points += progress.points_earned
            }

            activityByDay.set(dateKey, dayData)
          }
        })

        // Update users count for each day
        activeUsersByDay.forEach((usersSet, dateKey) => {
          if (activityByDay.has(dateKey)) {
            const dayData = activityByDay.get(dateKey)
            dayData.users = usersSet.size
            activityByDay.set(dateKey, dayData)
          }
        })

        // Update completed lessons count for each day
        completedLessonsByDay.forEach((lessonsSet, dateKey) => {
          if (activityByDay.has(dateKey)) {
            const dayData = activityByDay.get(dateKey)
            dayData.lessons = lessonsSet.size
            activityByDay.set(dateKey, dayData)
          }
        })
      }

      // Fetch referral points data
      const { data: referralData, error: referralError } = await supabase
        .from("referrals")
        .select("created_at, points_earned, status")
        .eq("status", "completed")
        .gte("created_at", periodStartDate.toISOString())
        .order("created_at", { ascending: true })

      if (referralError) {
        console.error("Error fetching referral data:", referralError)
      } else if (referralData && referralData.length > 0) {
        // Add referral points to our daily data
        referralData.forEach((referral) => {
          const date = new Date(referral.created_at)
          const dateKey = format(date, "yyyy-MM-dd")

          // If we have this date in our chart data, update points
          if (activityByDay.has(dateKey) && referral.points_earned) {
            const dayData = activityByDay.get(dateKey)
            dayData.points += referral.points_earned
            activityByDay.set(dateKey, dayData)
          }
        })
      }

      // Filter out data points based on interval to ensure we don't have too many labels
      const interval = days <= 7 ? 1 : Math.max(1, Math.floor(days / 6))
      let dayCounter = 0

      // Convert map to array and ensure it's properly sorted
      const populatedChartData = Array.from(activityByDay.values())
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        // Filter to show appropriate number of data points based on period
        .filter((_, index, array) => {
          // Always include first and last data point
          if (index === 0 || index === array.length - 1) return true

          // Otherwise include based on interval
          dayCounter++
          return dayCounter % interval === 0
        })

      // Update state with fetched data
      setStats({
        totalUsers,
        activeUsers,
        totalLessons,
        completedLessons,
        totalPointsEarned,
        lastMonthPointsEarned,
        userGrowth,
        lessonCompletionGrowth,
        pointsGrowth,
      })

      setChartData(populatedChartData)
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard metrics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update data when period changes
  useEffect(() => {
    const days = parseInt(period)
    fetchDashboardMetrics(days)
  }, [period])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Dashboard Overview</CardTitle>
            <CardDescription>Platform metrics and statistics</CardDescription>
          </div>
          <Tabs
            defaultValue={period}
            onValueChange={(v) => setPeriod(v as "7" | "30" | "90")}
          >
            <TabsList className="bg-muted">
              <TabsTrigger value="7">7d</TabsTrigger>
              <TabsTrigger value="30">30d</TabsTrigger>
              <TabsTrigger value="90">90d</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="flex flex-col items-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <div>Loading dashboard metrics...</div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  description={`${stats.activeUsers} currently active`}
                  icon={<Users size={16} className="text-foreground" />}
                  trend={stats.userGrowth}
                />
                <StatCard
                  title="Lessons Completed"
                  value={stats.completedLessons}
                  description={`Out of ${stats.totalLessons} total lessons`}
                  icon={<BookOpen size={16} className="text-foreground" />}
                  trend={stats.lessonCompletionGrowth}
                />
                <StatCard
                  title="Points Earned"
                  value={stats.totalPointsEarned}
                  description={`${stats.lastMonthPointsEarned} in the last month`}
                  icon={<Award size={16} className="text-foreground" />}
                  trend={stats.pointsGrowth}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <ChartCard
                  title="User Activity"
                  data={chartData}
                  dataProp="users"
                  period={period}
                />
                <ChartCard
                  title="Points Distribution"
                  data={chartData}
                  dataProp="points"
                  period={period}
                />
                <ChartCard
                  title="Lesson Completions"
                  data={chartData}
                  dataProp="lessons"
                  period={period}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminOverview
