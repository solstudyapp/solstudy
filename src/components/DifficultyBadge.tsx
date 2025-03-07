
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
        difficulty === "beginner" && "bg-green-500/30 text-green-50 hover:bg-green-500/40",
        difficulty === "intermediate" && "bg-blue-500/30 text-blue-50 hover:bg-blue-500/40",
        difficulty === "advanced" && "bg-orange-500/30 text-orange-50 hover:bg-orange-500/40",
        size === "sm" && "text-xs px-2 py-0"
      )}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
};
