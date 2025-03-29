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

export const BasicDetails = ({
  editedLesson,
  handleInputChange,
  showNewCategoryInput,
  setNewCategory,
  handleAddCategory,
  categories,
  availableIcons,
  selectedIconName,
  handleIconChange,
  handleSponsoredChange,
  handleSponsorChange,
  sponsors,
  sponsorId,
  setShowNewCategoryInput,
  newCategory,
}: {
  editedLesson: LessonType
  handleInputChange: (field: string, value: any) => void
  showNewCategoryInput: boolean
  setNewCategory: (value: string) => void
  handleAddCategory: () => void
  categories: string[]
  availableIcons: { name: string; component: React.ReactNode }[]
  selectedIconName: string
  handleIconChange: (value: string) => void
  handleSponsoredChange: (value: boolean) => void
  handleSponsorChange: (value: string) => void
  sponsors: { id: number; name: string; logo_url: string }[]
  sponsorId: number | null
  setShowNewCategoryInput: (value: boolean) => void
  newCategory: string
}) => {
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
                      alt="Sponsor Logo"
                      className="h-12 object-contain mx-auto"
                    />
                  ) : (
                    <div className="text-white/50 text-center">
                      <AlertCircle size={16} className="inline-block mr-2" />
                      No logo available for this sponsor
                    </div>
                  )}
                </div>
              )}
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
    </div>
  )
}
