import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { lessonService } from "@/services/lessonService"
import QuizHeader from "@/components/quiz/QuizHeader"
import QuizQuestion from "@/components/quiz/QuizQuestion"
import QuizResults from "@/components/quiz/QuizResults"
import FeedbackDialog from "@/components/quiz/FeedbackDialog"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { fetchLessonById } from "@/services/lessons"
import { fetchSections } from "@/services/sections"
import { LessonType, Section, Quiz } from "@/types/lesson"
import { Button } from "@/components/ui/button"

// Interface for quiz data from Supabase
interface DBQuiz {
  id: string
  title: string
  questions: {
    id: string
    question: string
    options: string[]
    correctAnswer: number
  }[]
  points: number
  lesson_id: string | null
  section_id: number | null
  created_at: string
  updated_at: string
}

// Function to fetch a quiz by lesson_id and section_id
const fetchQuizByLessonAndSection = async (
  lessonId: string,
  sectionId: string,
  isFinalTest: boolean
): Promise<Quiz | null> => {
  try {
    let query = supabase.from("quizzes").select("*")

    if (isFinalTest) {
      // For final test, find quiz with matching lesson_id and section_id is null
      query = query
        .eq("lesson_id", lessonId)
        .is("section_id", null)
        .eq("is_final_test", true)
    } else if (sectionId === "default") {
      // For default section, find quiz with matching lesson_id and section_id is null
      query = query
        .eq("lesson_id", lessonId)
        .is("section_id", null)
        .eq("is_final_test", false)
    } else {
      // For specific section, find quiz with matching lesson_id and section_id
      query = query
        .eq("lesson_id", lessonId)
        .eq("section_id", parseInt(sectionId))
    }

    const { data, error } = await query.single()

    if (error) {
      console.error("Error fetching quiz:", error)
      return null
    }

    if (!data) return null

    // Convert DB quiz to frontend Quiz format
    return {
      id: data.id,
      title: data.title,
      lessonId: data.lesson_id || "default",
      sectionId: data.section_id ? String(data.section_id) : "default",
      rewardPoints: data.points,
      isFinalTest: isFinalTest,
      questions: data.questions.map((q: any) => ({
        id: q.id,
        text: q.question,
        options: q.options,
        correctOptionIndex: q.correctAnswer,
      })),
    }
  } catch (error) {
    console.error("Error in fetchQuizByLessonAndSection:", error)
    return null
  }
}

const QuizPage = () => {
  const { lessonId, sectionId } = useParams<{
    lessonId: string
    sectionId: string
  }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lesson, setLesson] = useState<LessonType | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Determine if this is a final test
  const isFinalTest = sectionId === "final"

  // Load lesson, sections, and quiz data
  useEffect(() => {
    const fetchData = async () => {
      if (!lessonId || !sectionId) {
        setError("Missing lesson or section ID")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch lesson data
        const lessonData = await fetchLessonById(lessonId)
        if (!lessonData) {
          setError("Lesson not found")
          setIsLoading(false)
          return
        }
        setLesson(lessonData)

        // Fetch sections data
        const sectionsData = await fetchSections(lessonId)
        if (!sectionsData || sectionsData.length === 0) {
          setError("No sections found for this lesson")
          setIsLoading(false)
          return
        }
        setSections(sectionsData)

        // Fetch quiz data
        const quizData = await fetchQuizByLessonAndSection(
          lessonId,
          sectionId,
          isFinalTest
        )
        if (!quizData) {
          // If this is a section quiz and it doesn't exist, redirect back to the lesson
          if (!isFinalTest) {
            toast({
              title: "Quiz not available",
              description:
                "This section doesn't have a quiz. Returning to lesson.",
              variant: "destructive",
            })

            // Find the section index
            const sectionIndex = sectionsData.findIndex(
              (section) =>
                section.id === sectionId || String(section.id) === sectionId
            )

            if (sectionIndex >= 0 && sectionIndex < sectionsData.length - 1) {
              // If there's a next section, navigate to it
              navigate(`/lesson/${lessonId}?section=${sectionIndex + 1}&page=0`)
            } else {
              // Otherwise, just go back to the lesson
              navigate(`/lesson/${lessonId}`)
            }
            return
          } else {
            setError("Quiz not found")
            setIsLoading(false)
            return
          }
        }
        setQuiz(quizData)
      } catch (error) {
        console.error("Error loading quiz data:", error)
        setError("Failed to load quiz data")
        toast({
          title: "Error loading quiz",
          description:
            "There was a problem loading the quiz data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [lessonId, sectionId, isFinalTest, toast, navigate])

  // Parse the current section number from the sectionId
  const currentSectionIndex = (() => {
    if (isFinalTest) return sections.length - 1

    if (!sectionId || sectionId === "default") return 0

    // Try to find the section index by matching the section_id
    const index = sections.findIndex(
      (section) => section.id === sectionId || String(section.id) === sectionId
    )
    return index >= 0 ? index : 0
  })()

  // Reset state when quiz changes
  useEffect(() => {
    if (quiz) {
      setCurrentQuestion(0)
      setUserAnswers([])
      setShowResults(false)
      setShowFeedback(false)
    }
  }, [quiz?.id])

  // For the final test, check if all section quizzes are completed
  useEffect(() => {
    if (!isLoading && isFinalTest && lesson && sections.length > 0) {
      // Skip checking for already completed final tests
      if (lessonService.isFinalTestCompleted(lessonId || "")) {
        return
      }

      const allSectionsCompleted = sections.every((section) =>
        lessonService.isSectionCompleted(lessonId || "", section.id)
      )

      if (!allSectionsCompleted) {
        toast({
          title: "Complete all sections first",
          description:
            "You need to complete all section quizzes before taking the final test.",
          variant: "destructive",
        })
        navigate(`/lesson/${lessonId}`)
      }
    }
  }, [isFinalTest, sections, lessonId, navigate, toast, isLoading, lesson])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#14F195] mx-auto mb-4" />
          <p className="text-white text-lg">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !lesson || !quiz) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-lg">
          <h2 className="text-xl text-white mb-4">
            {error || "Quiz not available"}
          </h2>
          <p className="text-gray-400 mb-6">
            We couldn't load the quiz. This might be because the quiz doesn't
            exist or there was a problem connecting to our servers.
          </p>
          <Button
            variant="gradient"
            onClick={() => navigate(`/lesson/${lessonId}`)}
            className="mx-auto"
          >
            Return to Lesson
          </Button>
        </div>
      </div>
    )
  }

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestion] = optionIndex
    setUserAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // All questions completed, show results
      setShowResults(true)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    // Ensure we have both quiz questions and user answers before calculating
    if (!quiz?.questions || userAnswers.length === 0) {
      return 0
    }

    return userAnswers.reduce((score, answer, index) => {
      // Make sure we have a question at this index before accessing its properties
      if (quiz.questions[index]) {
        return answer === quiz.questions[index].correctOptionIndex
          ? score + 1
          : score
      }
      return score
    }, 0)
  }

  const handleCompleteQuiz = () => {
    const score = calculateScore()

    // Mark the section as completed or record final test completion
    if (isFinalTest) {
      // Only complete the test if it hasn't been completed before
      if (!lessonService.isFinalTestCompleted(lessonId || "")) {
        lessonService.completeQuiz(quiz, score)
        lessonService.completeFinalTest(lessonId || "")
      }

      // Show feedback dialog after the final test
      setShowFeedback(true)
    } else {
      // For section quizzes, mark the section as completed
      lessonService.completeQuiz(quiz, score)
      lessonService.completeSection(lessonId || "", sectionId || "")

      // For section quizzes, proceed directly to navigation without showing feedback
      handleSectionQuizComplete()
    }
  }

  // Function to handle section quiz completion without feedback
  const handleSectionQuizComplete = () => {
    // For section quizzes, determine if there's a next section
    const isLastSection = currentSectionIndex >= sections.length - 1

    if (isLastSection) {
      // If this was the last section quiz, navigate to the final test
      toast({
        title: "All sections completed!",
        description: "You can now take the final test for this lesson.",
      })

      // Explicitly navigate to the final test
      navigate(`/quiz/${lessonId}/final`)
    } else {
      // If there are more sections, navigate to the next section
      const nextSectionIndex = currentSectionIndex + 1
      const nextSection = sections[nextSectionIndex]

      if (!nextSection) {
        console.error("Next section not found")
        navigate("/")
        return
      }

      const nextSectionFirstPageId = nextSection.pages[0].id

      // Update progress to next section
      lessonService.updateProgress(
        lessonId || "",
        nextSection.id,
        nextSectionFirstPageId
      )

      toast({
        title: "Section completed!",
        description: "Moving on to the next section.",
      })

      // Navigate directly to the next section's first page
      navigate(`/lesson/${lessonId}?section=${nextSectionIndex}&page=0`)
    }
  }

  const handleFeedbackComplete = () => {
    setShowFeedback(false)

    // After the final test, go to dashboard
    toast({
      title: "Course completed!",
      description: "Congratulations! You've completed the entire course.",
    })
    navigate("/dashboard")
  }

  // Determine if user has answered the current question
  const hasAnswered = userAnswers[currentQuestion] !== undefined

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <QuizHeader
          lessonId={lessonId}
          currentQuestion={currentQuestion}
          totalQuestions={quiz.questions.length}
          quizTitle={quiz.title}
          isFinalTest={isFinalTest}
        />

        {!showResults ? (
          <QuizQuestion
            question={quiz.questions[currentQuestion]}
            selectedOption={userAnswers[currentQuestion]}
            onSelectOption={handleSelectAnswer}
            onNext={nextQuestion}
            onPrev={prevQuestion}
            isFirst={currentQuestion === 0}
            isLast={currentQuestion === quiz.questions.length - 1}
            hasAnswered={hasAnswered}
          />
        ) : (
          <QuizResults
            score={calculateScore()}
            totalQuestions={quiz.questions.length}
            onComplete={handleCompleteQuiz}
            quiz={quiz}
          />
        )}

        {showFeedback && (
          <FeedbackDialog
            lessonId={lessonId || ""}
            onComplete={handleFeedbackComplete}
          />
        )}
      </div>
    </div>
  )
}

export default QuizPage

