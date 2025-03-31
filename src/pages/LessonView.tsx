import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"
import { toast } from "@/hooks/use-toast"
import { lessonService } from "@/services/lessonService"
import { userProgressService } from "@/services/userProgressService"
import { useProgress } from "@/hooks/use-progress"
import LessonSidebar from "@/components/lesson/LessonSidebar"
import LessonHeader from "@/components/lesson/LessonHeader"
import LessonContent from "@/components/lesson/LessonContent"
import { LessonRatingModal } from "@/components/lesson/LessonRatingModal"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { fetchLessonById } from "@/services/lessons"
import { fetchSections } from "@/services/sections"
import { LessonType, Section } from "@/types/lesson"
import { supabase } from "@/lib/supabase"

const LessonView = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentSection, setCurrentSection] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState<LessonType | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const { completePage, completeSection } = useProgress()
  const isFirstRender = useRef(true)

  // Load lesson and sections data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!lessonId) {
        setError("Lesson ID is missing")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch lesson data
        const lessonData = await fetchLessonById(lessonId)
        if (!lessonData) {
          console.error("Lesson not found for ID:", lessonId)
          setError("Lesson not found")
          setLoading(false)
          return
        }

        setLesson(lessonData)

        // Fetch sections data
        const sectionsData = await fetchSections(lessonId)
        if (!sectionsData || sectionsData.length === 0) {
          console.error("No sections found for lesson ID:", lessonId)
          setError("No sections found for this lesson")
          setLoading(false)
          return
        }

        setSections(sectionsData)
      } catch (error) {
        console.error("Error loading lesson data:", error)
        setError("Failed to load lesson data")
        toast({
          title: "Error loading course",
          description:
            "There was a problem loading the course data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lessonId])

  // Parse URL query parameters for direct navigation
  useEffect(() => {
    // Get saved progress or URL params
    if (lesson && sections.length > 0) {
      const queryParams = new URLSearchParams(location.search)
      const sectionParam = queryParams.get("section")
      const pageParam = queryParams.get("page")

      if (sectionParam !== null && pageParam !== null) {
        // If URL has section and page params, use those
        const sectionIndex = parseInt(sectionParam)
        const pageIndex = parseInt(pageParam)

        if (
          !isNaN(sectionIndex) &&
          !isNaN(pageIndex) &&
          sectionIndex >= 0 &&
          sectionIndex < sections.length &&
          pageIndex >= 0 &&
          pageIndex < sections[sectionIndex].pages.length
        ) {
          setCurrentSection(sectionIndex)
          setCurrentPage(pageIndex)
          return
        }
      }

      // If no valid URL params, try to find the last page the user was on
      const getUserProgress = async () => {
        try {
          // Get the user progress for this lesson
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            console.error("No authenticated user found")
            setCurrentSection(0)
            setCurrentPage(0)
            return
          }

          const { data: progress, error } = await supabase
            .from("user_progress")
            .select(
              "current_section_id, current_page_id, completed_sections, completed_quizzes"
            )
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId)
            .single()

          if (error) {
            if (error.code === "PGRST116") {
              // No progress record found, start from beginning

              setCurrentSection(0)
              setCurrentPage(0)
            } else {
              console.error("Error fetching user progress:", error)
              setCurrentSection(0)
              setCurrentPage(0)
            }
            return
          }

          if (progress) {
            // If there's a current section and page ID, use them
            if (progress.current_section_id && progress.current_page_id) {
              // Find the section index
              const sectionIndex = sections.findIndex(
                (section) => section.id === progress.current_section_id
              )

              if (sectionIndex !== -1) {
                // Find the page index
                const pageIndex = sections[sectionIndex].pages.findIndex(
                  (page) => page.id === progress.current_page_id
                )

                if (pageIndex !== -1) {
                  setCurrentSection(sectionIndex)
                  setCurrentPage(pageIndex)
                  return
                }
              }
            }

            // If we don't have current section/page or they're invalid,
            // use completed sections to determine the farthest point
            if (
              progress.completed_sections &&
              progress.completed_sections.length > 0
            ) {
              // Get the last completed section
              const completedSectionIds = progress.completed_sections

              // Find the index of the last completed section
              let lastCompletedSectionIndex = -1
              for (let i = sections.length - 1; i >= 0; i--) {
                if (completedSectionIds.includes(sections[i].id)) {
                  lastCompletedSectionIndex = i
                  break
                }
              }

              if (lastCompletedSectionIndex !== -1) {
                // If we found a completed section, start at the next section
                if (lastCompletedSectionIndex < sections.length - 1) {
                  setCurrentSection(lastCompletedSectionIndex + 1)
                  setCurrentPage(0)
                } else {
                  // If the last section is completed, stay on the last page of the last section

                  setCurrentSection(sections.length - 1)
                  setCurrentPage(sections[sections.length - 1].pages.length - 1)
                }
                return
              }
            }
          }

          // Default to the beginning if we couldn't determine progress
          setCurrentSection(0)
          setCurrentPage(0)
        } catch (error) {
          console.error("Error determining user progress:", error)
          // Default to the beginning on error
          setCurrentSection(0)
          setCurrentPage(0)
        }
      }

      getUserProgress()
    }
  }, [lesson, sections, location.search, lessonId])

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    if (!lesson) return

    // Calculate progress based on current position
    const totalPages = sections.reduce(
      (acc, section) => acc + section.pages.length,
      0
    )
    const pagesCompleted =
      sections
        .slice(0, currentSection)
        .reduce((acc, section) => acc + section.pages.length, 0) + currentPage
    setProgress(Math.round((pagesCompleted / totalPages) * 100))
  }, [currentSection, currentPage, lesson, sections])

  // Also scroll to top when sections or pages change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentSection, currentPage])

  // Update saved progress when section or page changes
  useEffect(() => {
    
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (lesson && sections.length > 0 && sections[currentSection]) {
      const currentSectionData = sections[currentSection]
      if (currentSectionData && currentSectionData.pages[currentPage]) {
        // Use the userProgressService to update progress in the database
        completePage(
          lesson.id,
          currentSectionData.id,
          currentSectionData.pages[currentPage].id
        ).then((success) => {
          if (success) {
          } else {
            console.error("Failed to update progress")
          }
        })
      }
    }
  }, [lesson, currentSection, currentPage, sections])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#14F195] mx-auto mb-4" />
          <p className="text-foreground text-lg">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg border border-border">
          <h2 className="text-xl text-foreground mb-4">{error}</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't load the course content. This might be because the
            course doesn't exist or there was a problem connecting to our
            servers.
          </p>
          <Button
            variant="gradient"
            onClick={() => navigate("/")}
            className="mx-auto"
          >
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg border border-border">
          <h2 className="text-xl text-foreground mb-4">Lesson not found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the lesson you're looking for. It might have been
            removed or doesn't exist.
          </p>
          <Button
            variant="gradient"
            onClick={() => navigate("/")}
            className="mx-auto"
          >
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg border border-border">
          <h2 className="text-xl text-foreground mb-4">No sections found</h2>
          <p className="text-muted-foreground mb-6">
            This lesson doesn't have any sections yet. Please add some sections
            to continue.
          </p>
          <Button
            variant="gradient"
            onClick={() => navigate("/")}
            className="mx-auto"
          >
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  // Get current section and page data
  const currentSectionData = sections[currentSection]
  const currentPageData = currentSectionData?.pages[currentPage]

  const navigateNext = () => {
    // If there are more pages in the current section
    if (currentPage < currentSectionData.pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
    // If there are more sections
    else if (currentSection < sections.length - 1) {
      // Mark the current section as completed using userProgressService
      completeSection(lesson.id, currentSectionData.id).then((success) => {
        if (success) {
          // Move to the next section
          setCurrentSection(currentSection + 1)
          setCurrentPage(0)
        } else {
          console.error("Failed to complete section")
          toast({
            title: "Error",
            description: "Failed to save your progress. Please try again.",
            variant: "destructive",
          })
        }
      })
    }
    // If this is the last page of the last section
    else {
      // Mark the section as completed using userProgressService
      completeSection(lesson.id, currentSectionData.id).then((success) => {
        if (success) {
          // Check if there's a final test
          const checkFinalTest = async () => {
            try {
              // Get the current user
              const {
                data: { user },
              } = await supabase.auth.getUser()

              if (!user) {
                console.error("No authenticated user found")
                setShowRatingModal(true)
                return
              }

              // Check if there is a final test for this lesson
              const { data: finalTestData, error: finalTestError } =
                await supabase
                  .from("quizzes")
                  .select("id")
                  .eq("lesson_id", lessonId)
                  .eq("is_final_test", true)

              if (finalTestError) {
                console.error("Error checking for final test:", finalTestError)
                // Show rating modal instead of going directly to dashboard
                setShowRatingModal(true)
                return
              }

              const hasFinalTest = finalTestData && finalTestData.length > 0

              if (hasFinalTest) {
                // Check if there are any section quizzes that need to be completed first
                const { data: sectionQuizzes, error: sectionQuizError } =
                  await supabase
                    .from("quizzes")
                    .select("id")
                    .eq("lesson_id", lessonId)
                    .eq("is_final_test", false)
                    .not("section_id", "is", null)

                if (sectionQuizError) {
                  console.error(
                    "Error checking for section quizzes:",
                    sectionQuizError
                  )
                  // If we can't check for section quizzes, proceed to final test
                  navigate(`/quiz/${lesson.id}/final`)
                  return
                }

                // If there are no section quizzes, proceed directly to final test
                if (!sectionQuizzes || sectionQuizzes.length === 0) {
                  navigate(`/quiz/${lesson.id}/final`)
                  return
                }

                // If the lesson has section quizzes, check if all sections are completed
                const { data: userProgress, error: progressError } =
                  await supabase
                    .from("user_progress")
                    .select("completed_sections")
                    .eq("user_id", user.id)
                    .eq("lesson_id", lessonId)
                    .single()

                if (progressError && progressError.code !== "PGRST116") {
                  console.error("Error checking user progress:", progressError)
                  // If we can't check progress, proceed to final test
                  navigate(`/quiz/${lesson.id}/final`)
                  return
                }

                const completedSections = userProgress?.completed_sections || []
                const allSectionsCompleted = sections.every((section) =>
                  completedSections.includes(section.id)
                )

                if (allSectionsCompleted) {
                  // Navigate to the final test if all sections are completed
                  navigate(`/quiz/${lesson.id}/final`)
                } else {
                  // Show a message that sections need to be completed first
                  toast({
                    title: "Complete all sections first",
                    description:
                      "You need to complete all sections before taking the final test.",
                    variant: "destructive",
                  })

                  // Find the first incomplete section
                  const firstIncompleteSection = sections.findIndex(
                    (section) => !completedSections.includes(section.id)
                  )

                  if (firstIncompleteSection !== -1) {
                    // Navigate to the first page of the incomplete section
                    navigate(
                      `/lesson/${lessonId}?section=${firstIncompleteSection}&page=0`
                    )
                  }
                }
              } else {
                // If there's no final test, show the rating modal
                setShowRatingModal(true)
              }
            } catch (error) {
              console.error("Error in checkFinalTest:", error)
              // Show rating modal on error
              setShowRatingModal(true)
            }
          }

          checkFinalTest()
        } else {
          console.error("Failed to complete section")
          toast({
            title: "Error",
            description: "Failed to save your progress. Please try again.",
            variant: "destructive",
          })
        }
      })
    }
  }

  const navigatePrev = () => {
    // If there are previous pages in the current section
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
    // If there are previous sections
    else if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      setCurrentPage(sections[currentSection - 1].pages.length - 1)
    }
  }

  const isFirstPage = currentSection === 0 && currentPage === 0
  const isLastPage =
    currentSection === sections.length - 1 &&
    currentPage === currentSectionData.pages.length - 1

  // Calculate total pages for the header
  const totalPages = sections.reduce(
    (acc, section) => acc + section.pages.length,
    0
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Lesson Header */}
        <LessonHeader
          lesson={lesson}
          progress={progress}
          totalSections={sections.length}
          totalPages={totalPages}
        />

        {/* Lesson Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <LessonSidebar
            sections={sections}
            currentSection={currentSection}
            currentPage={currentPage}
            setCurrentSection={setCurrentSection}
            setCurrentPage={setCurrentPage}
            lessonId={lessonId || ""}
          />

          {/* Main Content */}
          <LessonContent
            lesson={lesson}
            currentSection={currentSection}
            currentPage={currentPage}
            currentPageData={currentPageData}
            sections={sections}
            navigatePrev={navigatePrev}
            navigateNext={navigateNext}
            isFirstPage={isFirstPage}
            isLastPage={isLastPage}
          />
        </div>
      </div>

      {/* Add the rating modal */}
      {lesson && (
        <LessonRatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
        />
      )}
    </div>
  )
}

export default LessonView
