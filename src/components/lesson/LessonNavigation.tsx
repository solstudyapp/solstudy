import { ChevronLeft, ChevronRight, FileQuestion, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useProgress } from "@/hooks/use-progress"
import { useToast } from "@/hooks/use-toast"

interface LessonNavigationProps {
  lessonId: string
  currentSection: number
  sectionId: string
  navigatePrev: () => void
  navigateNext: () => void
  isFirstPage: boolean
  isLastPage: boolean
  isLastPageOfSection: boolean
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
}: LessonNavigationProps) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isUpdating, completeSection, completeLesson } = useProgress()
  const [hasQuiz, setHasQuiz] = useState<boolean>(false)
  const [hasFinalTest, setHasFinalTest] = useState<boolean>(false)
  const [isCheckingQuiz, setIsCheckingQuiz] = useState<boolean>(false)

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

          console.log("Checking for default section quiz")
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
        } else {
          const quizExists = data && data.length > 0
          console.log(
            `Quiz ${
              quizExists ? "found" : "not found"
            } for section ${sectionId}`
          )
          setHasQuiz(quizExists)
        }
      } catch (error) {
        console.error("Error in checkQuizExists:", error)
        setHasQuiz(false)
      } finally {
        setIsCheckingQuiz(false)
      }
    }

    checkQuizExists()
  }, [lessonId, sectionId, isLastPageOfSection, isLastPage])

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

  return (
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
            onClick={handleNextSection}
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
        <Button
          onClick={navigateNext}
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
              Next Page
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export default LessonNavigation
