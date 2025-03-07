
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { lessonService } from "@/services/lessonService";

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
  const sectionNumber = currentSection + 1;
  const quizId = `quiz-section${sectionNumber}`;
  const isQuizCompleted = lessonService.isQuizCompleted(lessonId, quizId);
  
  // If this is the last page of a section, user needs to take the quiz
  const shouldTakeQuiz = isLastPage;
  
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
      
      {shouldTakeQuiz ? (
        <Button 
          className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
          onClick={() => navigate(`/quiz/${lessonId}/section${sectionNumber}`)}
        >
          Take Quiz
          <Trophy className="ml-2 h-4 w-4" />
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
