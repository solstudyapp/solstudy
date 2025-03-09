import { supabase } from "@/lib/supabase"
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

// Placeholder for sponsor logo - replace with your actual import
const COINGECKO_LOGO = "/path/to/coingecko-logo.png"

// Map category to icon
const getCategoryIcon = (category: string): ReactNode => {
  switch (category) {
    case "blockchain":
      return <Database size={24} />
    case "trading":
      return <LineChart size={24} />
    case "defi":
      return <BarChart size={24} />
    case "nft":
      return <PaintBucket size={24} />
    case "solana":
      return <Code size={24} />
    default:
      return <Database size={24} />
  }
}

// Map lesson ID to specific icon (for special cases)
const getSpecificIcon = (id: string): ReactNode | null => {
  const iconMap: Record<string, ReactNode> = {
    "crypto-security": <ShieldCheck size={24} />,
    "advanced-trading": <BarChart3 size={24} />,
    "wallet-management": <Wallet size={24} />,
    "solana-token": <Sparkles size={24} />,
  }

  return iconMap[id] || null
}

/**
 * Fetch all lessons from Supabase
 */
export async function fetchLessons(): Promise<LessonType[]> {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching lessons:", error)
      return []
    }

    // Transform the data to match the LessonType
    return data.map((lesson) => {
      // Generate an ID from the title if not available
      const id =
        lesson.id?.toString() || lesson.title.toLowerCase().replace(/\s+/g, "-")

      return {
        id,
        title: lesson.title,
        description: lesson.description || `Learn about ${lesson.title}`,
        difficulty: lesson.difficulty,
        category: lesson.category,
        sections: 3, // Default value, replace with actual data when available
        pages: 12, // Default value, replace with actual data when available
        completedSections: 0,
        rating: lesson.rating,
        reviewCount: lesson.rating_count,
        icon: getSpecificIcon(id) || getCategoryIcon(lesson.category),
        sponsored: lesson.is_sponsored,
        sponsorLogo: COINGECKO_LOGO,
        points: lesson.points,
        bonusLesson: false,
        // Add any additional fields needed
      }
    })
  } catch (error) {
    console.error("Error in fetchLessons:", error)
    return []
  }
}

/**
 * Fetch a single lesson by ID
 */
export async function fetchLessonById(
  lessonId: string
): Promise<LessonType | null> {
  try {
    // First try to find by string ID
    let { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single()

    // If not found, try to find by numeric ID
    if (!data && !isNaN(Number(lessonId))) {
      const numericId = Number(lessonId)
      ;({ data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", numericId)
        .single())
    }

    if (error || !data) {
      console.error("Error fetching lesson by ID:", error)
      return null
    }

    // Transform to LessonType
    const id = lessonId || data.title.toLowerCase().replace(/\s+/g, "-")

    return {
      id,
      title: data.title,
      description: data.description || `Learn about ${data.title}`,
      difficulty: data.difficulty,
      category: data.category,
      sections: 3, // Default value
      pages: 12, // Default value
      completedSections: 0,
      rating: data.rating,
      reviewCount: data.rating_count,
      icon: getSpecificIcon(id) || getCategoryIcon(data.category),
      sponsored: data.is_sponsored,
      sponsorLogo: COINGECKO_LOGO,
      points: data.points,
      bonusLesson: false,
    }
  } catch (error) {
    console.error("Error in fetchLessonById:", error)
    return null
  }
}
