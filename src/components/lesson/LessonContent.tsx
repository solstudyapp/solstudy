import React from "react"
import { LessonType, Page, Section } from "@/types/lesson"
import LessonNavigation from "./LessonNavigation"
import { PageCompletion } from "./PageCompletion"
import parse from "html-react-parser"

interface LessonContentProps {
  lesson: LessonType
  currentSection: number
  currentPage: number
  currentPageData?: Page
  sections: Section[]
  navigatePrev: () => void
  navigateNext: () => void
  isFirstPage: boolean
  isLastPage: boolean
}

const LessonContent = ({
  lesson,
  currentSection,
  currentPage,
  currentPageData,
  sections,
  navigatePrev,
  navigateNext,
  isFirstPage,
  isLastPage,
}: LessonContentProps) => {
  if (!currentPageData) {
    return (
      <div className="col-span-3 bg-white/5 rounded-lg p-6">
        <div className="text-center py-12">
          <p className="text-white/70">Page content not available</p>
        </div>
      </div>
    )
  }

  const currentSectionData = sections[currentSection]
  const sectionId = currentSectionData?.id || "default"

  // Check if this is the last page of the current section
  const isLastPageOfSection =
    currentPage === currentSectionData.pages.length - 1

  return (
    <div className="col-span-3 bg-white/5 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">
          {currentPageData.title}
        </h2>
        <p className="text-white/70 text-sm">
          Section {currentSection + 1} • Page {currentPage + 1}
        </p>
      </div>

      <div className="prose prose-invert max-w-none pb-4">
        {parse(currentPageData.content)}
      </div>

      {!isLastPage && (
        <div className="mt-8 border-t border-white/10 pt-6">
          <PageCompletion
            lessonId={lesson.id}
            sectionId={sectionId}
            pageId={currentPageData.id}
            onComplete={isLastPageOfSection ? undefined : navigateNext}
          />
        </div>
      )}

      <LessonNavigation
        lessonId={lesson.id}
        currentSection={currentSection}
        sectionId={sectionId}
        navigatePrev={navigatePrev}
        navigateNext={navigateNext}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        isLastPageOfSection={isLastPageOfSection}
      />
    </div>
  )
}

export default LessonContent
