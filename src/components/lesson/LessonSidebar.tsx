
import { CheckCircle, BookOpen, LockIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Section } from "@/types/lesson";
import { lessonService } from "@/services/lessonService";
import { toast } from "@/hooks/use-toast";

interface LessonSidebarProps {
  sections: Section[];
  currentSection: number;
  currentPage: number;
  setCurrentSection: (section: number) => void;
  setCurrentPage: (page: number) => void;
  lessonId: string;
}

const LessonSidebar = ({
  sections,
  currentSection,
  currentPage,
  setCurrentSection,
  setCurrentPage,
  lessonId,
}: LessonSidebarProps) => {
  // Function to check if a section is locked
  const isSectionLocked = (sectionIndex: number) => {
    // First section is always unlocked
    if (sectionIndex === 0) return false;
    
    // For other sections, check if previous section's quiz is completed
    const prevQuizId = `quiz-section${sectionIndex}`;
    return !lessonService.isQuizCompleted(lessonId, prevQuizId);
  };

  const handleNavigate = (sectionIndex: number, pageIndex: number) => {
    // Check if section is locked
    if (isSectionLocked(sectionIndex)) {
      toast({
        title: "Section locked",
        description: `Complete the quiz for section ${sectionIndex} to unlock this section.`,
      });
      return;
    }
    
    // Check if we're allowed to navigate to this page
    if (
      sectionIndex < currentSection ||
      (sectionIndex === currentSection && pageIndex <= currentPage) ||
      // Allow navigation to any page in unlocked sections
      !isSectionLocked(sectionIndex)
    ) {
      setCurrentSection(sectionIndex);
      setCurrentPage(pageIndex);
    } else {
      toast({
        title: "Page locked",
        description: "Complete previous pages first.",
      });
    }
  };

  return (
    <div className="hidden md:block">
      <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-lg p-4 sticky top-24">
        <h3 className="text-lg font-medium text-white mb-4">Course Contents</h3>
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => {
            const locked = isSectionLocked(sectionIndex);
            
            return (
              <div key={section.id} className={locked ? "opacity-60" : ""}>
                <div className="flex items-center mb-2">
                  {locked ? (
                    <LockIcon className="h-4 w-4 text-white/50 mr-2" />
                  ) : sectionIndex < currentSection ? (
                    <CheckCircle className="h-4 w-4 text-[#14F195] mr-2" />
                  ) : sectionIndex === currentSection ? (
                    <BookOpen className="h-4 w-4 text-white mr-2" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/40 mr-2"></div>
                  )}
                  <span className="text-white font-medium">
                    {section.title}
                    {sectionIndex > 0 && 
                      <span className="ml-2 text-xs text-white/50">
                        (Quiz {sectionIndex} required)
                      </span>
                    }
                  </span>
                </div>
                <div className="ml-6 space-y-1">
                  {section.pages.map((page, pageIndex) => (
                    <button
                      key={page.id}
                      className={`text-sm w-full text-left py-1 px-2 rounded ${
                        locked
                          ? "text-white/30 cursor-not-allowed"
                          : sectionIndex === currentSection && pageIndex === currentPage
                          ? "bg-white/20 text-white"
                          : sectionIndex < currentSection || (sectionIndex === currentSection && pageIndex < currentPage)
                          ? "text-white/70 hover:text-white hover:bg-white/10"
                          : "text-white/50"
                      }`}
                      onClick={() => handleNavigate(sectionIndex, pageIndex)}
                      disabled={locked}
                    >
                      {page.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LessonSidebar;
