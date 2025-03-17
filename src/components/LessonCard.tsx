import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { DifficultyBadge } from "./DifficultyBadge"
import { LessonType } from "@/types/lesson"

interface LessonCardProps {
  lesson: LessonType
}

const LessonCard = ({ lesson }: LessonCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  const handleStartLesson = () => {
    window.scrollTo(0, 0)
    navigate(`/lesson/${lesson.id}`)
  }

  // Use CoinGecko logo for all lessons
  const sponsorLogo =
    "https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d208683fad7ae6f2ce06c76d0a56.png"

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 dark-glass border-0 group relative cursor-pointer h-full flex flex-col",
        lesson.difficulty === "beginner" &&
          "bg-gradient-to-br from-green-400/10 to-emerald-500/20 text-white",
        lesson.difficulty === "intermediate" &&
          "bg-gradient-to-br from-blue-400/10 to-purple-500/20 text-white",
        lesson.difficulty === "advanced" &&
          "bg-gradient-to-br from-orange-400/10 to-red-500/20 text-white",
        isHovered && "transform-gpu translate-y-[-8px] shadow-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStartLesson}
    >
      <div className="absolute top-0 right-0 bg-black/40 backdrop-blur-sm text-white px-3 py-1 text-xs font-medium"></div>

      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <DifficultyBadge difficulty={lesson.difficulty} />
          {lesson.is_sponsored ? (
            <Badge
              className={cn(
                "p-1 rounded-lg transition-all mb-2 text-white bg-gray-800"
              )}
            >
              Sponsored
            </Badge>
          ) : (
            <div />
          )}
        </div>
        <h3 className="text-xl font-bold text-white mt-2">{lesson.title}</h3>
      </CardHeader>

      <CardContent className="pt-4 flex-grow flex flex-col">
        <p className="text-white/80 mb-4">{lesson.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(lesson.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-white/30"
                )}
              />
            ))}
            <span className="text-white/70 text-xs ml-1">
              ({lesson.reviewCount})
            </span>
          </div>
          <Badge variant="outline" className="border-white/20 text-white/70">
            {lesson.category}
          </Badge>
        </div>

        {lesson.is_sponsored && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-xs text-white/60 mb-1">
              This Course is Brought to You By:
            </div>
            <div className="h-8 bg-black/20 rounded flex items-center justify-center p-1">
              <img
                src={sponsorLogo}
                alt="CoinGecko Logo"
                className="h-6 max-w-[100px] object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-0 mt-auto">
        <Button
          variant="ghost"
          className={cn(
            "w-full hover:bg-white/10 text-white rounded-none border-t border-white/10 h-12",
            lesson.difficulty === "beginner" && "bg-green-500/30",
            lesson.difficulty === "intermediate" && "bg-blue-500/30",
            lesson.difficulty === "advanced" && "bg-orange-500/30"
          )}
          onClick={(e) => {
            e.stopPropagation() // Prevent triggering the card's onClick
            handleStartLesson()
          }}
        >
          <span className="mr-auto">Start Learning</span>
          <ChevronRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default LessonCard
