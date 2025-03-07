
import { ChevronLeft, ChevronRight, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LessonNavigationProps {
  lessonId: string;
  currentSection: number;
  navigatePrev: () => void;
  navigateNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

const LessonNavigation = ({
  lessonId,
  currentSection,
  navigatePrev,
  navigateNext,
  isFirstPage,
  isLastPage,
}: LessonNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between pt-4 border-t border-white/10">
      <Button
        variant="outline"
        onClick={navigatePrev}
        disabled={isFirstPage}
        className={`border-white/20 text-white hover:bg-white/10 hover:text-white ${
          isFirstPage ? "invisible" : ""
        }`}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous Page
      </Button>
      
      {isLastPage ? (
        <Button 
          className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
          onClick={() => navigate(`/quiz/${lessonId}/section${currentSection + 1}`)}
        >
          Take Section Quiz
          <FileQuestion className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={navigateNext}
          className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
        >
          Next Page
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default LessonNavigation;
