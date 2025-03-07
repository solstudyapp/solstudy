
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, X, Plus } from "lucide-react";
import { Quiz, Question } from "@/types/lesson";
import QuizMetadataForm from "./quizzes/QuizMetadataForm";
import QuestionsSection from "./quizzes/QuestionsSection";

interface QuizEditorProps {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

export const QuizEditor = ({ quiz, onSave, onCancel }: QuizEditorProps) => {
  const [editedQuiz, setEditedQuiz] = useState<Quiz>({...quiz});
  
  const handleInputChange = (field: keyof Quiz, value: any) => {
    setEditedQuiz(prev => ({...prev, [field]: value}));
  };
  
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: "New question?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctOptionIndex: 0
    };
    
    setEditedQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };
  
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setEditedQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    setEditedQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions
      };
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  const addOption = (questionIndex: number) => {
    setEditedQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options, `Option ${updatedQuestions[questionIndex].options.length + 1}`];
      
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions
      };
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  const removeOption = (questionIndex: number, optionIndex: number) => {
    setEditedQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      
      // Adjust correct answer index if needed
      let correctIndex = updatedQuestions[questionIndex].correctOptionIndex;
      if (optionIndex === correctIndex) {
        correctIndex = 0;
      } else if (optionIndex < correctIndex) {
        correctIndex--;
      }
      
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions,
        correctOptionIndex: correctIndex
      };
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    setEditedQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        correctOptionIndex: optionIndex
      };
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  const deleteQuestion = (index: number) => {
    setEditedQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };
  
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === editedQuiz.questions.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    setEditedQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  const handleSaveQuiz = () => {
    onSave(editedQuiz);
  };
  
  return (
    <div className="space-y-6">
      <QuizMetadataForm 
        quiz={editedQuiz} 
        onHandleInputChange={handleInputChange} 
      />
      
      <QuestionsSection 
        questions={editedQuiz.questions}
        onAddQuestion={addQuestion}
        onUpdateQuestion={updateQuestion}
        onDeleteQuestion={deleteQuestion}
        onMoveQuestion={moveQuestion}
        onUpdateQuestionOption={updateQuestionOption}
        onAddOption={addOption}
        onRemoveOption={removeOption}
        onSetCorrectOption={setCorrectOption}
      />
      
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
          onClick={handleSaveQuiz}
          className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
        >
          <Save size={16} className="mr-2" />
          Save Quiz
        </Button>
      </div>
    </div>
  );
};
