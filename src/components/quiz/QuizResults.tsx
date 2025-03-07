
import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types/lesson";

interface QuizResultsProps {
  quiz: Quiz;
  score: number;
  onComplete: () => void;
}

const QuizResults = ({ quiz, score, onComplete }: QuizResultsProps) => {
  const earnedPoints = Math.round((score / quiz.questions.length) * quiz.rewardPoints);
  
  // Determine the message based on score and whether this is a final test
  const getMessage = () => {
    const percentage = score / quiz.questions.length;
    
    if (quiz.isFinalTest) {
      if (percentage >= 0.8) {
        return "Congratulations! You've mastered this course!";
      } else if (percentage >= 0.6) {
        return "Good job completing the course! You've learned a lot.";
      } else {
        return "You've completed the course. Consider reviewing the material to reinforce your knowledge.";
      }
    } else {
      if (percentage >= 0.8) {
        return "Great job! You've mastered this section.";
      } else if (percentage >= 0.6) {
        return "Good effort! Keep studying to improve.";
      } else {
        return "Need more practice. Review the material and try again.";
      }
    }
  };
  
  return (
    <Card className="backdrop-blur-md bg-white/10 border border-white/10 text-white">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="text-5xl font-bold mb-2">{score}/{quiz.questions.length}</div>
            <p className="text-white/70">{getMessage()}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Award className="mr-2 h-5 w-5 text-[#14F195]" />
              <p className="font-medium">You earned {earnedPoints} points!</p>
            </div>
            <p className="text-sm text-white/70">Keep learning to earn more rewards</p>
          </div>
          
          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0 mt-4"
          >
            {quiz.isFinalTest 
              ? "Complete Course" 
              : "Continue to Next Section"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizResults;
