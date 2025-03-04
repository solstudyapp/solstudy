
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Award, ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  
  // Mock quiz data - would come from API in real app
  const quiz = {
    id: quizId,
    title: "Blockchain Fundamentals Quiz",
    description: "Test your knowledge of blockchain fundamentals",
    lessonId: "intro-to-blockchain",
    sectionId: "section1",
    rewardPoints: 50,
    questions: [
      {
        id: "q1",
        text: "What is blockchain?",
        options: [
          "A type of cryptocurrency",
          "A distributed database that maintains a growing list of records",
          "A cloud storage solution",
          "A programming language for smart contracts"
        ],
        correctOptionIndex: 1
      },
      {
        id: "q2",
        text: "What property of blockchain makes it secure?",
        options: [
          "Centralization",
          "Government regulation",
          "Immutability",
          "Fast transaction speed"
        ],
        correctOptionIndex: 2
      },
      {
        id: "q3",
        text: "What is a consensus mechanism?",
        options: [
          "A way to achieve agreement on the blockchain's state",
          "A type of cryptocurrency mining",
          "A blockchain messaging system",
          "A method to store private keys"
        ],
        correctOptionIndex: 0
      },
      {
        id: "q4",
        text: "Which of these is NOT a common blockchain consensus mechanism?",
        options: [
          "Proof of Work",
          "Proof of Stake",
          "Proof of Authority",
          "Proof of Payment"
        ],
        correctOptionIndex: 3
      },
      {
        id: "q5",
        text: "What is a 'block' in blockchain?",
        options: [
          "A unit of cryptocurrency",
          "A digital wallet",
          "A collection of transactions bundled together",
          "A type of smart contract"
        ],
        correctOptionIndex: 2
      }
    ]
  };
  
  const currentQuestionData = quiz.questions[currentQuestion];
  
  const handleOptionSelect = (optionIndex: number) => {
    if (!isSubmitted) {
      setSelectedOption(optionIndex);
    }
  };
  
  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    setIsSubmitted(true);
    
    // Check if answer is correct
    if (selectedOption === currentQuestionData.correctOptionIndex) {
      setScore(score + 1);
    }
    
    // Wait for a moment to show feedback before moving to next question
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        setIsSubmitted(false);
      } else {
        // Quiz completed
        setShowResults(true);
      }
    }, 1500);
  };
  
  const handleQuizComplete = () => {
    // In a real app, you would save results to backend
    toast({
      title: "Quiz completed!",
      description: `You earned ${quiz.rewardPoints} points for completing this quiz.`,
    });
    
    setShowFeedback(true);
  };
  
  const submitFeedback = () => {
    // In a real app, you would send feedback to backend
    toast({
      title: "Thanks for your feedback!",
      description: "Your feedback helps us improve our content.",
    });
    setShowFeedback(false);
    
    // Navigate back to the course
    navigate(`/lesson/${quiz.lessonId}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9945FF] to-[#14F195]">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="text-white/80 hover:text-white"
          >
            <Link to={`/lesson/${quiz.lessonId}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Lesson
            </Link>
          </Button>
          
          <div className="text-white text-sm">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
        </div>
        
        <Card className="backdrop-blur-md bg-white/10 border-white/10 text-white">
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {!showResults ? (
              <div>
                <h2 className="text-xl font-medium mb-6">{currentQuestionData.text}</h2>
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-md border cursor-pointer transition-all ${
                        selectedOption === index
                          ? isSubmitted
                            ? index === currentQuestionData.correctOptionIndex
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
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="text-5xl font-bold mb-2">{score}/{quiz.questions.length}</div>
                  <p className="text-white/70">
                    {score / quiz.questions.length >= 0.8 
                      ? "Great job! You've mastered this section." 
                      : score / quiz.questions.length >= 0.6 
                      ? "Good effort! Keep studying to improve." 
                      : "Need more practice. Review the material and try again."}
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="mr-2 h-5 w-5 text-[#14F195]" />
                    <p className="font-medium">You earned {quiz.rewardPoints} points!</p>
                  </div>
                  <p className="text-sm text-white/70">Keep learning to earn more rewards</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end border-t border-white/10 pt-4">
            {!showResults ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedOption === null || isSubmitted}
                className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
              >
                {isSubmitted ? "Next Question..." : "Submit Answer"}
              </Button>
            ) : (
              <Button
                onClick={handleQuizComplete}
                className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
              >
                Complete Quiz
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Rate this lesson</DialogTitle>
            <DialogDescription className="text-white/70">
              Your feedback helps us improve our content
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-all ${
                    star <= feedbackRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-white/30"
                  }`}
                  onClick={() => setFeedbackRating(star)}
                />
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedback(false)} className="border-white/20 text-white hover:bg-white/10">
              Skip
            </Button>
            <Button onClick={submitFeedback} className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90">
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizPage;
