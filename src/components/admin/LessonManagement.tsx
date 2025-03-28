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
    console.log("LessonManagement - saveLesson called with:", {
      updatedLesson,
      sectionsToSave,
      sectionsLength: sectionsToSave?.length || 0,
      isNewLesson,
    })

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
          console.log(
            "LessonManagement - New lesson created with ID:",
            newLessonId
          )

          if (newLessonId) {
            // Save the sections with the new lesson ID
            console.log(
              "LessonManagement - Saving sections for new lesson:",
              sectionsToSave.length
            )
            const sectionsResult = await saveSections(
              newLessonId,
              sectionsToSave
            )
            console.log(
              "LessonManagement - saveSections result:",
              sectionsResult
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
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Lessons Management</CardTitle>
            <CardDescription className="text-white/70">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <Input
                placeholder="Search lessons..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14F195] mx-auto mb-4"></div>
              <p className="text-white/70">Loading lessons...</p>
            </div>
          )}

          {!isLoading && (
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
                  {filteredLessons.map((lesson) => (
                    <TableRow
                      key={lesson.id}
                      className="hover:bg-white/5 border-white/10"
                    >
                      <TableCell className="font-medium">
                        {lesson.title}
                      </TableCell>
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
                              <Award
                                size={16}
                                className="text-[#14F195] mr-1"
                              />
                              <span>{lesson.points}</span>
                            </>
                          ) : (
                            <span className="text-white/50">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lesson.is_sponsored ? (
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
                              onClick={() => handleEditLesson(lesson)}
                              className="hover:bg-white/10 cursor-pointer"
                            >
                              <Pencil size={16} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => previewLesson(lesson.id)}
                              className="hover:bg-white/10 cursor-pointer"
                            >
                              <ExternalLink size={16} className="mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteLesson(lesson)}
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

                  {filteredLessons.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-6 text-white/50"
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
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete this lesson? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 bg-white/5 rounded-md">
            <p className="font-medium">{currentLesson?.title}</p>
            <p className="text-sm text-white/70 mt-1">
              {currentLesson?.description}
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteLesson}
              className="bg-red-500 hover:bg-red-600 text-white"
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
