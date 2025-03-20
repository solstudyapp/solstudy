import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface PrerequisiteStatus {
  beginnerCompleted: boolean
  intermediateCompleted: boolean
  loading: boolean
  checkPrerequisites: (difficulty: string) => boolean
  availableCourses: { id: string; title: string; difficulty: string }[]
}

export function usePrerequisites(): PrerequisiteStatus {
  const [beginnerCompleted, setBeginnerCompleted] = useState(false)
  const [intermediateCompleted, setIntermediateCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [availableCourses, setAvailableCourses] = useState<
    { id: string; title: string; difficulty: string }[]
  >([])

  useEffect(() => {
    async function checkCompletedCourses() {
      try {
        setLoading(true)
        
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.error("No authenticated user found")
          return
        }

        // Fetch all completed lessons
        const { data: completedData, error: completedError } = await supabase
          .from("user_progress")
          .select("lesson_id, lessons:lesson_id(difficulty)")
          .eq("user_id", user.id)
          .eq("is_completed", true)
        
        if (completedError) {
          console.error("Error fetching completed lessons:", completedError)
          return
        }

        // Check if any beginner/intermediate courses are completed
        let hasBeginnerCompleted = false
        let hasIntermediateCompleted = false

        if (completedData && completedData.length > 0) {
          for (const item of completedData) {
            // Since the join comes back in a strange format, access with caution
            const lesson = item.lessons as unknown as { difficulty: string }
            if (lesson && lesson.difficulty) {
              if (lesson.difficulty === 'beginner') {
                hasBeginnerCompleted = true
              } else if (lesson.difficulty === 'intermediate') {
                hasIntermediateCompleted = true
              }
            }
          }
        }

        setBeginnerCompleted(hasBeginnerCompleted)
        setIntermediateCompleted(hasIntermediateCompleted)

        // Fetch available courses for recommendations
        const { data: availableData, error: availableError } = await supabase
          .from("lessons")
          .select("id, title, difficulty")
          .eq("published", true)
          .in("difficulty", ["beginner", "intermediate"])
          .order("difficulty", { ascending: true })
        
        if (availableError) {
          console.error("Error fetching available courses:", availableError)
          return
        }

        setAvailableCourses(availableData || [])
      } catch (error) {
        console.error("Error in checkCompletedCourses:", error)
      } finally {
        setLoading(false)
      }
    }

    checkCompletedCourses()
  }, [])

  const checkPrerequisites = (difficulty: string): boolean => {
    // Beginner courses have no prerequisites
    if (difficulty === "beginner") return true
    
    // Intermediate courses require beginner courses to be completed
    if (difficulty === "intermediate") return beginnerCompleted
    
    // Advanced courses require both beginner and intermediate courses
    if (difficulty === "advanced") return beginnerCompleted && intermediateCompleted
    
    return true
  }

  return {
    beginnerCompleted,
    intermediateCompleted,
    loading,
    checkPrerequisites,
    availableCourses
  }
} 