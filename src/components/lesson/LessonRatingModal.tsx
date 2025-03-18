import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface LessonRatingModalProps {
  isOpen: boolean
  onClose: () => void
  lessonId: string
  lessonTitle: string
}

export const LessonRatingModal = ({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
}: LessonRatingModalProps) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a rating",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Check if the user has already rated this lesson
      const { data: existingRating, error: existingRatingError } =
        await supabase
          .from("lesson_ratings")
          .select("*")
          .eq("lesson_id", lessonId)
          .eq("user_id", user.id)

      if (existingRating) {
        // Submit the rating to Supabase
        const { error: updateError } = await supabase
          .from("lesson_ratings")
          .update({
            rating,
            feedback: feedback.trim() || null,
          })
          .eq("lesson_id", lessonId)
          .eq("user_id", user.id)

        if (updateError) {
          console.error("Error updating rating:", updateError)
          toast({
            title: "Error",
            description: "Failed to update your rating. Please try again.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted successfully.",
        })
        onClose()
        navigate("/dashboard")
        return
      }

      // Submit the rating to Supabase
      const { error } = await supabase.from("lesson_ratings").insert({
        lesson_id: lessonId,
        user_id: user.id,
        rating,
        feedback: feedback.trim() || null,
      })

      if (error) {
        console.error("Error submitting rating:", error)
        toast({
          title: "Error",
          description: "Failed to submit your rating. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      })

      // Close the modal and redirect to dashboard
      onClose()
      navigate("/dashboard")
    } catch (error) {
      console.error("Error in handleRatingSubmit:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onClose()
    navigate("/dashboard")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="dark-glass border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Rate this Lesson</DialogTitle>
          <DialogDescription className="text-white/70">
            Tell us what you thought about{" "}
            <span className="text-[#14F195] font-medium">{lessonTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-10 h-10 cursor-pointer transition-all duration-200",
                    hoveredRating >= star || rating >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-white/30"
                  )}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              Additional feedback (optional)
            </label>
            <Textarea
              placeholder="Share your experience with this lesson..."
              className="bg-white/5 border-white/10 text-white"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex space-x-2 sm:space-x-0">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Skip
          </Button>
          <Button
            onClick={handleRatingSubmit}
            disabled={isSubmitting}
            className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
