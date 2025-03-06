
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizHeaderProps {
  lessonId: string | undefined;
  currentQuestion: number;
  totalQuestions: number;
  quizTitle: string;
}

const QuizHeader = ({ lessonId, currentQuestion, totalQuestions, quizTitle }: QuizHeaderProps) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <Button 
        variant="ghost" 
        size="sm" 
        asChild 
        className="text-white/80 hover:text-white"
      >
        <Link to={lessonId ? `/lesson/${lessonId}` : '/'}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Lesson
        </Link>
      </Button>
      
      <div className="text-white text-sm">
        Question {currentQuestion + 1} of {totalQuestions}
      </div>
    </div>
  );
};

export default QuizHeader;
