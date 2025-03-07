
import { CheckCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Section } from "@/types/lesson";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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
  // Create a flattened list of all pages for the dropdown
  const allPages = sections.flatMap((section, sectionIndex) => 
    section.pages.map((page, pageIndex) => ({
      section: sectionIndex,
      page: pageIndex,
      title: page.title,
      sectionTitle: section.title,
      id: page.id,
      // Determine if this page is accessible based on progress
      isAccessible: sectionIndex < currentSection || 
        (sectionIndex === currentSection && pageIndex <= currentPage)
    }))
  );

  const currentPageId = sections[currentSection]?.pages[currentPage]?.id;
  
  const handlePageSelect = (value: string) => {
    const [sectionIndex, pageIndex] = value.split(':').map(Number);
    
    if (
      sectionIndex < currentSection ||
      (sectionIndex === currentSection && pageIndex <= currentPage)
    ) {
      setCurrentSection(sectionIndex);
      setCurrentPage(pageIndex);
    }
  };

  return (
    <div className="hidden md:block">
      {/* Mobile dropdown selector (only visible on small screens) */}
      <div className="md:hidden mb-4">
        <Select 
          value={`${currentSection}:${currentPage}`}
          onValueChange={handlePageSelect}
        >
          <SelectTrigger className="w-full bg-gray-900 border-white/20 text-white">
            <SelectValue placeholder="Select a page" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/20 text-white max-h-[300px] z-50">
            {allPages.map((page) => (
              <SelectItem 
                key={page.id} 
                value={`${page.section}:${page.page}`}
                disabled={!page.isAccessible}
                className={!page.isAccessible ? "opacity-50" : ""}
              >
                {page.sectionTitle} - {page.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-lg p-4 sticky top-24">
        <h3 className="text-lg font-medium text-white mb-4">Course Contents</h3>
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <div key={section.id}>
              <div className="flex items-center mb-2">
                {sectionIndex < currentSection ? (
                  <CheckCircle className="h-4 w-4 text-[#14F195] mr-2" />
                ) : sectionIndex === currentSection ? (
                  <BookOpen className="h-4 w-4 text-white mr-2" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-white/40 mr-2"></div>
                )}
                <span className="text-white font-medium">{section.title}</span>
              </div>
              <div className="ml-6 space-y-1">
                {section.pages.map((page, pageIndex) => (
                  <button
                    key={page.id}
                    className={`text-sm w-full text-left py-1 px-2 rounded ${
                      sectionIndex === currentSection && pageIndex === currentPage
                        ? "bg-white/20 text-white"
                        : sectionIndex < currentSection || (sectionIndex === currentSection && pageIndex < currentPage)
                        ? "text-white/70 hover:text-white hover:bg-white/10"
                        : "text-white/50"
                    }`}
                    onClick={() => {
                      // Only allow navigating to completed pages or the current one
                      if (
                        sectionIndex < currentSection ||
                        (sectionIndex === currentSection && pageIndex <= currentPage)
                      ) {
                        setCurrentSection(sectionIndex);
                        setCurrentPage(pageIndex);
                      }
                    }}
                  >
                    {page.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonSidebar;
