
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRight, Award, BookOpen, Trophy, GraduationCap } from "lucide-react";
import Header from "@/components/Header";
import { lessonService } from "@/services/lessonService";
import { lessonData } from "@/data/lessons";

const Dashboard = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [inProgressLessons, setInProgressLessons] = useState<any[]>([]);
  
  useEffect(() => {
    // Get user points
    const points = lessonService.getUserPoints();
    setUserPoints(points);
    
    // Get in-progress lessons
    const lessons = lessonData.map(lesson => {
      const progress = lessonService.calculateLessonProgress(lesson.id, 3); // Assuming 3 sections per lesson
      if (progress > 0 && progress < 100) {
        return {
          ...lesson,
          progress
        };
      }
      return null;
    }).filter(Boolean);
    
    setInProgressLessons(lessons);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9945FF] to-[#14F195]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Your Dashboard</h1>
        
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
          
          {/* Lessons Progress */}
          <Card className="glass-card text-white col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-[#14F195]" />
                Your Progress
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
                  <p>You haven't started any lessons yet</p>
                  <Button 
                    className="mt-4 bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
                    asChild
                  >
                    <Link to="/">
                      Browse Lessons
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Completed Courses */}
        <Card className="glass-card text-white mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-[#14F195]" />
              Completed Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
