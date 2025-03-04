
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./DifficultyBadge";
import { LessonType } from "@/types/lesson";

interface LessonCardProps {
  lesson: LessonType;
}

const LessonCard = ({ lesson }: LessonCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 dark-glass border-0 group relative",
        lesson.difficulty === "beginner" && "bg-gradient-to-br from-green-400/10 to-emerald-500/20 text-white",
        lesson.difficulty === "intermediate" && "bg-gradient-to-br from-blue-400/10 to-purple-500/20 text-white",
        lesson.difficulty === "advanced" && "bg-gradient-to-br from-orange-400/10 to-red-500/20 text-white",
        isHovered && "transform-gpu translate-y-[-8px] shadow-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {lesson.sponsored && (
        <div className="absolute top-0 right-0 bg-black/40 backdrop-blur-sm text-white px-3 py-1 text-xs font-medium">
          Sponsored
        </div>
      )}

      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <div className={cn(
            "p-3 rounded-lg transition-all mb-2 text-white",
            lesson.difficulty === "beginner" && "bg-green-500/30",
            lesson.difficulty === "intermediate" && "bg-blue-500/30",
            lesson.difficulty === "advanced" && "bg-orange-500/30"
          )}>
            {lesson.icon}
          </div>
          <DifficultyBadge difficulty={lesson.difficulty} />
        </div>
        <h3 className="text-xl font-bold text-white mt-2">{lesson.title}</h3>
      </CardHeader>

      <CardContent className="pt-4">
        <p className="text-white/80 mb-4">{lesson.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(lesson.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/30"
                )}
              />
            ))}
            <span className="text-white/70 text-xs ml-1">({lesson.reviewCount})</span>
          </div>
          <Badge variant="outline" className="border-white/20 text-white/70">
            {lesson.category}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-0 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full bg-black/20 hover:bg-white/10 text-white rounded-none border-t border-white/10 h-12"
        >
          <span className="mr-auto">Start Learning</span>
          <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
