
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { quizzesData } from "@/data/quizzes";
import { QuizEditor } from "./QuizEditor";
import { Quiz } from "@/types/lesson";
import QuizSearch from "./quizzes/QuizSearch";
import QuizTable from "./quizzes/QuizTable";
import DeleteQuizDialog from "./quizzes/DeleteQuizDialog";

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
            <QuizSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
          
          <QuizTable 
            quizzes={filteredQuizzes} 
            onEditQuiz={handleEditQuiz} 
            onDeleteQuiz={handleDeleteQuiz} 
            onPreviewQuiz={previewQuiz} 
          />
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
      <DeleteQuizDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog} 
        quiz={currentQuiz} 
        onConfirmDelete={confirmDeleteQuiz} 
      />
    </div>
  );
};

export default QuizManagement;
