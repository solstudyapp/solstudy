import { Section, Page } from "@/types/lesson"
import { RichTextEditor } from "./RichTextEditor"
import { Input } from "../ui/input"

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

  const currentPage = sections[currentSectionIndex].pages[currentPageIndex]

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Page Title</label>
        <Input
          value={currentPage.title}
          onChange={(e) =>
            updatePage(
              currentSectionIndex,
              currentPageIndex,
              "title",
              e.target.value
            )
          }
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <label className="text-sm font-medium">Content</label>
        <div className="border border-white/20 rounded-md overflow-hidden">
          <RichTextEditor
            initialContent={currentPage.content}
            onChange={(content) =>
              updatePage(
                currentSectionIndex,
                currentPageIndex,
                "content",
                content
              )
            }
          />
        </div>
      </div>
    </div>
  )
}
