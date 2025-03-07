import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { lessonData } from "@/data/lessons";
import { getSectionsForLesson } from "@/data/sections";
import { getQuizByLessonAndSection } from "@/data/quizzes";
import { lessonService } from "@/services/lessonService";
import QuizHeader from "@/components/quiz/QuizHeader";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizResults from "@/components/quiz/QuizResults";
import FeedbackDialog from "@/components/quiz/FeedbackDialog";

const QuizPage = () => {
  const { lessonId, sectionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Find lesson data
  const lesson = lessonData.find(l => l.id === lessonId);
  
  // Get all sections for the lesson to check progress
  const sections = lessonId ? getSectionsForLesson(lessonId) : [];
  
  // Get quiz data - handling both section quizzes and final test
  const isFinalTest = sectionId === 'final';
  const quiz = lessonId && sectionId ? getQuizByLessonAndSection(lessonId, sectionId, isFinalTest) : null;
  
  // If quiz or lesson not found, handle gracefully
  useEffect(() => {
    if (!lesson || !quiz) {
      toast({
        title: "Quiz not found",
        description: "The requested quiz could not be found.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [lesson, quiz, toast, navigate]);
  
  useEffect(() => {
    // For the final test, check if all section quizzes are completed
    if (isFinalTest) {
      const allSectionsCompleted = sections.every(section => 
        lessonService.isSectionCompleted(lessonId || "", section.id)
      );
      
      if (!allSectionsCompleted) {
        toast({
          title: "Complete all sections first",
          description: "You need to complete all section quizzes before taking the final test.",
          variant: "destructive",
        });
        navigate(`/lesson/${lessonId}`);
      }
    }
  }, [isFinalTest, sections, lessonId, navigate, toast]);
  
  if (!lesson || !quiz) {
    return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;
  }
  
  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setUserAnswers(newAnswers);
  };
  
  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions completed, show results
      setShowResults(true);
    }
  };
  
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const calculateScore = () => {
    return userAnswers.reduce((score, answer, index) => {
      return answer === quiz.questions[index].correctOptionIndex ? score + 1 : score;
    }, 0);
  };
  
  const handleCompleteQuiz = () => {
    const score = calculateScore();
    
    // Mark the section as completed or record final test completion
    if (isFinalTest) {
      lessonService.completeQuiz(quiz, score);
      
      // Mark the lesson as fully completed if final test
      lessonService.completeFinalTest(lessonId || "");
    } else {
      // For section quizzes, mark the section as completed
      lessonService.completeQuiz(quiz, score);
      lessonService.completeSection(lessonId || "", sectionId || "");
    }
    
    // Show feedback dialog after completing
    setShowFeedback(true);
  };
  
  const handleFeedbackComplete = () => {
    setShowFeedback(false);
    
    toast({
      title: "Quiz completed!",
      description: "Great job! Your progress has been saved.",
    });
    
    // Navigate based on quiz type
    if (isFinalTest) {
      // After final test, go to dashboard
      navigate("/dashboard");
    } else {
      // Check if all sections are completed
      const allSectionsCompleted = sections.every(section => 
        lessonService.isSectionCompleted(lessonId || "", section.id)
      );
      
      if (allSectionsCompleted) {
        // If all sections are completed, offer the final test
        toast({
          title: "All sections completed!",
          description: "You can now take the final test for this lesson.",
        });
        navigate(`/quiz/${lessonId}/final`);
      } else {
        // Otherwise, continue to next section
        navigate(`/lesson/${lessonId}`);
      }
    }
  };
  
  // Determine if user has answered the current question
  const hasAnswered = userAnswers[currentQuestion] !== undefined;
  
  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <QuizHeader 
          lessonId={lessonId}
          currentQuestion={currentQuestion}
          totalQuestions={quiz.questions.length}
          quizTitle={quiz.title}
          isFinalTest={isFinalTest}
        />
        
        {!showResults ? (
          <QuizQuestion
            question={quiz.questions[currentQuestion]}
            selectedOption={userAnswers[currentQuestion]}
            onSelectOption={handleSelectAnswer}
            onNext={nextQuestion}
            onPrev={prevQuestion}
            isFirst={currentQuestion === 0}
            isLast={currentQuestion === quiz.questions.length - 1}
            hasAnswered={hasAnswered}
          />
        ) : (
          <QuizResults
            quiz={quiz}
            score={calculateScore()}
            onComplete={handleCompleteQuiz}
          />
        )}
        
        {showFeedback && (
          <FeedbackDialog
            lessonId={lessonId || ""}
            onComplete={handleFeedbackComplete}
          />
        )}
      </div>
    </div>
  );
};

export default QuizPage;
