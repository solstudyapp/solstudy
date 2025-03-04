
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "./DifficultyBadge";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  activeDifficulty: string;
  setActiveDifficulty: (difficulty: string) => void;
}

export const FilterBar = ({ 
  activeFilter, 
  setActiveFilter,
  activeDifficulty,
  setActiveDifficulty
}: FilterBarProps) => {
  const categories = ["all", "blockchain", "defi", "nft", "trading", "solana"];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            size="sm"
            className={cn(
              "text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full",
              activeFilter === category && "bg-white/20 text-white"
            )}
            onClick={() => setActiveFilter(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>
      
      <div className="h-8 w-px bg-white/20 mx-2 hidden md:block" />
      
      <div className="flex flex-wrap gap-2">
        {difficulties.map((difficulty) => {
          if (difficulty === "all") {
            return (
              <Button
                key={difficulty}
                variant="ghost"
                size="sm"
                className={cn(
                  "text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full",
                  activeDifficulty === difficulty && "bg-white/20 text-white"
                )}
                onClick={() => setActiveDifficulty(difficulty)}
              >
                All Levels
              </Button>
            );
          }
          
          return (
            <Button
              key={difficulty}
              variant="ghost"
              size="sm"
              className={cn(
                "p-0 h-7 bg-transparent hover:bg-transparent",
                activeDifficulty === difficulty && "ring-2 ring-white/40 ring-offset-1 ring-offset-transparent"
              )}
              onClick={() => setActiveDifficulty(difficulty)}
            >
              <DifficultyBadge difficulty={difficulty as "beginner" | "intermediate" | "advanced"} size="sm" />
            </Button>
          );
        })}
      </div>
    </div>
  );
};
