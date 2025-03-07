
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, X } from "lucide-react";
import { LessonType, Section, Page } from "@/types/lesson";
import { getSectionsForLesson } from "@/data/sections";
import LessonDetails from "./lessons/LessonDetails";
import SectionList from "./lessons/SectionList";
import PageList from "./lessons/PageList";
import SectionEditor from "./lessons/SectionEditor";
import PageEditor from "./lessons/PageEditor";

interface LessonEditorProps {
  lesson: LessonType;
  onSave: (lesson: LessonType) => void;
  onCancel: () => void;
}

export const LessonEditor = ({ lesson, onSave, onCancel }: LessonEditorProps) => {
  const [editedLesson, setEditedLesson] = useState<LessonType>({...lesson});
  const [sections, setSections] = useState<Section[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  useEffect(() => {
    if (lesson.id && lesson.id !== "lesson-new") {
      const existingSections = getSectionsForLesson(lesson.id);
      if (existingSections && existingSections.length > 0) {
        setSections(existingSections);
      } else {
        initializeDefaultSections();
      }
    } else {
      initializeDefaultSections();
    }
  }, [lesson.id]);
  
  const initializeDefaultSections = () => {
    const defaultSections: Section[] = [
      {
        id: `section1-${Date.now()}`,
        title: "Section 1",
        pages: [
          { id: `page1-${Date.now()}`, title: "Introduction", content: "<h1>Introduction</h1><p>Welcome to this lesson!</p>" }
        ],
        quizId: `quiz-${Date.now()}`
      }
    ];
    setSections(defaultSections);
  };
  
  useEffect(() => {
    const totalPages = sections.reduce((total, section) => total + section.pages.length, 0);
    setEditedLesson(prev => ({...prev, pages: totalPages, sections: sections.length}));
  }, [sections]);
  
  const handleInputChange = (field: keyof LessonType, value: any) => {
    setEditedLesson(prev => ({...prev, [field]: value}));
  };
  
  const handleSaveLesson = () => {
    onSave(editedLesson);
  };
  
  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      pages: [
        { id: `page-${Date.now()}`, title: "New Page", content: "<h1>New Page</h1><p>Add your content here.</p>" }
      ],
      quizId: `quiz-${Date.now()}`
    };
    
    setSections(prev => [...prev, newSection]);
  };
  
  const updateSection = (index: number, field: keyof Section, value: any) => {
    setSections(prev => {
      const updated = [...prev];
      updated[index] = {...updated[index], [field]: value};
      return updated;
    });
  };
  
  const deleteSection = (index: number) => {
    if (sections.length <= 1) {
      return;
    }
    
    setSections(prev => prev.filter((_, i) => i !== index));
    
    if (currentSectionIndex >= index && currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setCurrentPageIndex(0);
    }
  };
  
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    setSections(prev => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
    
    setCurrentSectionIndex(newIndex);
  };
  
  const addPage = (sectionIndex: number) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].pages.push({
        id: `page-${Date.now()}`,
        title: `New Page ${updated[sectionIndex].pages.length + 1}`,
        content: "<h1>New Page</h1><p>Add your content here.</p>"
      });
      return updated;
    });
    
    setCurrentPageIndex(sections[sectionIndex].pages.length);
  };
  
  const updatePage = (sectionIndex: number, pageIndex: number, field: keyof Page, value: any) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].pages[pageIndex] = {
        ...updated[sectionIndex].pages[pageIndex],
        [field]: value
      };
      return updated;
    });
  };
  
  const deletePage = (sectionIndex: number, pageIndex: number) => {
    if (sections[sectionIndex].pages.length <= 1) {
      return;
    }
    
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].pages = updated[sectionIndex].pages.filter((_, i) => i !== pageIndex);
      return updated;
    });
    
    if (currentPageIndex >= pageIndex && currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };
  
  const movePage = (sectionIndex: number, pageIndex: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && pageIndex === 0) || (direction === 'down' && pageIndex === sections[sectionIndex].pages.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1;
    
    setSections(prev => {
      const updated = [...prev];
      const pages = [...updated[sectionIndex].pages];
      [pages[pageIndex], pages[newIndex]] = [pages[newIndex], pages[pageIndex]];
      updated[sectionIndex].pages = pages;
      return updated;
    });
    
    setCurrentPageIndex(newIndex);
  };
  
  const renderContentTab = () => {
    if (sections.length === 0) {
      return <div className="text-white/50">No sections available</div>;
    }
    
    const currentSection = sections[currentSectionIndex];
    const currentPage = currentSection?.pages[currentPageIndex];
    
    return (
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-4">
          <SectionList 
            sections={sections}
            currentSectionIndex={currentSectionIndex}
            onAddSection={addSection}
            onSelectSection={(index) => {
              setCurrentSectionIndex(index);
              setCurrentPageIndex(0);
            }}
            onMoveSection={moveSection}
            onDeleteSection={deleteSection}
          />
          
          {currentSection && (
            <PageList 
              currentSection={currentSection}
              currentPageIndex={currentPageIndex}
              onAddPage={() => addPage(currentSectionIndex)}
              onSelectPage={setCurrentPageIndex}
              onMovePage={(pageIndex, direction) => movePage(currentSectionIndex, pageIndex, direction)}
              onDeletePage={(pageIndex) => deletePage(currentSectionIndex, pageIndex)}
            />
          )}
        </div>
        
        <div className="w-full md:w-2/3 space-y-4">
          {currentSection && (
            <SectionEditor 
              currentSection={currentSection}
              onUpdateSection={(field, value) => updateSection(currentSectionIndex, field, value)}
            />
          )}
          
          {currentPage && (
            <PageEditor 
              currentPage={currentPage}
              onUpdatePage={(field, value) => updatePage(currentSectionIndex, currentPageIndex, field, value)}
            />
          )}
          
          {!currentPage && (
            <div className="text-white/50">No page selected</div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-black/20 border-b border-white/10 w-full justify-start">
          <TabsTrigger value="details" className="data-[state=active]:bg-white/10">
            Basic Details
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-white/10">
            Lesson Content
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="pt-4 space-y-4">
          <LessonDetails 
            lesson={editedLesson} 
            onUpdateLesson={handleInputChange} 
          />
        </TabsContent>
        
        <TabsContent value="content" className="pt-4">
          {renderContentTab()}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <X size={16} className="mr-2" />
          Cancel
        </Button>
        <Button 
          onClick={handleSaveLesson}
          className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
        >
          <Save size={16} className="mr-2" />
          Save Lesson
        </Button>
      </div>
    </div>
  );
};
