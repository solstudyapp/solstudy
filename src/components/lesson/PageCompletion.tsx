import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useProgress } from "@/hooks/use-progress"
import { CheckCircle, Loader2 } from "lucide-react"

interface PageCompletionProps {
  lessonId: string
  sectionId: string
  pageId: string
  onComplete?: () => void
}

export function PageCompletion({
  lessonId,
  sectionId,
  pageId,
  onComplete,
}: PageCompletionProps) {
  const { isUpdating, completePage, checkPageCompletion } = useProgress()
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkCompletion = async () => {
      setIsLoading(true)
      try {
        const completed = await checkPageCompletion(lessonId, sectionId, pageId)
        setIsCompleted(completed)
      } catch (error) {
        console.error("Error checking page completion:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkCompletion()
  }, [lessonId, sectionId, pageId])

  const handleMarkAsCompleted = async () => {
    const success = await completePage(lessonId, sectionId, pageId)
    if (success) {
      setIsCompleted(true)
      if (onComplete) {
        onComplete()
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-[#14F195]" />
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="flex items-center justify-center py-4 text-[#14F195]">
        <CheckCircle className="h-6 w-6 mr-2" />
        <span>Page Completed</span>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-4">
      <Button
        variant="gradient"
        onClick={handleMarkAsCompleted}
        disabled={isUpdating}
        className="flex items-center gap-2"
      >
        {isUpdating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            Mark as Completed
          </>
        )}
      </Button>
    </div>
  )
}
