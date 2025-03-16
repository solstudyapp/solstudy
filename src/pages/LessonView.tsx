import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"
import { toast } from "@/hooks/use-toast"
import { lessonService } from "@/services/lessonService"
import { userProgressService } from "@/services/userProgressService"
import { useProgress } from "@/hooks/use-progress"
import LessonSidebar from "@/components/lesson/LessonSidebar"
import LessonHeader from "@/components/lesson/LessonHeader"
import LessonContent from "@/components/lesson/LessonContent"
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

        console.log("Fetching lesson with ID:", lessonId)

        // Fetch lesson data
        const lessonData = await fetchLessonById(lessonId)
        if (!lessonData) {
          console.error("Lesson not found for ID:", lessonId)
          setError("Lesson not found")
          setLoading(false)
          return
        }

        console.log("Lesson data fetched successfully:", lessonData)
        setLesson(lessonData)

        // Fetch sections data
        const sectionsData = await fetchSections(lessonId)
        if (!sectionsData || sectionsData.length === 0) {
          console.error("No sections found for lesson ID:", lessonId)
          setError("No sections found for this lesson")
          setLoading(false)
          return
        }

        console.log(
          "Sections data fetched successfully:",
          sectionsData.length,
          "sections"
        )
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
      // This would be a good place to implement a "resume" feature using userProgressService
      // For now, just start at the beginning
      setCurrentSection(0)
      setCurrentPage(0)
    }
  }, [lesson, sections, location.search])

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
            console.log(
              `Progress updated for ${lesson.id}: Section ${currentSectionData.id}, Page ${currentSectionData.pages[currentPage].id}`
            )
          } else {
            console.error("Failed to update progress")
          }
        })
      }
    }
  }, [lesson?.id, currentSection, currentPage, sections, completePage])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#14F195] mx-auto mb-4" />
          <p className="text-white text-lg">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-lg">
          <h2 className="text-xl text-white mb-4">{error}</h2>
          <p className="text-gray-400 mb-6">
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-lg">
          <h2 className="text-xl text-white mb-4">Lesson not found</h2>
          <p className="text-gray-400 mb-6">
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-lg">
          <h2 className="text-xl text-white mb-4">No sections found</h2>
          <p className="text-gray-400 mb-6">
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
          console.log(
            `Section ${currentSectionData.id} completed for lesson ${lesson.id}`
          )

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
          console.log(
            `Section ${currentSectionData.id} completed for lesson ${lesson.id}`
          )

          // Check if there's a final test
          const checkFinalTest = async () => {
            try {
              const { data, error } = await supabase
                .from("quizzes")
                .select("id")
                .eq("lesson_id", lessonId)
                .eq("is_final_test", true)

              if (error) {
                console.error("Error checking for final test:", error)
                // If there's an error, just navigate to dashboard
                toast({
                  title: "Lesson completed!",
                  description: "Congratulations! You've completed the lesson.",
                })
                navigate("/dashboard")
                return
              }

              const hasFinalTest = data && data.length > 0

              if (hasFinalTest) {
                // Navigate to the final test
                navigate(`/quiz/${lesson.id}/final`)
              } else {
                // If there's no final test, mark the lesson as completed and go to dashboard
                toast({
                  title: "Lesson completed!",
                  description: "Congratulations! You've completed the lesson.",
                })
                navigate("/dashboard")
              }
            } catch (error) {
              console.error("Error in checkFinalTest:", error)
              // If there's an error, just navigate to dashboard
              toast({
                title: "Lesson completed!",
                description: "Congratulations! You've completed the lesson.",
              })
              navigate("/dashboard")
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
    <div className="min-h-screen bg-black">
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
    </div>
  )
}

export default LessonView
