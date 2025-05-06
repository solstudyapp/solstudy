
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Award,
  GraduationCap,
  Code,
  Database,
  PaintBucket,
  BookText,
  ShieldCheck,
  BarChart,
  Sparkles,
  LineChart,
  Wallet,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { userProgressService, CompletedLessonData } from "@/services/userProgressService";
import { StatsCard } from "./StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table";
import { quizService, UserQuizCompletion } from "@/services/quizService";
import { useToast } from "@/hooks/use-toast";

export function CoursesTab() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [inProgressLessons, setInProgressLessons] = useState<any[]>([]);
  const [completedLessons, setCompletedLessons] = useState<CompletedLessonData[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<UserQuizCompletion[]>([]);
  const [stats, setStats] = useState({
    totalLessons: 0,
    lessonsCompleted: 0,
    quizzesCompleted: 0,
    totalPoints: 0,
    averageScore: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch courses in progress
        const inProgressData = await userProgressService.getCoursesInProgress();
        setInProgressLessons(inProgressData || []);

        // Fetch completed courses
        const completedData = await userProgressService.getCompletedCourses();
        setCompletedLessons(completedData || []);

        // Fetch completed quizzes
        const quizzesData = await quizService.getCompletedQuizzes();
        setCompletedQuizzes(quizzesData || []);

        // Calculate stats
        const totalPoints = await userProgressService.getTotalPoints();
        const quizPoints = await quizService.getTotalQuizPoints();
        
        // Calculate average score from completed quizzes
        const scores = quizzesData
          .map(quiz => quiz.score || 0);
        const avgScore = scores.length 
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
          : 0;
        
        setStats({
          // Total is in-progress + completed for now
          totalLessons: inProgressData.length + completedData.length,
          lessonsCompleted: completedData.length,
          quizzesCompleted: quizzesData.length,
          totalPoints: totalPoints,
          averageScore: avgScore
        });
      } catch (error) {
        console.error("Error fetching courses data:", error);
        toast({
          title: "Error loading courses",
          description: "Could not load your course data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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

    return iconMap[lessonId] || <BookText size={24} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#14F195] mx-auto mb-4" />
          <p className="text-foreground">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Lessons Completed"
          value={`${stats.lessonsCompleted}/${stats.totalLessons}`}
          icon={BookOpen}
          gradientClass="from-[#8B5CF6] to-[#D946EF]"
        />
        <StatsCard
          title="Quizzes Completed"
          value={stats.quizzesCompleted}
          icon={CheckCircle}
          gradientClass="from-[#14F195] to-[#9945FF]"
        />
        <StatsCard
          title="Total Points"
          value={stats.totalPoints}
          icon={Award}
          gradientClass="from-[#F97316] to-[#FBBF24]"
        />
        <StatsCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={GraduationCap}
          gradientClass="from-[#0EA5E9] to-[#6366F1]"
        />
      </div>

      <Card className="border-border">
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

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <CheckCircle className="mr-2 h-5 w-5 text-[#14F195] flex-shrink-0" />
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
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm text-muted-foreground">
                          Completed on {lesson.completedDate}
                        </span>
                      </div>
                      {lesson.scorePercentage && (
                        <div className="mt-1">
                          <span className="text-sm bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                            Score: {lesson.scorePercentage}%
                          </span>
                        </div>
                      )}
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
                <Link to="/">Browse Courses</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Award className="mr-2 h-5 w-5 text-[#14F195] flex-shrink-0" />
            <span className="flex-wrap">Completed Quizzes & Tests</span>
          </CardTitle>
          <CardDescription>Your assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          {completedQuizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Quiz/Test</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Score</TableHead>
                    <TableHead className="text-foreground text-right">Points</TableHead>
                    <TableHead className="text-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedQuizzes.map((quiz) => (
                    <TableRow key={quiz.id} className="border-border">
                      <TableCell className="text-foreground">
                        {quiz.quiz?.title || "Quiz"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {new Date(quiz.completed_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-foreground">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          quiz.score >= 80 
                            ? "bg-green-500/20 text-green-500" 
                            : quiz.score >= 60
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-red-500/20 text-red-500"
                        }`}>
                          {quiz.score}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className="text-[#14F195]">
                          +{quiz.points_earned}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-foreground hover:bg-muted/10"
                          asChild
                        >
                          <Link
                            to={`/quiz/${quiz.lesson_id}/${quiz.quiz_id}`}
                          >
                            Review
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Complete your first quiz to see your results here!
              </p>
              <Button variant="gradient" asChild>
                <Link to="/">Take a Quiz</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
