
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { lessonData } from "@/data/lessons";
import { LessonType } from "@/types/lesson";
import { LessonEditor } from "./LessonEditor";
import LessonTable from "./lessons/LessonTable";
import LessonSearch from "./lessons/LessonSearch";
import DeleteLessonDialog from "./lessons/DeleteLessonDialog";

const LessonManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [lessons, setLessons] = useState<LessonType[]>(lessonData);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<LessonType | null>(null);
  const [isNewLesson, setIsNewLesson] = useState(false);
  
  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateLesson = () => {
    const newLesson: LessonType = {
      id: `lesson-${Date.now()}`,
      title: "New Lesson",
      description: "Lesson description",
      difficulty: "beginner",
      category: "blockchain",
      sections: 3,
      pages: 0,
      completedSections: 0,
      rating: 0,
      reviewCount: 0,
      icon: <></>,
    };
    
    setCurrentLesson(newLesson);
    setIsNewLesson(true);
    setShowEditDialog(true);
  };
  
  const handleEditLesson = (lesson: LessonType) => {
    setCurrentLesson(lesson);
    setIsNewLesson(false);
    setShowEditDialog(true);
  };
  
  const handleDeleteLesson = (lesson: LessonType) => {
    setCurrentLesson(lesson);
    setShowDeleteDialog(true);
  };
  
  const confirmDeleteLesson = () => {
    if (!currentLesson) return;
    
    setLessons(prev => prev.filter(lesson => lesson.id !== currentLesson.id));
    
    toast({
      title: "Lesson Deleted",
      description: `${currentLesson.title} has been deleted.`,
    });
    
    setShowDeleteDialog(false);
    setCurrentLesson(null);
  };
  
  const saveLesson = (updatedLesson: LessonType) => {
    if (isNewLesson) {
      setLessons(prev => [...prev, updatedLesson]);
      toast({
        title: "Lesson Created",
        description: `${updatedLesson.title} has been created.`,
      });
    } else {
      setLessons(prev => 
        prev.map(lesson => lesson.id === updatedLesson.id ? updatedLesson : lesson)
      );
      toast({
        title: "Lesson Updated",
        description: `${updatedLesson.title} has been updated.`,
      });
    }
    
    setShowEditDialog(false);
    setCurrentLesson(null);
  };
  
  const previewLesson = (lessonId: string) => {
    window.open(`/lesson/${lessonId}`, '_blank');
  };
  
  return (
    <div className="space-y-6">
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Lessons Management</CardTitle>
            <CardDescription className="text-white/70">
              Create and manage learning modules
            </CardDescription>
          </div>
          <Button 
            className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
            onClick={handleCreateLesson}
          >
            <Plus size={16} className="mr-2" />
            New Lesson
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center">
            <LessonSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
          
          <LessonTable 
            lessons={filteredLessons} 
            onEdit={handleEditLesson} 
            onDelete={handleDeleteLesson} 
            onPreview={previewLesson} 
          />
        </CardContent>
      </Card>
      
      {/* Edit Lesson Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNewLesson ? "Create New Lesson" : "Edit Lesson"}</DialogTitle>
            <DialogDescription className="text-white/70">
              {isNewLesson ? "Create a new lesson from scratch" : `Edit the lesson: ${currentLesson?.title}`}
            </DialogDescription>
          </DialogHeader>
          
          {currentLesson && (
            <LessonEditor
              lesson={currentLesson}
              onSave={saveLesson}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Lesson Dialog */}
      <DeleteLessonDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        lesson={currentLesson}
        onConfirmDelete={confirmDeleteLesson}
      />
    </div>
  );
};

export default LessonManagement;
