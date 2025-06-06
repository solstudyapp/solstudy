import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { DifficultyBadge } from "./DifficultyBadge"
import { LessonType } from "@/types/lesson"
import { usePrerequisites } from "@/hooks/use-prerequisites"
import { PrerequisiteModal } from "./PrerequisiteModal"

interface LessonCardProps {
  lesson: LessonType
}

const LessonCard = ({ lesson }: LessonCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false)
  const navigate = useNavigate()
  const {
    beginnerCompleted,
    intermediateCompleted,
    checkPrerequisites,
    availableCourses,
  } = usePrerequisites()

  console.log("lesson", lesson)

  // Check if this lesson is completed - handle case when not logged in
  const isCompleted = lesson.isCompleted || false

  const handleStartLesson = () => {
    // Check prerequisites for intermediate and advanced courses
    // if (lesson.difficulty !== "beginner") {
    //   const hasPrerequisites = checkPrerequisites(lesson.difficulty)

    //   if (!hasPrerequisites) {
    //     // Show the modal instead of navigating
    //     // Modal is currently hidden
    //     // setShowPrerequisiteModal(true)
    //     // return
    //   }
    // }

    // If prerequisites are met or it's a beginner course, navigate to lesson
    window.scrollTo(0, 0)
    navigate(`/lesson/${lesson.id}`)
  }

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 glass-card border-0 group relative cursor-pointer h-full flex flex-col",
          // Apply grayscale filter to completed lessons, keep on hover
          isCompleted && "filter grayscale transition-all",
          lesson.difficulty === "beginner" &&
            "bg-gradient-to-br from-green-400/10 to-emerald-500/20",
          lesson.difficulty === "intermediate" &&
            "bg-gradient-to-br from-blue-400/10 to-purple-500/20",
          lesson.difficulty === "advanced" &&
            "bg-gradient-to-br from-orange-400/10 to-red-500/20",
          isHovered && "transform-gpu translate-y-[-8px] shadow-lg"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleStartLesson}
      >
        <div className="absolute top-0 right-0 bg-background/40 backdrop-blur-sm text-foreground px-3 py-1 text-xs font-medium">
          {isCompleted && "Completed"}
        </div>

        <CardHeader className="pb-0">
          <div className="flex justify-between items-start">
            <DifficultyBadge difficulty={lesson.difficulty} />
            {lesson.is_sponsored ? (
              <Badge
                className={cn(
                  "p-1 rounded-lg transition-all mb-2 text-foreground bg-muted"
                )}
              >
                Sponsored
              </Badge>
            ) : (
              <div />
            )}
          </div>
          <h3
            className={cn(
              "text-xl font-bold text-foreground mt-2",
              lesson.isCompleted && "text-muted-foreground"
            )}
          >
            {lesson.title}
          </h3>
        </CardHeader>

        <CardContent className="pt-4 flex-grow flex flex-col">
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {lesson.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.floor(lesson.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  )}
                />
              ))}
              <span className="text-muted-foreground text-xs ml-1">
                ({lesson.reviewCount})
              </span>
            </div>
            <Badge
              variant="outline"
              className="border-border text-muted-foreground"
            >
              {lesson.category}
            </Badge>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground mb-1">
              This lesson is sponsored by{" "}
              {lesson.sponsorName
                ? lesson.sponsorName
                : "your name and logo here"}
              . Want to sponsor a lesson?{" "}
              <a href="mailto:admin@solstudy.com" className="text-primary">
                Click here!
              </a>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-0 mt-auto">
          <Button
            variant="ghost"
            className={cn(
              "w-full hover:bg-accent/10 text-foreground rounded-none border-t border-border h-12",
              lesson.difficulty === "beginner" && "bg-green-500/30",
              lesson.difficulty === "intermediate" && "bg-blue-500/30",
              lesson.difficulty === "advanced" && "bg-orange-500/30"
            )}
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering the card's onClick
              handleStartLesson()
            }}
          >
            <span className="mr-auto">
              {isCompleted ? "Review Lesson" : "Start Learning"}
            </span>
            <ChevronRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
        </CardFooter>
      </Card>

      {/* Prerequisite Modal - currently hidden
      <PrerequisiteModal
        isOpen={showPrerequisiteModal}
        onClose={() => setShowPrerequisiteModal(false)}
        difficulty={lesson.difficulty}
        beginnerCompleted={beginnerCompleted}
        intermediateCompleted={intermediateCompleted}
        availableCourses={availableCourses}
      />
      */}
    </>
  )
}

export default LessonCard
