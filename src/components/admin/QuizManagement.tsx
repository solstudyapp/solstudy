
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
import { quizzesData } from "@/data/quizzes";
import { QuizEditor } from "./QuizEditor";
import { Quiz } from "@/types/lesson";

const QuizManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>(Object.values(quizzesData));
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isNewQuiz, setIsNewQuiz] = useState(false);
  
  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.lessonId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateQuiz = () => {
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: "New Quiz",
      lessonId: "default",
      sectionId: "default",
      rewardPoints: 50,
      questions: [
        {
          id: `q1-${Date.now()}`,
          text: "Sample question?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOptionIndex: 0
        }
      ]
    };
    
    setCurrentQuiz(newQuiz);
    setIsNewQuiz(true);
    setShowEditDialog(true);
  };
  
  const handleEditQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setIsNewQuiz(false);
    setShowEditDialog(true);
  };
  
  const handleDeleteQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setShowDeleteDialog(true);
  };
  
  const confirmDeleteQuiz = () => {
    if (!currentQuiz) return;
    
    setQuizzes(prev => prev.filter(quiz => quiz.id !== currentQuiz.id));
    
    toast({
      title: "Quiz Deleted",
      description: `${currentQuiz.title} has been deleted.`,
    });
    
    setShowDeleteDialog(false);
    setCurrentQuiz(null);
  };
  
  const saveQuiz = (updatedQuiz: Quiz) => {
    if (isNewQuiz) {
      setQuizzes(prev => [...prev, updatedQuiz]);
      toast({
        title: "Quiz Created",
        description: `${updatedQuiz.title} has been created.`,
      });
    } else {
      setQuizzes(prev => 
        prev.map(quiz => quiz.id === updatedQuiz.id ? updatedQuiz : quiz)
      );
      toast({
        title: "Quiz Updated",
        description: `${updatedQuiz.title} has been updated.`,
      });
    }
    
    setShowEditDialog(false);
    setCurrentQuiz(null);
  };
  
  const previewQuiz = (quiz: Quiz) => {
    window.open(`/quiz/${quiz.lessonId}/${quiz.sectionId}`, '_blank');
  };
  
  return (
    <div className="space-y-6">
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Quizzes Management</CardTitle>
            <CardDescription className="text-white/70">
              Create and manage quizzes and assessments
            </CardDescription>
          </div>
          <Button 
            className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
            onClick={handleCreateQuiz}
          >
            <Plus size={16} className="mr-2" />
            New Quiz
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <Input
                placeholder="Search quizzes..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border border-white/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="hover:bg-white/5 border-white/10">
                  <TableHead>Title</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map(quiz => (
                  <TableRow key={quiz.id} className="hover:bg-white/5 border-white/10">
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.lessonId}</TableCell>
                    <TableCell>{quiz.sectionId}</TableCell>
                    <TableCell>{quiz.questions.length}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500/30 text-blue-50">
                        {quiz.rewardPoints} pts
                      </Badge>
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
                          <DropdownMenuItem onClick={() => handleEditQuiz(quiz)}
                            className="hover:bg-white/10 cursor-pointer">
                            <Pencil size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => previewQuiz(quiz)}
                            className="hover:bg-white/10 cursor-pointer">
                            <ExternalLink size={16} className="mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteQuiz(quiz)}
                            className="hover:bg-white/10 cursor-pointer text-red-400">
                            <Trash size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredQuizzes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-white/50">
                      No quizzes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Quiz Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNewQuiz ? "Create New Quiz" : "Edit Quiz"}</DialogTitle>
            <DialogDescription className="text-white/70">
              {isNewQuiz ? "Create a new quiz from scratch" : `Edit the quiz: ${currentQuiz?.title}`}
            </DialogDescription>
          </DialogHeader>
          
          {currentQuiz && (
            <QuizEditor
              quiz={currentQuiz}
              onSave={saveQuiz}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Quiz Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete {currentQuiz?.title}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={confirmDeleteQuiz} variant="destructive">
              <Trash size={16} className="mr-2" />
              Delete Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizManagement;
