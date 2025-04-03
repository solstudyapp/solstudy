import React from "react"
import { LessonType, Page, Section } from "@/types/lesson"
import LessonNavigation from "./LessonNavigation"
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
      <div className="col-span-3 bg-card/50 rounded-lg p-6 border border-border">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Page content not available</p>
        </div>
      </div>
    )
  }

  const currentSectionData = sections[currentSection]
  const sectionId = currentSectionData?.id || "default"

  // Check if this is the last page of the current section
  const isLastPageOfSection =
    currentPage === currentSectionData.pages.length - 1

  // Process content to ensure line breaks are preserved
  const processedContent = currentPageData.content
    // Replace consecutive line breaks with paragraph tags
    .replace(/(\r\n|\n){2,}/g, "</p><p>")
    // Replace single line breaks with <br> tags
    .replace(/(\r\n|\n)/g, "<br>")

  return (
    <div className="col-span-3 bg-card/50 rounded-lg p-6 border border-border">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-1">
          {currentPageData.title}
        </h2>
        <p className="text-muted-foreground text-sm">
          Section {currentSection + 1} • Page {currentPage + 1}
        </p>
      </div>

      <div className="prose prose-invert lesson-content max-w-none pb-4">
        {parse(processedContent)}
      </div>

      <LessonNavigation
        lessonId={lesson.id}
        currentSection={currentSection}
        sectionId={sectionId}
        navigatePrev={navigatePrev}
        navigateNext={navigateNext}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        isLastPageOfSection={isLastPageOfSection}
        currentPage={currentPage}
      />
    </div>
  )
}

export default LessonContent
