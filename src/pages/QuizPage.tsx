import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { lessonService } from "@/services/lessonService"
import QuizHeader from "@/components/quiz/QuizHeader"
import QuizQuestion from "@/components/quiz/QuizQuestion"
import QuizResults from "@/components/quiz/QuizResults"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { fetchLessonById } from "@/services/lessons"
import { fetchSections } from "@/services/sections"
import { LessonType, Section, Quiz } from "@/types/lesson"
import { Button } from "@/components/ui/button"
import { LessonRatingModal } from "@/components/lesson/LessonRatingModal"
import { userProgressService } from "@/services/userProgressService"
import { quizService } from "@/services/quizService"

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
  const [isLoading, setIsLoading] = useState(true)
  const [lesson, setLesson] = useState<LessonType | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hasFinalTest, setHasFinalTest] = useState(false) // Track if a final test exists

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

        // Check if a final test exists for this lesson (when not already viewing final test)
        if (!isFinalTest) {
          try {
            const { data: finalTestData, error: finalTestError } =
              await supabase
                .from("quizzes")
                .select("id, title")
                .eq("lesson_id", lessonId)
                .eq("is_final_test", true)

            if (!finalTestError && finalTestData && finalTestData.length > 0) {
              setHasFinalTest(true)
            } else {
              setHasFinalTest(false)

              if (finalTestError) {
                console.error("Error checking for final test:", finalTestError)
              }
            }
          } catch (err) {
            console.error("Exception checking for final test:", err)
            setHasFinalTest(false)
          }
        }

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
    }
  }, [quiz?.id])

  // For the final test, check if all section quizzes are completed
  useEffect(() => {
    if (!isLoading && isFinalTest && lesson && sections.length > 0) {
      // Function to forcefully mark all sections as completed
      const forceCompleteAllSections = async () => {
        try {
          for (const section of sections) {
            await userProgressService.completeSection(
              lessonId || "",
              section.id
            )
            // Also update local cache
            lessonService.completeSection(lessonId || "", section.id)
          }

          return true
        } catch (error) {
          console.error("Error force completing sections:", error)
          return false
        }
      }

      // Skip checking for already completed final tests
      if (lessonService.isFinalTestCompleted(lessonId || "")) {
        return
      }

      // Check if we're coming directly from a section quiz by checking the URL
      const urlParams = new URLSearchParams(window.location.search)
      const fromSectionQuiz = urlParams.get("from_section_quiz") === "true"

      if (fromSectionQuiz) {
        // Force mark all sections as completed
        forceCompleteAllSections()
        return
      }

      const checkSectionQuizzes = async () => {
        try {
          // First check if there are any section quizzes for this lesson
          const { data: sectionQuizzes, error: quizError } = await supabase
            .from("quizzes")
            .select("id, section_id")
            .eq("lesson_id", lessonId)
            .eq("is_final_test", false)
            .not("section_id", "is", null)

          if (quizError) {
            console.error("Error checking for section quizzes:", quizError)
            return // Allow the user to take the final test if we can't check
          }

          // If there are no section quizzes, allow taking the final test
          if (!sectionQuizzes || sectionQuizzes.length === 0) {
            return
          }

          // Get the user's completed sections directly from database
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            console.error("No authenticated user found")
            return // Allow the user to take the final test if we can't check
          }

          // Check progress in the database
          const { data: userProgress, error: progressError } = await supabase
            .from("user_progress")
            .select("completed_sections")
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId)
            .single()

          if (progressError) {
            console.error("Error checking progress:", progressError)
            return // Allow the user to take the final test if we can't check
          }

          const completedSections = userProgress?.completed_sections || []

          // Check which sections need quizzes
          const sectionsWithQuizzes = new Set(
            sectionQuizzes.map((q) => String(q.section_id))
          )

          // If there are section quizzes, check if they're all completed
          const allSectionsCompleted = sections.every((section) => {
            // Only check sections that have quizzes
            if (sectionsWithQuizzes.has(String(section.id))) {
              const isCompleted = completedSections.includes(section.id)
              return isCompleted
            }

            return true // Sections without quizzes are considered completed
          })

          if (!allSectionsCompleted) {
            // Try to force complete all sections
            const forcedSuccess = await forceCompleteAllSections()

            if (forcedSuccess) {
            } else {
              // If force completion fails, show error and redirect
              toast({
                title: "Complete all sections first",
                description:
                  "You need to complete all section quizzes before taking the final test.",
                variant: "destructive",
              })
              navigate(`/lesson/${lessonId}`)
            }
          } else {
          }
        } catch (error) {
          console.error("Error checking section quizzes:", error)
          // On error, allow the user to take the test
        }
      }

      checkSectionQuizzes()
    }
  }, [isFinalTest, sections, lessonId, navigate, toast, isLoading, lesson])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#14F195] mx-auto mb-4" />
          <p className="text-foreground text-lg">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !lesson || !quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg border border-border">
          <h2 className="text-xl text-foreground mb-4">
            {error || "Quiz not available"}
          </h2>
          <p className="text-muted-foreground mb-6">
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

  const handleCompleteQuiz = async (earnedPoints: number) => {
    const score = calculateScore()
    const totalQuestions = quiz?.questions?.length || 1
    const percentScore = (score / totalQuestions) * 100

    // Log which quiz is being completed

    // First check if the quiz is already completed
    if (quiz && (await quizService.hasCompletedQuiz(quiz.id))) {
      // Still mark local progress for UI feedback
      if (isFinalTest) {
        lessonService.completeQuiz(quiz, score, earnedPoints)
        lessonService.completeFinalTest(lessonId || "")
        // Show rating modal directly instead of feedback
        setShowRatingModal(true)
      } else {
        lessonService.completeQuiz(quiz, score, earnedPoints)
        lessonService.completeSection(lessonId || "", sectionId || "")
        handleSectionQuizComplete()
      }
      return
    }

    // Mark the section as completed or record final test completion locally
    if (isFinalTest) {
      // Only complete the test if it hasn't been completed before
      if (!lessonService.isFinalTestCompleted(lessonId || "")) {
        // Pass the earned points to the completeQuiz method for local storage
        lessonService.completeQuiz(quiz, score, earnedPoints)
        lessonService.completeFinalTest(lessonId || "")

        // Update total points in Supabase
        if (quiz) {
          try {
            await userProgressService.completeQuiz(
              lessonId || "",
              quiz.id,
              percentScore,
              earnedPoints
            )
          } catch (error) {
            console.error("Error updating quiz completion in Supabase:", error)
          }
        }
      }

      // Show rating modal directly
      setShowRatingModal(true)
    } else {
      // For section quizzes, mark the section as completed locally and in database

      // Update local state first
      lessonService.completeQuiz(quiz, score, earnedPoints)
      lessonService.completeSection(lessonId || "", sectionId || "")

      // Update points in Supabase
      if (quiz) {
        try {
          await userProgressService.completeQuiz(
            lessonId || "",
            quiz.id,
            percentScore,
            earnedPoints
          )
        } catch (error) {
          console.error("Error updating quiz completion in Supabase:", error)
        }
      }

      // For section quizzes, proceed directly to navigation without showing feedback
      handleSectionQuizComplete()
    }
  }

  // Function to handle section quiz completion without feedback
  const handleSectionQuizComplete = async () => {
    // For section quizzes, determine if there's a next section
    const isLastSection = currentSectionIndex >= sections.length - 1

    if (isLastSection) {
      // Check if a final test exists and redirect to it
      if (hasFinalTest) {
        try {
          // First, ensure the quiz is marked as completed in the database
          await userProgressService.completeSection(
            lessonId || "",
            sectionId || ""
          )

          // Force a delay to ensure the database update is processed
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // For lessons with a final test, we need to ensure ALL sections are marked as completed
          // This is critical because the final test page checks for all sections to be completed
          for (const section of sections) {
            await userProgressService.completeSection(
              lessonId || "",
              section.id
            )
          }

          // Also update the local cache in lessonService
          for (const section of sections) {
            lessonService.completeSection(lessonId || "", section.id)
          }

          toast({
            title: "Section completed!",
            description: "Now taking the final test to complete the lesson.",
          })

          // Use a slight delay to ensure the toast is displayed before redirecting
          setTimeout(() => {
            // Force a hard navigation to the final test page with a special bypass parameter
            // This signals that we're coming directly from a section quiz and should bypass section completion checks
            window.location.href = `/quiz/${lessonId}/final?from_section_quiz=true`
          }, 1000)
        } catch (error) {
          console.error(
            "Error completing section before final test redirect:",
            error
          )
          // Still try to navigate to the final test even if there's an error
          window.location.href = `/quiz/${lessonId}/final?from_section_quiz=true`
        }
        return
      }

      // If no final test, auto-complete the lesson and show rating
      try {
        // Mark the lesson as completed in the database
        await userProgressService.completeLesson(lessonId || "")
        toast({
          title: "Lesson completed!",
          description: "You've completed all sections in this lesson.",
        })

        // Show the rating modal directly
        setShowRatingModal(true)
        return
      } catch (error) {
        console.error("Error completing lesson:", error)
        // If error, show toast and navigate to dashboard as fallback
        toast({
          title: "Lesson completed!",
          description: "You've completed this lesson successfully.",
        })
        navigate("/dashboard")
      }
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

  // Determine if user has answered the current question
  const hasAnswered = userAnswers[currentQuestion] !== undefined

  return (
    <div className="min-h-screen bg-background py-8 px-4">
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
            hasFinalTest={hasFinalTest}
            isLastSection={currentSectionIndex === sections.length - 1}
          />
        )}

        {/* Rating Modal */}
        {showRatingModal && lesson && (
          <LessonRatingModal
            isOpen={showRatingModal}
            onClose={() => {
              setShowRatingModal(false)
              // Navigate to dashboard after closing the rating modal
              navigate("/dashboard")
            }}
            lessonId={String(lesson.id)}
            lessonTitle={lesson.title}
          />
        )}
      </div>
    </div>
  )
}

export default QuizPage

