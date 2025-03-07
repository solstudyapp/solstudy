
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { lessonData, dailyBonusLesson } from "@/data/lessons";
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
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Find the lesson based on the URL param - also check if it's the daily bonus lesson
  const lesson = lessonId === "daily-bonus-lesson" 
    ? dailyBonusLesson 
    : lessonData.find(l => l.id === lessonId);
  
  // Get sections data from our new data file
  const sections = lessonId ? getSectionsForLesson(lessonId) : [];
  
  // Parse URL query parameters for direct navigation
  useEffect(() => {
    // Get saved progress or URL params
    if (lesson && sections.length > 0) {
      const queryParams = new URLSearchParams(location.search);
      const sectionParam = queryParams.get('section');
      const pageParam = queryParams.get('page');
      
      if (sectionParam !== null && pageParam !== null) {
        // If URL has section and page params, use those
        const sectionIndex = parseInt(sectionParam);
        const pageIndex = parseInt(pageParam);
        
        if (
          !isNaN(sectionIndex) && 
          !isNaN(pageIndex) && 
          sectionIndex >= 0 && 
          sectionIndex < sections.length && 
          pageIndex >= 0 && 
          pageIndex < sections[sectionIndex].pages.length
        ) {
          setCurrentSection(sectionIndex);
          setCurrentPage(pageIndex);
          return;
        }
      }
      
      // If no valid URL params, get from saved progress
      const userProgress = lessonService.getUserProgress(lesson.id);
      
      // Find the section index from the saved progress
      const progressSectionIndex = sections.findIndex(
        section => section.id === userProgress.currentSectionId
      );
      
      // Find the page index from the saved progress
      const section = sections[progressSectionIndex >= 0 ? progressSectionIndex : 0];
      const progressPageIndex = section 
        ? section.pages.findIndex(page => page.id === userProgress.currentPageId)
        : 0;
      
      // Set state based on saved progress (if valid) or defaults (0, 0)
      setCurrentSection(progressSectionIndex >= 0 ? progressSectionIndex : 0);
      setCurrentPage(progressPageIndex >= 0 ? progressPageIndex : 0);
    }
  }, [lesson, sections, location.search]);
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    if (!lesson) return;
    
    // Calculate progress based on current position
    const totalPages = sections.reduce((acc, section) => acc + section.pages.length, 0);
    const pagesCompleted = sections.slice(0, currentSection).reduce((acc, section) => acc + section.pages.length, 0) + currentPage;
    setProgress(Math.round((pagesCompleted / totalPages) * 100));
  }, [currentSection, currentPage, lesson, sections]);
  
  // Also scroll to top when sections or pages change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentSection, currentPage]);
  
  // Update saved progress when section or page changes
  useEffect(() => {
    if (lesson && sections.length > 0 && sections[currentSection]) {
      const currentSectionData = sections[currentSection];
      if (currentSectionData && currentSectionData.pages[currentPage]) {
        lessonService.updateProgress(
          lesson.id,
          currentSectionData.id,
          currentSectionData.pages[currentPage].id
        );
      }
    }
  }, [lesson, currentSection, currentPage, sections]);
  
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
      // Go to quiz instead of automatically proceeding to next section
      navigate(`/quiz/${lesson.id}/section${currentSection + 1}`);
      
      // Mark section as completed in the service
      lessonService.completeSection(lesson.id, currentSectionData.id);
      
      toast({
        title: "Section completed!",
        description: "Now take the section quiz.",
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
