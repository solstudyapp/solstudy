
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { LessonType } from "@/types/lesson";

interface LessonHeaderProps {
  lesson: LessonType;
  progress: number;
  totalSections: number;
  totalPages: number;
}

const LessonHeader = ({ lesson, progress, totalSections, totalPages }: LessonHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="text-white/80 hover:text-white p-0 h-auto font-normal"
          >
            <Link to="/">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{lesson.title}</h1>
        <div className="flex items-center mt-2">
          <DifficultyBadge difficulty={lesson.difficulty} />
          <span className="text-white/70 text-sm ml-3">{totalSections} sections • {totalPages} pages</span>
        </div>
      </div>
      
      <div className="mt-4 md:mt-0">
        <div className="flex items-center mb-1">
          <span className="text-white text-sm mr-2">Progress</span>
          <span className="text-white text-sm font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="w-32 md:w-40 h-2 bg-white/20" />
      </div>
    </div>
  );
};

export default LessonHeader;
