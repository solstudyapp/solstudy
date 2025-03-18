import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { quizService, UserQuizCompletion } from "@/services/quizService"
import { userProgressService } from "@/services/userProgressService"
import { Loader2, Trophy, ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

const QuizProgressPage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [completedQuizzes, setCompletedQuizzes] = useState<
    UserQuizCompletion[]
  >([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [totalQuizPoints, setTotalQuizPoints] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch all completed quizzes
        const quizzes = await quizService.getCompletedQuizzes()
        setCompletedQuizzes(quizzes)

        // Fetch total quiz points
        const quizPoints = await quizService.getTotalQuizPoints()
        setTotalQuizPoints(quizPoints)

        // Fetch total user points
        const points = await userProgressService.getTotalPoints()
        setTotalPoints(points)
      } catch (error) {
        console.error("Error fetching quiz progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#14F195] mx-auto mb-4" />
          <p className="text-white text-lg">Loading your quiz progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 text-white"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-md bg-white/10 border border-white/10 text-white col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                Quiz Progress
              </CardTitle>
              <CardDescription className="text-gray-300">
                Track your completed quizzes and points earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                You've completed{" "}
                <span className="font-bold text-white">
                  {completedQuizzes.length}
                </span>{" "}
                quizzes and earned{" "}
                <span className="font-bold text-white">{totalQuizPoints}</span>{" "}
                points from quizzes.
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-400" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">{totalPoints}</p>
              <p className="text-gray-300 mt-2">Total points earned</p>
            </CardContent>
          </Card>
        </div>

        {completedQuizzes.length > 0 ? (
          <Card className="backdrop-blur-md bg-white/10 border border-white/10 text-white">
            <CardHeader>
              <CardTitle>Completed Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>
                  A list of all your completed quizzes
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Points Earned</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedQuizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">
                        {quiz.quiz?.title || "Unnamed Quiz"}
                      </TableCell>
                      <TableCell>
                        {quiz.lesson?.title || "Unknown Lesson"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            quiz.score >= 80
                              ? "default"
                              : quiz.score >= 60
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {quiz.score}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {quiz.points_earned}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatDate(quiz.completed_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="backdrop-blur-md bg-white/10 border border-white/10 text-white">
            <CardHeader>
              <CardTitle>No Quizzes Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                You haven't completed any quizzes yet. Complete lessons and
                their quizzes to track your progress here.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="gradient" onClick={() => navigate("/lessons")}>
                Explore Lessons
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

export default QuizProgressPage
