import { useState } from 'react';
import { userProgressService, PageCompletionData } from '@/services/userProgressService';
import { useToast } from '@/hooks/use-toast';

export function useProgress() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  /**
   * Mark a page as completed
   */
  const completePage = async (lessonId: string, sectionId: string, pageId: string): Promise<boolean> => {
    setIsUpdating(true);
    
    try {
      const success = await userProgressService.updatePageProgress({
        lessonId,
        sectionId,
        pageId,
        completed: true
      });
      
      if (success) {
        // Update local state
        setIsCompleted(prev => ({
          ...prev,
          [`${lessonId}-${sectionId}-${pageId}`]: true
        }));
        
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to update progress. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error completing page:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Check if a page is completed
   */
  const checkPageCompletion = async (lessonId: string, sectionId: string, pageId: string): Promise<boolean> => {
    const cacheKey = `${lessonId}-${sectionId}-${pageId}`;
    
    // Return from cache if available
    if (isCompleted[cacheKey] !== undefined) {
      return isCompleted[cacheKey];
    }
    
    try {
      const completed = await userProgressService.isPageCompleted(lessonId, sectionId, pageId);
      
      // Update local state
      setIsCompleted(prev => ({
        ...prev,
        [cacheKey]: completed
      }));
      
      return completed;
    } catch (error) {
      console.error("Error checking page completion:", error);
      return false;
    }
  };

  /**
   * Mark an entire section as completed
   */
  const completeSection = async (lessonId: string, sectionId: string): Promise<boolean> => {
    setIsUpdating(true);
    
    try {
      const success = await userProgressService.completeSectionProgress(lessonId, sectionId);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to complete section. Please try again.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error completing section:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    completePage,
    checkPageCompletion,
    completeSection
  };
} 