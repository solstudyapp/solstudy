
import React, { useState, useEffect } from 'react';
import { useProgress } from '@/hooks/use-progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PageCompletionProps {
  lessonId: string;
  sectionId: string;
  pageId: string;
  onComplete?: () => void;
}

const PageCompletion: React.FC<PageCompletionProps> = ({ 
  lessonId, 
  sectionId, 
  pageId,
  onComplete
}) => {
  const { isUpdating, completePage, checkPageCompletion } = useProgress();
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const loadCompletionStatus = async () => {
      try {
        const completed = await checkPageCompletion(lessonId, sectionId, pageId);
        setIsCompleted(completed);
      } catch (error) {
        console.error('Error checking page completion:', error);
      }
    };

    loadCompletionStatus();
  }, [checkPageCompletion, lessonId, sectionId, pageId]);

  const handleMarkComplete = async () => {
    try {
      const success = await completePage(lessonId, sectionId, pageId);
      
      if (success) {
        setIsCompleted(true);
        toast({
          title: "Progress saved",
          description: "This page has been marked as completed.",
        });
        
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Error marking page as complete:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark page as completed. Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center justify-end mt-8">
      <Button
        variant={isCompleted ? "outline" : "default"}
        onClick={handleMarkComplete}
        disabled={isUpdating || isCompleted}
        className="flex items-center gap-2"
      >
        {isCompleted ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>Completed</span>
          </>
        ) : (
          <>
            <Circle className="h-4 w-4" />
            <span>{isUpdating ? "Saving..." : "Mark as Complete"}</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default PageCompletion;
