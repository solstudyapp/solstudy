import { Section, Page } from "@/types/lesson"
import { RichTextEditor } from "./RichTextEditor"
import { Input } from "../ui/input"
import { useCallback, useEffect, useRef, useState } from "react"

export const PageEditor = ({
  sections,
  currentSectionIndex,
  currentPageIndex,
  setSections,
}: {
  sections: Section[]
  currentSectionIndex: number
  currentPageIndex: number
  setSections: (sections: Section[] | ((prev: Section[]) => Section[])) => void
}) => {
  if (
    sections.length === 0 ||
    !sections[currentSectionIndex]?.pages[currentPageIndex]
  ) {
    return <div className="text-white/50">No page selected</div>
  }

  // Store the current page info for reference
  const currentPage = sections[currentSectionIndex].pages[currentPageIndex]
  const currentPageId = currentPage.id
  // Use just the page ID for the key, removing the timestamp to reduce unmounting
  const editorKey = `editor-${currentPageId}`
  const [editorMounted, setEditorMounted] = useState(false)
  const [editorHeight, setEditorHeight] = useState<number | null>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Track editor height and log page changes
  useEffect(() => {
    // Measure current editor height if it exists
    if (editorContainerRef.current) {
      const currentHeight = editorContainerRef.current.offsetHeight
      if (currentHeight > 350) {
        // Only update if it's larger than our minimum
        setEditorHeight(currentHeight)
      }
    }
  }, [currentPageId, currentSectionIndex, currentPageIndex, currentPage.title])

  // Find the page by ID rather than relying on indices
  const updatePageById = useCallback(
    (pageId: string, field: keyof Page, value: any) => {
      setSections((prev) => {
        // First, find the section and page by ID
        for (let sectionIndex = 0; sectionIndex < prev.length; sectionIndex++) {
          const pageIndex = prev[sectionIndex].pages.findIndex(
            (p) => p.id === pageId
          )

          if (pageIndex !== -1) {
            // Found the page by ID

            // Don't update if the value hasn't changed
            if (prev[sectionIndex].pages[pageIndex][field] === value) {
              return prev
            }

            // Create deep copies to avoid reference issues
            const updated = JSON.parse(JSON.stringify(prev))
            updated[sectionIndex].pages[pageIndex] = {
              ...updated[sectionIndex].pages[pageIndex],
              [field]: value,
            }

            return updated
          }
        }

        return prev
      })
    },
    [setSections]
  )

  // Memoize the content change handler to prevent recreating it on each render
  const handleContentChange = useCallback(
    (content: string) => {
      // Use ID-based update to ensure the correct page is modified
      updatePageById(currentPageId, "content", content)
    },
    [currentPageId, currentPage.title, updatePageById]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Page Title</label>
        <Input
          value={currentPage.title}
          onChange={(e) =>
            updatePageById(currentPageId, "title", e.target.value)
          }
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <label className="text-sm font-medium">Content</label>
        {/* Apply minimum height to editor container to prevent layout shifts */}
        <div
          ref={editorContainerRef}
          className="border border-white/20 rounded-md overflow-hidden"
          style={{
            minHeight: editorHeight ? `${editorHeight}px` : "350px",
          }}
        >
          <RichTextEditor
            key={editorKey}
            initialContent={currentPage.content}
            onChange={handleContentChange}
          />
        </div>
      </div>
    </div>
  )
}
