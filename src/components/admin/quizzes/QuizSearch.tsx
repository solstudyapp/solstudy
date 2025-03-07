
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface QuizSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const QuizSearch = ({ searchTerm, onSearchChange }: QuizSearchProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
      <Input
        placeholder="Search quizzes..."
        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default QuizSearch;
