
import { Input } from "@/components/ui/input";
import { Page } from "@/types/lesson";
import { RichTextEditor } from "../RichTextEditor";

interface PageEditorProps {
  currentPage: Page;
  onUpdatePage: (field: keyof Page, value: any) => void;
}

const PageEditor = ({ currentPage, onUpdatePage }: PageEditorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Page Title</label>
        <Input
          value={currentPage.title}
          onChange={(e) => onUpdatePage('title', e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
      
      <div className="flex flex-col gap-2 pt-4">
        <label className="text-sm font-medium">Content</label>
        <div className="border border-white/20 rounded-md overflow-hidden">
          <RichTextEditor
            initialContent={currentPage.content}
            onChange={(content) => onUpdatePage('content', content)}
          />
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
