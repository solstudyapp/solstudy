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
  
  // Get quiz data based on section or if it's the final test
  const isFinalTest = sectionId === 'final';
  const quiz = sectionId && lessonId ? getQuizByLessonAndSection(lessonId, sectionId, isFinalTest) : null;
  
  // If quiz or lesson not found, handle gracefully
  useEffect(() => {
    if (!lesson || !quiz) {
      toast({
        title: "Quiz not found",
        description: "The requested quiz could not be found.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    // Ensure the user has access to this quiz (only for section quizzes)
    if (!isFinalTest && sectionId && sectionId.startsWith('section')) {
      const sectionNumber = parseInt(sectionId.replace('section', ''), 10) - 1;
      
      // If trying to access a quiz for a section other than the first, check if previous sections are completed
      if (sectionNumber > 0) {
        const userProgress = lessonService.getUserProgress(lessonId);
        const sections = lessonId ? getSectionsForLesson(lessonId) : [];
        
        // Get previous section
        const prevSection = sections[sectionNumber - 1];
        
        // If previous quiz not completed, redirect to lesson view
        if (prevSection && !userProgress.completedQuizzes.includes(prevSection.quizId)) {
          toast({
            title: "Access Denied",
            description: "You need to complete previous sections first.",
            variant: "destructive",
          });
          navigate(`/lesson/${lessonId}`);
        }
      }
    }
    
    // For final test, check if all section quizzes are completed
    if (isFinalTest && lessonId) {
      const userProgress = lessonService.getUserProgress(lessonId);
      const sections = lessonId ? getSectionsForLesson(lessonId) : [];
      
      // Check if all section quizzes are completed
      const allQuizzesCompleted = sections.every(section => 
        userProgress.completedQuizzes.includes(section.quizId)
      );
      
      if (!allQuizzesCompleted) {
        toast({
          title: "Access Denied",
          description: "You need to complete all section quizzes first.",
          variant: "destructive",
        });
        navigate(`/lesson/${lessonId}`);
      }
    }
  }, [lesson, quiz, toast, navigate, lessonId, sectionId, isFinalTest]);
  
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
    
    toast({
      title: "Quiz completed!",
      description: "Great job! Your progress has been saved.",
    });
    
    // Navigate based on what type of quiz this was
    if (isFinalTest) {
      // If final test, go to dashboard or home
      navigate("/dashboard");
    } else if (sectionId && sectionId.startsWith('section')) {
      // If section quiz, go to next section
      const sectionNumber = parseInt(sectionId.replace('section', ''), 10);
      const sections = lessonId ? getSectionsForLesson(lessonId) : [];
      
      // If there's another section, go there
      if (sectionNumber < sections.length) {
        navigate(`/lesson/${lessonId}`);
      } else {
        // Otherwise go to lesson page (should redirect to final test)
        navigate(`/lesson/${lessonId}`);
      }
    } else {
      // Default fallback
      navigate(`/lesson/${lessonId}`);
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
