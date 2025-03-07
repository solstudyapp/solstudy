
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { LessonType } from "@/types/lesson";

interface DeleteLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: LessonType | null;
  onConfirmDelete: () => void;
}

const DeleteLessonDialog = ({ open, onOpenChange, lesson, onConfirmDelete }: DeleteLessonDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
        <DialogHeader>
          <DialogTitle>Delete Lesson</DialogTitle>
          <DialogDescription className="text-white/70">
            Are you sure you want to delete {lesson?.title}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/20 text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button onClick={onConfirmDelete} variant="destructive">
            <Trash size={16} className="mr-2" />
            Delete Lesson
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteLessonDialog;
