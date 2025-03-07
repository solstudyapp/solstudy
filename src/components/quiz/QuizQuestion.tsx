
import { useState } from "react";
import { Question } from "@/types/lesson";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface QuizQuestionProps {
  question: Question;
  selectedOption: number | undefined;
  onSelectOption: (optionIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  hasAnswered: boolean;
}

const QuizQuestion = ({ 
  question, 
  selectedOption, 
  onSelectOption, 
  onNext, 
  onPrev, 
  isFirst, 
  isLast,
  hasAnswered 
}: QuizQuestionProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    if (!isSubmitted) {
      onSelectOption(optionIndex);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === undefined) return;
    
    setIsSubmitted(true);
    
    // Check if answer is correct
    const isCorrect = selectedOption === question.correctOptionIndex;
    
    if (isCorrect) {
      toast({
        title: "Correct!",
        description: "Good job! Moving to next question soon...",
      });
    } else {
      // For wrong answers, show explanation if available
      setShowExplanation(true);
      
      const explanationText = question.explanation 
        ? question.explanation 
        : `The correct answer was: ${question.options[question.correctOptionIndex]}`;
      
      toast({
        title: "Incorrect",
        description: explanationText,
      });
    }
    
    // Wait for a moment to show feedback before moving to next question
    setTimeout(() => {
      onNext();
      setIsSubmitted(false);
      setShowExplanation(false);
    }, 3000); // Extended time to allow reading the explanation
  };

  return (
    <Card className="backdrop-blur-md bg-white/10 border border-white/10 text-white">
      <CardHeader>
        <CardTitle>{question.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`p-4 rounded-md border cursor-pointer transition-all ${
                selectedOption === index
                  ? isSubmitted
                    ? index === question.correctOptionIndex
                      ? "border-green-500 bg-green-500/20"
                      : "border-red-500 bg-red-500/20"
                    : "border-purple-400 bg-white/20"
                  : "border-white/20 hover:border-white/40 hover:bg-white/10"
              }`}
              onClick={() => handleOptionSelect(index)}
            >
              {option}
            </div>
          ))}
        </div>
        
        {/* Explanation for wrong answers */}
        {isSubmitted && showExplanation && question.explanation && (
          <div className="mt-4 p-3 border border-yellow-500/50 bg-yellow-500/10 rounded-md">
            <p className="font-medium text-yellow-300 mb-1">Explanation:</p>
            <p>{question.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-white/10 pt-4">
        <Button
          onClick={onPrev}
          disabled={isFirst || isSubmitted}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedOption === undefined || isSubmitted}
          className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
        >
          {isSubmitted ? "Next Question..." : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizQuestion;
