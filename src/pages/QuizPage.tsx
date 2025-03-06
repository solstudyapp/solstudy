import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { lessonService } from "@/services/lessonService";
import { Quiz } from "@/types/lesson";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizResults from "@/components/quiz/QuizResults";
import FeedbackDialog from "@/components/quiz/FeedbackDialog";
import QuizHeader from "@/components/quiz/QuizHeader";

const QuizPage = () => {
  const { lessonId, sectionId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
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
  
  const handleQuestionComplete = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed
      setShowResults(true);
    }
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
  
  const submitFeedback = (feedbackRating: number) => {
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
        {!showResults && (
          <QuizHeader 
            lessonId={lessonId} 
            currentQuestion={currentQuestion} 
            totalQuestions={quiz.questions.length}
            quizTitle={quiz.title}
          />
        )}
        
        {!showResults ? (
          <QuizQuestion 
            question={quiz.questions[currentQuestion]}
            onNext={handleQuestionComplete}
          />
        ) : (
          <QuizResults 
            quiz={quiz}
            score={score}
            onComplete={handleQuizComplete}
          />
        )}
      </div>
      
      <FeedbackDialog 
        open={showFeedback} 
        onOpenChange={setShowFeedback}
        onSubmit={submitFeedback}
      />
    </div>
  );
};

export default QuizPage;
