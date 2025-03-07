import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, X, Plus, Trash, ChevronUp, ChevronDown, Edit, BookOpen, Award } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { LessonType, Section, Page } from "@/types/lesson";
import { getSectionsForLesson } from "@/data/sections";
import { RichTextEditor } from "./RichTextEditor";
import IconSelector from "./IconSelector";

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
    if (lesson.iconName && !lesson.icon) {
      const IconComponent = (LucideIcons as any)[lesson.iconName];
      if (IconComponent) {
        setEditedLesson(prev => ({
          ...prev,
          icon: <IconComponent size={24} />
        }));
      }
    }
  }, [lesson]);
  
  useEffect(() => {
    if (lesson.id && lesson.id !== "lesson-new") {
      const existingSections = getSectionsForLesson(lesson.id);
      if (existingSections && existingSections.length > 0) {
        setSections(existingSections);
      } else {
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
      }
    } else {
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
    }
  }, [lesson.id]);
  
  useEffect(() => {
    const totalPages = sections.reduce((total, section) => total + section.pages.length, 0);
    setEditedLesson(prev => ({...prev, pages: totalPages, sections: sections.length}));
  }, [sections]);
  
  const handleInputChange = (field: keyof LessonType, value: any) => {
    setEditedLesson(prev => ({...prev, [field]: value}));
  };
  
  const handleIconChange = (icon: React.ReactNode, iconName: string) => {
    setEditedLesson(prev => ({
      ...prev,
      icon,
      iconName
    }));
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
  
  const renderSectionsList = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Sections</h3>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={addSection}
          >
            <Plus size={16} className="mr-2" /> Add Section
          </Button>
        </div>
        
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
          {sections.map((section, index) => (
            <div 
              key={section.id} 
              className={`flex items-center justify-between p-2 rounded ${
                currentSectionIndex === index ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              onClick={() => {
                setCurrentSectionIndex(index);
                setCurrentPageIndex(0);
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{section.title}</span>
                <span className="text-xs text-white/50">({section.pages.length} pages)</span>
              </div>
              <div className="flex gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(index, 'up');
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
                    moveSection(index, 'down');
                  }}
                  disabled={index === sections.length - 1}
                >
                  <ChevronDown size={14} />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(index);
                  }}
                  disabled={sections.length <= 1}
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
  
  const renderPagesList = () => {
    if (sections.length === 0) return null;
    
    const currentSection = sections[currentSectionIndex];
    
    return (
      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Pages in {currentSection.title}</h3>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => addPage(currentSectionIndex)}
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
              onClick={() => setCurrentPageIndex(index)}
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
                    movePage(currentSectionIndex, index, 'up');
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
                    movePage(currentSectionIndex, index, 'down');
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
                    deletePage(currentSectionIndex, index);
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
  
  const renderPageEditor = () => {
    if (sections.length === 0 || !sections[currentSectionIndex]?.pages[currentPageIndex]) {
      return <div className="text-white/50">No page selected</div>;
    }
    
    const currentPage = sections[currentSectionIndex].pages[currentPageIndex];
    
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Page Title</label>
          <Input
            value={currentPage.title}
            onChange={(e) => updatePage(currentSectionIndex, currentPageIndex, 'title', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex flex-col gap-2 pt-4">
          <label className="text-sm font-medium">Content</label>
          <div className="border border-white/20 rounded-md overflow-hidden">
            <RichTextEditor
              initialContent={currentPage.content}
              onChange={(content) => updatePage(currentSectionIndex, currentPageIndex, 'content', content)}
            />
          </div>
        </div>
      </div>
    );
  };
  
  const renderSectionEditor = () => {
    if (sections.length === 0) return null;
    
    const currentSection = sections[currentSectionIndex];
    
    return (
      <div className="space-y-4 mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Section Title</label>
          <Input
            value={currentSection.title}
            onChange={(e) => updateSection(currentSectionIndex, 'title', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Quiz ID</label>
          <Input
            value={currentSection.quizId}
            onChange={(e) => updateSection(currentSectionIndex, 'quizId', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editedLesson.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                value={editedLesson.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Icon</label>
              <IconSelector
                selectedIcon={editedLesson.icon}
                onSelectIcon={handleIconChange}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select 
                value={editedLesson.difficulty} 
                onValueChange={(value) => handleInputChange('difficulty', value)}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-md border-white/10 text-white">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Rating</label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={editedLesson.rating}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Review Count</label>
              <Input
                type="number"
                min="0"
                value={editedLesson.reviewCount}
                onChange={(e) => handleInputChange('reviewCount', parseInt(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                <span className="flex items-center">
                  <Award size={16} className="mr-2 text-[#14F195]" /> 
                  Points Reward
                </span>
              </label>
              <Input
                type="number"
                min="0"
                value={editedLesson.points || 0}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                placeholder="Points awarded for completion"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-7">
              <Switch
                id="sponsored"
                checked={!!editedLesson.sponsored}
                onCheckedChange={(checked) => handleInputChange('sponsored', checked)}
              />
              <Label htmlFor="sponsored">Sponsored Lesson</Label>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={editedLesson.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-white/10 border-white/20 text-white min-h-[100px]"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="pt-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4">
              {renderSectionsList()}
              {renderPagesList()}
            </div>
            
            <div className="w-full md:w-2/3 space-y-4">
              {renderSectionEditor()}
              {renderPageEditor()}
            </div>
          </div>
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
