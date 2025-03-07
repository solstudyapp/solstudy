
import { Quiz } from "@/types/lesson";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface QuizMetadataFormProps {
  quiz: Quiz;
  onHandleInputChange: (field: keyof Quiz, value: any) => void;
}

const QuizMetadataForm = ({ quiz, onHandleInputChange }: QuizMetadataFormProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          value={quiz.title}
          onChange={(e) => onHandleInputChange('title', e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Reward Points</label>
        <Input
          type="number"
          min="0"
          value={quiz.rewardPoints}
          onChange={(e) => onHandleInputChange('rewardPoints', parseInt(e.target.value))}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Lesson ID</label>
        <Input
          value={quiz.lessonId}
          onChange={(e) => onHandleInputChange('lessonId', e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Section ID</label>
        <Input
          value={quiz.sectionId}
          onChange={(e) => onHandleInputChange('sectionId', e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
      
      <div className="flex items-center space-x-2 pt-7 col-span-2 md:col-span-1">
        <Switch
          id="isFinalTest"
          checked={!!quiz.isFinalTest}
          onCheckedChange={(checked) => onHandleInputChange('isFinalTest', checked)}
        />
        <Label htmlFor="isFinalTest">Final Test</Label>
      </div>
    </div>
  );
};

export default QuizMetadataForm;
