
import { LessonType, DbLessonData } from "@/types/lesson"
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
import { supabase } from "@/integrations/supabase/client"
import {
  dbToFrontendLesson,
  frontendToDbLesson,
  safelyParseId,
} from "@/lib/type-converters"

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

/**
 * Fetch all lessons from Supabase
 */
export async function fetchLessons(): Promise<LessonType[]> {
  try {
    const data = (await db.fetchAllLessons()) as unknown as DbLessonData[]

    // Transform the data to match the LessonType
    return data.map(dbToFrontendLesson)
  } catch (error) {
    console.error("Error fetching lessons:", error)
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
    // For UUID-based IDs, we can pass the ID directly
    // For older numeric IDs, we'll try to parse them
    let parsedId = lessonId

    // Only try to parse if it's not a UUID format
    if (!lessonId.includes("-") && !isNaN(Number(lessonId))) {
      parsedId = Number(lessonId).toString()
    }

    const lesson = (await db.fetchLessonById(
      parsedId
    )) as unknown as DbLessonData

    if (!lesson) {
      console.error("Lesson not found for ID:", parsedId)
      return null
    }

    const frontendLesson = dbToFrontendLesson(lesson)

    return frontendLesson
  } catch (error) {
    console.error("Error fetching lesson by ID:", error)
    return null
  }
}

/**
 * Save a lesson to Supabase
 */
export async function saveLesson(
  lesson: LessonType
): Promise<{ success: boolean; error?: string; data?: { id: string }[] }> {
  try {
    // Check if the lesson has an ID that's not a temporary ID
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        lesson.id
      )
    const isUpdate = lesson.id && !lesson.id.startsWith("new-") && isUuid

    if (isUpdate) {
      // If it's a UUID, use it directly; otherwise convert string ID to number
      const lessonId = lesson.id

      // Create a database lesson object
      const dbLesson = frontendToDbLesson(lesson)

      // Type assertion to match the expected parameter type
      const result = await db.updateLesson(lessonId, dbLesson as any)

      return {
        success: result.success,
        error: result.error,
      }
    } else {
      // It's a create operation

      // Create a database lesson object
      const dbLesson = frontendToDbLesson(lesson)

      // Type assertion to match the expected parameter type
      const result = await db.createLesson(dbLesson as any)

      return {
        success: result.success,
        error: result.error,
        data: result.id ? [{ id: result.id.toString() }] : undefined,
      }
    }
  } catch (error) {
    console.error("Error saving lesson:", error)
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
    // If it's a UUID, use it directly; otherwise try to convert to number
    return await db.deleteLesson(lessonId)
  } catch (error) {
    console.error("Error in deleteLesson:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
