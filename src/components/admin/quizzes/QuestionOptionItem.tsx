
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trash } from "lucide-react";

interface QuestionOptionItemProps {
  option: string;
  index: number;
  isCorrect: boolean;
  onUpdateOption: (value: string) => void;
  onRemoveOption: () => void;
  onSetCorrect: () => void;
  canDelete: boolean;
}

const QuestionOptionItem = ({
  option,
  index,
  isCorrect,
  onUpdateOption,
  onRemoveOption,
  onSetCorrect,
  canDelete
}: QuestionOptionItemProps) => {
  return (
    <div className="flex items-center">
      <div 
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          isCorrect
            ? 'bg-green-500/20 border-green-500'
            : 'border-white/20 bg-white/10'
        } mr-2 cursor-pointer`}
        onClick={onSetCorrect}
      >
        {isCorrect && (
          <Check size={14} className="text-green-500" />
        )}
      </div>
      
      <Input
        value={option}
        onChange={(e) => onUpdateOption(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
      />
      
      {canDelete && (
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7 ml-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={onRemoveOption}
        >
          <Trash size={14} />
        </Button>
      )}
    </div>
  );
};

export default QuestionOptionItem;
