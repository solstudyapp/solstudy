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
  const editorKey = `editor-${currentPageId}-${Date.now()}`
  const [editorMounted, setEditorMounted] = useState(false)

  // Log when the page changes
  useEffect(() => {
    console.log(
      `[PageEditor] Page changed to "${currentPage.title}" (ID: ${currentPageId})`
    )
    console.log(
      `[PageEditor] Current page at section ${currentSectionIndex}, index ${currentPageIndex}`
    )

    // Reset editor mounted state when page changes
    setEditorMounted(false)

    // Small delay to allow editor to unmount/remount
    setTimeout(() => {
      setEditorMounted(true)
    }, 50)
  }, [currentPageId, currentSectionIndex, currentPageIndex, currentPage.title])

  // Find the page by ID rather than relying on indices
  const updatePageById = useCallback(
    (pageId: string, field: keyof Page, value: any) => {
      console.log(`[PageEditor] updatePageById called for page ID: ${pageId}`)
      console.log(
        `[PageEditor] Field: ${String(field)}, value starts with: "${String(
          value
        ).substring(0, 50)}..."`
      )

      setSections((prev) => {
        // First, find the section and page by ID
        for (let sectionIndex = 0; sectionIndex < prev.length; sectionIndex++) {
          const pageIndex = prev[sectionIndex].pages.findIndex(
            (p) => p.id === pageId
          )

          if (pageIndex !== -1) {
            // Found the page by ID
            console.log(
              `[PageEditor] Found page at section ${sectionIndex}, index ${pageIndex}`
            )

            // Don't update if the value hasn't changed
            if (prev[sectionIndex].pages[pageIndex][field] === value) {
              console.log(
                `[PageEditor] No change detected in ${String(
                  field
                )}, skipping update`
              )
              return prev
            }

            console.log(
              `[PageEditor] Updating ${String(field)} for page "${
                prev[sectionIndex].pages[pageIndex].title
              }"`
            )

            // Create deep copies to avoid reference issues
            const updated = JSON.parse(JSON.stringify(prev))
            updated[sectionIndex].pages[pageIndex] = {
              ...updated[sectionIndex].pages[pageIndex],
              [field]: value,
            }

            console.log(
              `[PageEditor] Update complete for page "${updated[sectionIndex].pages[pageIndex].title}"`
            )
            return updated
          }
        }

        console.log(
          `[PageEditor] Page with ID ${pageId} not found, no update made`
        )
        return prev
      })
    },
    [setSections]
  )

  // Memoize the content change handler to prevent recreating it on each render
  const handleContentChange = useCallback(
    (content: string) => {
      console.log(
        `[PageEditor] handleContentChange: Content changed for page "${currentPage.title}" (ID: ${currentPageId})`
      )
      console.log(
        `[PageEditor] New content starts with: "${content.substring(0, 50)}..."`
      )

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
        <div className="border border-white/20 rounded-md overflow-hidden">
          {editorMounted && (
            <RichTextEditor
              key={editorKey}
              initialContent={currentPage.content}
              onChange={handleContentChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
