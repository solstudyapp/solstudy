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

    const newIndex = direction === "up" ? pageIndex - 1 : pageIndex + 1

    setSections((prev) => {
      const updated = [...prev]
      const pages = [...updated[sectionIndex].pages]
      ;[pages[pageIndex], pages[newIndex]] = [pages[newIndex], pages[pageIndex]]
      updated[sectionIndex].pages = pages
      return updated
    })

    setCurrentPageIndex(newIndex)
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
