import {
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Loader2,
  CheckCircle,
  Clock,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useProgress } from "@/hooks/use-progress"
import { useToast } from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LessonNavigationProps {
  lessonId: string
  currentSection: number
  sectionId: string
  navigatePrev: () => void
  navigateNext: () => void
  isFirstPage: boolean
  isLastPage: boolean
  isLastPageOfSection: boolean
  currentPage: number
}

const LessonNavigation = ({
  lessonId,
  currentSection,
  sectionId,
  navigatePrev,
  navigateNext,
  isFirstPage,
  isLastPage,
  isLastPageOfSection,
  currentPage,
}: LessonNavigationProps) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    isUpdating,
    completeSection,
    completeLesson,
    isPageCompleted,
    markPageCompleted,
  } = useProgress()
  const [hasQuiz, setHasQuiz] = useState<boolean>(false)
  const [hasFinalTest, setHasFinalTest] = useState<boolean>(false)
  const [isCheckingQuiz, setIsCheckingQuiz] = useState<boolean>(false)
  const [quizId, setQuizId] = useState<string | null>(null)
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(30)
  const [isPageComplete, setIsPageComplete] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [pageId, setPageId] = useState<string>("")
  const [pageTimer, setPageTimer] = useState(30)
  const [isTimerActive, setIsTimerActive] = useState(false)

  // Check if a quiz exists for this section
  useEffect(() => {
    const checkQuizExists = async () => {
      if (!isLastPageOfSection) return

      console.log(
        `Checking if quiz exists for lesson ${lessonId}, section ${sectionId}`
      )
      setIsCheckingQuiz(true)

      try {
        // If this is the last page of the last section, also check for a final test
        if (isLastPage) {
          const finalTestQuery = supabase
            .from("quizzes")
            .select("id")
            .eq("lesson_id", lessonId)
            .eq("is_final_test", true)

          const { data: finalTestData, error: finalTestError } =
            await finalTestQuery

          if (finalTestError) {
            console.error("Error checking for final test:", finalTestError)
            setHasFinalTest(false)
          } else {
            setHasFinalTest(finalTestData && finalTestData.length > 0)
            console.log(
              `Final test ${
                finalTestData && finalTestData.length > 0
                  ? "found"
                  : "not found"
              } for lesson ${lessonId}`
            )
          }
        }

        let query = supabase.from("quizzes").select("id")

        if (sectionId === "default") {
          // For default section, find quiz with matching lesson_id and section_id is null
          query = query
            .eq("lesson_id", lessonId)
            .is("section_id", null)
            .eq("is_final_test", false)
        } else {
          // For specific section, find quiz with matching lesson_id and section_id
          const sectionIdNum = parseInt(sectionId)

          if (isNaN(sectionIdNum)) {
            console.error(`Invalid section ID: ${sectionId}`)
            setHasQuiz(false)
            setIsCheckingQuiz(false)
            return
          }

          query = query.eq("lesson_id", lessonId).eq("section_id", sectionIdNum)

          console.log(
            `Checking for section quiz with section_id=${sectionIdNum}`
          )
        }

        const { data, error } = await query

        if (error) {
          console.error("Error checking for quiz:", error)
          setHasQuiz(false)
          setQuizId(null)
        } else {
          const quizExists = data && data.length > 0
          console.log(
            `Quiz ${
              quizExists ? "found" : "not found"
            } for section ${sectionId}`
          )
          setHasQuiz(quizExists)

          // If quiz exists, save the quiz ID and check if it's completed
          if (quizExists && data && data.length > 0) {
            setQuizId(data[0].id)

            // Now check if the user has completed this quiz
            await checkQuizCompletion(data[0].id)
          } else {
            setQuizId(null)
            setQuizCompleted(false)
          }
        }
      } catch (error) {
        console.error("Error in checkQuizExists:", error)
        setHasQuiz(false)
        setQuizId(null)
        setQuizCompleted(false)
      } finally {
        setIsCheckingQuiz(false)
      }
    }

    checkQuizExists()
  }, [lessonId, sectionId, isLastPageOfSection, isLastPage])

  // Get the current page ID - directly from URL or params
  useEffect(() => {
    // Use currentPage directly as the page ID from the database
    const pageIdToUse = String(currentPage)
    const getCurrentPageId = async () => {
      try {
        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.error("No authenticated user found")
          return
        }

        // Set the page ID directly from currentPage
        setPageId(pageIdToUse)

        // Check if the page is completed
        const { data, error } = await supabase
          .from("user_progress")
          .select("completed_pages")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching completion status:", error)
          return
        }

        // Check completion status
        if (
          data &&
          data.completed_pages &&
          Array.isArray(data.completed_pages)
        ) {
          // Log the completed pages for debugging

          const isCompleted = data.completed_pages.includes(pageIdToUse)

          setIsPageComplete(isCompleted)
          setTimeRemaining(isCompleted ? 0 : 30)
        } else {
          // Check via service if no completed_pages data
          checkPageCompletion(pageIdToUse)
        }
      } catch (error) {
        console.error("Error getting current page ID:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getCurrentPageId()
  }, [lessonId, sectionId, currentSection, currentPage])

  // Check if the current page is completed
  const checkPageCompletion = async (pageIdToCheck: string) => {
    try {
      // Use currentSection instead of sectionId to ensure we're checking the right section
      const sectionIdToUse = String(currentSection)

      // Log debugging info

      // Use currentPage as the actual page ID to check
      const pageIdToUse = String(currentPage)

      const completed = await isPageCompleted(
        lessonId,
        sectionIdToUse,
        pageIdToUse
      )

      setIsPageComplete(completed)

      // If page is already completed, no need for timer
      if (completed) {
        setTimeRemaining(0)
      } else {
        // Reset timer for uncompleted pages

        setTimeRemaining(30)
      }
    } catch (error) {
      console.error("Error checking page completion:", error)
      setIsPageComplete(false)
    }
  }

  // Timer effect - use this one exclusively for timing
  useEffect(() => {
    console.log(
      `Timer effect triggered. pageId: ${pageId}, isLastPageOfSection: ${isLastPageOfSection}, isPageComplete: ${isPageComplete}, timeRemaining: ${timeRemaining}`
    )

    // Skip timer if no pageId is set yet
    if (!pageId) {
      return
    }

    // Only start timer if page is not completed and not the last page of section
    if (!isLastPageOfSection && !isPageComplete && timeRemaining > 0) {
      // Start countdown
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1

          if (newTime <= 0) {
            clearInterval(timer)
            console.log(
              `Timer reached zero for page ${pageId}, marking as completed`
            )
            markPageAsCompleted()
            return 0
          }
          return newTime
        })
      }, 1000)

      // Clear timer on unmount
      return () => {
        clearInterval(timer)
      }
    } else {
      console.log(
        `No timer needed. isLastPageOfSection: ${isLastPageOfSection}, isPageComplete: ${isPageComplete}, timeRemaining: ${timeRemaining}`
      )
    }
  }, [pageId, isPageComplete, isLastPageOfSection, timeRemaining])

  // Check if the user has completed the quiz
  const checkQuizCompletion = async (quizIdToCheck: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error("No authenticated user found")
        setQuizCompleted(false)
        return
      }

      // Check if the quiz is in user_quizzes
      const { data, error } = await supabase
        .from("user_quizzes")
        .select("id")
        .eq("user_id", user.id)
        .eq("quiz_id", quizIdToCheck)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking quiz completion:", error)
        setQuizCompleted(false)
        return
      }

      // If we found a record, the quiz is completed
      setQuizCompleted(!!data)
    } catch (error) {
      console.error("Error in checkQuizCompletion:", error)
      setQuizCompleted(false)
    }
  }

  const handleNextSection = async () => {
    if (isLastPage) {
      // Mark the lesson as completed
      try {
        const success = await completeLesson(lessonId)
      } catch (error) {
        console.error("Error completing lesson:", error)
      }
    }

    if (isLastPageOfSection) {
      // Mark the section as completed
      try {
        const success = await completeSection(lessonId, sectionId)
        if (success) {
          toast({
            title: "Section completed",
            description: "Your progress has been saved.",
          })
        }
      } catch (error) {
        console.error("Error completing section:", error)
      }
    }

    // Navigate to the next page/section regardless of completion status
    navigateNext()
  }

  const handleTakeQuiz = async () => {
    // Mark the section as completed before taking the quiz
    try {
      await completeSection(lessonId, sectionId)
    } catch (error) {
      console.error("Error completing section before quiz:", error)
    }

    // Navigate to the quiz
    navigate(`/quiz/${lessonId}/${sectionId}`)
  }

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 30)
    const secs = seconds % 30
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Check if page is already completed when component mounts or page changes
  useEffect(() => {
    const checkCompletion = async () => {
      if (lessonId && pageId) {
        const sectionIdToUse = String(currentSection)
        const completed = await isPageCompleted(
          lessonId,
          sectionIdToUse,
          pageId
        )

        setIsPageComplete(completed)

        // If page is not completed, start the timer at 30 seconds
        if (!completed) {
          setTimeRemaining(30)
        } else {
          setTimeRemaining(0)
        }
      }
    }

    checkCompletion()
  }, [lessonId, currentSection, pageId])

  // Function to mark page as completed
  const markPageAsCompleted = async () => {
    if (!lessonId || !pageId) {
      console.error("Cannot mark page as completed: Missing required IDs", {
        lessonId,
        sectionId: currentSection,
        pageId,
      })
      return
    }

    if (isPageComplete) {
      return
    }

    // Log the current page and page ID to understand the relationship

    try {
      // Use currentSection instead of sectionId for consistency
      const sectionIdToUse = String(currentSection)

      // Make sure the page ID is a string
      const success = await markPageCompleted(
        lessonId,
        sectionIdToUse,
        String(currentPage) // Use currentPage directly as the ID
      )

      if (success) {
        setIsPageComplete(true)
        setTimeRemaining(0) // Reset timer once marked as completed
        toast({
          title: "Page completed",
          description: "You can now proceed to the next page.",
        })
      } else {
        console.error("Failed to mark page as completed")
      }
    } catch (error) {
      console.error("Error marking page as completed:", error)
    }
  }

  const handleNext = () => {
    if (lessonId) {
      // Use currentSection instead of sectionId for consistency
      const sectionIdToUse = String(currentSection)
      console.log(
        `handleNext called for lesson ${lessonId}, page ${currentPage}`
      )

      if (isPageComplete || timeRemaining <= 0) {
        // Mark this page as completed before navigating
        if (!isPageComplete) {
          markPageAsCompleted()
        }
        navigateNext()
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between pt-4 border-t border-white/10">
        <Button
          variant="outline"
          onClick={navigatePrev}
          disabled={isFirstPage || isUpdating}
          className={`border-white/20 text-white hover:bg-white/10 hover:text-white ${
            isFirstPage ? "invisible" : ""
          }`}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous Page
        </Button>

        {isLastPageOfSection ? (
          hasQuiz ? (
            quizCompleted ? (
              // If quiz is completed, show a success button
              <Button
                className="bg-green-600/70 hover:bg-green-600/90 text-white border-0"
                onClick={() => {
                  toast({
                    title: "Quiz already completed",
                    description: "You can continue to the next section.",
                  })
                  if (!isLastPage) {
                    handleNextSection()
                  }
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Quiz Completed
              </Button>
            ) : (
              // If quiz is not completed, show the take quiz button
              <Button
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
                onClick={handleTakeQuiz}
                disabled={isCheckingQuiz || isUpdating}
              >
                {isCheckingQuiz || isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCheckingQuiz ? "Checking..." : "Saving progress..."}
                  </>
                ) : (
                  <>
                    Take Section Quiz
                    <FileQuestion className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )
          ) : isLastPage && hasFinalTest ? (
            <Button
              onClick={handleNextSection}
              className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
              disabled={isCheckingQuiz || isUpdating}
            >
              {isCheckingQuiz || isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCheckingQuiz ? "Checking..." : "Saving progress..."}
                </>
              ) : (
                <>
                  Take Final Test
                  <FileQuestion className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving progress...
                </>
              ) : (
                <>
                  {isLastPage ? "Finish Lesson" : "Next Section"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )
        ) : (
          // Regular Next Page button with timer
          <div className="flex items-center gap-2">
            {!isPageComplete && timeRemaining > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <Info className="h-4 w-4 text-white/70" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Please spend at least 30 seconds on each new page before
                      proceeding. <strong>Page ID: {pageId}</strong>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
              disabled={isUpdating || (!isPageComplete && timeRemaining > 0)}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving progress...
                </>
              ) : !isPageComplete && timeRemaining > 0 ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Wait {formatTime(timeRemaining)}
                </>
              ) : (
                <>
                  Next Page
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonNavigation
