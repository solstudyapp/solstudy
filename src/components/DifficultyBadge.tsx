
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: "beginner" | "intermediate" | "advanced";
  size?: "sm" | "md";
}

export const DifficultyBadge = ({ difficulty, size = "md" }: DifficultyBadgeProps) => {
  return (
    <Badge
      className={cn(
        "font-medium transition-all",
        difficulty === "beginner" && "bg-black border border-green-500/30 text-green-400 hover:bg-green-500/10",
        difficulty === "intermediate" && "bg-black border border-blue-500/30 text-blue-400 hover:bg-blue-500/10",
        difficulty === "advanced" && "bg-black border border-orange-500/30 text-orange-400 hover:bg-orange-500/10",
        size === "sm" && "text-xs px-2 py-0"
      )}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
};
