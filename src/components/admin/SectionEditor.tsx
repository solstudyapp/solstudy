import { Input } from "@/components/ui/input"
import { Quiz } from "@/types/lesson"
import { Section } from "@/types/lesson"
import { DBQuiz } from "./LessonEditor"

export const SectionEditor = ({
  sections,
  currentSectionIndex,
  setSections,
  quizzes,
}: {
  sections: Section[]
  currentSectionIndex: number
  setSections: (sections: Section[] | ((prev: Section[]) => Section[])) => void
  quizzes: DBQuiz[]
}) => {
  if (sections.length === 0) return null

  const currentSection = sections[currentSectionIndex]

  // Find the associated quiz for this section
  const associatedQuiz = quizzes.find(
    (quiz) => quiz.id === currentSection.quizId
  )

  const updateSection = (index: number, field: keyof Section, value: any) => {
    setSections((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  return (
    <div className="space-y-4 mb-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Section Title</label>
        <Input
          value={currentSection.title}
          onChange={(e) =>
            updateSection(currentSectionIndex, "title", e.target.value)
          }
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">End of Section Quiz</label>
        <div className="flex items-center gap-2">
          <Input
            value={associatedQuiz ? associatedQuiz.title : "No Quiz Assigned"}
            disabled
            className="bg-white/5 border-white/10 text-white/70"
          />
        </div>
      </div>
    </div>
  )
}
