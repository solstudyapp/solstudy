
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LessonCard from "@/components/LessonCard";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { lessonData } from "@/data/lessons";
import { FilterBar } from "@/components/FilterBar";

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeDifficulty, setActiveDifficulty] = useState("all");

  const filteredLessons = lessonData.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === "all" || lesson.category === activeFilter;
    const matchesDifficulty = activeDifficulty === "all" || lesson.difficulty === activeDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-xl bg-accent1/60 border border-accent3/20 p-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">SolStudy</h1>
            <p className="text-xl mb-6">Learn crypto, earn rewards, and build your knowledge in the blockchain space</p>
            <Button className="bg-accent4 text-black hover:bg-accent4/90">Start Learning</Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-accent1/60 border border-accent3/20 rounded-xl p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/30 border-accent3/20 text-white placeholder:text-white/60 focus-visible:ring-accent3/30"
              />
            </div>
            <FilterBar 
              activeFilter={activeFilter} 
              setActiveFilter={setActiveFilter}
              activeDifficulty={activeDifficulty}
              setActiveDifficulty={setActiveDifficulty}
            />
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center bg-accent1/60 border border-accent3/20 rounded-xl p-12 text-white">
            <h3 className="text-xl font-medium">No lessons found</h3>
            <p className="mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
