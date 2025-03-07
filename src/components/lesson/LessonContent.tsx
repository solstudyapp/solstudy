
import React from "react";
import { LessonType, Page } from "@/types/lesson";
import LessonNavigation from "./LessonNavigation";
import parse from "html-react-parser";

interface LessonContentProps {
  lesson: LessonType;
  currentSection: number;
  currentPage: number;
  currentPageData?: Page;
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
  if (!currentPageData) {
    return (
      <div className="col-span-3 p-6 bg-white/5 rounded-lg">
        <p className="text-white/60">Page content not found</p>
      </div>
    );
  }

  return (
    <div className="col-span-3 space-y-6">
      <div className="p-6 bg-white/5 rounded-lg">
        <div className="prose prose-invert max-w-none">
          {currentPageData.content && parse(currentPageData.content)}
        </div>
      </div>

      <LessonNavigation
        lessonId={lesson.id}
        currentSection={currentSection}
        navigatePrev={navigatePrev}
        navigateNext={navigateNext}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
      />
    </div>
  );
};

export default LessonContent;
