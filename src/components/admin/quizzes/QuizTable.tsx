
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pencil, Trash, MoreVertical, ExternalLink } from "lucide-react";
import { Quiz } from "@/types/lesson";

interface QuizTableProps {
  quizzes: Quiz[];
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quiz: Quiz) => void;
  onPreviewQuiz: (quiz: Quiz) => void;
}

const QuizTable = ({ quizzes, onEditQuiz, onDeleteQuiz, onPreviewQuiz }: QuizTableProps) => {
  return (
    <div className="rounded-md border border-white/20 overflow-hidden">
      <Table>
        <TableHeader className="bg-black/20">
          <TableRow className="hover:bg-white/5 border-white/10">
            <TableHead>Title</TableHead>
            <TableHead>Lesson</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Points</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.length > 0 ? (
            quizzes.map(quiz => (
              <TableRow key={quiz.id} className="hover:bg-white/5 border-white/10">
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>{quiz.lessonId}</TableCell>
                <TableCell>{quiz.sectionId}</TableCell>
                <TableCell>{quiz.questions.length}</TableCell>
                <TableCell>
                  <Badge className="bg-blue-500/30 text-blue-50">
                    {quiz.rewardPoints} pts
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black/70 backdrop-blur-md border-white/10 text-white">
                      <DropdownMenuItem onClick={() => onEditQuiz(quiz)}
                        className="hover:bg-white/10 cursor-pointer">
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPreviewQuiz(quiz)}
                        className="hover:bg-white/10 cursor-pointer">
                        <ExternalLink size={16} className="mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteQuiz(quiz)}
                        className="hover:bg-white/10 cursor-pointer text-red-400">
                        <Trash size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-white/50">
                No quizzes found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuizTable;
