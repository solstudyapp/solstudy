
import { CheckCircle, BookOpen, LockIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Section } from "@/types/lesson";
import { lessonService } from "@/services/lessonService";

interface LessonSidebarProps {
  sections: Section[];
  currentSection: number;
  currentPage: number;
  setCurrentSection: (section: number) => void;
  setCurrentPage: (page: number) => void;
}

const LessonSidebar = ({
  sections,
  currentSection,
  currentPage,
  setCurrentSection,
  setCurrentPage,
}: LessonSidebarProps) => {
  return (
    <div className="hidden md:block">
      <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-lg p-4 sticky top-24">
        <h3 className="text-lg font-medium text-white mb-4">Course Contents</h3>
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => {
            // Get completed sections from the service
            const isCompleted = lessonService.isSectionCompleted(sections[0]?.id || "", section.id);
            
            // A section is accessible if:
            // 1. It's the current or previous section
            // 2. The previous section has been completed (has a quiz completed)
            const isAccessible = sectionIndex <= currentSection;
            
            return (
              <div key={section.id}>
                <div className="flex items-center mb-2">
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-[#14F195] mr-2" />
                  ) : sectionIndex === currentSection ? (
                    <BookOpen className="h-4 w-4 text-white mr-2" />
                  ) : (
                    <>
                      {isAccessible ? (
                        <div className="h-4 w-4 rounded-full border border-white/40 mr-2"></div>
                      ) : (
                        <LockIcon className="h-4 w-4 text-white/30 mr-2" />
                      )}
                    </>
                  )}
                  <span className={`font-medium ${isAccessible ? "text-white" : "text-white/30"}`}>
                    {section.title}
                  </span>
                </div>
                <div className="ml-6 space-y-1">
                  {section.pages.map((page, pageIndex) => (
                    <button
                      key={page.id}
                      className={`text-sm w-full text-left py-1 px-2 rounded ${
                        sectionIndex === currentSection && pageIndex === currentPage
                          ? "bg-white/20 text-white"
                          : isAccessible
                          ? "text-white/70 hover:text-white hover:bg-white/10"
                          : "text-white/30 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        // Only allow navigating to accessible sections
                        if (isAccessible) {
                          setCurrentSection(sectionIndex);
                          setCurrentPage(pageIndex);
                        }
                      }}
                      disabled={!isAccessible}
                    >
                      {page.title}
                    </button>
                  ))}
                </div>

                {isAccessible && (
                  <div className="ml-6 mt-1">
                    <div 
                      className={`text-sm py-1 px-2 rounded flex items-center ${
                        isCompleted 
                          ? "text-[#14F195]" 
                          : "text-white/50"
                      }`}
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      {isCompleted ? "Quiz Completed" : "Quiz"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Adding Trophy import at the top
import { Trophy } from "lucide-react";

export default LessonSidebar;
