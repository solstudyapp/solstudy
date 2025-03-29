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

const PAGE_TIMER_DURATION = 30

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
  const [timeRemaining, setTimeRemaining] =
    useState<number>(PAGE_TIMER_DURATION)
  const [isPageComplete, setIsPageComplete] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [pageId, setPageId] = useState<string>("")
  const [isTimerActive, setIsTimerActive] = useState(false)

  // Check if a quiz exists for this section
  useEffect(() => {
    const checkQuizExists = async () => {
      if (!isLastPageOfSection) return

      
      setIsCheckingQuiz(true)

      try {
        // Always check for a final test if this is the last page
        // This ensures we detect the final test even when there's a section quiz
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
            const hasFinalTestResult = finalTestData && finalTestData.length > 0
            setHasFinalTest(hasFinalTestResult)
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
        }

        const { data, error } = await query

        if (error) {
          console.error("Error checking for quiz:", error)
          setHasQuiz(false)
          setQuizId(null)
        } else {
          const quizExists = data && data.length > 0

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

    // Set the pageId immediately to avoid delays
    setPageId(pageIdToUse)

    // Reset timer for every new page without checking completion first
    setTimeRemaining(PAGE_TIMER_DURATION)
    setIsPageComplete(false)
    setIsTimerActive(true)

    const getCurrentPageId = async () => {
      try {
        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          return
        }

        // Check if the page is completed
        const { data, error } = await supabase
          .from("user_progress")
          .select("completed_pages")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .single()

        if (error && error.code !== "PGRST116") {
          return
        }

        // Check completion status
        if (
          data &&
          data.completed_pages &&
          Array.isArray(data.completed_pages)
        ) {
          const isCompleted = data.completed_pages.includes(pageIdToUse)

          // Always force timer to run for 30 seconds
          // We'll only set isPageComplete after 30 seconds
        } else {
          // Check via service if no completed_pages data
          // But don't update isPageComplete yet
          const completed = await isPageCompleted(
            lessonId,
            String(currentSection),
            pageIdToUse
          )
        }
      } catch (error) {
        // Silent fail
      } finally {
        setIsLoading(false)
      }
    }

    getCurrentPageId()
  }, [lessonId, currentPage, currentSection])

  // Timer effect - use this one exclusively for timing
  useEffect(() => {
    // Skip timer if no pageId is set yet
    if (!pageId) {
      return
    }

    // Always run the timer for 30 seconds on every page, regardless of completion status

    setIsTimerActive(true)

    // Start timer for all pages in all sections
    if (timeRemaining > 0) {
      // Start countdown
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1
          if (newTime <= 0) {
            clearInterval(timer)

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
    }
  }, [pageId, timeRemaining, currentSection, lessonId])

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

  // New function to handle final test navigation
  const handleTakeFinalTest = async () => {
    // Mark all sections as completed before taking the final test
    try {
      // First mark current section as completed
      await completeSection(lessonId, sectionId)

      // Navigate to the final test
      navigate(`/quiz/${lessonId}/final`)
    } catch (error) {
      console.error("Error preparing for final test:", error)
    }
  }

  // Function to mark page as completed
  const markPageAsCompleted = async () => {
    if (!lessonId || !pageId) {
      return
    }

    if (isPageComplete) {
      return
    }

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
        setIsTimerActive(false) // Explicitly turn off timer

        toast({
          title: "Page completed",
          description: "You can now proceed to the next page.",
        })
      }
    } catch (error) {
      // Silent fail
    }
  }

  const handleNext = () => {
    if (lessonId) {
      // Use currentSection instead of sectionId for consistency
      const sectionIdToUse = String(currentSection)

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
              // If quiz is completed, always show the quiz completed button first
              // Don't show the final test button here - it should only appear when there's no quiz
              <div className="flex items-center gap-2">
                {/* Button to retake the section quiz */}
                <Button
                  className="bg-blue-600/70 hover:bg-blue-600/90 text-white border-0"
                  onClick={handleTakeQuiz}
                >
                  Retake Section Quiz
                  <FileQuestion className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              // If quiz is not completed, show the timer first, then take quiz button
              <div className="flex items-center gap-2">
                {/* Timer display tooltip for last page */}
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
                          Please spend at least {PAGE_TIMER_DURATION} seconds on
                          each new page before proceeding.{" "}
                          <strong>
                            Page: {currentPage}, Section: {currentSection}
                          </strong>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <Button
                  className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
                  onClick={
                    !isPageComplete && timeRemaining > 0
                      ? undefined
                      : handleTakeQuiz
                  }
                  disabled={
                    isCheckingQuiz ||
                    isUpdating ||
                    (!isPageComplete && timeRemaining > 0)
                  }
                >
                  {isCheckingQuiz || isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isCheckingQuiz ? "Checking..." : "Saving progress..."}
                    </>
                  ) : !isPageComplete && timeRemaining > 0 ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Wait {timeRemaining}s
                    </>
                  ) : (
                    <>
                      Take Section Quiz
                      <FileQuestion className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )
          ) : isLastPage && hasFinalTest ? (
            // Only show final test button if there's no quiz for this section
            // Final test button with timer
            <div className="flex items-center gap-2">
              {/* Timer display tooltip for last page */}
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
                        Please spend at least {PAGE_TIMER_DURATION} seconds on
                        each new page before proceeding.{" "}
                        <strong>
                          Page: {currentPage}, Section: {currentSection}
                        </strong>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Button
                onClick={
                  !isPageComplete && timeRemaining > 0
                    ? undefined
                    : handleTakeFinalTest
                }
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
                disabled={
                  isCheckingQuiz ||
                  isUpdating ||
                  (!isPageComplete && timeRemaining > 0)
                }
              >
                {isCheckingQuiz || isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCheckingQuiz ? "Checking..." : "Saving progress..."}
                  </>
                ) : !isPageComplete && timeRemaining > 0 ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Wait {timeRemaining}s
                  </>
                ) : (
                  <>
                    Take Final Test
                    <FileQuestion className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Next Section button with timer
            <div className="flex items-center gap-2">
              {/* Timer display tooltip for last page */}
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
                        Please spend at least {PAGE_TIMER_DURATION} seconds on
                        each new page before proceeding.{" "}
                        <strong>
                          Page: {currentPage}, Section: {currentSection}
                        </strong>
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
                    Wait {timeRemaining}s
                  </>
                ) : (
                  <>
                    {isLastPage ? "Finish Lesson" : "Next Section"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )
        ) : (
          // Regular Next Page button with timer
          <div className="flex items-center gap-2">
            {/* Timer display tooltip */}
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
                      Please spend at least {PAGE_TIMER_DURATION} seconds on
                      each new page before proceeding.{" "}
                      <strong>
                        Page: {currentPage}, Section: {currentSection}
                      </strong>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Next button with timer */}
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
                  Wait {timeRemaining}s
                </>
              ) : (
                <>
                  {isLastPage
                    ? "Finish Lesson"
                    : isLastPageOfSection
                    ? "Next Section"
                    : "Next Page"}
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
