import { Button } from "../ui/button"
import { Plus, ChevronUp, ChevronDown, Trash, Edit } from "lucide-react"
import { Section } from "@/types/lesson"

interface PagesListProps {
  sections: Section[]
  currentSectionIndex: number
  addPage: (sectionIndex: number) => void
  movePage: (
    sectionIndex: number,
    pageIndex: number,
    direction: "up" | "down"
  ) => void
  deletePage: (sectionIndex: number, pageIndex: number) => void
  saveCurrentPageContent: () => void
  setCurrentPageIndex: (index: number) => void
  currentPageIndex: number
}

export const PagesList = ({
  sections,
  currentSectionIndex,
  addPage,
  movePage,
  deletePage,
  saveCurrentPageContent,
  setCurrentPageIndex,
  currentPageIndex,
}: PagesListProps) => {
  if (sections.length === 0) return null

  const currentSection = sections[currentSectionIndex]

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
