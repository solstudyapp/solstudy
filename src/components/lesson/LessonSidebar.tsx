import { useState, useEffect } from "react"
import { CheckCircle, BookOpen, Check } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Section } from "@/types/lesson"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

interface LessonSidebarProps {
  sections: Section[]
  currentSection: number
  currentPage: number
  setCurrentSection: (section: number) => void
  setCurrentPage: (page: number) => void
  lessonId: string
}

const LessonSidebar = ({
  sections,
  currentSection,
  currentPage,
  setCurrentSection,
  setCurrentPage,
  lessonId,
}: LessonSidebarProps) => {
  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([])
  const [completedPages, setCompletedPages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Fetch completed sections, quizzes, and pages from user_progress table
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setIsLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.error("No authenticated user found")
          return
        }

        const { data, error } = await supabase
          .from("user_progress")
          .select("completed_sections, completed_quizzes, completed_pages")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .single()

        if (error) {
          if (error.code !== "PGRST116") {
            // No rows found
            console.error("Error fetching user progress:", error)
          }
          return
        }

        if (data) {
          setCompletedSections(data.completed_sections || [])
          setCompletedQuizzes(data.completed_quizzes || [])
          setCompletedPages(data.completed_pages || [])
          console.log("Completed sections:", data.completed_sections)
          console.log("Completed quizzes:", data.completed_quizzes)
          console.log("Completed pages:", data.completed_pages)
        }
      } catch (error) {
        console.error("Error in fetchUserProgress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (lessonId) {
      fetchUserProgress()
    }
  }, [lessonId])

  // Create a flattened list of all pages for the dropdown
  const allPages = sections.flatMap((section, sectionIndex) =>
    section.pages.map((page, pageIndex) => ({
      section: sectionIndex,
      page: pageIndex,
      title: page.title,
      sectionTitle: section.title,
      id: page.id,
      // Determine if this page is accessible based on progress or if it's completed
      isAccessible:
        sectionIndex < currentSection ||
        (sectionIndex === currentSection && pageIndex <= currentPage) ||
        completedPages.includes(String(page.id)),
    }))
  )

  const currentPageId = sections[currentSection]?.pages[currentPage]?.id

  const handlePageSelect = (value: string) => {
    const [sectionIndex, pageIndex] = value.split(":").map(Number)

    if (
      sectionIndex < currentSection ||
      (sectionIndex === currentSection && pageIndex <= currentPage) ||
      (sections[sectionIndex]?.pages[pageIndex] &&
        completedPages.includes(
          String(sections[sectionIndex].pages[pageIndex].id)
        ))
    ) {
      setCurrentSection(sectionIndex)
      setCurrentPage(pageIndex)
    }
  }

  // Determine if a section is completed based on the data from user_progress
  const isSectionCompleted = (sectionId: string) => {
    return completedSections.includes(sectionId)
  }

  // Check if a page is completed
  const isPageCompleted = (pageId: string) => {
    return completedPages.includes(String(pageId))
  }

  // Function to navigate to the quiz page
  const handleTakeQuiz = (sectionId: string) => {
    navigate(`/quiz/${lessonId}/${sectionId}`)
  }

  return (
    <div className="hidden md:block">
      {/* Mobile dropdown selector (only visible on small screens) */}
      <div className="md:hidden mb-4">
        <Select
          value={`${currentSection}:${currentPage}`}
          onValueChange={handlePageSelect}
        >
          <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select a page" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/20 text-white max-h-[300px] z-50">
            {allPages.map((page) => (
              <SelectItem
                key={page.id}
                value={`${page.section}:${page.page}`}
                disabled={!page.isAccessible}
                className={!page.isAccessible ? "opacity-50" : ""}
              >
                {page.sectionTitle} - {page.title}
                {isPageCompleted(String(page.id)) && " ✓"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-lg p-4 sticky top-24">
        <h3 className="text-lg font-medium text-white mb-4">Course Contents</h3>
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => {
            const completed = isSectionCompleted(section.id)

            return (
              <div key={section.id}>
                <div className="flex items-center mb-2">
                  {completed ? (
                    <CheckCircle className="h-4 w-4 text-[#14F195] mr-2" />
                  ) : sectionIndex === currentSection ? (
                    <BookOpen className="h-4 w-4 text-white mr-2" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/40 mr-2"></div>
                  )}
                  <span
                    className={`font-medium ${
                      completed ? "text-[#14F195]" : "text-white"
                    }`}
                  >
                    {section.title}
                  </span>
                </div>
                <div className="ml-6 space-y-1">
                  {section.pages.map((page, pageIndex) => {
                    // A page is considered accessible if:
                    // 1. Its section is completed
                    // 2. It's in a previous section
                    // 3. It's in the current section and before or at the current page
                    // 4. The page ID is in the completedPages array
                    const pageIsCompleted = isPageCompleted(String(page.id - 1))
                    const isPageAccessible =
                      completed ||
                      sectionIndex < currentSection ||
                      (sectionIndex === currentSection &&
                        pageIndex <= currentPage) ||
                      pageIsCompleted

                    return (
                      <button
                        key={page.id}
                        className={`text-sm w-full text-left py-1 px-2 rounded flex items-center gap-2 ${
                          sectionIndex === currentSection &&
                          pageIndex === currentPage
                            ? "bg-white/20 text-white"
                            : pageIsCompleted
                            ? "text-[#14F195] hover:bg-white/10"
                            : isPageAccessible
                            ? "text-white/70 hover:text-white hover:bg-white/10"
                            : "text-white/50 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          // Only allow navigating to accessible pages
                          if (isPageAccessible) {
                            setCurrentSection(sectionIndex)
                            setCurrentPage(pageIndex)
                          }
                        }}
                        disabled={!isPageAccessible}
                      >
                        {pageIsCompleted ? (
                          <Check className="h-3 w-3 text-[#14F195]" />
                        ) : completed && sectionIndex < currentSection ? (
                          <Check className="h-3 w-3 text-[#14F195]" />
                        ) : null}
                        <span>{page.title}</span>
                      </button>
                    )
                  })}

                  {/* Quiz indicator */}
                  {section.quizId && (
                    <div
                      className={`mt-2 text-sm rounded py-1 px-2 border border-dotted flex items-center gap-2 ${
                        completedQuizzes.includes(section.quizId)
                          ? "border-[#14F195]/30 text-[#14F195]"
                          : completed
                          ? "border-yellow-500/30 text-yellow-500 hover:bg-white/5 cursor-pointer"
                          : "border-white/20 text-white/40"
                      }`}
                      onClick={() => {
                        // Only navigate to quiz if section is completed
                        if (
                          completed &&
                          !completedQuizzes.includes(section.quizId)
                        ) {
                          handleTakeQuiz(section.id)
                        }
                      }}
                      role={
                        completed && !completedQuizzes.includes(section.quizId)
                          ? "button"
                          : undefined
                      }
                      title={
                        completedQuizzes.includes(section.quizId)
                          ? "Quiz completed"
                          : completed
                          ? "Take quiz"
                          : "Complete section to unlock quiz"
                      }
                    >
                      {completedQuizzes.includes(section.quizId) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : null}
                      <span>
                        Quiz: {section.title}
                        {completed &&
                          !completedQuizzes.includes(section.quizId) && (
                            <span className="ml-1 text-yellow-500">
                              (Available)
                            </span>
                          )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LessonSidebar
