import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, ExternalLink, Trash, Award } from "lucide-react"
import { LessonType } from "@/types/lesson"

interface LessonTableProps {
  lessons: LessonType[]
  onEdit: (lesson: LessonType) => void
  onDelete: (lesson: LessonType) => void
  onPreview: (lessonId: string) => void
}

export const LessonTable = ({
  lessons,
  onEdit,
  onDelete,
  onPreview,
}: LessonTableProps) => {
  return (
    <div className="rounded-md border border-white/20 overflow-hidden">
      <Table>
        <TableHeader className="bg-black/20">
          <TableRow className="hover:bg-white/5 border-white/10">
            <TableHead>Title</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Sponsored</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow
              key={lesson.id}
              className="hover:bg-white/5 border-white/10"
            >
              <TableCell className="font-medium">{lesson.title}</TableCell>
              <TableCell>
                <Badge
                  className={
                    lesson.difficulty === "beginner"
                      ? "bg-green-500/30 text-green-50"
                      : lesson.difficulty === "intermediate"
                      ? "bg-blue-500/30 text-blue-50"
                      : "bg-orange-500/30 text-orange-50"
                  }
                >
                  {lesson.difficulty}
                </Badge>
              </TableCell>
              <TableCell>{lesson.category}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {lesson.rating}
                  <span className="text-yellow-400 ml-1">★</span>
                  <span className="text-xs text-white/50 ml-1">
                    ({lesson.reviewCount})
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {lesson.points ? (
                    <>
                      <Award size={16} className="text-[#14F195] mr-1" />
                      <span>{lesson.points}</span>
                    </>
                  ) : (
                    <span className="text-white/50">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {lesson.sponsored ? (
                  <Badge className="bg-purple-500/30 text-purple-50">
                    Sponsored
                  </Badge>
                ) : (
                  <span className="text-white/50">-</span>
                )}
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
                  <DropdownMenuContent
                    align="end"
                    className="bg-black/70 backdrop-blur-md border-white/10 text-white"
                  >
                    <DropdownMenuItem
                      onClick={() => onEdit(lesson)}
                      className="hover:bg-white/10 cursor-pointer"
                    >
                      <Pencil size={16} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onPreview(lesson.id)}
                      className="hover:bg-white/10 cursor-pointer"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(lesson)}
                      className="hover:bg-white/10 cursor-pointer text-red-400"
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {lessons.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-white/50">
                No lessons found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
