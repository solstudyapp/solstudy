
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Award, ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { SectionQuiz, FinalTest } from "@/types/lesson";
import { getSectionQuiz, getFinalTest } from "@/data/quizzes";

const QuizPage = () => {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const quizType = searchParams.get("type") || "section";
  const sectionId = searchParams.get("sectionId");
  const lessonId = searchParams.get("lessonId") || "intro-to-blockchain";
  
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  
  // Get the appropriate quiz data based on type
  const [quizData, setQuizData] = useState<SectionQuiz | FinalTest | null>(null);
  
  useEffect(() => {
    if (!quizId) return;
    
    if (quizType === "section") {
      const sectionQuiz = getSectionQuiz(quizId);
      if (sectionQuiz) {
        setQuizData(sectionQuiz);
      }
    } else if (quizType === "final") {
      const finalTest = getFinalTest(lessonId);
      if (finalTest) {
        setQuizData(finalTest);
      }
    }
  }, [quizId, quizType, lessonId]);
  
  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#9945FF] to-[#14F195]">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Quiz not found</h1>
          <p className="mb-6">The quiz you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const currentQuestionData = quizData.questions[currentQuestion];
  
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
      if (currentQuestion < quizData.questions.length - 1) {
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
      description: `You earned ${quizData.rewardPoints} points.`,
    });
    
    setShowFeedback(true);
  };
  
  const handleFeedbackComplete = () => {
    // Handle the completion based on quiz type
    if (quizType === "section" && sectionId) {
      // Mark section as completed
      const savedProgress = localStorage.getItem(`lesson_progress_${lessonId}`);
      let progressData = savedProgress ? JSON.parse(savedProgress) : { completedSections: [], currentSection: 0, currentPage: 0 };
      
      if (!progressData.completedSections.includes(sectionId)) {
        progressData.completedSections.push(sectionId);
      }
      
      // Move to next section if not the last one
      // Parse section ID to get the numeric part (assuming format like "section1", "section2")
      const currentSectionNumber = parseInt(sectionId.replace("section", ""));
      const nextSectionNumber = currentSectionNumber + 1;
      const nextSectionId = `section${nextSectionNumber}`;
      
      // Check if there might be a next section (up to section3 in our mock data)
      if (nextSectionNumber <= 3) {
        progressData.currentSection = nextSectionNumber - 1; // Array is 0-indexed
        progressData.currentPage = 0; // Start at the first page of the new section
      }
      
      localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify(progressData));
      
      toast({
        title: "Section completed!",
        description: nextSectionNumber <= 3 ? "Moving to the next section." : "You can now take the final test.",
        variant: "default"
      });
      
      // Navigate back to the lesson
      navigate(`/lesson/${lessonId}`);
    } else if (quizType === "final") {
      // Mark lesson as completed
      localStorage.setItem(`lesson_${lessonId}_completed`, "true");
      
      toast({
        title: "Congratulations!",
        description: "You've completed the entire course!",
        variant: "default"
      });
      
      // Navigate to dashboard with completed message
      navigate(`/dashboard?completed=${lessonId}`);
    }
    
    setShowFeedback(false);
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
            <Link to={`/lesson/${lessonId}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Lesson
            </Link>
          </Button>
          
          <div className="text-white text-sm">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </div>
        </div>
        
        <Card className="backdrop-blur-md bg-white/10 border-white/10 text-white">
          <CardHeader>
            <CardTitle>{quizData.title}</CardTitle>
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
                  <div className="text-5xl font-bold mb-2">{score}/{quizData.questions.length}</div>
                  <p className="text-white/70">
                    {score / quizData.questions.length >= 0.8 
                      ? "Great job! You've mastered this section." 
                      : score / quizData.questions.length >= 0.6 
                      ? "Good effort! Keep studying to improve." 
                      : "Need more practice. Review the material and try again."}
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="mr-2 h-5 w-5 text-[#14F195]" />
                    <p className="font-medium">You earned {quizData.rewardPoints} points!</p>
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
                Complete {quizType === "section" ? "Quiz" : "Test"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Rate this {quizType === "section" ? "section" : "course"}</DialogTitle>
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
            <Button onClick={handleFeedbackComplete} className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90">
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizPage;
