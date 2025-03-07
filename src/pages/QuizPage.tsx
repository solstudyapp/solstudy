
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { lessonData } from "@/data/lessons";
import { getQuizByLessonAndSection } from "@/data/quizzes";
import { lessonService } from "@/services/lessonService";
import { getSectionsForLesson } from "@/data/sections";
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
  let quiz = sectionId && lessonId ? getQuizByLessonAndSection(lessonId, sectionId) : null;
  
  // Get sections for this lesson
  const sections = lessonId ? getSectionsForLesson(lessonId) : [];
  
  // Determine if this is the final test
  useEffect(() => {
    if (quiz && lessonId && sectionId) {
      // Check if this is the last section
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      const isLastSection = sectionIndex === sections.length - 1;
      
      // Set isFinalTest for the quiz
      if (isLastSection) {
        quiz = { ...quiz, isFinalTest: true };
      }
    }
  }, [quiz, lessonId, sectionId, sections]);
  
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
    if (currentQuestion < quiz!.questions.length - 1) {
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
      return answer === quiz!.questions[index].correctOptionIndex ? score + 1 : score;
    }, 0);
  };
  
  const handleCompleteQuiz = () => {
    const score = calculateScore();
    lessonService.completeQuiz(quiz!, score);
    
    // Mark this section as completed
    if (lessonId && sectionId) {
      lessonService.completeSection(lessonId, sectionId);
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
    
    // Determine next section or course completion
    if (lessonId && sectionId) {
      const currentSectionIndex = sections.findIndex(s => s.id === sectionId);
      
      if (quiz?.isFinalTest) {
        // Navigate to dashboard after completing the course
        navigate("/dashboard");
        toast({
          title: "Course Completed!",
          description: "Congratulations on completing the course!",
        });
      } else if (currentSectionIndex < sections.length - 1) {
        // Navigate to the next section
        const nextSection = currentSectionIndex + 1;
        navigate(`/lesson/${lessonId}`);
        
        // This will trigger the useEffect in LessonView to show the next section
      } else {
        // Navigate back to lesson (should show final test button)
        navigate(`/lesson/${lessonId}`);
      }
    } else {
      navigate("/");
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
