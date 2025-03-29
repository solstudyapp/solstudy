import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [newCategory, setNewCategory] = useState<string>("")
  const [showNewCategoryInput, setShowNewCategoryInput] =
    useState<boolean>(false)
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

  const handleInputChange = (field: keyof LessonType, value: any) => {
    setEditedLesson((prev) => ({ ...prev, [field]: value }))
  }

  const handleIconChange = (iconName: string) => {
    setSelectedIconName(iconName)

    const selectedIcon = availableIcons.find((icon) => icon.name === iconName)

    if (selectedIcon) {
      handleInputChange("icon", selectedIcon.component)
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim() === "") return

    const updatedCategories = [...categories]
    if (!updatedCategories.includes(newCategory.trim())) {
      updatedCategories.push(newCategory.trim())
      setCategories(updatedCategories)
    }

    setEditedLesson((prev) => ({
      ...prev,
      category: newCategory.trim(),
    }))
    setNewCategory("")
    setShowNewCategoryInput(false)
  }

  const handleSponsoredChange = (checked: boolean) => {
    setEditedLesson((prev) => ({
      ...prev,
      is_sponsored: checked,
      // If not sponsored, reset sponsor ID
      sponsorId: checked ? prev.sponsorId : null,
    }))
  }

  const handleSponsorChange = (selectedSponsorId: string) => {
    const id = parseInt(selectedSponsorId)
    setSponsorId(id)

    // Get the selected sponsor's logo URL
    const selectedSponsor = sponsors.find((sponsor) => sponsor.id === id)
    const logoUrl = selectedSponsor ? selectedSponsor.logo_url : null

    setEditedLesson((prev) => ({
      ...prev,
      sponsorId: id,
      sponsorLogo: logoUrl,
    }))
  }

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

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      pages: [
        {
          id: `page-${Date.now()}`,
          title: "New Page",
          content: "<h1>New Page</h1><p>Add your content here.</p>",
        },
      ],
      quizId: null,
    }

    setSections((prev) => [...prev, newSection])
  }

  const updateSection = (index: number, field: keyof Section, value: any) => {
    setSections((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const deleteSection = (index: number) => {
    if (sections.length <= 1) {
      return
    }

    setSections((prev) => prev.filter((_, i) => i !== index))

    if (currentSectionIndex >= index && currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1)
      setCurrentPageIndex(0)
    }
  }

  const moveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return
    }

    const newIndex = direction === "up" ? index - 1 : index + 1

    setSections((prev) => {
      const updated = [...prev]
      ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
      return updated
    })

    setCurrentSectionIndex(newIndex)
  }

  const addPage = (sectionIndex: number) => {
    // Use the saveCurrentPageContent function
    saveCurrentPageContent()

    setSections((prev) => {
      const updated = [...prev]
      updated[sectionIndex].pages.push({
        id: `page-${Date.now()}`,
        title: `New Page ${updated[sectionIndex].pages.length + 1}`,
        content: "<h1>New Page</h1><p>Add your content here.</p>",
      })
      return updated
    })

    setCurrentPageIndex(sections[sectionIndex].pages.length)
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

  const deletePage = (sectionIndex: number, pageIndex: number) => {
    if (sections[sectionIndex].pages.length <= 1) {
      return
    }

    setSections((prev) => {
      const updated = [...prev]
      updated[sectionIndex].pages = updated[sectionIndex].pages.filter(
        (_, i) => i !== pageIndex
      )
      return updated
    })

    if (currentPageIndex >= pageIndex && currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1)
    }
  }

  const movePage = (
    sectionIndex: number,
    pageIndex: number,
    direction: "up" | "down"
  ) => {
    if (
      (direction === "up" && pageIndex === 0) ||
      (direction === "down" &&
        pageIndex === sections[sectionIndex].pages.length - 1)
    ) {
      return
    }

    const newIndex = direction === "up" ? pageIndex - 1 : pageIndex + 1

    setSections((prev) => {
      const updated = [...prev]
      const pages = [...updated[sectionIndex].pages]
      ;[pages[pageIndex], pages[newIndex]] = [pages[newIndex], pages[pageIndex]]
      updated[sectionIndex].pages = pages
      return updated
    })

    setCurrentPageIndex(newIndex)
  }

  // Function to save the current page content before switching
  const saveCurrentPageContent = () => {
    if (
      sections.length > 0 &&
      sections[currentSectionIndex]?.pages[currentPageIndex]
    ) {
      // Get the current content from the editor if available
      const currentEditor = document.querySelector(".ProseMirror")
      if (currentEditor && currentEditor.innerHTML) {
        updatePage(
          currentSectionIndex,
          currentPageIndex,
          "content",
          currentEditor.innerHTML
        )
      }
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
            handleInputChange={handleInputChange}
            showNewCategoryInput={showNewCategoryInput}
            setNewCategory={setNewCategory}
            handleAddCategory={handleAddCategory}
            categories={categories}
            availableIcons={availableIcons}
            selectedIconName={selectedIconName}
            handleIconChange={handleIconChange}
            handleSponsoredChange={handleSponsoredChange}
            handleSponsorChange={handleSponsorChange}
            sponsors={sponsors}
            sponsorId={sponsorId}
            setShowNewCategoryInput={setShowNewCategoryInput}
            newCategory={newCategory}
          />
        </TabsContent>

        <TabsContent value="content" className="pt-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4">
              <SectionsList
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                addSection={addSection}
                moveSection={moveSection}
                deleteSection={deleteSection}
                saveCurrentPageContent={saveCurrentPageContent}
                setCurrentSectionIndex={setCurrentSectionIndex}
                setCurrentPageIndex={setCurrentPageIndex}
              />
              <PagesList
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                addPage={addPage}
                movePage={movePage}
                deletePage={deletePage}
                saveCurrentPageContent={saveCurrentPageContent}
                setCurrentPageIndex={setCurrentPageIndex}
                currentPageIndex={currentPageIndex}
              />
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <SectionEditor
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                updateSection={updateSection}
                quizzes={quizzes}
              />
              <PageEditor
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                currentPageIndex={currentPageIndex}
                updatePage={updatePage}
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
