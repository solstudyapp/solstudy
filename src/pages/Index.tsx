
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LessonCard from "@/components/LessonCard";
import { FilterBar } from "@/components/FilterBar";
import { lessonData } from "@/data/lessons";
import FeatureCards from "@/components/FeatureCards";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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

  const handleStartLearning = () => {
    window.scrollTo(0, 0);
    
    if (lessonData.length > 0) {
      navigate(`/lesson/${lessonData[0].id}`);
    } else {
      toast({
        title: "No courses available",
        description: "Please check back later for new content.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-xl dark-glass p-8 text-white bg-gradient-to-br from-[#9945FF]/5 to-[#14F195]/5">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">SolStudy</span>
            </h1>
            <p className="text-xl mb-6">
              Learn about crypto from fundamentals to advanced trading strategies. With our course feedback component you play an important role helping evolve the material for future users. Earn rewards for completing courses and referring others to do so. Rewards will be converted to tokens upon SocialFiLy TGE. We are part of the growing SocialFiLy ecosystem and look forward to having you in our community.
            </p>
            <Button 
              variant="default" 
              onClick={handleStartLearning}
              className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white"
            >
              Start Learning
            </Button>
          </div>
        </div>

        {/* Feature Cards Section */}
        <FeatureCards />

        {/* Search and Filter Section */}
        <div className="dark-glass rounded-xl p-4 mb-8 bg-gradient-to-br from-[#9945FF]/5 to-[#14F195]/5">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60 focus-visible:ring-white/30"
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

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center dark-glass rounded-xl p-12 text-white">
            <h3 className="text-xl font-medium">No courses found</h3>
            <p className="mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
