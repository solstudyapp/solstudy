
import { Button } from "@/components/ui/button";
import { Plus, Trash, ChevronUp, ChevronDown, Edit } from "lucide-react";
import { Section } from "@/types/lesson";

interface PageListProps {
  currentSection: Section;
  currentPageIndex: number;
  onAddPage: () => void;
  onSelectPage: (index: number) => void;
  onMovePage: (pageIndex: number, direction: 'up' | 'down') => void;
  onDeletePage: (pageIndex: number) => void;
}

const PageList = ({
  currentSection,
  currentPageIndex,
  onAddPage,
  onSelectPage,
  onMovePage,
  onDeletePage
}: PageListProps) => {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pages in {currentSection.title}</h3>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
          onClick={onAddPage}
        >
          <Plus size={16} className="mr-2" /> Add Page
        </Button>
      </div>
      
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
        {currentSection.pages.map((page, index) => (
          <div 
            key={page.id} 
            className={`flex items-center justify-between p-2 rounded ${
              currentPageIndex === index ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
            onClick={() => onSelectPage(index)}
          >
            <div className="flex items-center gap-2">
              <Edit size={16} />
              <span>{page.title}</span>
            </div>
            <div className="flex gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onMovePage(index, 'up');
                }}
                disabled={index === 0}
              >
                <ChevronUp size={14} />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onMovePage(index, 'down');
                }}
                disabled={index === currentSection.pages.length - 1}
              >
                <ChevronDown size={14} />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePage(index);
                }}
                disabled={currentSection.pages.length <= 1}
              >
                <Trash size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageList;
