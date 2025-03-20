import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom"

interface PrerequisiteModalProps {
  isOpen: boolean
  onClose: () => void
  difficulty: string
  beginnerCompleted: boolean
  intermediateCompleted: boolean
  availableCourses: { id: string; title: string; difficulty: string }[]
}

export function PrerequisiteModal({
  isOpen,
  onClose,
  difficulty,
  beginnerCompleted,
  intermediateCompleted,
  availableCourses,
}: PrerequisiteModalProps) {
  const navigate = useNavigate()

  // Determine which courses need to be completed
  const prerequisiteText =
    difficulty === "intermediate"
      ? "beginner"
      : difficulty === "advanced" && !beginnerCompleted
      ? "beginner and intermediate"
      : "intermediate"

  // Get courses that should be completed first
  const suggestedCourses = availableCourses.filter((course) => {
    if (difficulty === "intermediate") {
      return course.difficulty === "beginner"
    } else if (difficulty === "advanced") {
      return !beginnerCompleted
        ? course.difficulty === "beginner"
        : course.difficulty === "intermediate"
    }
    return false
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Complete Prerequisites First
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Before taking a{" "}
            <span className="font-semibold text-white">{difficulty}</span>{" "}
            course, you should complete {prerequisiteText} courses first.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="font-medium mb-2">
            Suggested courses to complete first:
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {suggestedCourses.length > 0 ? (
              suggestedCourses.map((course) => (
                <div
                  key={course.id}
                  className={`p-3 rounded-lg ${
                    course.difficulty === "beginner"
                      ? "bg-green-500/20 border-green-500/30"
                      : "bg-blue-500/20 border-blue-500/30"
                  } border flex justify-between items-center cursor-pointer hover:bg-white/10`}
                  onClick={() => {
                    navigate(`/lesson/${course.id}`)
                    onClose()
                  }}
                >
                  <span className="font-medium">{course.title}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      course.difficulty === "beginner"
                        ? "bg-green-500/30 text-green-200"
                        : "bg-blue-500/30 text-blue-200"
                    }`}
                  >
                    {course.difficulty}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-white/50 italic">
                No prerequisite courses available at this time.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          <div />
          <Button
            onClick={onClose}
            className="bg-white/10 text-white hover:bg-white/20"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
