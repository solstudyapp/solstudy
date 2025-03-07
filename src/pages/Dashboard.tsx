
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Award, BookOpen, Trophy, GraduationCap, Share2, Users, TrendingUp, LineChart, Copy } from "lucide-react";
import { lessonService } from "@/services/lessonService";
import { lessonData } from "@/data/lessons";
import { useToast } from "@/hooks/use-toast";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data for the points chart
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

const Dashboard = () => {
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(0);
  const [inProgressLessons, setInProgressLessons] = useState<any[]>([]);
  const [completedLessons, setCompletedLessons] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState("SOLSTUDY123");
  const [pointsData, setPointsData] = useState<any[]>([]);
  
  useEffect(() => {
    // Get user points
    const points = lessonService.getUserPoints();
    setUserPoints(points);
    
    // Get all user progress for all lessons
    const inProgress = lessonData.map(lesson => {
      const progress = lessonService.getUserProgress(lesson.id);
      const progressPercentage = lessonService.calculateLessonProgress(lesson.id, lesson.sections);
      
      // Consider a lesson "in progress" if it has ANY progress (visited at least one page)
      // but not 100% completed
      if (progressPercentage > 0 && progressPercentage < 100) {
        return {
          ...lesson,
          progress: progressPercentage
        };
      }
      return null;
    }).filter(Boolean);
    
    setInProgressLessons(inProgress);
    
    // Get completed courses
    const completed = lessonData.map(lesson => {
      const progressPercentage = lessonService.calculateLessonProgress(lesson.id, lesson.sections);
      
      if (progressPercentage === 100) {
        const userProgress = lessonService.getUserProgress(lesson.id);
        return {
          ...lesson,
          completedDate: new Date().toLocaleDateString(), // In a real app, we'd store this
          earnedPoints: userProgress.earnedPoints || Math.floor(Math.random() * 300) + 100
        };
      }
      return null;
    }).filter(Boolean);
    
    setCompletedLessons(completed);
    
    // Generate mock points data for the chart
    setPointsData(generateMockPointsData());
  }, []);
  
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Referral code copied!",
      description: "Your referral code has been copied to clipboard.",
    });
  };
  
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
          
          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Points Card */}
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
              
              {/* Points Chart */}
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
            
            {/* Courses In Progress */}
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
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <span className="text-sm text-white/70">{lesson.progress}% Complete</span>
                        </div>
                        <Progress value={lesson.progress} className="h-2 mb-3 bg-white/20" />
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            className="bg-[#9945FF] hover:bg-[#9945FF]/90 text-white"
                            asChild
                          >
                            <Link to={`/lesson/${lesson.id}`}>
                              Continue Learning
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
                      className="mt-4 bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
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
            
            {/* Completed Courses */}
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
                      <div key={lesson.id} className="bg-white/10 rounded-lg p-4 flex justify-between items-center">
                        <div>
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
                      className="mt-4 bg-[#9945FF] hover:bg-[#9945FF]/90 text-white"
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
          
          {/* Referrals Tab Content */}
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
                  <div className="text-4xl font-bold">0</div>
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
                    <p className="text-white/70 mb-6">Invite friends to join SolStudy. You'll earn 100 points for each person who signs up using your referral code.</p>
                    
                    <div className="relative mb-6">
                      <div className="bg-white/5 border border-white/20 rounded-lg p-4 flex justify-between items-center">
                        <div className="font-mono text-lg">{referralCode}</div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 text-white hover:bg-white/10"
                          onClick={handleCopyReferralCode}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white">
                        Share on Facebook
                      </Button>
                      <Button className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white">
                        Share on Twitter
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
                <div className="text-center py-10">
                  <Users className="h-16 w-16 mx-auto text-white/20 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No referrals yet</h3>
                  <p className="text-white/70 mb-6">
                    Share your referral code with friends to start earning points!
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
                    onClick={handleCopyReferralCode}
                  >
                    Copy Referral Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
