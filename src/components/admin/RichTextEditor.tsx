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
  Table as TableIcon,
  SquareMenu,
  SquarePlus,
  SquareMinus,
  Trash2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TiptapLink from "@tiptap/extension-link"
import TiptapImage from "@tiptap/extension-image"
import UnderlineExtension from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import { imageService } from "@/services/imageService"

// Toolbar Button Component
interface ToolbarButtonProps {
  onClick: () => void
  icon: React.ReactNode
  title: string
  isActive?: boolean
}

const ToolbarButton = ({
  onClick,
  icon,
  title,
  isActive = false,
}: ToolbarButtonProps) => {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={`h-7 w-7 rounded-md p-0 text-white/70 hover:bg-white/10 hover:text-white ${
        isActive ? "bg-white/10 text-white" : ""
      }`}
      onClick={onClick}
      title={title}
    >
      {icon}
    </Button>
  )
}

// Table Button Dropdown Component
interface TableDropdownProps {
  editor: Editor
}

const TableDropdown = ({ editor }: TableDropdownProps) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run()

    setShowDropdown(false)
  }

  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run()
  }

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run()
  }

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run()
  }

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run()
  }

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run()
  }

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run()
  }

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run()
  }

  const toggleHeaderColumn = () => {
    editor.chain().focus().toggleHeaderColumn().run()
  }

  const toggleHeaderRow = () => {
    editor.chain().focus().toggleHeaderRow().run()
  }

  const toggleHeaderCell = () => {
    editor.chain().focus().toggleHeaderCell().run()
  }

  const isInTable = editor.isActive("table")

  return (
    <div className="relative">
      <ToolbarButton
        onClick={() => setShowDropdown(!showDropdown)}
        icon={<TableIcon size={14} />}
        title="Table"
        isActive={isInTable}
      />

      {showDropdown && (
        <div className="absolute z-10 mt-1 bg-[#1E222B] border border-white/10 rounded-md shadow-lg py-1 w-48">
          {!isInTable ? (
            <div className="p-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/70">Rows:</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value) || 2)}
                  className="w-16 h-6 bg-black/20 border-white/10 text-white text-xs"
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/70">Columns:</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value) || 2)}
                  className="w-16 h-6 bg-black/20 border-white/10 text-white text-xs"
                />
              </div>
              <Button
                size="sm"
                className="w-full mt-1 bg-white/10 hover:bg-white/20 text-white text-xs"
                onClick={insertTable}
              >
                Insert Table
              </Button>
            </div>
          ) : (
            <div>
              <div className="px-1">
                <p className="px-2 py-1 text-xs text-white/50">Columns</p>
                <button
                  onClick={addColumnBefore}
                  className="flex items-center w-full px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <SquarePlus size={12} className="mr-2" /> Add Column Before
                </button>
                <button
                  onClick={addColumnAfter}
                  className="flex items-center w-full px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <SquarePlus size={12} className="mr-2" /> Add Column After
                </button>
                <button
                  onClick={deleteColumn}
                  className="flex items-center w-full px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <SquareMinus size={12} className="mr-2" /> Delete Column
                </button>
              </div>

              <div className="border-t border-white/10 mt-1 pt-1 px-1">
                <p className="px-2 py-1 text-xs text-white/50">Rows</p>
                <button
                  onClick={addRowBefore}
                  className="flex items-center w-full px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <SquarePlus size={12} className="mr-2" /> Add Row Before
                </button>
                <button
                  onClick={addRowAfter}
                  className="flex items-center w-full px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <SquarePlus size={12} className="mr-2" /> Add Row After
                </button>
                <button
                  onClick={deleteRow}
                  className="flex items-center w-full px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <SquareMinus size={12} className="mr-2" /> Delete Row
                </button>
              </div>

              <div className="border-t border-white/10 mt-1 pt-1 px-1">
                <p className="px-2 py-1 text-xs text-white/50">Headers</p>
                <button
                  onClick={toggleHeaderRow}
                  className="flex items-center w-full px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <SquareMenu size={12} className="mr-2" /> Toggle Header Row
                </button>
                <button
                  onClick={toggleHeaderColumn}
                  className="flex items-center w-full px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <SquareMenu size={12} className="mr-2" /> Toggle Header Column
                </button>
                <button
                  onClick={toggleHeaderCell}
                  className="flex items-center w-full px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  <SquareMenu size={12} className="mr-2" /> Toggle Header Cell
                </button>
              </div>

              <div className="border-t border-white/10 mt-1 pt-1 px-1">
                <button
                  onClick={deleteTable}
                  className="flex items-center w-full px-2 py-1 text-xs text-red-500 hover:bg-white/10"
                >
                  <Trash2 size={12} className="mr-2" /> Delete Table
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Editor Toolbar Component
interface EditorToolbarProps {
  editor: Editor
  openLinkDialog: () => void
  openImageDialog: () => void
}

const EditorToolbar = ({
  editor,
  openLinkDialog,
  openImageDialog,
}: EditorToolbarProps) => {
  if (!editor) {
    return null
  }

  return (
    <div className="px-2 py-1 bg-black/20 border-b border-white/10 flex flex-wrap gap-1">
      {/* Text formatting */}
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

      {/* Lists */}
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

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        icon={<AlignLeft size={14} />}
        title="Align Left"
        isActive={editor.isActive({ textAlign: "left" })}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
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

      {/* Special elements */}
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

      {/* Table dropdown */}
      <TableDropdown editor={editor} />

      <div className="h-6 w-px bg-white/10 mx-1"></div>

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        icon={<Heading1 size={14} />}
        title="Heading 1"
        isActive={editor.isActive("heading", { level: 1 })}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        icon={<Heading2 size={14} />}
        title="Heading 2"
        isActive={editor.isActive("heading", { level: 2 })}
      />
    </div>
  )
}

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
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border-b border-white/20",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border-b border-white/20 bg-white/10 font-bold text-left p-2",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-white/20 p-2",
        },
      }),
    ],
    content: initialContent,
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
      const { from, to } = editor.state.selection
      editor.commands.setContent(initialContent)

      // Wait for the next tick to restore selection
      setTimeout(() => {
        try {
          editor.commands.setTextSelection({ from, to })
        } catch (e) {
          editor.commands.focus()
        }
      }, 0)
    }
  }, [editor, initialContent])

  // Handle HTML mode changes with improved cursor handling
  useEffect(() => {
    if (!htmlMode && editor) {
      const { from, to } = editor.state.selection
      editor.commands.setContent(htmlContent)

      // Wait for the next tick to restore selection
      setTimeout(() => {
        try {
          editor.commands.setTextSelection({ from, to })
        } catch (e) {
          editor.commands.focus()
        }
      }, 0)
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

    setUploading(true)
    try {
      // Upload the image using the image service
      const imageUrl = await imageService.uploadImage(file)

      // Set the image URL
      setImageUrl(imageUrl)
      
      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully to Supabase storage",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
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
          <EditorToolbar
            editor={editor}
            openLinkDialog={openLinkDialog}
            openImageDialog={openImageDialog}
          />

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
