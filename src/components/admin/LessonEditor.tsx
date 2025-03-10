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

interface LessonEditorProps {
  lesson: LessonType
  onSave: (lesson: LessonType, sections: Section[]) => void
  onCancel: () => void
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
  const [sponsorLogoUrl, setSponsorLogoUrl] = useState<string>(
    lesson.sponsorLogo || ""
  )

  const [availableCategories, setAvailableCategories] = useState<string[]>([
    "Blockchain",
    "DeFi",
    "NFTs",
    "Trading",
    "Security",
    "Development",
  ])

  useEffect(() => {
    const loadSections = async () => {
      console.log("LessonEditor - loadSections called for lesson:", lesson.id)

      if (lesson.id && lesson.id !== "lesson-new") {
        try {
          console.log("LessonEditor - Fetching sections for lesson:", lesson.id)
          const loadedSections = await fetchSections(lesson.id)
          console.log("LessonEditor - Loaded sections:", loadedSections)

          if (loadedSections && loadedSections.length > 0) {
            console.log(
              "LessonEditor - Setting loaded sections:",
              loadedSections.length
            )
            setSections(loadedSections)
          } else {
            console.log(
              "LessonEditor - No sections found, setting default sections"
            )
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
                quizId: `quiz-${Date.now()}`,
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
              quizId: `quiz-${Date.now()}`,
            },
          ]
          setSections(defaultSections)
        }
      } else {
        // For new lessons, set default sections
        console.log("LessonEditor - New lesson, setting default sections")
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
            quizId: `quiz-${Date.now()}`,
          },
        ]
        setSections(defaultSections)
      }

      const initialIconName = determineInitialIconName(lesson.icon)
      setSelectedIconName(initialIconName)
      setSponsorLogoUrl(lesson.sponsorLogo || "")
    }

    loadSections()
  }, [lesson.id, lesson.icon, lesson.sponsorLogo])

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

    const updatedCategories = [...availableCategories]
    if (!updatedCategories.includes(newCategory.trim())) {
      updatedCategories.push(newCategory.trim())
      setAvailableCategories(updatedCategories)
    }

    handleInputChange("category", newCategory.trim())

    setNewCategory("")
    setShowNewCategoryInput(false)
  }

  const handleSponsoredChange = (checked: boolean) => {
    handleInputChange("sponsored", checked)
    if (!checked) {
      handleInputChange("sponsorLogo", "")
      setSponsorLogoUrl("")
    }
  }

  const handleSponsorLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const file = files[0]
      const reader = new FileReader()

      reader.onload = (e) => {
        const result = e.target?.result as string
        setSponsorLogoUrl(result)
        handleInputChange("sponsorLogo", result)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleSaveLesson = async () => {
    try {
      console.log("LessonEditor - handleSaveLesson - sections:", sections)
      console.log(
        "LessonEditor - handleSaveLesson - editedLesson:",
        editedLesson
      )

      // For new lessons, we need to save the lesson first to get a valid ID
      if (
        editedLesson.id === "lesson-new" ||
        editedLesson.id.startsWith("new-lesson-")
      ) {
        console.log(
          "LessonEditor - Saving new lesson with sections:",
          sections.length
        )
        // Pass the sections along with the edited lesson to the parent's onSave
        onSave(editedLesson, sections)
      } else {
        // For existing lessons with valid IDs, save sections first
        const numericLessonId = Number(editedLesson.id)
        console.log(
          "LessonEditor - Saving existing lesson with ID:",
          numericLessonId
        )

        // Ensure the lesson ID is a valid number
        if (isNaN(numericLessonId)) {
          throw new Error(`Invalid lesson ID: ${editedLesson.id}`)
        }

        const result = await saveSections(numericLessonId, sections)
        console.log("LessonEditor - saveSections result:", result)

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
      quizId: `quiz-${Date.now()}`,
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

  const renderSectionsList = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Sections</h3>
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={addSection}
          >
            <Plus size={16} className="mr-2" /> Add Section
          </Button>
        </div>

        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`flex items-center justify-between p-2 rounded ${
                currentSectionIndex === index
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              }`}
              onClick={() => {
                setCurrentSectionIndex(index)
                setCurrentPageIndex(0)
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{section.title}</span>
                <span className="text-xs text-white/50">
                  ({section.pages.length} pages)
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    moveSection(index, "up")
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    moveSection(index, "down")
                  }}
                  disabled={index === sections.length - 1}
                >
                  <ChevronDown size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSection(index)
                  }}
                  disabled={sections.length <= 1}
                >
                  <Trash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPagesList = () => {
    if (sections.length === 0) return null

    const currentSection = sections[currentSectionIndex]

    return (
      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Pages in {currentSection.title}
          </h3>
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => addPage(currentSectionIndex)}
          >
            <Plus size={16} className="mr-2" /> Add Page
          </Button>
        </div>

        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
          {currentSection.pages.map((page, index) => (
            <div
              key={page.id}
              className={`flex items-center justify-between p-2 rounded ${
                currentPageIndex === index ? "bg-white/10" : "hover:bg-white/5"
              }`}
              onClick={() => setCurrentPageIndex(index)}
            >
              <div className="flex items-center gap-2">
                <Edit size={16} />
                <span>{page.title}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    movePage(currentSectionIndex, index, "up")
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    movePage(currentSectionIndex, index, "down")
                  }}
                  disabled={index === currentSection.pages.length - 1}
                >
                  <ChevronDown size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePage(currentSectionIndex, index)
                  }}
                  disabled={currentSection.pages.length <= 1}
                >
                  <Trash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPageEditor = () => {
    if (
      sections.length === 0 ||
      !sections[currentSectionIndex]?.pages[currentPageIndex]
    ) {
      return <div className="text-white/50">No page selected</div>
    }

    const currentPage = sections[currentSectionIndex].pages[currentPageIndex]

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Page Title</label>
          <Input
            value={currentPage.title}
            onChange={(e) =>
              updatePage(
                currentSectionIndex,
                currentPageIndex,
                "title",
                e.target.value
              )
            }
            className="bg-white/10 border-white/20 text-white"
          />
        </div>

        <div className="flex flex-col gap-2 pt-4">
          <label className="text-sm font-medium">Content</label>
          <div className="border border-white/20 rounded-md overflow-hidden">
            <RichTextEditor
              initialContent={currentPage.content}
              onChange={(content) =>
                updatePage(
                  currentSectionIndex,
                  currentPageIndex,
                  "content",
                  content
                )
              }
            />
          </div>
        </div>
      </div>
    )
  }

  const renderSectionEditor = () => {
    if (sections.length === 0) return null

    const currentSection = sections[currentSectionIndex]

    return (
      <div className="space-y-4 mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Section Title</label>
          <Input
            value={currentSection.title}
            onChange={(e) =>
              updateSection(currentSectionIndex, "title", e.target.value)
            }
            className="bg-white/10 border-white/20 text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Quiz ID</label>
          <Input
            value={currentSection.quizId}
            onChange={(e) =>
              updateSection(currentSectionIndex, "quizId", e.target.value)
            }
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>
    )
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editedLesson.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Category</label>
              {showNewCategoryInput ? (
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Button
                    onClick={handleAddCategory}
                    className="bg-[#14F195] text-[#1A1F2C] hover:bg-[#14F195]/90"
                  >
                    <Plus size={16} className="mr-2" />
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewCategoryInput(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={editedLesson.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-md border-white/10 text-white">
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewCategoryInput(true)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                value={editedLesson.difficulty}
                onValueChange={(value) =>
                  handleInputChange("difficulty", value)
                }
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-md border-white/10 text-white">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Lesson Icon</label>
              <Select value={selectedIconName} onValueChange={handleIconChange}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-md border-white/10 text-white max-h-[300px]">
                  {availableIcons.map((icon) => (
                    <SelectItem
                      key={icon.name}
                      value={icon.name}
                      className="flex items-center"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex-shrink-0">{icon.component}</span>
                        <span>{icon.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Rating</label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={editedLesson.rating}
                onChange={(e) =>
                  handleInputChange("rating", parseFloat(e.target.value))
                }
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Review Count</label>
              <Input
                type="number"
                min="0"
                value={editedLesson.reviewCount}
                onChange={(e) =>
                  handleInputChange("reviewCount", parseInt(e.target.value))
                }
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                <span className="flex items-center">
                  <Award size={16} className="mr-2 text-[#14F195]" />
                  Points Reward
                </span>
              </label>
              <Input
                type="number"
                min="0"
                value={editedLesson.points || 0}
                onChange={(e) =>
                  handleInputChange("points", parseInt(e.target.value))
                }
                placeholder="Points awarded for completion"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sponsored"
                  checked={!!editedLesson.sponsored}
                  onCheckedChange={handleSponsoredChange}
                />
                <Label htmlFor="sponsored">Sponsored Lesson</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="bonusLesson"
                  checked={!!editedLesson.bonusLesson}
                  onCheckedChange={(checked) =>
                    handleInputChange("bonusLesson", checked)
                  }
                />
                <Label htmlFor="bonusLesson">
                  <span className="flex items-center">
                    <Sparkles size={16} className="mr-2 text-[#14F195]" />
                    Bonus Lesson of the Day
                  </span>
                </Label>
              </div>

              {editedLesson.sponsored && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sponsor Logo</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="sponsorLogo"
                        className="flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-md cursor-pointer hover:bg-white/20 transition-colors"
                      >
                        <Upload size={16} className="mr-2" />
                        {sponsorLogoUrl ? "Change Logo" : "Upload Logo"}
                      </Label>
                      <Input
                        id="sponsorLogo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSponsorLogoChange}
                      />
                    </div>

                    {sponsorLogoUrl ? (
                      <div className="p-4 bg-white/5 rounded-md">
                        <img
                          src={sponsorLogoUrl}
                          alt="Sponsor Logo"
                          className="h-12 object-contain mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-white/5 rounded-md flex items-center justify-center text-white/50">
                        <AlertCircle size={16} className="mr-2" />
                        No logo uploaded
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={editedLesson.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-white/10 border-white/20 text-white min-h-[100px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="content" className="pt-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4">
              {renderSectionsList()}
              {renderPagesList()}
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              {renderSectionEditor()}
              {renderPageEditor()}
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
