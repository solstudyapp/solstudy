import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronRight,
  Award,
  BookOpen,
  Trophy,
  GraduationCap,
  Share2,
  Users,
  TrendingUp,
  LineChart,
  Copy,
  BookText,
  ShieldCheck,
  Wallet,
  Code,
  Database,
  PaintBucket,
  BarChart,
  Sparkles,
  CheckCircle,
  Calendar,
  Clock,
  UserPlus,
  Link as LinkIcon,
  Facebook,
  Loader2,
} from "lucide-react"
import { lessonService } from "@/services/lessonService";
import {
  userProgressService,
  PointsHistoryData,
  ReferralHistoryData,
} from "@/services/userProgressService"
import { lessonData, loadLessons } from "@/data/lessons"
import { useToast } from "@/hooks/use-toast"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { LessonType } from "@/types/lesson"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchLessons } from "@/services/lessons"
import { shareOnFacebook, shareOnTwitter } from "@/utils/social"
import { ReferralCard } from "@/components/dashboard/ReferralCard"

// This function is now only used as a fallback if real data can't be fetched
const generateMockPointsData = () => {
  const data = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      coursePoints: Math.floor(Math.random() * 50) + 10,
      referralPoints: Math.floor(Math.random() * 30),
      quizPoints: Math.floor(Math.random() * 40) + 5,
    })
  }

  return data
}

const Dashboard = () => {
  const { toast } = useToast()
  const [userPoints, setUserPoints] = useState(0)
  const [inProgressLessons, setInProgressLessons] = useState<any[]>([])
  const [completedLessons, setCompletedLessons] = useState<any[]>([])
  const [referralCode, setReferralCode] = useState("SOLSTUDY123")
  const [pointsData, setPointsData] = useState<PointsHistoryData[]>([])
  const [referrals, setReferrals] = useState<ReferralHistoryData[]>([])
  const [referralLink, setReferralLink] = useState("")
  const [loading, setLoading] = useState(true)
  const [allLessons, setAllLessons] = useState<LessonType[]>([])

  const getLessonIcon = (lessonId: string) => {
    const iconMap: Record<string, JSX.Element> = {
      "intro-to-blockchain": <Database size={24} />,
      "crypto-trading-101": <LineChart size={24} />,
      "defi-essentials": <BarChart size={24} />,
      "nft-creation": <PaintBucket size={24} />,
      "solana-dev": <Code size={24} />,
      "crypto-security": <ShieldCheck size={24} />,
      "advanced-trading": <LineChart size={24} />,
      "wallet-management": <Wallet size={24} />,
      "solana-token": <Sparkles size={24} />,
    }

    return iconMap[lessonId] || <BookText size={24} />
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all lessons
        const lessonsData = await fetchLessons()
        setAllLessons(lessonsData)

        // Fetch user points
        const points = await userProgressService.getTotalPoints()
        setUserPoints(points)

        // Fetch courses in progress
        const inProgressData = await userProgressService.getCoursesInProgress()

        if (inProgressData.length > 0) {
          setInProgressLessons(inProgressData)
        }

        // Fetch completed courses
        const completedData = await userProgressService.getCompletedCourses()

        if (completedData.length > 0) {
          setCompletedLessons(completedData)
        }

        // Fetch points history
        try {
          const pointsHistoryData = await userProgressService.getPointsHistory()
          if (pointsHistoryData.length > 0) {
            setPointsData(pointsHistoryData)
          } else {
            // Fallback to mock data if no real data is available
            setPointsData(generateMockPointsData())
          }
        } catch (error) {
          console.error("Error fetching points history:", error)
          // Fallback to mock data
          setPointsData(generateMockPointsData())
        }

        setReferralLink(
          `${import.meta.env.VITE_PUBLIC_URL}/signup?ref=${referralCode}`
        )

        // Fetch referral history
        const referralHistory = await userProgressService.getReferralHistory()

        // Update the referrals state with the data from API
        if (referralHistory && referralHistory.length > 0) {
          setReferrals(referralHistory)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        toast({
          title: "Error loading dashboard",
          description:
            "There was a problem loading your dashboard data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [referralCode, toast])

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: "Referral link copied!",
      description: "Your referral link has been copied to clipboard.",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#14F195] mx-auto mb-4" />
          <p className="text-foreground text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Your Dashboard
        </h1>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 bg-muted/10 border-b border-border w-full justify-start rounded-lg p-1">
            <TabsTrigger
              value="overview"
              className="rounded-md data-[state=active]:bg-muted/20 data-[state=active]:text-foreground text-muted-foreground"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="referrals"
              className="rounded-md data-[state=active]:bg-muted/20 data-[state=active]:text-foreground text-muted-foreground"
            >
              <Users className="mr-2 h-4 w-4" />
              Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-[#14F195]" />
                    Total Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-foreground">
                    {userPoints}
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Keep learning to earn more!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-border text-foreground hover:bg-muted/10"
                    asChild
                  >
                    <Link to="/quiz-progress">
                      <BarChart className="mr-2 h-4 w-4" />
                      View Quiz Progress
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="mr-2 h-5 w-5 text-[#14F195]" />
                    Points Earned (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={pointsData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="var(--muted-foreground)"
                        />
                        <YAxis stroke="var(--muted-foreground)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="coursePoints"
                          name="Course Points"
                          stroke="#14F195"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="referralPoints"
                          name="Referral Points"
                          stroke="#9945FF"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="quizPoints"
                          name="Quiz Points"
                          stroke="#FF4500"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border mb-8">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <BookOpen className="mr-2 h-5 w-5 text-[#14F195] flex-shrink-0" />
                  <span className="flex-wrap">Courses In Progress</span>
                </CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                {inProgressLessons.length > 0 ? (
                  <div className="space-y-4">
                    {inProgressLessons.map((lesson: any) => (
                      <div
                        key={lesson.id || lesson.lessonId}
                        className="bg-muted/10 rounded-lg p-4"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div
                            className={`p-3 rounded-lg mb-3 sm:mb-0 ${
                              lesson.difficulty === "beginner"
                                ? "bg-green-500/30 text-foreground"
                                : lesson.difficulty === "intermediate"
                                ? "bg-blue-500/30 text-foreground"
                                : "bg-orange-500/30 text-foreground"
                            }`}
                          >
                            {getLessonIcon(lesson.id || lesson.lessonId)}
                          </div>
                          <div className="flex-1 w-full">
                            <h3 className="font-medium text-lg text-foreground">
                              {lesson.title}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1">
                              <span className="text-sm text-muted-foreground mb-1 sm:mb-0">
                                {lesson.progress}% Complete
                              </span>
                              {lesson.lastActivity && (
                                <span className="text-xs text-muted-foreground mt-1 sm:mt-0">
                                  Last activity:{" "}
                                  {new Date(
                                    lesson.lastActivity
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <Progress
                              value={lesson.progress}
                              className="h-2 mt-2 mb-3 bg-muted/20"
                            />
                          </div>
                          <Button
                            variant="gradient"
                            className="w-full sm:w-auto mt-2 sm:mt-0"
                            asChild
                          >
                            <Link
                              to={`/lesson/${lesson.id || lesson.lessonId}`}
                            >
                              Continue Course
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="mb-4 text-foreground">
                      You haven't started any courses yet
                    </p>
                    <Button variant="gradient" asChild>
                      <Link to="/">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border mb-8">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Award className="mr-2 h-5 w-5 text-[#14F195] flex-shrink-0" />
                  <span className="flex-wrap">Completed Courses</span>
                </CardTitle>
                <CardDescription>Your learning achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {completedLessons.length > 0 ? (
                  <div className="space-y-4">
                    {completedLessons.map((lesson: any) => (
                      <div
                        key={lesson.id || lesson.lessonId}
                        className="bg-muted/10 rounded-lg p-4"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div
                            className={`p-3 rounded-lg mb-3 sm:mb-0 ${
                              lesson.difficulty === "beginner"
                                ? "bg-green-500/30 text-foreground"
                                : lesson.difficulty === "intermediate"
                                ? "bg-blue-500/30 text-foreground"
                                : "bg-orange-500/30 text-foreground"
                            }`}
                          >
                            {getLessonIcon(lesson.id || lesson.lessonId)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-lg text-foreground">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Completed on {lesson.completedDate}
                            </p>
                          </div>
                          <div className="text-right mt-3 sm:mt-0 w-full sm:w-auto">
                            <div className="text-[#14F195] font-medium">
                              +{lesson.earnedPoints} pts
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 border-border text-foreground hover:bg-muted/10 w-full sm:w-auto"
                              asChild
                            >
                              <Link
                                to={`/lesson/${lesson.id || lesson.lessonId}`}
                              >
                                Review Course
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">
                      Complete your first course to see it here!
                    </p>
                    <Button variant="gradient" asChild>
                      <Link to="/">Browse More Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-border col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="mr-2 h-5 w-5 text-[#14F195]" />
                    Your Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-foreground">
                    {referrals.filter((r) => r.status === "completed").length}
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Each referral earns you 100 points!
                  </p>
                </CardContent>
              </Card>

              <div className="col-span-1 md:col-span-2">
                <ReferralCard />
              </div>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-[#14F195]" />
                  Your Referral History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-foreground">
                            Email
                          </TableHead>
                          <TableHead className="text-foreground">
                            Date
                          </TableHead>
                          <TableHead className="text-foreground text-right">
                            Points
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.map((referral) => (
                          <TableRow key={referral.id} className="border-border">
                            <TableCell className="text-foreground">
                              {referral.referee?.email || "Unknown"}
                            </TableCell>
                            <TableCell className="text-foreground">
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                {new Date(
                                  referral.created_at
                                ).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {referral.status === "completed" ? (
                                <span className="text-[#14F195]">
                                  +{referral.points_earned}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  --
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      No referrals yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Share your referral link with friends to start earning
                      points!
                    </p>
                    <Button variant="gradient" onClick={handleCopyReferralCode}>
                      Copy Referral Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard;
