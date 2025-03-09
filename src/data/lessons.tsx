import { LessonType } from "@/types/lesson"
import { fetchLessons } from "@/services/lessons"
import { Database, BarChart } from "lucide-react"

// This is a fallback in case the API call fails
export const lessonData: LessonType[] = []

// Default daily bonus lesson (will be replaced when data is loaded)
export const dailyBonusLesson: LessonType = {
  id: "daily-bonus",
  title: "Daily Bonus Lesson",
  description: "Complete this lesson for bonus points!",
  difficulty: "beginner",
  category: "blockchain",
  sections: 1,
  pages: 3,
  completedSections: 0,
  rating: 5.0,
  reviewCount: 0,
  icon: <Database size={24} />,
  sponsored: false,
  sponsorLogo: "",
  points: 50,
  bonusLesson: true,
}

// Function to load lessons from Supabase
export async function loadLessons(): Promise<LessonType[]> {
  try {
    const lessons = await fetchLessons()

    // Update the lessonData array with the fetched data
    lessonData.length = 0 // Clear the array
    lessonData.push(...lessons) // Add all fetched lessons

    // Set a random lesson as the daily bonus lesson
    if (lessons.length > 0) {
      const randomIndex = Math.floor(Math.random() * lessons.length)
      const bonusLesson = { ...lessons[randomIndex], bonusLesson: true }

      // Update the dailyBonusLesson
      Object.assign(dailyBonusLesson, bonusLesson)
    }

    return lessons
  } catch (error) {
    console.error("Failed to load lessons:", error)
    return []
  }
}

// Export a function to get a lesson by ID
export function getLessonById(id: string): LessonType | undefined {
  return lessonData.find((lesson) => lesson.id === id)
}
