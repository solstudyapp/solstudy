import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Heading1,
  Heading2,
  Upload,
  X,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TiptapLink from "@tiptap/extension-link"
import TiptapImage from "@tiptap/extension-image"
import UnderlineExtension from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"

interface RichTextEditorProps {
  initialContent: string
  onChange: (content: string) => void
}

export const RichTextEditor = ({
  initialContent,
  onChange,
}: RichTextEditorProps) => {
  const [htmlMode, setHtmlMode] = useState(false)
  const [htmlContent, setHtmlContent] = useState(initialContent)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const isUpdatingRef = useRef(false)

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "max-w-full",
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Prevent cursor jumps by using a flag to avoid multiple updates
      if (isUpdatingRef.current) return

      isUpdatingRef.current = true

      // Get the HTML content
      const html = editor.getHTML()

      // Only update state if content actually changed
      if (html !== htmlContent) {
        setHtmlContent(html)
        onChange(html)
      }

      // Reset the flag after a short delay to allow React to process the update
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 0)
    },
    autofocus: true,
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  })

  // Update editor content when initialContent changes, but only if it's different
  useEffect(() => {
    if (editor && !editor.isDestroyed && initialContent !== editor.getHTML()) {
      // Store current selection
      const { from, to } = editor.state.selection

      // Update content
      editor.commands.setContent(initialContent)

      // Try to restore cursor position if possible
      if (from && to) {
        try {
          editor.commands.setTextSelection({ from, to })
        } catch (e) {
          // If we can't restore the exact position, at least focus the editor
          editor.commands.focus()
        }
      }
    }
  }, [editor, initialContent])

  // Handle HTML mode changes with improved cursor handling
  useEffect(() => {
    if (!htmlMode && editor) {
      // Store current selection if possible before switching
      const selection = editor.state.selection
      const hasSelection = !selection.empty

      // Update content
      editor.commands.setContent(htmlContent)

      // Restore focus and try to restore selection
      editor.commands.focus()
      if (hasSelection) {
        try {
          editor.commands.setTextSelection(selection)
        } catch (e) {
          // Fallback if selection can't be restored
        }
      }
    }
  }, [htmlMode, htmlContent, editor])

  // Link dialog handlers
  const openLinkDialog = () => {
    if (!editor) return

    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, " ")

    setLinkText(selectedText)
    setLinkUrl("")
    setShowLinkDialog(true)
  }

  const insertLink = () => {
    if (!editor || !linkUrl) return

    if (editor.state.selection.empty && linkText) {
      // Insert new text with link
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
        )
        .run()
    } else {
      // Apply link to selection
      editor.chain().focus().setLink({ href: linkUrl, target: "_blank" }).run()
    }

    setShowLinkDialog(false)
    toast({
      title: "Link inserted",
      description: "The link has been added to your content",
    })
  }

  // Image dialog handlers
  const openImageDialog = () => {
    setImageUrl("")
    setShowImageDialog(true)
  }

  const insertImage = () => {
    if (!editor || !imageUrl) return

    editor
      .chain()
      .focus()
      .setImage({ src: imageUrl, alt: "Inserted image" })
      .run()

    setShowImageDialog(false)
    toast({
      title: "Image inserted",
      description: "The image has been added to your content",
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive",
      })
      return
    }

    // Mock file upload - in a real app, this would upload to a server/CDN
    setUploading(true)
    try {
      // This is a simplified mock of an image upload
      // In a real application, this would be an API call to upload the image
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate upload delay

      // Create a local object URL for demo purposes
      // In production, this would be replaced with the URL from your server
      const objectUrl = URL.createObjectURL(file)
      setImageUrl(objectUrl)

      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value)
    onChange(e.target.value)
  }

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    icon,
    title,
    isActive = false,
  }: {
    onClick: () => void
    icon: React.ReactNode
    title: string
    isActive?: boolean
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${
        isActive
          ? "bg-white/20 text-white"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
      onClick={(e) => {
        e.preventDefault()
        if (editor) editor.commands.focus()
        onClick()
      }}
      title={title}
    >
      {icon}
    </Button>
  )

  if (!editor) {
    return (
      <div className="min-h-[300px] bg-black/30 p-4">Loading editor...</div>
    )
  }

  return (
    <div className="w-full bg-black/30">
      <Tabs
        defaultValue="visual"
        onValueChange={(val) => setHtmlMode(val === "html")}
      >
        <div className="flex justify-between border-b border-white/10 px-2 bg-black/20">
          <TabsList className="bg-transparent">
            <TabsTrigger
              value="visual"
              className="data-[state=active]:bg-white/10 text-sm data-[state=inactive]:text-white/70"
            >
              Visual
            </TabsTrigger>
            <TabsTrigger
              value="html"
              className="data-[state=active]:bg-white/10 text-sm data-[state=inactive]:text-white/70"
            >
              HTML
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visual" className="mt-0">
          <div className="px-2 py-1 bg-black/20 border-b border-white/10 flex flex-wrap gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              icon={<Bold size={14} />}
              title="Bold"
              isActive={editor.isActive("bold")}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              icon={<Italic size={14} />}
              title="Italic"
              isActive={editor.isActive("italic")}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              icon={<UnderlineIcon size={14} />}
              title="Underline"
              isActive={editor.isActive("underline")}
            />

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              icon={<List size={14} />}
              title="Bullet List"
              isActive={editor.isActive("bulletList")}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              icon={<ListOrdered size={14} />}
              title="Numbered List"
              isActive={editor.isActive("orderedList")}
            />

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              icon={<AlignLeft size={14} />}
              title="Align Left"
              isActive={editor.isActive({ textAlign: "left" })}
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              icon={<AlignCenter size={14} />}
              title="Align Center"
              isActive={editor.isActive({ textAlign: "center" })}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              icon={<AlignRight size={14} />}
              title="Align Right"
              isActive={editor.isActive({ textAlign: "right" })}
            />

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <ToolbarButton
              onClick={() => {
                editor.commands.focus()
                openLinkDialog()
              }}
              icon={<LinkIcon size={14} />}
              title="Insert Link"
              isActive={editor.isActive("link")}
            />
            <ToolbarButton
              onClick={() => {
                editor.commands.focus()
                openImageDialog()
              }}
              icon={<ImageIcon size={14} />}
              title="Insert Image"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              icon={<Code size={14} />}
              title="Code Block"
              isActive={editor.isActive("codeBlock")}
            />

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              icon={<Heading1 size={14} />}
              title="Heading 1"
              isActive={editor.isActive("heading", { level: 1 })}
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              icon={<Heading2 size={14} />}
              title="Heading 2"
              isActive={editor.isActive("heading", { level: 2 })}
            />
          </div>

          <div className="min-h-[300px] p-4 text-white focus:outline-none rich-text-editor-content">
            <EditorContent
              editor={editor}
              className="prose prose-invert max-w-none min-h-[250px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="html" className="mt-0">
          <textarea
            className="w-full min-h-[356px] p-4 bg-black/10 text-white font-mono text-sm focus:outline-none border-0"
            value={htmlContent}
            onChange={handleHtmlChange}
          />
        </TabsContent>
      </Tabs>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription className="text-white/70">
              {editor && !editor.state.selection.empty
                ? "Add a link to the selected text"
                : "Create a new link"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editor && editor.state.selection.empty && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Link Text</label>
                <Input
                  placeholder="Text to display"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLinkDialog(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button
              onClick={insertLink}
              disabled={
                !linkUrl ||
                (editor && editor.state.selection.empty && !linkText)
              }
            >
              <LinkIcon size={16} className="mr-2" />
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription className="text-white/70">
              Upload an image or enter a URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
              className="w-full h-32 border-dashed border-2 border-white/20 text-white hover:bg-white/10 flex flex-col items-center justify-center gap-2"
              disabled={uploading}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin h-6 w-6 border-2 border-white border-opacity-20 border-t-white rounded-full mb-2"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <Upload size={24} />
                  <span>Click to upload an image</span>
                  <span className="text-xs text-white/60">
                    JPEG, PNG, GIF up to 10MB
                  </span>
                </>
              )}
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex items-center">
              <div className="w-full border-t border-white/10"></div>
              <span className="mx-2 text-white/60 text-sm">OR</span>
              <div className="w-full border-t border-white/10"></div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {imageUrl && (
              <div className="mt-4 border border-white/20 rounded p-2 bg-white/5">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-40 max-w-full mx-auto object-contain"
                  onError={() => {
                    toast({
                      title: "Error loading image",
                      description:
                        "Could not load the image from the provided URL",
                      variant: "destructive",
                    })
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImageDialog(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={insertImage} disabled={!imageUrl}>
              <ImageIcon size={16} className="mr-2" />
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
