import { useState } from "react"
import { userProgressService } from "@/services/userProgressService"
import { useToast } from "./use-toast"

export function useProgress() {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  /**
   * Mark a page as viewed (for navigation tracking)
   */
  const completePage = async (
    lessonId: string,
    sectionId: string,
    pageId: string
  ): Promise<boolean> => {
    try {
      setIsUpdating(true)
      const result = await userProgressService.updateProgress(
        lessonId,
        sectionId,
        pageId
      )
      return result.success
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * Mark a page as completed (e.g., after spending enough time on it)
   */
  const markPageCompleted = async (
    lessonId: string,
    sectionId: string,
    pageId: string
  ): Promise<boolean> => {
    try {
      setIsUpdating(true)
      const result = await userProgressService.markPageCompleted(
        lessonId,
        sectionId,
        pageId
      )
      return result.success
    } catch (error) {
      console.error("Error marking page as completed:", error)
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * Check if a page is completed
   */
  const isPageCompleted = async (
    lessonId: string,
    sectionId: string,
    pageId: string
  ): Promise<boolean> => {
    try {
      return await userProgressService.isPageCompleted(lessonId, sectionId, pageId)
    } catch (error) {
      console.error("Error checking page completion:", error)
      return false
    }
  }

  /**
   * Mark a section as completed
   */
  const completeSection = async (
    lessonId: string,
    sectionId: string
  ): Promise<boolean> => {
    try {
      setIsUpdating(true)
      const result = await userProgressService.completeSection(
        lessonId,
        sectionId
      )
      return result.success
    } catch (error) {
      console.error("Error completing section:", error)
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * Mark a quiz as completed
   */
  const completeQuiz = async (
    lessonId: string,
    quizId: string,
    score: number,
    totalPoints: number
  ): Promise<boolean> => {
    try {
      setIsUpdating(true)
      const result = await userProgressService.completeQuiz(
        lessonId,
        quizId,
        score,
        totalPoints
      )
      return result.success
    } catch (error) {
      console.error("Error completing quiz:", error)
      toast({
        title: "Error",
        description: "Failed to save your quiz results. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * Mark a lesson as completed
   */
  const completeLesson = async (lessonId: string): Promise<boolean> => {
    try {
      setIsUpdating(true)
      const result = await userProgressService.completeLesson(lessonId)
      return result.success
    } catch (error) {
      console.error("Error completing lesson:", error)
      toast({
        title: "Error",
        description: "Failed to mark lesson as completed. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    isUpdating,
    completePage,
    markPageCompleted,
    completeSection,
    completeQuiz,
    completeLesson,
    isPageCompleted,
  }
}
