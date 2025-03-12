
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Plus, Trash, ChevronUp, ChevronDown, AlertCircle, Check } from "lucide-react";
import { Quiz, Question } from "@/types/lesson"

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={editedQuiz.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Reward Points</label>
          <Input
            type="number"
            min="0"
            value={editedQuiz.rewardPoints}
            onChange={(e) => handleInputChange('rewardPoints', parseInt(e.target.value))}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Lesson ID</label>
          <Input
            value={editedQuiz.lessonId}
            onChange={(e) => handleInputChange('lessonId', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Section ID</label>
          <Input
            value={editedQuiz.sectionId}
            onChange={(e) => handleInputChange('sectionId', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex items-center space-x-2 pt-7 col-span-2 md:col-span-1">
          <Switch
            id="isFinalTest"
            checked={!!editedQuiz.isFinalTest}
            onCheckedChange={(checked) => handleInputChange('isFinalTest', checked)}
          />
          <Label htmlFor="isFinalTest">Final Test</Label>
        </div>
      </div>
      
      <div className="pt-4 border-t border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Questions</h3>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={addQuestion}
          >
            <Plus size={16} className="mr-2" /> Add Question
          </Button>
        </div>
        
        <div className="space-y-6">
          {editedQuiz.questions.map((question, qIndex) => (
            <div 
              key={question.id} 
              className="p-4 border border-white/10 rounded-md bg-white/5"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-base font-medium">Question {qIndex + 1}</h4>
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => moveQuestion(qIndex, 'up')}
                    disabled={qIndex === 0}
                  >
                    <ChevronUp size={14} />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => moveQuestion(qIndex, 'down')}
                    disabled={qIndex === editedQuiz.questions.length - 1}
                  >
                    <ChevronDown size={14} />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    onClick={() => deleteQuestion(qIndex)}
                    disabled={editedQuiz.questions.length <= 1}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Question Text</label>
                  <Textarea
                    value={question.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    className="bg-white/10 border-white/20 text-white min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Answer Options</label>
                    {question.options.length < 6 && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-xs"
                        onClick={() => addOption(qIndex)}
                      >
                        <Plus size={12} className="mr-1" /> Add Option
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center">
                        <div 
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            question.correctOptionIndex === oIndex
                              ? 'bg-green-500/20 border-green-500'
                              : 'border-white/20 bg-white/10'
                          } mr-2 cursor-pointer`}
                          onClick={() => setCorrectOption(qIndex, oIndex)}
                        >
                          {question.correctOptionIndex === oIndex && (
                            <Check size={14} className="text-green-500" />
                          )}
                        </div>
                        
                        <Input
                          value={option}
                          onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                        
                        {question.options.length > 2 && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 ml-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => removeOption(qIndex, oIndex)}
                          >
                            <Trash size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {editedQuiz.questions.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/20 rounded-md bg-white/5">
              <AlertCircle size={24} className="text-white/50 mb-2" />
              <p className="text-white/50">No questions added yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 border-white/20 text-white hover:bg-white/10"
                onClick={addQuestion}
              >
                <Plus size={16} className="mr-2" /> Add First Question
              </Button>
            </div>
          )}
        </div>
      </div>
      
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
