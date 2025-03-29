import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Save,
  X,
  Plus,
  Trash,
  ChevronUp,
  ChevronDown,
  Edit,
  BookOpen,
  Award,
  Database,
  LineChart,
  BarChart,
  Key,
  Rocket,
  Lock,
  ShieldCheck,
  Network,
  Code,
  BarChart3,
  Wallet,
  Layers,
  Bird,
  Gem,
  PaintBucket,
  Sparkles,
  Share2,
  GraduationCap,
  Upload,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { LessonType, Section, Page } from "@/types/lesson"
import { RichTextEditor } from "./RichTextEditor"
import { fetchSections, saveSections } from "@/services/sections"
import { toast } from "@/hooks/use-toast"
import { safelyParseId } from "@/lib/type-converters"
import { supabase } from "@/lib/supabase"
import { SectionEditor } from "./SectionEditor"
import { BasicDetails } from "./BasicDetails"
import { PageEditor } from "./PageEditor"
import { SectionsList } from "./SectionsList"
import { PagesList } from "./PagesList"

interface LessonEditorProps {
  lesson: LessonType
  onSave: (lesson: LessonType, sections: Section[]) => void
  onCancel: () => void
}

export interface DBQuiz {
  id: string
  title: string
  lesson_id: string | null
  section_id: number | null
}

interface Sponsor {
  id: number
  name: string
  logo_url: string
}

const availableIcons = [
  { name: "Database", component: <Database size={24} /> },
  { name: "LineChart", component: <LineChart size={24} /> },
  { name: "BarChart", component: <BarChart size={24} /> },
  { name: "Key", component: <Key size={24} /> },
  { name: "Rocket", component: <Rocket size={24} /> },
  { name: "Lock", component: <Lock size={24} /> },
  { name: "ShieldCheck", component: <ShieldCheck size={24} /> },
  { name: "Network", component: <Network size={24} /> },
  { name: "Code", component: <Code size={24} /> },
  { name: "BarChart3", component: <BarChart3 size={24} /> },
  { name: "Wallet", component: <Wallet size={24} /> },
  { name: "Layers", component: <Layers size={24} /> },
  { name: "Gem", component: <Gem size={24} /> },
  { name: "PaintBucket", component: <PaintBucket size={24} /> },
  { name: "Sparkles", component: <Sparkles size={24} /> },
  { name: "Share2", component: <Share2 size={24} /> },
  { name: "GraduationCap", component: <GraduationCap size={24} /> },
  { name: "Award", component: <Award size={24} /> },
  { name: "BookOpen", component: <BookOpen size={24} /> },
]

export const LessonEditor = ({
  lesson,
  onSave,
  onCancel,
}: LessonEditorProps) => {
  const [editedLesson, setEditedLesson] = useState<LessonType>({ ...lesson })
  const [sections, setSections] = useState<Section[]>([])
  const [activeTab, setActiveTab] = useState("details")
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedIconName, setSelectedIconName] = useState<string>("")
  const [sponsorId, setSponsorId] = useState<number | null>(
    lesson.sponsorId || null
  )
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [categories, setCategories] = useState<string[]>([
    "Blockchain",
    "DeFi",
    "NFTs",
    "Trading",
    "Security",
    "Development",
  ])
  const [quizzes, setQuizzes] = useState<DBQuiz[]>([])

  // Ref to track last saved content to avoid unnecessary updates
  const lastSavedContentRef = useRef<{ [pageId: string]: string }>({})

  useEffect(() => {
    const loadSections = async () => {
      if (lesson.id && lesson.id !== "lesson-new") {
        try {
          const loadedSections = await fetchSections(lesson.id)

          if (loadedSections && loadedSections.length > 0) {
            setSections(loadedSections)
          } else {
            const defaultSections: Section[] = [
              {
                id: `section-${Date.now()}`,
                title: "Section 1",
                pages: [
                  {
                    id: `page-${Date.now()}`,
                    title: "Introduction",
                    content:
                      "<h1>Introduction</h1><p>Welcome to this lesson!</p>",
                  },
                ],
                quizId: null,
              },
            ]
            setSections(defaultSections)
          }
        } catch (error) {
          console.error("Error loading sections:", error)
          toast({
            title: "Error loading sections",
            description:
              "There was a problem loading the lesson sections. Please try again.",
            variant: "destructive",
          })
          // Set default sections on error
          const defaultSections: Section[] = [
            {
              id: `section-${Date.now()}`,
              title: "Section 1",
              pages: [
                {
                  id: `page-${Date.now()}`,
                  title: "Introduction",
                  content:
                    "<h1>Introduction</h1><p>Welcome to this lesson!</p>",
                },
              ],
              quizId: null,
            },
          ]
          setSections(defaultSections)
        }
      } else {
        // For new lessons, set default sections

        const defaultSections: Section[] = [
          {
            id: `section-${Date.now()}`,
            title: "Section 1",
            pages: [
              {
                id: `page-${Date.now()}`,
                title: "Introduction",
                content: "<h1>Introduction</h1><p>Welcome to this lesson!</p>",
              },
            ],
            quizId: null,
          },
        ]
        setSections(defaultSections)
      }

      const initialIconName = determineInitialIconName(lesson.icon)
      setSelectedIconName(initialIconName)
      setSponsorId(lesson.sponsorId || null)
    }

    loadSections()
  }, [lesson.id, lesson.icon, lesson.sponsorId])

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("id, title, lesson_id, section_id")
          .order("title", { ascending: true })

        if (error) throw error

        setQuizzes(data || [])
      } catch (error) {
        console.error("Error fetching quizzes:", error)
      }
    }

    fetchQuizzes()
  }, [])

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const { data, error } = await supabase
          .from("sponsors")
          .select("*")
          .order("name", { ascending: true })

        if (error) throw error

        setSponsors(data || [])
      } catch (error) {
        console.error("Error fetching sponsors:", error)
      }
    }

    fetchSponsors()
  }, [])

  const determineInitialIconName = (iconElement: React.ReactNode): string => {
    const iconString = String(iconElement)

    for (const icon of availableIcons) {
      if (iconString.includes(icon.name)) {
        return icon.name
      }
    }

    return "Database"
  }

  useEffect(() => {
    const totalPages = sections.reduce(
      (total, section) => total + section.pages.length,
      0
    )
    setEditedLesson((prev) => ({
      ...prev,
      pages: totalPages,
      sections: sections.length,
    }))
  }, [sections])

  const handleSaveLesson = async () => {
    // Save current page content before submitting
    saveCurrentPageContent()

    try {
      // Validate required fields
      if (!editedLesson.title) {
        toast({
          title: "Error",
          description: "Lesson title is required",
          variant: "destructive",
        })
        setActiveTab("details")
        return
      }

      // For new lessons, we need to save the lesson first to get a valid ID
      if (
        editedLesson.id === "lesson-new" ||
        editedLesson.id.startsWith("new-lesson-")
      ) {
        // Pass the sections along with the edited lesson to the parent's onSave
        onSave(editedLesson, sections)
      } else {
        // For existing lessons with valid IDs, save sections first
        const parsedLessonId = safelyParseId(editedLesson.id)

        // Ensure the lesson ID is valid
        if (parsedLessonId === null) {
          throw new Error(`Invalid lesson ID: ${editedLesson.id}`)
        }

        const result = await saveSections(parsedLessonId, sections)

        if (!result.success) {
          throw new Error(result.error || "Failed to save sections")
        }

        // Then call the parent's onSave with the edited lesson (no need to pass sections)
        onSave(editedLesson, null)
      }
    } catch (error) {
      console.error("Error saving lesson:", error)
      toast({
        title: "Error saving lesson",
        description: "There was a problem saving the lesson. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updatePage = (
    sectionIndex: number,
    pageIndex: number,
    field: keyof Page,
    value: any
  ) => {
    setSections((prev) => {
      const updated = [...prev]
      updated[sectionIndex].pages[pageIndex] = {
        ...updated[sectionIndex].pages[pageIndex],
        [field]: value,
      }
      return updated
    })
  }

  // Function to save the current page content before switching
  const saveCurrentPageContent = () => {
    if (
      sections.length === 0 ||
      !sections[currentSectionIndex] ||
      !sections[currentSectionIndex].pages ||
      !sections[currentSectionIndex].pages[currentPageIndex]
    ) {
      return // Don't attempt to save if there's no valid page
    }

    // Get the current content from the editor if available
    const currentEditor = document.querySelector(".ProseMirror")
    if (!currentEditor) {
      return // Exit if editor not found
    }

    const newContent = currentEditor.innerHTML
    const currentPage = sections[currentSectionIndex].pages[currentPageIndex]
    const currentContent = currentPage.content
    const currentPageId = currentPage.id
    const currentPageTitle = currentPage.title

    // Compare with last saved content to avoid duplicate saves
    const lastSavedContent = lastSavedContentRef.current[currentPageId]
    if (lastSavedContent === newContent) {
      return
    }
    // Normalize content to avoid unnecessary updates due to minor formatting differences
    const normalizedNewContent = newContent.replace(/\s+/g, " ").trim()
    const normalizedCurrentContent = currentContent.replace(/\s+/g, " ").trim()

    // Only update if content has actually changed
    if (newContent && normalizedNewContent !== normalizedCurrentContent) {
      // Store this content in our ref to avoid duplicate saves
      lastSavedContentRef.current[currentPageId] = newContent

      setSections((prev) => {
        // Create deep copies to avoid reference issues
        const updated = JSON.parse(JSON.stringify(prev))

        // Search all sections for the target page by ID (don't rely on indexes)
        let targetPageFound = false

        for (let s = 0; s < updated.length; s++) {
          const pageIdx = updated[s].pages.findIndex(
            (p) => p.id === currentPageId
          )

          if (pageIdx !== -1) {
            // Found the page by ID in this section

            // Update the page content
            updated[s].pages[pageIdx].content = newContent

            targetPageFound = true
            break
          }
        }

        if (!targetPageFound) {
          return prev // Return unchanged state
        }

        return updated
      })
    } else {
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-black/20 border-b border-white/10 w-full justify-start">
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-white/10"
          >
            Basic Details
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-white/10"
          >
            Lesson Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="pt-4 space-y-4">
          <BasicDetails
            editedLesson={editedLesson}
            setEditedLesson={setEditedLesson}
            availableIcons={availableIcons}
            sponsors={sponsors}
            categories={categories}
            setCategories={setCategories}
          />
        </TabsContent>

        <TabsContent value="content" className="pt-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4">
              <SectionsList
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                setSections={setSections}
                saveCurrentPageContent={saveCurrentPageContent}
                setCurrentSectionIndex={setCurrentSectionIndex}
                setCurrentPageIndex={setCurrentPageIndex}
              />
              <PagesList
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                currentPageIndex={currentPageIndex}
                setSections={setSections}
                saveCurrentPageContent={saveCurrentPageContent}
                setCurrentPageIndex={setCurrentPageIndex}
              />
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <SectionEditor
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                setSections={setSections}
                quizzes={quizzes}
              />
              <PageEditor
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                currentPageIndex={currentPageIndex}
                setSections={setSections}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <X size={16} className="mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleSaveLesson}
          className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
        >
          <Save size={16} className="mr-2" />
          Save Lesson
        </Button>
      </div>
    </div>
  )
}
