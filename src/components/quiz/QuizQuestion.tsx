
import { useState } from "react";
import { Question } from "@/types/lesson";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface QuizQuestionProps {
  question: Question;
  onNext: (isCorrect: boolean) => void;
}

const QuizQuestion = ({ question, onNext }: QuizQuestionProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    if (!isSubmitted) {
      setSelectedOption(optionIndex);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    setIsSubmitted(true);
    
    // Check if answer is correct
    const isCorrect = selectedOption === question.correctOptionIndex;
    
    if (isCorrect) {
      toast({
        title: "Correct!",
        description: "Good job! Moving to next question soon...",
      });
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer was: ${question.options[question.correctOptionIndex]}`,
      });
    }
    
    // Wait for a moment to show feedback before moving to next question
    setTimeout(() => {
      onNext(isCorrect);
      setSelectedOption(null);
      setIsSubmitted(false);
    }, 2000);
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
      </CardContent>
      <CardFooter className="justify-end border-t border-white/10 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitted}
          className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
        >
          {isSubmitted ? "Next Question..." : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizQuestion;
