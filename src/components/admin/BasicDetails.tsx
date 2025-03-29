import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, X, Sparkles, Award, AlertCircle } from "lucide-react"
import { LessonType } from "@/types/lesson"
import { useEffect, useState } from "react"

interface Sponsor {
  id: number
  name: string
  logo_url: string
}

interface IconOption {
  name: string
  component: React.ReactNode
}

interface BasicDetailsProps {
  editedLesson: LessonType
  setEditedLesson: (lesson: LessonType) => void
  availableIcons: IconOption[]
  sponsors: Sponsor[]
  categories: string[]
  setCategories: (categories: string[]) => void
}

export const BasicDetails = ({
  editedLesson,
  setEditedLesson,
  availableIcons,
  sponsors,
  categories,
  setCategories,
}: BasicDetailsProps) => {
  const [selectedIconName, setSelectedIconName] = useState<string>("")
  const [newCategory, setNewCategory] = useState<string>("")
  const [showNewCategoryInput, setShowNewCategoryInput] =
    useState<boolean>(false)
  const [sponsorId, setSponsorId] = useState<number | null>(
    editedLesson.sponsorId || null
  )

  useEffect(() => {
    const initialIconName = determineInitialIconName(editedLesson.icon)
    setSelectedIconName(initialIconName)
    setSponsorId(editedLesson.sponsorId || null)
  }, [editedLesson.icon, editedLesson.sponsorId])

  const determineInitialIconName = (iconElement: React.ReactNode): string => {
    const iconString = String(iconElement)

    for (const icon of availableIcons) {
      if (iconString.includes(icon.name)) {
        return icon.name
      }
    }

    return "Database"
  }

  const handleInputChange = (field: keyof LessonType, value: any) => {
    setEditedLesson({ ...editedLesson, [field]: value })
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

    handleInputChange("category", newCategory.trim())
    setNewCategory("")
    setShowNewCategoryInput(false)
  }

  const handleSponsoredChange = (checked: boolean) => {
    handleInputChange("is_sponsored", checked)

    // If not sponsored, reset sponsor ID
    if (!checked) {
      handleInputChange("sponsorId", null)
    }
  }

  const handleSponsorChange = (selectedSponsorId: string) => {
    const id = parseInt(selectedSponsorId)
    setSponsorId(id)

    // Get the selected sponsor's logo URL
    const selectedSponsor = sponsors.find((sponsor) => sponsor.id === id)
    const logoUrl = selectedSponsor ? selectedSponsor.logo_url : null

    handleInputChange("sponsorId", id)
    handleInputChange("sponsorLogo", logoUrl)
  }

  return (
    <div>
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
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-md border-white/10 text-white">
                  {categories.map((category) => (
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
            onValueChange={(value) => handleInputChange("difficulty", value)}
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

        <div className="flex flex-col gap-1">
          <div className="flex items-center space-x-2">
            <Switch
              id="sponsored"
              checked={!!editedLesson.is_sponsored}
              onCheckedChange={handleSponsoredChange}
            />
            <Label htmlFor="sponsored">Sponsored Lesson</Label>
          </div>
          {/* Hide bonus lesson for now
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
        </div> */}

          {editedLesson.is_sponsored && (
            <div className="space-y-2">
              <Select
                value={sponsorId?.toString() || ""}
                onValueChange={handleSponsorChange}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select a sponsor" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-md border-white/10 text-white">
                  {sponsors.map((sponsor) => (
                    <SelectItem key={sponsor.id} value={sponsor.id.toString()}>
                      {sponsor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Show the selected sponsor's logo if available */}
              {sponsorId && (
                <div className="p-4 bg-white/5 rounded-md mt-2">
                  {sponsors.find((s) => s.id === sponsorId)?.logo_url ? (
                    <img
                      src={sponsors.find((s) => s.id === sponsorId)?.logo_url}
                      alt={`${
                        sponsors.find((s) => s.id === sponsorId)?.name
                      } logo`}
                      className="h-12 object-contain mx-auto"
                    />
                  ) : (
                    <div className="text-center text-sm text-white/50 flex items-center justify-center">
                      <AlertCircle size={16} className="mr-2" />
                      No logo available for this sponsor
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={editedLesson.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>
    </div>
  )
}
