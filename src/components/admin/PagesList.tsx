import { Button } from "../ui/button"
import { Plus, ChevronUp, ChevronDown, Trash, Edit } from "lucide-react"
import { Section, Page } from "@/types/lesson"

interface PagesListProps {
  sections: Section[]
  currentSectionIndex: number
  currentPageIndex: number
  setSections: (sections: Section[] | ((prev: Section[]) => Section[])) => void
  setCurrentPageIndex: (index: number) => void
  saveCurrentPageContent: () => void
}

export const PagesList = ({
  sections,
  currentSectionIndex,
  currentPageIndex,
  setSections,
  saveCurrentPageContent,
  setCurrentPageIndex,
}: PagesListProps) => {
  if (sections.length === 0) return null

  const currentSection = sections[currentSectionIndex]

  const addPage = (sectionIndex: number) => {
    // Use the saveCurrentPageContent function
    saveCurrentPageContent()

    setSections((prev) => {
      const updated = [...prev]
      updated[sectionIndex].pages.push({
        id: `page-${Date.now()}`,
        title: `New Page ${updated[sectionIndex].pages.length + 1}`,
        content: "<h1>New Page</h1><p>Add your content here.</p>",
      })
      return updated
    })

    setCurrentPageIndex(sections[sectionIndex].pages.length)
  }

  const updatePage = (
    sectionIndex: number,
    pageIndex: number,
    field: keyof Page,
    value: any
  ) => {
    setSections((prev) => {
      const updated = [...prev]
      updated[sectionIndex].pages[pageIndex] = {
        ...updated[sectionIndex].pages[pageIndex],
        [field]: value,
      }
      return updated
    })
  }

  const deletePage = (sectionIndex: number, pageIndex: number) => {
    if (sections[sectionIndex].pages.length <= 1) {
      return
    }

    setSections((prev) => {
      const updated = [...prev]
      updated[sectionIndex].pages = updated[sectionIndex].pages.filter(
        (_, i) => i !== pageIndex
      )
      return updated
    })

    if (currentPageIndex >= pageIndex && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }

  const movePage = (
    sectionIndex: number,
    pageIndex: number,
    direction: "up" | "down"
  ) => {
    if (
      (direction === "up" && pageIndex === 0) ||
      (direction === "down" &&
        pageIndex === sections[sectionIndex].pages.length - 1)
    ) {
      return
    }

    console.log(
      `[movePage] Start: Moving page from index ${pageIndex} ${direction}`
    )

    // Save the current page content before moving
    console.log("[movePage] Saving current page content...")
    saveCurrentPageContent()

    const newIndex = direction === "up" ? pageIndex - 1 : pageIndex + 1
    console.log(`[movePage] Target index: ${newIndex}`)

    // Get page IDs to track the pages
    const movingPageId = sections[sectionIndex].pages[pageIndex].id
    const targetPageId = sections[sectionIndex].pages[newIndex].id

    console.log(
      `[movePage] Moving page ID: ${movingPageId} to position ${newIndex}`
    )
    console.log(
      `[movePage] Target page ID: ${targetPageId} will move to position ${pageIndex}`
    )

    setSections((prev) => {
      // Deep clone the entire sections array
      const updated = JSON.parse(JSON.stringify(prev))

      // Log content before swap
      console.log(
        `[movePage] BEFORE swap - Page ${pageIndex} (ID: ${updated[sectionIndex].pages[pageIndex].id}): "${updated[sectionIndex].pages[pageIndex].title}"`
      )
      console.log(
        `[movePage] BEFORE swap - Page ${newIndex} (ID: ${updated[sectionIndex].pages[newIndex].id}): "${updated[sectionIndex].pages[newIndex].title}"`
      )

      // Store the pages we're swapping by making deep copies
      const movingPage = JSON.parse(
        JSON.stringify(updated[sectionIndex].pages[pageIndex])
      )
      const targetPage = JSON.parse(
        JSON.stringify(updated[sectionIndex].pages[newIndex])
      )

      // Important: Update the position property for database consistency with unique constraint
      // This matches the position with the array index to maintain consistency
      movingPage.position = newIndex
      targetPage.position = pageIndex

      // Make the swap with copied objects to ensure deep cloning
      updated[sectionIndex].pages[newIndex] = movingPage
      updated[sectionIndex].pages[pageIndex] = targetPage

      // Log content after swap
      console.log(
        `[movePage] AFTER swap - Page ${pageIndex} (ID: ${updated[sectionIndex].pages[pageIndex].id}, position: ${targetPage.position}): "${updated[sectionIndex].pages[pageIndex].title}"`
      )
      console.log(
        `[movePage] AFTER swap - Page ${newIndex} (ID: ${updated[sectionIndex].pages[newIndex].id}, position: ${movingPage.position}): "${updated[sectionIndex].pages[newIndex].title}"`
      )

      return updated
    })

    // Add a small delay before updating current page index to ensure editor unmounts/remounts
    setTimeout(() => {
      // Update the current page index to follow the moved page
      setCurrentPageIndex(newIndex)
      console.log(`[movePage] Updated current page index to ${newIndex}`)
    }, 10)
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pages in {currentSection.title}</h3>
        <Button
          size="sm"
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
          onClick={() => addPage(currentSectionIndex)}
        >
          <Plus size={16} className="mr-2" /> Add Page
        </Button>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
        {currentSection.pages.map((page, index) => (
          <div
            key={page.id}
            className={`flex items-center justify-between p-2 rounded ${
              currentPageIndex === index ? "bg-white/10" : "hover:bg-white/5"
            }`}
            onClick={() => {
              saveCurrentPageContent()
              setCurrentPageIndex(index)
            }}
          >
            <div className="flex items-center gap-2">
              <Edit size={16} />
              <span>{page.title}</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  movePage(currentSectionIndex, index, "up")
                }}
                disabled={index === 0}
              >
                <ChevronUp size={14} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  movePage(currentSectionIndex, index, "down")
                }}
                disabled={index === currentSection.pages.length - 1}
              >
                <ChevronDown size={14} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation()
                  deletePage(currentSectionIndex, index)
                }}
                disabled={currentSection.pages.length <= 1}
              >
                <Trash size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
