
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, Pencil, Trash, MoreVertical, Save, X, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { lessonData } from "@/data/lessons";
import { Section, LessonType } from "@/types/lesson";
import { LessonEditor } from "./LessonEditor";

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
      <Card className="backdrop-blur-md bg-white/10 border-white/10 text-white">
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <Input
                placeholder="Search lessons..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border border-white/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/10">
                <TableRow className="hover:bg-white/5 border-white/10">
                  <TableHead>Title</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sponsored</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLessons.map(lesson => (
                  <TableRow key={lesson.id} className="hover:bg-white/5 border-white/10">
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          lesson.difficulty === "beginner"
                            ? "bg-green-500/30 text-green-50"
                            : lesson.difficulty === "intermediate"
                            ? "bg-blue-500/30 text-blue-50"
                            : "bg-orange-500/30 text-orange-50"
                        }
                      >
                        {lesson.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{lesson.category}</TableCell>
                    <TableCell className="flex items-center">
                      {lesson.rating}
                      <span className="text-yellow-400 ml-1">★</span>
                      <span className="text-xs text-white/50 ml-1">({lesson.reviewCount})</span>
                    </TableCell>
                    <TableCell>
                      {lesson.sponsored ? (
                        <Badge className="bg-purple-500/30 text-purple-50">
                          Sponsored
                        </Badge>
                      ) : (
                        <span className="text-white/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black/70 backdrop-blur-md border-white/10 text-white">
                          <DropdownMenuItem onClick={() => handleEditLesson(lesson)}
                            className="hover:bg-white/10 cursor-pointer">
                            <Pencil size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => previewLesson(lesson.id)}
                            className="hover:bg-white/10 cursor-pointer">
                            <ExternalLink size={16} className="mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteLesson(lesson)}
                            className="hover:bg-white/10 cursor-pointer text-red-400">
                            <Trash size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredLessons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-white/50">
                      No lessons found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete {currentLesson?.title}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={confirmDeleteLesson} variant="destructive">
              <Trash size={16} className="mr-2" />
              Delete Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonManagement;
