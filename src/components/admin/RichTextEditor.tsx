
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link, 
  Image, 
  Code, 
  Heading1, 
  Heading2, 
  PanelLeftClose,
  Upload,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export const RichTextEditor = ({ initialContent, onChange }: RichTextEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [htmlMode, setHtmlMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Link dialog state
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  
  // Image dialog state
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    if (editorRef.current && !htmlMode) {
      editorRef.current.innerHTML = content;
    }
  }, [htmlMode, content]);
  
  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };
  
  const execCommand = (command: string, showUI: boolean = false, value?: string) => {
    document.execCommand(command, showUI, value);
    handleContentChange();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };
  
  // Link functionality
  const openLinkDialog = () => {
    const selection = window.getSelection();
    const hasSelectedText = selection && selection.toString().length > 0;
    setHasSelection(hasSelectedText);
    
    if (hasSelectedText) {
      setLinkText(selection.toString());
    } else {
      setLinkText("");
    }
    setLinkUrl("");
    setShowLinkDialog(true);
  };
  
  const insertLink = () => {
    if (!linkUrl) return;
    
    if (hasSelection) {
      execCommand('createLink', false, linkUrl);
    } else if (linkText) {
      // First insert the text, then select it and create the link
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
      const textNode = document.createTextNode(linkText);
      range.insertNode(textNode);
      
      range.selectNodeContents(textNode);
      sel.removeAllRanges();
      sel.addRange(range);
      
      execCommand('createLink', false, linkUrl);
    }
    
    setShowLinkDialog(false);
    handleContentChange();
  };
  
  // Image functionality
  const openImageDialog = () => {
    setImageUrl("");
    setShowImageDialog(true);
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Mock file upload - in a real app, this would upload to a server/CDN
    setUploading(true);
    try {
      // This is a simplified mock of an image upload
      // In a real application, this would be an API call to upload the image
      // and return a URL
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
      
      // Create a local object URL for demo purposes
      // In production, this would be replaced with the URL from your server
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      
      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const insertImage = () => {
    if (!imageUrl) return;
    
    if (editorRef.current) {
      const imgHtml = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%;" />`;
      document.execCommand('insertHTML', false, imgHtml);
      handleContentChange();
    }
    
    setShowImageDialog(false);
  };
  
  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onChange(e.target.value);
  };
  
  const ToolbarButton = ({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
      onClick={onClick}
      title={title}
    >
      {icon}
    </Button>
  );
  
  return (
    <div className="w-full bg-black/30">
      <Tabs defaultValue="visual" onValueChange={(val) => setHtmlMode(val === 'html')}>
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
            <ToolbarButton onClick={() => execCommand('bold')} icon={<Bold size={14} />} title="Bold" />
            <ToolbarButton onClick={() => execCommand('italic')} icon={<Italic size={14} />} title="Italic" />
            <ToolbarButton onClick={() => execCommand('underline')} icon={<Underline size={14} />} title="Underline" />
            
            <div className="h-6 w-px bg-white/10 mx-1"></div>
            
            <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={<List size={14} />} title="Bullet List" />
            <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={<ListOrdered size={14} />} title="Numbered List" />
            
            <div className="h-6 w-px bg-white/10 mx-1"></div>
            
            <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={<AlignLeft size={14} />} title="Align Left" />
            <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={<AlignCenter size={14} />} title="Align Center" />
            <ToolbarButton onClick={() => execCommand('justifyRight')} icon={<AlignRight size={14} />} title="Align Right" />
            
            <div className="h-6 w-px bg-white/10 mx-1"></div>
            
            <ToolbarButton onClick={openLinkDialog} icon={<Link size={14} />} title="Insert Link" />
            <ToolbarButton onClick={openImageDialog} icon={<Image size={14} />} title="Insert Image" />
            <ToolbarButton onClick={() => execCommand('formatBlock', false, '<pre>')} icon={<Code size={14} />} title="Code Block" />
            
            <div className="h-6 w-px bg-white/10 mx-1"></div>
            
            <ToolbarButton onClick={() => execCommand('formatBlock', false, '<h1>')} icon={<Heading1 size={14} />} title="Heading 1" />
            <ToolbarButton onClick={() => execCommand('formatBlock', false, '<h2>')} icon={<Heading2 size={14} />} title="Heading 2" />
          </div>
          
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[300px] p-4 text-white focus:outline-none"
            onInput={handleContentChange}
            onBlur={handleContentChange}
          />
        </TabsContent>
        
        <TabsContent value="html" className="mt-0">
          <textarea
            className="w-full min-h-[356px] p-4 bg-black/10 text-white font-mono text-sm focus:outline-none border-0"
            value={content}
            onChange={handleHtmlChange}
          />
        </TabsContent>
      </Tabs>
      
      {/* Hidden file input for image upload */}
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!hasSelection && (
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
            <Button onClick={insertLink} disabled={!linkUrl || (!hasSelection && !linkText)}>
              <Link size={16} className="mr-2" />
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
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button
              variant="outline"
              onClick={triggerFileInput}
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
                  <span className="text-xs text-white/60">JPEG, PNG, GIF up to 10MB</span>
                </>
              )}
            </Button>
            
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
                      description: "Could not load the image from the provided URL",
                      variant: "destructive"
                    });
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
              <Image size={16} className="mr-2" />
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
