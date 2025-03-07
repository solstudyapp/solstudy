
import { useState } from "react";
import { Question } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, ChevronDown, Trash, Plus } from "lucide-react";
import QuestionOptionItem from "./QuestionOptionItem";

interface QuestionEditorProps {
  question: Question;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isOnly: boolean;
  onUpdateQuestion: (field: keyof Question, value: any) => void;
  onDeleteQuestion: () => void;
  onMoveQuestion: (direction: 'up' | 'down') => void;
  onUpdateOption: (optionIndex: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onSetCorrectOption: (optionIndex: number) => void;
}

const QuestionEditor = ({
  question,
  index,
  isFirst,
  isLast,
  isOnly,
  onUpdateQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onSetCorrectOption
}: QuestionEditorProps) => {
  return (
    <div className="p-4 border border-white/10 rounded-md bg-white/5">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-base font-medium">Question {index + 1}</h4>
        <div className="flex gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7"
            onClick={() => onMoveQuestion('up')}
            disabled={isFirst}
          >
            <ChevronUp size={14} />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7"
            onClick={() => onMoveQuestion('down')}
            disabled={isLast}
          >
            <ChevronDown size={14} />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={onDeleteQuestion}
            disabled={isOnly}
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
            onChange={(e) => onUpdateQuestion('text', e.target.value)}
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
                onClick={onAddOption}
              >
                <Plus size={12} className="mr-1" /> Add Option
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            {question.options.map((option, oIndex) => (
              <QuestionOptionItem
                key={oIndex}
                option={option}
                index={oIndex}
                isCorrect={question.correctOptionIndex === oIndex}
                onUpdateOption={(value) => onUpdateOption(oIndex, value)}
                onRemoveOption={() => onRemoveOption(oIndex)}
                onSetCorrect={() => onSetCorrectOption(oIndex)}
                canDelete={question.options.length > 2}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
