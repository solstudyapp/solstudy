
import { useState } from "react";
import { Star } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FeedbackDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (rating: number) => void;
  lessonId: string;
  onComplete: () => void;
}

const FeedbackDialog = ({ 
  open = true, 
  onOpenChange, 
  onSubmit, 
  lessonId, 
  onComplete 
}: FeedbackDialogProps) => {
  const [rating, setRating] = useState(0);
  
  const handleSubmit = () => {
    // If onSubmit was provided, call it with the rating
    if (onSubmit) {
      onSubmit(rating);
    }
    
    // Call onComplete to handle finishing the feedback process
    onComplete();
  };
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    
    // If dialog is being closed and onOpenChange isn't provided,
    // treat it as a completion
    if (!newOpen && !onOpenChange) {
      onComplete();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
        <DialogHeader>
          <DialogTitle>Rate this course</DialogTitle>
          <DialogDescription className="text-white/70">
            Your feedback helps us improve our content for lesson: {lessonId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-all ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-white/30"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="border-white/20 text-white hover:bg-white/10">
            Skip
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0">
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
