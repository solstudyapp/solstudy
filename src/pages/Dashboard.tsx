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
import { lessonData, loadLessons } from "@/data/lessons"
import { useToast } from "@/hooks/use-toast";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LessonType } from "@/types/lesson";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const generateMockPointsData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      coursePoints: Math.floor(Math.random() * 50) + 10,
      referralPoints: Math.floor(Math.random() * 30)
    });
  }
  
  return data;
};

const mockReferrals = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.j@example.com",
    date: "2023-08-15",
    status: "completed",
    points: 100
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.g@example.com",
    date: "2023-09-02",
    status: "completed",
    points: 100
  },
  {
    id: 3,
    name: "Sam Wilson",
    email: "sam.w@example.com",
    date: "2023-10-17",
    status: "pending",
    points: 0
  }
];

const Dashboard = () => {
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(0);
  const [inProgressLessons, setInProgressLessons] = useState<LessonType[]>([]);
  const [completedLessons, setCompletedLessons] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState("SOLSTUDY123");
  const [pointsData, setPointsData] = useState<any[]>([]);
  const [referrals, setReferrals] = useState(mockReferrals);
  const [referralLink, setReferralLink] = useState("");
  const [loading, setLoading] = useState(true)
  
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
      "solana-token": <Sparkles size={24} />
    };
    
    return iconMap[lessonId] || <BookText size={24} />;
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Load lessons from Supabase
        await loadLessons()

        const points = lessonService.getUserPoints()
        setUserPoints(points)

        const inProgress = lessonData
          .map((lesson) => {
            const progress = lessonService.calculateLessonProgress(lesson.id, 3)

            if (progress > 0 && progress < 100) {
              return {
                ...lesson,
                progress,
              }
            }
            return null
          })
          .filter(Boolean) as LessonType[]

        if (inProgress.length === 0 && lessonData.length >= 5) {
          const demoCourses = [
            { ...lessonData[2], progress: 66 },
            { ...lessonData[4], progress: 33 },
          ]
          setInProgressLessons(demoCourses)
        } else if (lessonData.length > 0) {
          // If no in-progress lessons but we have lessons data, use the first two
          const demoCourses = [
            { ...lessonData[0], progress: 66 },
            {
              ...(lessonData.length > 1 ? lessonData[1] : lessonData[0]),
              progress: 33,
            },
          ]
          setInProgressLessons(demoCourses)
        } else {
          setInProgressLessons(inProgress)
        }

        // Set completed lessons if we have lesson data
        if (lessonData.length > 0) {
          const completed = [
            {
              ...lessonData[0],
              completedDate: new Date(
                Date.now() - Math.random() * 10000000000
              ).toLocaleDateString(),
              earnedPoints: Math.floor(Math.random() * 300) + 100,
            },
          ]

          // Add a second completed lesson if available
          if (lessonData.length > 1) {
            completed.push({
              ...lessonData[lessonData.length > 7 ? 7 : 0],
              completedDate: new Date(
                Date.now() - Math.random() * 5000000000
              ).toLocaleDateString(),
              earnedPoints: Math.floor(Math.random() * 300) + 100,
            })
          }

          setCompletedLessons(completed)
        }

        setPointsData(generateMockPointsData())
        setReferralLink(`https://solstudy.com/signup?ref=${referralCode}`)
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
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral link copied!",
      description: "Your referral link has been copied to clipboard.",
    });
  };
  
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  const shareOnTwitter = () => {
    const text = "Join me on SolStudy to learn about blockchain and Solana! Use my referral link:";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#14F195] mx-auto mb-4" />
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Your Dashboard</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 bg-white/10 border-b border-white/10 w-full justify-start rounded-lg p-1">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">
              <TrendingUp className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="referrals" className="rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">
              <Users className="mr-2 h-4 w-4" />
              Referrals
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="glass-card text-white col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-[#14F195]" />
                    Total Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{userPoints}</div>
                  <p className="text-white/70 mt-2">Keep learning to earn more!</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card text-white col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="mr-2 h-5 w-5 text-[#14F195]" />
                    Points Earned (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={pointsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="date" stroke="#ffffff80" />
                        <YAxis stroke="#ffffff80" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1A1F2C', 
                            borderColor: '#ffffff30',
                            color: 'white' 
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
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="glass-card text-white mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-[#14F195]" />
                  Courses In Progress
                </CardTitle>
                <CardDescription className="text-white/70">
                  Continue where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inProgressLessons.length > 0 ? (
                  <div className="space-y-4">
                    {inProgressLessons.map((lesson: any) => (
                      <div key={lesson.id} className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-2">
                          <div className={`p-3 rounded-lg bg-${lesson.difficulty === "beginner" ? "green" : lesson.difficulty === "intermediate" ? "blue" : "orange"}-500/30 text-white`}>
                            {getLessonIcon(lesson.id)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{lesson.title}</h3>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm text-white/70">{lesson.progress}% Complete</span>
                            </div>
                            <Progress value={lesson.progress} className="h-2 mt-2 mb-3 bg-white/20" />
                          </div>
                          <Button variant="gradient"
                            asChild
                          >
                            <Link to={`/lesson/${lesson.id}`}>
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
                    <GraduationCap className="h-12 w-12 mx-auto text-white/30 mb-3" />
                    <p>You haven't started any courses yet</p>
                    <Button 
                      variant="gradient"
                      asChild
                    >
                      <Link to="/">
                        Browse Courses
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="glass-card text-white mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-[#14F195]" />
                  Completed Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedLessons.length > 0 ? (
                  <div className="space-y-4">
                    {completedLessons.map((lesson: any) => (
                      <div key={lesson.id} className="bg-white/10 rounded-lg p-4 flex items-center">
                        <div className={`p-3 rounded-lg bg-${lesson.difficulty === "beginner" ? "green" : lesson.difficulty === "intermediate" ? "blue" : "orange"}-500/30 text-white mr-4`}>
                          {getLessonIcon(lesson.id)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <p className="text-sm text-white/70">Completed on {lesson.completedDate}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-[#14F195] font-medium">+{lesson.earnedPoints} pts</div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2 border-white/20 text-white hover:bg-white/10"
                            asChild
                          >
                            <Link to={`/lesson/${lesson.id}`}>
                              Review Course
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-white/70">Complete your first course to see it here!</p>
                    <Button 
                      variant="gradient"
                      asChild
                    >
                      <Link to="/">
                        Browse More Courses
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="glass-card text-white col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="mr-2 h-5 w-5 text-[#14F195]" />
                    Your Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{referrals.filter(r => r.status === "completed").length}</div>
                  <p className="text-white/70 mt-2">Each referral earns you 100 points!</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card text-white col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-[#14F195]" />
                    Referral Program
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/10 rounded-lg p-6 text-center">
                    <h3 className="text-xl font-medium mb-3">Share SolStudy and earn rewards!</h3>
                    <p className="text-white/70 mb-6">Invite friends to join SolStudy. You'll earn 100 points for each person who signs up using your referral link.</p>
                    
                    <div className="relative mb-6">
                      <div className="bg-white/5 border border-white/20 rounded-lg p-4 flex justify-between items-center">
                        <div className="font-mono text-lg truncate mr-2">{referralLink}</div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 text-white hover:bg-white/10 flex-shrink-0"
                          onClick={handleCopyReferralCode}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button 
                        variant="gradient" 
                        onClick={shareOnFacebook}
                        className="flex items-center gap-2"
                      >
                        <Facebook size={16} />
                        Share on Facebook
                      </Button>
                      <Button 
                        variant="gradient"
                        onClick={shareOnTwitter}
                        className="flex items-center gap-2"
                      >
                        <img 
                          src="https://about.x.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png" 
                          alt="X logo" 
                          className="w-4 h-4 invert"
                        />
                        Share on X
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="glass-card text-white">
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
                        <TableRow className="border-white/10">
                          <TableHead className="text-white">Name</TableHead>
                          <TableHead className="text-white">Email</TableHead>
                          <TableHead className="text-white">Date</TableHead>
                          <TableHead className="text-white">Status</TableHead>
                          <TableHead className="text-white text-right">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.map((referral) => (
                          <TableRow key={referral.id} className="border-white/10">
                            <TableCell className="text-white">{referral.name}</TableCell>
                            <TableCell className="text-white">{referral.email}</TableCell>
                            <TableCell className="text-white">
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-white/70" />
                                {new Date(referral.date).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {referral.status === "completed" ? (
                                <div className="flex items-center text-[#14F195]">
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Completed
                                </div>
                              ) : (
                                <div className="flex items-center text-yellow-500">
                                  <Clock className="mr-1 h-4 w-4" />
                                  Pending
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {referral.status === "completed" ? (
                                <span className="text-[#14F195]">+{referral.points}</span>
                              ) : (
                                <span className="text-white/50">--</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Users className="h-16 w-16 mx-auto text-white/20 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No referrals yet</h3>
                    <p className="text-white/70 mb-6">
                      Share your referral link with friends to start earning points!
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
  );
};

export default Dashboard;
