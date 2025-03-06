
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Award, ChevronLeft, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { lessonService } from "@/services/lessonService";
import { Quiz } from "@/types/lesson";

const QuizPage = () => {
  const { lessonId, sectionId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  // Load quiz data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchQuiz = () => {
      // Mock quizzes - would come from API in real app
      const quizzes: Quiz[] = [
        {
          id: "section1",
          title: "Getting Started Quiz",
          lessonId: "intro-to-blockchain",
          sectionId: "section1",
          rewardPoints: 20,
          questions: [
            {
              id: "q1-1",
              text: "What is blockchain primarily designed to provide?",
              options: [
                "Fast transaction processing",
                "Decentralized trust",
                "Free transactions",
                "Anonymous transactions"
              ],
              correctOptionIndex: 1
            },
            {
              id: "q1-2",
              text: "When was Bitcoin, the first blockchain application, created?",
              options: [
                "2001",
                "2005",
                "2009",
                "2013"
              ],
              correctOptionIndex: 2
            },
            {
              id: "q1-3",
              text: "What does the term 'decentralized' mean in blockchain?",
              options: [
                "The system is run by a central bank",
                "The system has no single point of control",
                "The system is free to use",
                "The system only works offline"
              ],
              correctOptionIndex: 1
            }
          ]
        },
        {
          id: "section2",
          title: "Core Components Quiz",
          lessonId: "intro-to-blockchain",
          sectionId: "section2",
          rewardPoints: 30,
          questions: [
            {
              id: "q2-1",
              text: "What is a hash function in blockchain?",
              options: [
                "A function that encrypts data for privacy",
                "A function that creates a fixed-size output from any input",
                "A function that speeds up transactions",
                "A function that distributes mining rewards"
              ],
              correctOptionIndex: 1
            },
            {
              id: "q2-2",
              text: "What is the primary purpose of a consensus mechanism?",
              options: [
                "To encrypt transactions",
                "To speed up the network",
                "To agree on the state of the blockchain",
                "To reduce transaction fees"
              ],
              correctOptionIndex: 2
            },
            {
              id: "q2-3",
              text: "What is a smart contract?",
              options: [
                "A legal document for blockchain users",
                "Self-executing code stored on the blockchain",
                "A type of cryptocurrency",
                "An agreement between miners"
              ],
              correctOptionIndex: 1
            }
          ]
        },
        {
          id: "section3",
          title: "Applications & Future Quiz",
          lessonId: "intro-to-blockchain",
          sectionId: "section3",
          rewardPoints: 40,
          questions: [
            {
              id: "q3-1",
              text: "What is DeFi?",
              options: [
                "Digital Finance",
                "Decentralized Finance",
                "Distributed Funding",
                "Direct Finance"
              ],
              correctOptionIndex: 1
            },
            {
              id: "q3-2",
              text: "What does NFT stand for?",
              options: [
                "New Financial Token",
                "Non-Fungible Token",
                "Network Function Transfer",
                "New Fund Transaction"
              ],
              correctOptionIndex: 1
            },
            {
              id: "q3-3",
              text: "What is a DAO?",
              options: [
                "Digital Asset Ownership",
                "Decentralized Application Operation",
                "Decentralized Autonomous Organization",
                "Digital Asset Organizer"
              ],
              correctOptionIndex: 2
            }
          ]
        },
        {
          id: "final-test",
          title: "Blockchain Fundamentals Final Test",
          lessonId: "intro-to-blockchain",
          sectionId: "final",
          isFinalTest: true,
          rewardPoints: 100,
          questions: [
            {
              id: "f1",
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
              id: "f2",
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
              id: "f3",
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
              id: "f4",
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
              id: "f5",
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
        }
      ];
      
      // For quizId, use the sectionId param
      const foundQuiz = quizzes.find(q => q.sectionId === sectionId);
      if (foundQuiz) {
        setQuiz(foundQuiz);
      } else {
        toast({
          title: "Error",
          description: "Quiz not found",
          variant: "destructive"
        });
        navigate('/');
      }
    };
    
    fetchQuiz();
  }, [sectionId, navigate]);
  
  if (!quiz) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-white">Loading quiz...</h2>
        </div>
      </div>
    );
  }
  
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
      toast({
        title: "Correct!",
        description: "Good job! Moving to next question soon...",
      });
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer was: ${currentQuestionData.options[currentQuestionData.correctOptionIndex]}`,
      });
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
    }, 2000);
  };
  
  const handleQuizComplete = () => {
    // Save quiz results
    lessonService.completeQuiz(quiz, score);
    
    // Complete the section if it's a section quiz
    if (!quiz.isFinalTest && lessonId) {
      lessonService.completeSection(lessonId, quiz.sectionId);
    }
    
    const earnedPoints = Math.round((score / quiz.questions.length) * quiz.rewardPoints);
    
    // Show toast notification
    toast({
      title: "Quiz completed!",
      description: `You earned ${earnedPoints} points for completing this quiz.`,
    });
    
    // Show feedback dialog for final test only
    if (quiz.isFinalTest) {
      setShowFeedback(true);
    } else {
      // For non-final tests, wait a moment before navigating back
      setTimeout(() => {
        if (lessonId) {
          navigate(`/lesson/${lessonId}`);
        } else {
          navigate('/');
        }
      }, 1500);
    }
  };
  
  const submitFeedback = () => {
    if (lessonId) {
      // Save user feedback
      lessonService.saveFeedback(lessonId, feedbackRating);
      
      toast({
        title: "Thanks for your feedback!",
        description: "Your feedback helps us improve our content.",
      });
    }
    
    setShowFeedback(false);
    
    // Navigate back to the lesson or to home
    if (lessonId) {
      navigate(quiz.isFinalTest ? '/' : `/lesson/${lessonId}`);
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
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
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
        </div>
        
        <Card className="backdrop-blur-md bg-white/10 border border-white/10 text-white">
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
                    <p className="font-medium">You earned {Math.round((score / quiz.questions.length) * quiz.rewardPoints)} points!</p>
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
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
              >
                {isSubmitted ? "Next Question..." : "Submit Answer"}
              </Button>
            ) : (
              <Button
                onClick={handleQuizComplete}
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
              >
                {quiz.isFinalTest ? "Complete Course" : "Complete Quiz"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Rate this course</DialogTitle>
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
            <Button onClick={submitFeedback} className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0">
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizPage;
