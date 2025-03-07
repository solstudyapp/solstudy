
import { Input } from "@/components/ui/input";
import { Section } from "@/types/lesson";

interface SectionEditorProps {
  currentSection: Section;
  onUpdateSection: (field: keyof Section, value: any) => void;
}

const SectionEditor = ({ currentSection, onUpdateSection }: SectionEditorProps) => {
  return (
    <div className="space-y-4 mb-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Section Title</label>
        <Input
          value={currentSection.title}
          onChange={(e) => onUpdateSection('title', e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Quiz ID</label>
        <Input
          value={currentSection.quizId}
          onChange={(e) => onUpdateSection('quizId', e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
    </div>
  );
};

export default SectionEditor;
