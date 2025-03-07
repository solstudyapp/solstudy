
import { LessonType } from "@/types/lesson";
import LessonNavigation from "./LessonNavigation";

interface LessonContentProps {
  lesson: LessonType;
  currentSection: number;
  currentPage: number;
  currentPageData: { content: string };
  navigatePrev: () => void;
  navigateNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

const LessonContent = ({
  lesson,
  currentSection,
  currentPage,
  currentPageData,
  navigatePrev,
  navigateNext,
  isFirstPage,
  isLastPage,
}: LessonContentProps) => {
  // Use CoinGecko logo for all lessons
  const sponsorLogo = "https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d208683fad7ae6f2ce06c76d0a56.png";

  return (
    <div className="md:col-span-3">
      <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-lg p-6 md:p-8">
        {/* Show sponsor for all lessons */}
        <div className="mb-6 p-4 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 rounded-lg">
          <div className="text-white/70 text-sm mb-2 text-center">This Course is Brought to You By:</div>
          <div className="flex items-center justify-center h-12 bg-black/20 rounded">
            <img 
              src={sponsorLogo} 
              alt="CoinGecko Logo" 
              className="h-8 max-w-[120px] object-contain"
            />
          </div>
        </div>
        
        <div 
          className="prose prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: currentPageData.content }}
        />
        
        {/* Navigation buttons */}
        <LessonNavigation
          lessonId={lesson.id}
          currentSection={currentSection}
          navigatePrev={navigatePrev}
          navigateNext={navigateNext}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
        />
      </div>
    </div>
  );
};

export default LessonContent;
