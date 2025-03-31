import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  Pencil,
  Trash,
  MoreVertical,
  Save,
  X,
  ExternalLink,
  Award,
  Database,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { LessonTable } from "./LessonTable"
import {
  fetchLessons,
  saveLesson as saveLessonToSupabase,
  deleteLesson as deleteLessonFromSupabase,
} from "@/services/lessons"
import { saveSections } from "@/services/sections"
import { LessonEditor } from "./LessonEditor"
import { LessonType, Section } from "@/types/lesson"

const LessonManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [lessons, setLessons] = useState<LessonType[]>([])
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentLesson, setCurrentLesson] = useState<LessonType | null>(null)
  const [isNewLesson, setIsNewLesson] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Load lessons when component mounts
  useEffect(() => {
    const loadLessonsData = async () => {
      setIsLoading(true)
      try {
        const fetchedLessons = await fetchLessons()
        setLessons(fetchedLessons)
      } catch (error) {
        console.error("Error loading lessons:", error)
        toast({
          title: "Error Loading Lessons",
          description:
            "There was a problem loading the lessons. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadLessonsData()
  }, [])

  const handleCreateLesson = () => {
    // Create a new empty lesson
    const newLesson: LessonType = {
      id: `new-lesson-${Date.now()}`,
      title: "New Lesson",
      description: "Enter lesson description here",
      difficulty: "beginner",
      category: "blockchain",
      sections: 0,
      pages: 0,
      completedSections: 0,
      rating: 0,
      reviewCount: 0,
      icon: <Database size={24} />,
      is_sponsored: false,
      sponsorLogo: "",
      points: 100,
      sponsorName: "",
    }

    setCurrentLesson(newLesson)
    setIsNewLesson(true)
    setShowEditDialog(true)
  }

  const handleEditLesson = (lesson: LessonType) => {
    setCurrentLesson(lesson)
    setIsNewLesson(false)
    setShowEditDialog(true)
  }

  const handleDeleteLesson = (lesson: LessonType) => {
    setCurrentLesson(lesson)
    setShowDeleteDialog(true)
  }

  const confirmDeleteLesson = async () => {
    if (!currentLesson) return

    setIsLoading(true)
    try {
      const result = await deleteLessonFromSupabase(currentLesson.id)

      if (result.success) {
        // Update local state
        setLessons((prev) =>
          prev.filter((lesson) => lesson.id !== currentLesson.id)
        )

        toast({
          title: "Lesson Deleted",
          description: `${currentLesson.title} has been deleted.`,
        })
      } else {
        toast({
          title: "Error Deleting Lesson",
          description:
            result.error || "There was a problem deleting the lesson.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting lesson:", error)
      toast({
        title: "Error Deleting Lesson",
        description: "There was a problem deleting the lesson.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
      setCurrentLesson(null)
    }
  }

  const saveLesson = async (
    updatedLesson: LessonType,
    sectionsToSave?: Section[]
  ) => {
    setIsLoading(true)
    try {
      const result = await saveLessonToSupabase(updatedLesson)

      if (result.success) {
        // If this was a new lesson and we have sections to save
        if (
          isNewLesson &&
          sectionsToSave &&
          sectionsToSave.length > 0 &&
          result.data
        ) {
          // Get the newly created lesson ID
          const newLessonId = result.data[0]?.id

          if (newLessonId) {
            // Save the sections with the new lesson ID

            const sectionsResult = await saveSections(
              newLessonId,
              sectionsToSave
            )
          } else {
            console.error(
              "LessonManagement - No lesson ID returned from create operation"
            )
          }
        }

        // Refresh the lessons list to get the updated data with correct IDs
        const refreshedLessons = await fetchLessons()
        setLessons(refreshedLessons)

        toast({
          title: isNewLesson ? "Lesson Created" : "Lesson Updated",
          description: `${updatedLesson.title} has been ${
            isNewLesson ? "created" : "updated"
          }.`,
        })
      } else {
        console.error("LessonManagement - Error saving lesson:", result.error)
        toast({
          title: `Error ${isNewLesson ? "Creating" : "Updating"} Lesson`,
          description:
            result.error ||
            `There was a problem ${
              isNewLesson ? "creating" : "updating"
            } the lesson.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(
        `Error ${isNewLesson ? "creating" : "updating"} lesson:`,
        error
      )
      toast({
        title: `Error ${isNewLesson ? "Creating" : "Updating"} Lesson`,
        description: `There was a problem ${
          isNewLesson ? "creating" : "updating"
        } the lesson.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowEditDialog(false)
      setCurrentLesson(null)
    }
  }

  const previewLesson = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Lessons Management</CardTitle>
            <CardDescription>
              Create and manage learning modules
            </CardDescription>
          </div>
          <Button
            className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
            onClick={handleCreateLesson}
          >
            <Plus size={16} className="mr-2" />
            New Lesson
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <div>Loading lessons...</div>
              </div>
            </div>
          )}

          {!isLoading && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {filteredLessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-medium">
                        {lesson.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lesson.difficulty === "beginner"
                              ? "default"
                              : lesson.difficulty === "intermediate"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {lesson.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>{lesson.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {lesson.rating}
                          <span className="text-yellow-500 ml-1">★</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({lesson.reviewCount})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {lesson.points ? (
                            <>
                              <Award
                                size={16}
                                className="text-[#14F195] mr-1"
                              />
                              <span>{lesson.points}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lesson.is_sponsored ? (
                          <Badge variant="secondary">Sponsored</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditLesson(lesson)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => previewLesson(lesson.id)}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteLesson(lesson)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredLessons.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No lessons found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Lesson Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewLesson ? "Create New Lesson" : "Edit Lesson"}:{" "}
              {currentLesson?.title}
            </DialogTitle>
          </DialogHeader>

          {currentLesson && (
            <LessonEditor
              lesson={currentLesson}
              onSave={saveLesson}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Lesson Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lesson? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="font-medium">{currentLesson?.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentLesson?.description}
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteLesson}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LessonManagement
