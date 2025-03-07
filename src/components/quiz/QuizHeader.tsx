
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lessonData } from "@/data/lessons";

interface QuizHeaderProps {
  lessonId: string | undefined;
  currentQuestion: number;
  totalQuestions: number;
  quizTitle: string;
}

const QuizHeader = ({ lessonId, currentQuestion, totalQuestions, quizTitle }: QuizHeaderProps) => {
  // Use CoinGecko logo for all quizzes
  const sponsorLogo = "https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d208683fad7ae6f2ce06c76d0a56.png";

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="text-white/80 hover:text-white"
        >
          <Link to={lessonId ? `/lesson/${lessonId}` : '/'}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Course
          </Link>
        </Button>
        
        <div className="text-white text-sm">
          Question {currentQuestion + 1} of {totalQuestions}
        </div>
      </div>

      {/* Always display sponsor information */}
      <div className="mb-6 p-3 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 rounded-lg">
        <div className="text-white/70 text-xs mb-1 text-center">This Quiz is Brought to You By:</div>
        <div className="flex items-center justify-center h-10 bg-black/20 rounded">
          <img 
            src={sponsorLogo} 
            alt="CoinGecko Logo" 
            className="h-6 max-w-[100px] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default QuizHeader;
