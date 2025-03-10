import { LessonType } from "@/types/lesson"
import {
  Database,
  BarChart,
  LineChart,
  Code,
  PaintBucket,
  ShieldCheck,
  BarChart3,
  Wallet,
  Sparkles,
} from "lucide-react"
import { ReactNode } from "react"
import * as db from "@/lib/db"

// Placeholder for sponsor logo - replace with your actual import
const COINGECKO_LOGO = "/path/to/coingecko-logo.png"

// Map category to icon
const getCategoryIcon = (category: string): ReactNode => {
  switch (category) {
    case "Blockchain":
      return <Database size={24} />
    case "DeFi":
      return <BarChart size={24} />
    case "NFTs":
      return <PaintBucket size={24} />
    case "Trading":
      return <LineChart size={24} />
    case "Security":
      return <ShieldCheck size={24} />
    case "Development":
      return <Code size={24} />
    case "Analytics":
      return <BarChart3 size={24} />
    case "Wallets":
      return <Wallet size={24} />
    default:
      return <Sparkles size={24} />
  }
}

// Get specific icon for a lesson by ID
const getSpecificIcon = (id: string): ReactNode | null => {
  // You can add specific icons for specific lessons here
  return null
}

// Type for database lesson data
interface DbLessonData {
  id?: number
  title: string
  description?: string
  difficulty: string
  category: string
  rating?: number
  rating_count?: number
  is_sponsored?: boolean
  points?: number
}

/**
 * Fetch all lessons from Supabase
 */
export async function fetchLessons(): Promise<LessonType[]> {
  try {
    const data = await db.fetchAllLessons()

    // Transform the data to match the LessonType
    return data.map((lesson: DbLessonData) => {
      // Generate an ID from the title if not available
      const id =
        lesson.id?.toString() || lesson.title.toLowerCase().replace(/\s+/g, "-")

      return {
        id,
        title: lesson.title,
        description: lesson.description || `Learn about ${lesson.title}`,
        difficulty:
          (lesson.difficulty as "beginner" | "intermediate" | "advanced") ||
          "beginner",
        category: lesson.category,
        sections: 3, // Default value, replace with actual data when available
        pages: 12, // Default value, replace with actual data when available
        completedSections: 0,
        rating: lesson.rating || 0,
        reviewCount: lesson.rating_count || 0,
        icon: getSpecificIcon(id) || getCategoryIcon(lesson.category),
        sponsored: lesson.is_sponsored || false,
        sponsorLogo: COINGECKO_LOGO,
        points: lesson.points || 0,
        bonusLesson: false,
      }
    })
  } catch (error) {
    console.error("Error in fetchLessons:", error)
    return []
  }
}

/**
 * Fetch a lesson by ID from Supabase
 */
export async function fetchLessonById(
  lessonId: string
): Promise<LessonType | null> {
  try {
    const lesson = (await db.fetchLessonById(lessonId)) as DbLessonData

    if (!lesson) {
      return null
    }

    const id =
      lesson.id?.toString() || lesson.title.toLowerCase().replace(/\s+/g, "-")

    return {
      id,
      title: lesson.title,
      description: lesson.description || `Learn about ${lesson.title}`,
      difficulty:
        (lesson.difficulty as "beginner" | "intermediate" | "advanced") ||
        "beginner",
      category: lesson.category,
      sections: 3, // Default value
      pages: 12, // Default value
      completedSections: 0,
      rating: lesson.rating || 0,
      reviewCount: lesson.rating_count || 0,
      icon: getSpecificIcon(id) || getCategoryIcon(lesson.category),
      sponsored: lesson.is_sponsored || false,
      sponsorLogo: COINGECKO_LOGO,
      points: lesson.points || 0,
      bonusLesson: false,
    }
  } catch (error) {
    console.error("Error in fetchLessonById:", error)
    return null
  }
}

/**
 * Save a lesson to Supabase (create or update)
 */
export async function saveLesson(
  lesson: LessonType
): Promise<{ success: boolean; error?: string; data?: any }> {
  console.log("saveLesson called with:", lesson)

  try {
    // Check if this is an update or create operation
    if (lesson.id && !isNaN(Number(lesson.id))) {
      // It's an update operation
      console.log("saveLesson - Updating existing lesson with ID:", lesson.id)
      const result = await db.updateLesson(Number(lesson.id), {
        title: lesson.title,
        description: lesson.description,
        difficulty: lesson.difficulty,
        category: lesson.category,
        rating: lesson.rating || 0,
        reviewCount: lesson.reviewCount || 0,
        sponsored: lesson.sponsored,
        points: lesson.points,
      })

      return {
        success: result.success,
        error: result.error,
        data: [{ id: Number(lesson.id) }],
      }
    } else {
      // It's a create operation
      console.log("saveLesson - Creating new lesson")

      // Create a lesson object without the id property
      const { id, icon, ...lessonWithoutId } = lesson

      const result = await db.createLesson({
        ...lessonWithoutId,
        // Set default values for required fields
        rating: lesson.rating || 0,
        reviewCount: lesson.reviewCount || 0,
        sponsored: lesson.sponsored || false,
        points: lesson.points || 0,
      })

      return {
        success: result.success,
        error: result.error,
        data: result.id ? [{ id: result.id }] : undefined,
      }
    }
  } catch (error) {
    console.error("Error in saveLesson:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Delete a lesson from Supabase
 */
export async function deleteLesson(
  lessonId: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Convert string ID to number if needed
    const id =
      typeof lessonId === "string" && !isNaN(Number(lessonId))
        ? Number(lessonId)
        : lessonId

    if (typeof id !== "number") {
      return {
        success: false,
        error: `Invalid lesson ID: ${lessonId}. Expected a number.`,
      }
    }

    return await db.deleteLesson(id)
  } catch (error) {
    console.error("Error in deleteLesson:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
