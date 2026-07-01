import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Search,
  Upload,
  FolderPlus,
  FileText,
  File,
  Image,
  FileSpreadsheet,
  FileCode,
  Star,
  BookOpen,
  MessageCircle,
  Sparkles,
  MoreVertical,
  X,
  Plus,
  LayoutList,
  Grid3x3,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";

interface FileItem {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt" | "md" | "png" | "jpg" | "ai-note";
  size: string;
  date: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  aiSummary?: string;
  lastOpened?: string;
  folder?: string;
}

const FileCard = ({ file, onFileClick, onToggleFavorite }: { file: FileItem; onFileClick: (file: FileItem) => void; onToggleFavorite: (id: string) => void }) => {
  const getFileIcon = () => {
    switch (file.type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-400" />;
      case "docx":
        return <FileSpreadsheet className="h-8 w-8 text-blue-400" />;
      case "txt":
        return <File className="h-8 w-8 text-gray-400" />;
      case "md":
        return <FileCode className="h-8 w-8 text-purple-400" />;
      case "png":
      case "jpg":
        return <Image className="h-8 w-8 text-green-400" />;
      case "ai-note":
        return <Sparkles className="h-8 w-8 text-yellow-400" />;
      default:
        return <File className="h-8 w-8 text-gray-400" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-blue-500/30"
      onClick={() => onFileClick(file)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getFileIcon()}
          <div>
            <h3 className="line-clamp-1 text-sm font-medium text-white">{file.name}</h3>
            <p className="text-xs text-gray-400">{file.size} · {file.date}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(event) => { event.stopPropagation(); onToggleFavorite(file.id); }}>
            <Star className={`h-3.5 w-3.5 ${file.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreVertical className="h-3.5 w-3.5 text-gray-400" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {file.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="border-0 bg-blue-500/10 text-xs text-blue-400">{tag}</Badge>
        ))}
        {file.tags.length > 2 && <Badge variant="secondary" className="border-0 bg-white/5 text-xs text-gray-400">+{file.tags.length - 2}</Badge>}
        {file.type === "ai-note" && <Badge variant="outline" className="border-yellow-400/30 bg-yellow-400/10 text-xs text-yellow-400">✨ AI</Badge>}
      </div>

      <div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-gray-400 hover:text-white">
          <BookOpen className="h-3 w-3" /> AI Read
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-gray-400 hover:text-white">
          <MessageCircle className="h-3 w-3" /> Chat
        </Button>
      </div>
    </motion.div>
  );
};

export default function FilesNotes() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Physics Notes.pdf",
      type: "pdf",
      size: "2.4 MB",
      date: "Today",
      tags: ["Physics", "Thermodynamics"],
      isFavorite: true,
      isArchived: false,
      aiSummary: "This PDF covers Thermodynamics, Chapter 5. Key topics: Entropy, Heat Engines, and Carnot Cycle.",
      lastOpened: "Today, 9:30 AM",
      folder: "Physics_2026",
    },
    {
      id: "2",
      name: "Chapter 5 Summary",
      type: "ai-note",
      size: "12 KB",
      date: "Today",
      tags: ["Physics", "AI Generated"],
      isFavorite: false,
      isArchived: false,
      aiSummary: "Summary of Chapter 5: Thermodynamics. Entropy increases in isolated systems.",
      lastOpened: "Today, 9:45 AM",
      folder: "AI Notes",
    },
    {
      id: "3",
      name: "Maths Formulas.docx",
      type: "docx",
      size: "812 KB",
      date: "Yesterday",
      tags: ["Maths", "Formulas"],
      isFavorite: false,
      isArchived: false,
    },
    {
      id: "4",
      name: "Chemistry Lab.pdf",
      type: "pdf",
      size: "5.1 MB",
      date: "Sat",
      tags: ["Chemistry", "Lab"],
      isFavorite: false,
      isArchived: true,
    },
    {
      id: "5",
      name: "English Essay.txt",
      type: "txt",
      size: "8 KB",
      date: "Last week",
      tags: ["English", "Essay"],
      isFavorite: false,
      isArchived: false,
    },
    {
      id: "6",
      name: "Project Idea.md",
      type: "md",
      size: "12 KB",
      date: "Mon",
      tags: ["Project", "AI"],
      isFavorite: true,
      isArchived: false,
    },
  ]);

  const allTags = ["All", "PDFs", "AI Notes", "Favorites", "Archived", "Physics", "Maths", "English", "Chemistry", "AI"];

  const filteredFiles = (() => {
    let filtered = files;

    switch (selectedTag) {
      case "PDFs":
        filtered = filtered.filter((file) => file.type === "pdf");
        break;
      case "AI Notes":
        filtered = filtered.filter((file) => file.type === "ai-note");
        break;
      case "Favorites":
        filtered = filtered.filter((file) => file.isFavorite);
        break;
      case "Archived":
        filtered = filtered.filter((file) => file.isArchived);
        break;
      default:
        if (selectedTag !== "All") {
          filtered = filtered.filter((file) => file.tags.includes(selectedTag));
        }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((file) => file.name.toLowerCase().includes(query) || file.tags.some((tag) => tag.toLowerCase().includes(query)) || (file.aiSummary && file.aiSummary.toLowerCase().includes(query)));
    }

    return filtered;
  })();

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
    setIsSidebarOpen(true);
  };

  const handleToggleFavorite = (id: string) => {
    setFiles((current) => current.map((file) => (file.id === id ? { ...file, isFavorite: !file.isFavorite } : file)));
  };

  return (
    <PageShell>
      <PageHeader title="Files & AI Knowledge Base" subtitle="Search, organize, and ask JARVIS about your notes." icon={<FileText className="h-5 w-5" />} />

      <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }} className="mt-6 space-y-6">
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.3 } } }}>
          <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input placeholder="Search files, notes & AI summaries..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
                    <Upload className="h-4 w-4" /> Upload
                  </Button>
                  <Button variant="outline" className="gap-2 border-white/10 text-gray-400 hover:border-white/20 hover:text-white">
                    <FolderPlus className="h-4 w-4" /> New Folder
                  </Button>
                  <Button variant="outline" className="gap-2 border-white/10 text-gray-400 hover:border-white/20 hover:text-white">
                    <Sparkles className="h-4 w-4" /> Create AI Note
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                    {viewMode === "grid" ? <LayoutList className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.3 } } }}>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Button key={tag} variant={selectedTag === tag ? "default" : "outline"} size="sm" className={selectedTag === tag ? "bg-blue-500 hover:bg-blue-600" : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"} onClick={() => setSelectedTag(tag)}>
                {tag}
              </Button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.3 } } }}>
          {filteredFiles.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
              <File className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <p className="text-gray-400">No files found. Upload a file or create an AI note.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {filteredFiles.map((file) => (
                <FileCard key={file.id} file={file} onFileClick={handleFileClick} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full overflow-y-auto border-l border-white/10 bg-black/95 text-white sm:w-[400px]">
          {selectedFile && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="flex items-start justify-between text-white">
                  <span className="line-clamp-2 text-lg font-semibold">{selectedFile.name}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="flex flex-wrap gap-2">
                  {selectedFile.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="border-0 bg-blue-500/10 text-blue-400">{tag}</Badge>
                  ))}
                  {selectedFile.type === "ai-note" && <Badge variant="outline" className="border-yellow-400/30 bg-yellow-400/10 text-yellow-400">✨ AI Generated</Badge>}
                </div>

                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="mb-1 text-xs font-medium text-blue-400">🤖 AI Summary</p>
                  <p className="text-sm leading-relaxed text-gray-300">{selectedFile.aiSummary || "No summary available. Upload a file to generate AI insights."}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Size</span><span className="text-white">{selectedFile.size}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Last Opened</span><span className="text-white">{selectedFile.lastOpened || "Never"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Folder</span><span className="text-white">{selectedFile.folder || "Root"}</span></div>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4">
                  <Button className="w-full justify-start gap-2 bg-blue-500 hover:bg-blue-600">
                    <MessageCircle className="h-4 w-4" /> Ask JARVIS about this file
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 border-white/10 text-gray-400 hover:border-white/20 hover:text-white">
                    <Sparkles className="h-4 w-4" /> Generate Flashcards
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 border-white/10 text-gray-400 hover:border-white/20 hover:text-white">
                    <Clock className="h-4 w-4" /> Add to Today&apos;s Routine
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
