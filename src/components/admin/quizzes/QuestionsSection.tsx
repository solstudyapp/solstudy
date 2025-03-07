
import { Question } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";
import QuestionEditor from "./QuestionEditor";

interface QuestionsSectionProps {
  questions: Question[];
  onAddQuestion: () => void;
  onUpdateQuestion: (index: number, field: keyof Question, value: any) => void;
  onDeleteQuestion: (index: number) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
  onUpdateQuestionOption: (questionIndex: number, optionIndex: number, value: string) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onSetCorrectOption: (questionIndex: number, optionIndex: number) => void;
}

const QuestionsSection = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  onUpdateQuestionOption,
  onAddOption,
  onRemoveOption,
  onSetCorrectOption
}: QuestionsSectionProps) => {
  return (
    <div className="pt-4 border-t border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Questions</h3>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
          onClick={onAddQuestion}
        >
          <Plus size={16} className="mr-2" /> Add Question
        </Button>
      </div>
      
      <div className="space-y-6">
        {questions.map((question, qIndex) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={qIndex}
            isFirst={qIndex === 0}
            isLast={qIndex === questions.length - 1}
            isOnly={questions.length <= 1}
            onUpdateQuestion={(field, value) => onUpdateQuestion(qIndex, field, value)}
            onDeleteQuestion={() => onDeleteQuestion(qIndex)}
            onMoveQuestion={(direction) => onMoveQuestion(qIndex, direction)}
            onUpdateOption={(optionIndex, value) => onUpdateQuestionOption(qIndex, optionIndex, value)}
            onAddOption={() => onAddOption(qIndex)}
            onRemoveOption={(optionIndex) => onRemoveOption(qIndex, optionIndex)}
            onSetCorrectOption={(optionIndex) => onSetCorrectOption(qIndex, optionIndex)}
          />
        ))}
        
        {questions.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/20 rounded-md bg-white/5">
            <AlertCircle size={24} className="text-white/50 mb-2" />
            <p className="text-white/50">No questions added yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 border-white/20 text-white hover:bg-white/10"
              onClick={onAddQuestion}
            >
              <Plus size={16} className="mr-2" /> Add First Question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsSection;
