
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
  
  useEffect(() => {
    if (!lesson || !lessonId) return;
    
    // Get user progress for this lesson
    const userProgress = lessonService.getUserProgress(lessonId);
    
    // Find completed sections
    const completedSections = userProgress.completedSections;
    
    // Calculate progress based on completed sections
    setProgress(Math.round((completedSections.length / sections.length) * 100));
    
    // If we have completed sections, set the current section/page accordingly
    if (completedSections.length > 0) {
      // Set to the first non-completed section, or the last section if all are completed
      const nextSectionIndex = completedSections.length >= sections.length 
        ? sections.length - 1 
        : completedSections.length;
      
      setCurrentSection(nextSectionIndex);
      setCurrentPage(0);
    }
  }, [lesson, lessonId, sections]);
  
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
      // We don't automatically move to the next section
      // The user needs to take the quiz first
      
      // Update progress in the service
      if (lessonId) {
        lessonService.completeSection(lessonId, currentSectionData.id);
      }
      
      toast({
        title: "Section completed!",
        description: "Take the quiz to move to the next section.",
      });
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
  const isLastSection = currentSection === sections.length - 1;
  
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
          <div className="col-span-1 md:col-span-3 space-y-6">
            <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-lg p-6 text-white">
              <div 
                dangerouslySetInnerHTML={{ __html: currentPageData?.content || "" }}
                className="prose prose-invert max-w-none"
              />
              
              <LessonNavigation 
                lessonId={lesson.id}
                currentSection={currentSection}
                navigatePrev={navigatePrev}
                navigateNext={navigateNext}
                isFirstPage={isFirstPage}
                isLastPage={isLastPage}
                isLastSection={isLastSection}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;
