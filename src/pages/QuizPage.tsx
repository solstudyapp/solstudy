
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { lessonData, dailyBonusLesson } from "@/data/lessons";
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Find lesson data - check if it's the daily bonus lesson
  const lesson = lessonId === "daily-bonus-lesson" 
    ? dailyBonusLesson 
    : lessonData.find(l => l.id === lessonId);
  
  // Get all sections for the lesson to check progress
  const sections = lessonId ? getSectionsForLesson(lessonId) : [];
  
  // Get quiz data - handling both section quizzes and final test
  const isFinalTest = sectionId === 'final';
  const quiz = lessonId && sectionId ? getQuizByLessonAndSection(lessonId, sectionId, isFinalTest) : null;
  
  // Parse the current section number from the sectionId - handle both regular and daily bonus sections
  const currentSectionIndex = (() => {
    if (isFinalTest) return sections.length - 1;
    
    if (sectionId?.startsWith('daily-bonus-section')) {
      return parseInt(sectionId.replace('daily-bonus-section', '')) - 1;
    }
    
    if (sectionId?.startsWith('section')) {
      return parseInt(sectionId.replace('section', '')) - 1;
    }
    
    return 0;
  })();
  
  // Reset state when quiz changes
  useEffect(() => {
    if (quiz) {
      setCurrentQuestion(0);
      setUserAnswers([]);
      setShowResults(false);
      setShowFeedback(false);
      setIsLoading(false);
    }
  }, [quiz?.id]);
  
  // If quiz or lesson not found, handle gracefully
  useEffect(() => {
    if (!lesson || !quiz) {
      console.log("Quiz not found:", { lessonId, sectionId, lesson, quiz });
      toast({
        title: "Quiz not found",
        description: "The requested quiz could not be found.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [lesson, quiz, toast, navigate, lessonId, sectionId]);
  
  useEffect(() => {
    // For the final test, check if all section quizzes are completed
    if (isFinalTest) {
      // Skip checking for already completed final tests
      if (lessonService.isFinalTestCompleted(lessonId || "")) {
        return;
      }
      
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
  
  if (!lesson || !quiz || isLoading) {
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
    // Ensure we have both quiz questions and user answers before calculating
    if (!quiz?.questions || userAnswers.length === 0) {
      return 0;
    }
    
    return userAnswers.reduce((score, answer, index) => {
      // Make sure we have a question at this index before accessing its properties
      if (quiz.questions[index]) {
        return answer === quiz.questions[index].correctOptionIndex ? score + 1 : score;
      }
      return score;
    }, 0);
  };
  
  const handleCompleteQuiz = () => {
    const score = calculateScore();
    
    // Mark the section as completed or record final test completion
    if (isFinalTest) {
      // Only complete the test if it hasn't been completed before
      if (!lessonService.isFinalTestCompleted(lessonId || "")) {
        lessonService.completeQuiz(quiz, score);
        lessonService.completeFinalTest(lessonId || "");
      }
      
      // Show feedback dialog after the final test
      setShowFeedback(true);
    } else {
      // For section quizzes, mark the section as completed
      lessonService.completeQuiz(quiz, score);
      lessonService.completeSection(lessonId || "", sectionId || "");
      
      // For section quizzes, proceed directly to navigation without showing feedback
      handleSectionQuizComplete();
    }
  };
  
  // Function to handle section quiz completion without feedback
  const handleSectionQuizComplete = () => {
    // Determine the next section ID based on the lesson type
    const getNextSectionId = () => {
      const nextSectionIndex = currentSectionIndex + 1;
      if (nextSectionIndex < sections.length) {
        return sections[nextSectionIndex].id;
      }
      return null;
    };
    
    // For section quizzes, determine if there's a next section
    const isLastSection = currentSectionIndex >= sections.length - 1;
    
    if (isLastSection) {
      // If this was the last section quiz, navigate to the final test
      toast({
        title: "All sections completed!",
        description: "You can now take the final test for this lesson.",
      });
      
      // Explicitly navigate to the final test
      navigate(`/quiz/${lessonId}/final`);
    } else {
      // If there are more sections, navigate to the next section
      const nextSectionIndex = currentSectionIndex + 1;
      const nextSectionId = getNextSectionId();
      if (!nextSectionId) {
        console.error("Next section ID not found");
        navigate("/");
        return;
      }
      
      const nextSectionFirstPageId = sections[nextSectionIndex].pages[0].id;
      
      // Update progress to next section
      lessonService.updateProgress(
        lessonId || "", 
        nextSectionId, 
        nextSectionFirstPageId
      );
      
      toast({
        title: "Section completed!",
        description: "Moving on to the next section.",
      });
      
      // Navigate directly to the next section's first page
      navigate(`/lesson/${lessonId}?section=${nextSectionIndex}&page=0`);
    }
  };
  
  const handleFeedbackComplete = () => {
    setShowFeedback(false);
    
    // After the final test, go to dashboard
    toast({
      title: "Course completed!",
      description: "Congratulations! You've completed the entire course.",
    });
    navigate("/dashboard");
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
