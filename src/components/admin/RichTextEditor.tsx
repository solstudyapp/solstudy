
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  PanelLeftClose
} from "lucide-react";

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export const RichTextEditor = ({ initialContent, onChange }: RichTextEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [htmlMode, setHtmlMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
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
  
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', false, url);
    }
  };
  
  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', false, url);
    }
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
            
            <ToolbarButton onClick={insertLink} icon={<Link size={14} />} title="Insert Link" />
            <ToolbarButton onClick={insertImage} icon={<Image size={14} />} title="Insert Image" />
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
    </div>
  );
};
