import { Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quiz } from "@/types/lesson"

interface QuizResultsProps {
  score: number
  totalQuestions: number
  onComplete: (earnedPoints: number) => void
  quiz?: Quiz // Make quiz optional for backward compatibility
  hasFinalTest?: boolean // Add prop to indicate if a final test is available
  isLastSection?: boolean // Add prop to indicate if this is the last section
}

const QuizResults = ({
  quiz,
  score,
  totalQuestions,
  onComplete,
  hasFinalTest = false,
  isLastSection = false,
}: QuizResultsProps) => {
  // Log props to debug issues

  // Use quiz.questions.length if available, otherwise use totalQuestions
  const questionCount = quiz?.questions?.length || totalQuestions
  const earnedPoints = Math.round(
    (score / questionCount) * (quiz?.rewardPoints || 100)
  )

  const isFinalTest = quiz?.isFinalTest || false

  // Determine button text based on the quiz type and final test availability
  const buttonText = (() => {
    // For final tests, show "Finish Lesson"
    if (isFinalTest) return "Finish Lesson"

    // For the last section quiz when a final test is available,
    // show a combined button text that indicates both completing the quiz
    // and taking the final test in one action
    if (isLastSection && hasFinalTest)
      return "Complete Quiz and Take Final Test"

    // For all other section quizzes, show standard text
    return "Complete Quiz"
  })()

  // Handle button click with appropriate action
  const handleButtonClick = () => {
    // If this is for taking the final test after a section quiz, log extra information
    if (isLastSection && hasFinalTest) {
    }

    // Call the parent component's completion handler with the earned points
    onComplete(earnedPoints)
  }

  return (
    <Card className="backdrop-blur-md bg-white/10 border border-white/10 text-white">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="text-5xl font-bold mb-2">
              {score}/{questionCount}
            </div>
            <p className="text-white/70">
              {score / questionCount >= 0.8
                ? "Great job! You've mastered this section."
                : score / questionCount >= 0.6
                ? "Good effort! Keep studying to improve."
                : "Need more practice. Review the material and try again."}
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Award className="mr-2 h-5 w-5 text-[#14F195]" />
              <p className="font-medium">You earned {earnedPoints} points!</p>
            </div>
            <p className="text-sm text-white/70">
              Keep learning to earn more rewards
            </p>
          </div>

          <Button
            onClick={handleButtonClick}
            className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0 mt-4"
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuizResults
