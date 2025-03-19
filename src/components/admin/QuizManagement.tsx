import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash,
  ExternalLink,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { QuizEditor } from "./QuizEditor"

// Database Quiz type
interface DBQuiz {
  id: string
  title: string
  questions: {
    id: string
    question: string
    options: string[]
    correctAnswer: number
  }[]
  points: number
  lesson_id: string | null
  section_id: number | null
  created_at: string
  updated_at: string
  is_final_test: boolean | null
  // Join data
  lesson?: { title: string } | null
  section?: { title: string } | null
}

// Legacy Quiz type for existing components
interface EditorQuiz {
  id: string
  title: string
  lessonId: string
  sectionId: string
  rewardPoints: number
  isFinalTest?: boolean
  questions: {
    id: string
    text: string
    options: string[]
    correctOptionIndex: number
  }[]
}

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState<DBQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<EditorQuiz | null>(null)
  const [isNewQuiz, setIsNewQuiz] = useState(false)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select(
          `
          *,
          lesson:lessons(title),
          section:sections(title)
        `
        )
        .order("created_at", { ascending: false })

      if (error) throw error

      setQuizzes(data)
    } catch (error) {
      console.error("Error fetching quizzes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch quizzes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.lesson?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.section?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateQuiz = () => {
    const newQuiz: EditorQuiz = {
      id: "",
      title: "New Quiz",
      lessonId: "default",
      sectionId: "default",
      rewardPoints: 10,
      isFinalTest: false,
      questions: [
        {
          id: `q-${Date.now()}`,
          text: "What is the answer to this question?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOptionIndex: 0,
        },
      ],
    }

    setCurrentQuiz(newQuiz)
    setIsNewQuiz(true)
    setShowEditDialog(true)
  }

  const handleEdit = (dbQuiz: DBQuiz) => {
    // Convert DB quiz to editor format
    const editorQuiz: EditorQuiz = {
      id: dbQuiz.id,
      title: dbQuiz.title,
      lessonId: dbQuiz.lesson_id || "default",
      sectionId: String(dbQuiz.section_id || "default"),
      rewardPoints: dbQuiz.points,
      isFinalTest: dbQuiz.is_final_test || false,
      questions: dbQuiz.questions.map((q) => ({
        id: q.id,
        text: q.question,
        options: q.options,
        correctOptionIndex: q.correctAnswer,
      })),
    }

    setCurrentQuiz(editorQuiz)
    setIsNewQuiz(false)
    setShowEditDialog(true)
  }

  const handleDelete = async (quiz: DBQuiz) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quiz.id)

      if (error) throw error

      toast({
        title: "Quiz Deleted",
        description: `${quiz.title} has been deleted.`,
      })

      fetchQuizzes()
    } catch (error) {
      console.error("Error deleting quiz:", error)
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      })
    }
  }

  const handleSaveQuiz = async (editorQuiz: EditorQuiz) => {
    try {
      // Convert editor quiz to DB format
      const dbQuiz: Partial<DBQuiz> = {
        title: editorQuiz.title,
        lesson_id:
          editorQuiz.lessonId === "default" ? null : editorQuiz.lessonId,
        section_id:
          editorQuiz.sectionId === "default"
            ? null
            : parseInt(editorQuiz.sectionId),
        points: editorQuiz.rewardPoints,
        is_final_test: editorQuiz.isFinalTest || false,
        questions: editorQuiz.questions.map((q) => ({
          id: q.id,
          question: q.text,
          options: q.options,
          correctAnswer: q.correctOptionIndex,
        })),
      }

      if (isNewQuiz) {
        const { error } = await supabase.from("quizzes").insert(dbQuiz)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("quizzes")
          .update(dbQuiz)
          .eq("id", editorQuiz.id)
        if (error) throw error
      }

      toast({
        title: isNewQuiz ? "Quiz Created" : "Quiz Updated",
        description: `${editorQuiz.title} has been ${
          isNewQuiz ? "created" : "updated"
        }.`,
      })

      setShowEditDialog(false)
      setCurrentQuiz(null)
      fetchQuizzes()
    } catch (error) {
      console.error("Error saving quiz:", error)
      toast({
        title: "Error",
        description: "Failed to save quiz",
        variant: "destructive",
      })
    }
  }

  const previewQuiz = (quiz: DBQuiz) => {
    window.open(
      `/quiz/${quiz.lesson_id || "default"}/${quiz.section_id || "default"}`,
      "_blank"
    )
  }

  if (loading) {
    return (
      <div className="min-h-[300px] bg-black/30 p-4 flex items-center justify-center">
        Loading quizzes...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Quizzes Management</CardTitle>
            <CardDescription className="text-white/70">
              Create and manage quizzes and assessments
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="gradient"
              size="sm"
              className="text-white"
              onClick={handleCreateQuiz}
            >
              <Plus size={16} className="mr-2" />
              New Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <Input
                placeholder="Search quizzes..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-white/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="hover:bg-white/5 border-white/10">
                  <TableHead>Title</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz) => (
                  <TableRow
                    key={quiz.id}
                    className="hover:bg-white/5 border-white/10"
                  >
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.lesson?.title || "No Lesson"}</TableCell>
                    <TableCell>{quiz.section?.title || "No Section"}</TableCell>
                    <TableCell>{quiz.questions.length}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500/30 text-blue-50">
                        {quiz.points} pts
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {quiz.is_final_test ? (
                        <Badge className="bg-purple-500/30 text-purple-50">
                          Final Test
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/30 text-green-50">
                          Section Quiz
                        </Badge>
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
                            onClick={() => handleEdit(quiz)}
                            className="hover:bg-white/10 cursor-pointer"
                          >
                            <Pencil size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => previewQuiz(quiz)}
                            className="hover:bg-white/10 cursor-pointer"
                          >
                            <ExternalLink size={16} className="mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(quiz)}
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

                {filteredQuizzes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-white/50"
                    >
                      No quizzes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Editor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewQuiz ? "Create New Quiz" : "Edit Quiz"}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {isNewQuiz
                ? "Create a new quiz by adding questions and answers"
                : "Edit quiz questions and answers"}
            </DialogDescription>
          </DialogHeader>

          {currentQuiz && (
            <QuizEditor
              quiz={currentQuiz}
              onSave={handleSaveQuiz}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizManagement
