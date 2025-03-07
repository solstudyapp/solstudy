
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award } from "lucide-react";
import { LessonType } from "@/types/lesson";

interface LessonDetailsProps {
  lesson: LessonType;
  onUpdateLesson: (field: keyof LessonType, value: any) => void;
}

const LessonDetails = ({ lesson, onUpdateLesson }: LessonDetailsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={lesson.title}
            onChange={(e) => onUpdateLesson('title', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Category</label>
          <Input
            value={lesson.category}
            onChange={(e) => onUpdateLesson('category', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Difficulty</label>
          <Select 
            value={lesson.difficulty} 
            onValueChange={(value) => onUpdateLesson('difficulty', value)}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/80 backdrop-blur-md border-white/10 text-white">
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Rating</label>
          <Input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={lesson.rating}
            onChange={(e) => onUpdateLesson('rating', parseFloat(e.target.value))}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Review Count</label>
          <Input
            type="number"
            min="0"
            value={lesson.reviewCount}
            onChange={(e) => onUpdateLesson('reviewCount', parseInt(e.target.value))}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            <span className="flex items-center">
              <Award size={16} className="mr-2 text-[#14F195]" /> 
              Points Reward
            </span>
          </label>
          <Input
            type="number"
            min="0"
            value={lesson.points || 0}
            onChange={(e) => onUpdateLesson('points', parseInt(e.target.value))}
            placeholder="Points awarded for completion"
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        
        <div className="flex items-center space-x-2 pt-7">
          <Switch
            id="sponsored"
            checked={!!lesson.sponsored}
            onCheckedChange={(checked) => onUpdateLesson('sponsored', checked)}
          />
          <Label htmlFor="sponsored">Sponsored Lesson</Label>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={lesson.description}
          onChange={(e) => onUpdateLesson('description', e.target.value)}
          className="bg-white/10 border-white/20 text-white min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default LessonDetails;
