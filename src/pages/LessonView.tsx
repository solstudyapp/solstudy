
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { lessonData } from "@/data/lessons";
import { getSectionsForLesson } from "@/data/sections";
import { toast } from "@/hooks/use-toast";
import { lessonService } from "@/services/lessonService";
import LessonSidebar from "@/components/lesson/LessonSidebar";
import LessonHeader from "@/components/lesson/LessonHeader";
import LessonContent from "@/components/lesson/LessonContent";
import { Button } from "@/components/ui/button";

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Find the lesson based on the URL param
  const lesson = lessonData.find(l => l.id === lessonId);
  
  // Get sections data from our new data file
  const sections = lessonId ? getSectionsForLesson(lessonId) : [];
  
  // Listen for navigation events from QuizPage
  useEffect(() => {
    const handleNavigateToSection = (event: CustomEvent<{sectionIndex: number, pageIndex: number}>) => {
      const { sectionIndex, pageIndex } = event.detail;
      setCurrentSection(sectionIndex);
      setCurrentPage(pageIndex);
    };
    
    window.addEventListener('navigateToSection', handleNavigateToSection as EventListener);
    
    return () => {
      window.removeEventListener('navigateToSection', handleNavigateToSection as EventListener);
    };
  }, []);
  
  useEffect(() => {
    if (!lesson) return;
    
    // Calculate progress based on current position
    const totalPages = sections.reduce((acc, section) => acc + section.pages.length, 0);
    const pagesCompleted = sections.slice(0, currentSection).reduce((acc, section) => acc + section.pages.length, 0) + currentPage;
    setProgress(Math.round((pagesCompleted / totalPages) * 100));
  }, [currentSection, currentPage, lesson, sections]);
  
  // Check if user can access this section (all previous quizzes completed)
  useEffect(() => {
    if (!lesson || !lessonId) return;

    // User can always access the first section
    if (currentSection === 0) return;

    // For sections beyond the first, check if the previous section's quiz is completed
    for (let i = 0; i < currentSection; i++) {
      const quizId = `quiz-section${i + 1}`;
      const isCompleted = lessonService.isQuizCompleted(lessonId, quizId);
      
      if (!isCompleted) {
        // If a previous quiz isn't completed, navigate to that section
        setCurrentSection(i);
        setCurrentPage(0);
        
        toast({
          title: "Section locked",
          description: `You need to complete the quiz for section ${i + 1} before proceeding.`,
        });
        
        break;
      }
    }
  }, [currentSection, lessonId, lesson]);
  
  if (!lesson) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <p className="mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];
  const currentPageData = currentSectionData?.pages[currentPage];
  
  const navigateNext = () => {
    // If there are more pages in the current section
    if (currentPage < currentSectionData.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } 
    // If there are more sections
    else if (currentSection < sections.length - 1) {
      // Check if user completed the quiz for this section
      const quizId = `quiz-section${currentSection + 1}`;
      const isQuizCompleted = lessonService.isQuizCompleted(lessonId, quizId);
      
      if (!isQuizCompleted) {
        // If quiz not completed, redirect to quiz
        navigate(`/quiz/${lesson.id}/section${currentSection + 1}`);
        return;
      }
      
      // If quiz completed, mark section as completed and move to next section
      setCurrentSection(currentSection + 1);
      setCurrentPage(0);
      
      // Mark section as completed in the service
      lessonService.completeSection(lesson.id, currentSectionData.id);
      
      toast({
        title: "Section completed!",
        description: "Moving on to the next section.",
      });
    } 
    // If we're at the last page of the last section
    else if (currentSection === sections.length - 1 && currentPage === currentSectionData.pages.length - 1) {
      // Mark section as completed
      lessonService.completeSection(lesson.id, currentSectionData.id);
      
      toast({
        title: "Section completed!",
        description: "You've completed this section. Time for the quiz!",
      });
      
      // Navigate to the quiz
      navigate(`/quiz/${lesson.id}/section${currentSection + 1}`);
    }
  };
  
  const navigatePrev = () => {
    // If there are previous pages in the current section
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } 
    // If there are previous sections
    else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentPage(sections[currentSection - 1].pages.length - 1);
    }
  };
  
  const isFirstPage = currentSection === 0 && currentPage === 0;
  const isLastPage = currentSection === sections.length - 1 && currentPage === currentSectionData.pages.length - 1;
  
  // Calculate total pages for the header
  const totalPages = sections.reduce((acc, section) => acc + section.pages.length, 0);
  
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Lesson Header */}
        <LessonHeader 
          lesson={lesson} 
          progress={progress} 
          totalSections={sections.length}
          totalPages={totalPages}
        />
        
        {/* Lesson Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <LessonSidebar 
            sections={sections}
            currentSection={currentSection}
            currentPage={currentPage}
            setCurrentSection={setCurrentSection}
            setCurrentPage={setCurrentPage}
            lessonId={lessonId || ""}
          />
          
          {/* Main Content */}
          <LessonContent 
            lesson={lesson}
            currentSection={currentSection}
            currentPage={currentPage}
            currentPageData={currentPageData}
            navigatePrev={navigatePrev}
            navigateNext={navigateNext}
            isFirstPage={isFirstPage}
            isLastPage={isLastPage}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonView;
