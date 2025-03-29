import { BookOpen, ChevronDown, ChevronUp, Trash } from "lucide-react"
import { Plus } from "lucide-react"
import { Button } from "../ui/button"
import { Section } from "@/types/lesson"

interface SectionsListProps {
  sections: Section[]
  currentSectionIndex: number
  addSection: () => void
  moveSection: (index: number, direction: "up" | "down") => void
  deleteSection: (index: number) => void
  saveCurrentPageContent: () => void
  setCurrentSectionIndex: (index: number) => void
  setCurrentPageIndex: (index: number) => void
}
export const SectionsList = ({
  sections,
  currentSectionIndex,
  addSection,
  moveSection,
  deleteSection,
  saveCurrentPageContent,
  setCurrentSectionIndex,
  setCurrentPageIndex,
}: SectionsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Sections</h3>
        <Button
          size="sm"
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
          onClick={addSection}
        >
          <Plus size={16} className="mr-2" /> Add Section
        </Button>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`flex items-center justify-between p-2 rounded ${
              currentSectionIndex === index ? "bg-white/10" : "hover:bg-white/5"
            }`}
            onClick={() => {
              saveCurrentPageContent()
              setCurrentSectionIndex(index)
              setCurrentPageIndex(0)
            }}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              <span>{section.title}</span>
              <span className="text-xs text-white/50">
                ({section.pages.length} pages)
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  moveSection(index, "up")
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
                  moveSection(index, "down")
                }}
                disabled={index === sections.length - 1}
              >
                <ChevronDown size={14} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSection(index)
                }}
                disabled={sections.length <= 1}
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
