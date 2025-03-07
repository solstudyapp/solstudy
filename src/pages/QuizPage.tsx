
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { lessonData } from "@/data/lessons";
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
  
  // Get quiz data from our new file
  const quiz = sectionId && lessonId ? getQuizByLessonAndSection(lessonId, sectionId) : null;
  
  // Check if user can access this quiz (should have completed previous quizzes)
  useEffect(() => {
    if (!lessonId || !sectionId) return;
    
    // Extract section number from sectionId (e.g., "section2" -> 2)
    const currentSectionNum = parseInt(sectionId.replace("section", ""), 10);
    
    // If not the first section, check if previous quizzes are completed
    if (currentSectionNum > 1) {
      for (let i = 1; i < currentSectionNum; i++) {
        const prevQuizId = `quiz-section${i}`;
        if (!lessonService.isQuizCompleted(lessonId, prevQuizId)) {
          toast({
            title: "Quiz locked",
            description: `You need to complete section ${i} and its quiz first.`,
            variant: "destructive",
          });
          navigate(`/lesson/${lessonId}`);
          return;
        }
      }
    }
  }, [lessonId, sectionId, navigate, toast]);
  
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
    lessonService.completeQuiz(quiz, score);
    
    // Show feedback dialog after completing
    setShowFeedback(true);
  };
  
  const handleFeedbackComplete = () => {
    setShowFeedback(false);
    
    // Extract section number from sectionId (e.g., "section2" -> 2)
    const currentSectionNum = parseInt(sectionId?.replace("section", "") || "0", 10);
    const nextSectionNum = currentSectionNum + 1;
    
    toast({
      title: "Quiz completed!",
      description: "Great job! Your progress has been saved.",
    });
    
    // Navigate based on whether this is the final quiz or not
    if (quiz.isFinalTest || currentSectionNum >= 3) {
      navigate("/");
    } else {
      // Navigate to the next section's first page
      navigate(`/lesson/${lessonId}`);
      
      // Use a short timeout to ensure navigation completes before trying to set section/page
      setTimeout(() => {
        // This will dispatch an event that LessonView can listen for to set the correct section
        window.dispatchEvent(new CustomEvent('navigateToSection', {
          detail: {
            sectionIndex: nextSectionNum - 1,
            pageIndex: 0
          }
        }));
      }, 100);
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
