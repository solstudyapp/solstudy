
import { LessonType } from "@/types/lesson"
import { fetchLessons } from "@/services/lessons"
import { Database, BarChart, Code, LineChart, ShieldCheck } from "lucide-react"
import { supabaseConfig } from "@/integrations/supabase/client"

// Sample lesson data to use when offline or when API calls fail
export const sampleLessons: LessonType[] = [
  {
    id: "offline-1",
    title: "Introduction to Blockchain",
    description: "Learn the basics of blockchain technology and how it works",
    difficulty: "beginner",
    category: "blockchain",
    sections: 3,
    pages: 10,
    completedSections: 0,
    rating: 4.8,
    reviewCount: 120,
    icon: <Database size={24} />,
    is_sponsored: false,
    sponsorLogo: "",
    points: 100,
    bonusLesson: false,
    sponsorName: "",
    sponsorId: null
  },
  {
    id: "offline-2",
    title: "Cryptocurrency Trading Fundamentals",
    description: "Learn how to analyze markets and make informed trading decisions",
    difficulty: "intermediate",
    category: "Trading",
    sections: 4,
    pages: 15,
    completedSections: 0,
    rating: 4.5,
    reviewCount: 95,
    icon: <LineChart size={24} />,
    is_sponsored: false,
    sponsorLogo: "",
    points: 150,
    bonusLesson: false,
    sponsorName: "",
    sponsorId: null
  },
  {
    id: "offline-3",
    title: "Blockchain Security Best Practices",
    description: "Protect your assets with essential security knowledge",
    difficulty: "advanced",
    category: "Security",
    sections: 5,
    pages: 20,
    completedSections: 0,
    rating: 4.9,
    reviewCount: 75,
    icon: <ShieldCheck size={24} />,
    is_sponsored: false,
    sponsorLogo: "",
    points: 200,
    bonusLesson: false,
    sponsorName: "",
    sponsorId: null
  }
];

// This is a fallback in case the API call fails
export const lessonData: LessonType[] = supabaseConfig.isOfflineMode ? [...sampleLessons] : []

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
  is_sponsored: false,
  sponsorLogo: "",
  points: 50,
  bonusLesson: true,
  sponsorName: "",
  sponsorId: null
}

// Function to load lessons from Supabase
export async function loadLessons(): Promise<LessonType[]> {
  // If we're in offline mode, return sample lessons immediately
  if (supabaseConfig.isOfflineMode) {
    console.info("Running in offline mode. Using sample lessons data.");
    
    // Update the lessonData array with sample data
    lessonData.length = 0 // Clear the array
    lessonData.push(...sampleLessons) // Add sample lessons
    
    // Set a random lesson as the daily bonus lesson
    if (sampleLessons.length > 0) {
      const randomIndex = Math.floor(Math.random() * sampleLessons.length)
      const bonusLesson = { ...sampleLessons[randomIndex], bonusLesson: true }
      
      // Update the dailyBonusLesson
      Object.assign(dailyBonusLesson, bonusLesson)
    }
    
    return [...sampleLessons]
  }

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
    
    // Fallback to sample data if the API call fails
    if (lessonData.length === 0) {
      lessonData.push(...sampleLessons)
      
      // Set a random lesson as the daily bonus lesson
      if (sampleLessons.length > 0) {
        const randomIndex = Math.floor(Math.random() * sampleLessons.length)
        const bonusLesson = { ...sampleLessons[randomIndex], bonusLesson: true }
        
        // Update the dailyBonusLesson
        Object.assign(dailyBonusLesson, bonusLesson)
      }
    }
    
    return [...lessonData]
  }
}

// Export a function to get a lesson by ID
export function getLessonById(id: string): LessonType | undefined {
  return lessonData.find((lesson) => lesson.id === id)
}
