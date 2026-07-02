import { useState, useEffect, useCallback } from "react";
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
  Trash2,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";
import { toast } from "sonner";

// ==================== TYPES ====================
interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  aiSummary?: string;
  lastOpened?: string;
  folder?: string;
  path?: string;
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  folder: string;
  created_at: string;
  updated_at: string;
}

// ==================== API BASE ====================
const API_BASE = "http://127.0.0.1:8000";
async function apiFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || "API error");
  }
  return res.json();
}

// ==================== FILE CARD ====================
const FileCard = ({
  file,
  onFileClick,
  onToggleFavorite,
  onDelete,
}: {
  file: FileItem;
  onFileClick: (file: FileItem) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
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
      case "jpeg":
        return <Image className="h-8 w-8 text-green-400" />;
      case "ai-note":
        return <Sparkles className="h-8 w-8 text-yellow-400" />;
      default:
        return <File className="h-8 w-8 text-gray-400" />;
    }
  };

  const sizeStr = file.size < 1024 ? `${file.size} B` : file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1048576).toFixed(1)} MB`;

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
            <p className="text-xs text-gray-400">{sizeStr} · {file.date}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(file.id);
            }}
          >
            <Star
              className={`h-3.5 w-3.5 ${
                file.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {file.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="border-0 bg-blue-500/10 text-xs text-blue-400">
            {tag}
          </Badge>
        ))}
        {file.tags.length > 2 && (
          <Badge variant="secondary" className="border-0 bg-white/5 text-xs text-gray-400">
            +{file.tags.length - 2}
          </Badge>
        )}
        {file.type === "ai-note" && (
          <Badge variant="outline" className="border-yellow-400/30 bg-yellow-400/10 text-xs text-yellow-400">
            ✨ AI
          </Badge>
        )}
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

// ==================== MAIN PAGE ====================
export default function FilesNotes() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  // --- Folder creation ---
  const [folderName, setFolderName] = useState("");
  const [showFolderDialog, setShowFolderDialog] = useState(false);

  // Load files and notes
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [filesData, notesData] = await Promise.all([
        apiFetch("/api/files"),
        apiFetch("/api/notes"),
      ]);
      setFiles(filesData || []);
      setNotes(notesData || []);
    } catch (err) {
      toast.error("Failed to load files and notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Upload file
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const result = await apiFetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      toast.success("File uploaded successfully");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Delete file
  const handleDeleteFile = async (id: string) => {
    if (!confirm("Delete this file permanently?")) return;
    try {
      await apiFetch(`/api/files/${id}`, { method: "DELETE" });
      toast.success("File deleted");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (id: string) => {
    const file = files.find((f) => f.id === id);
    if (!file) return;
    try {
      await apiFetch(`/api/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !file.isFavorite }),
      });
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    }
  };

  // Create AI note
  const handleCreateNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast.warning("Please fill in both title and content.");
      return;
    }
    try {
      await apiFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newNoteTitle,
          content: newNoteContent,
          tags: ["AI Generated"],
        }),
      });
      toast.success("Note created");
      setNewNoteTitle("");
      setNewNoteContent("");
      setShowNewNoteDialog(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create note");
    }
  };

  // === NEW: Create Folder ===
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.warning("Please enter a folder name.");
      return;
    }
    try {
      await apiFetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName }),
      });
      toast.success(`Folder "${folderName}" created`);
      setFolderName("");
      setShowFolderDialog(false);
      // Optionally, you could refresh a folder list here
    } catch (err: any) {
      toast.error(err.message || "Failed to create folder");
    }
  };

  // Combine files and notes into unified items for display
  const allItems: FileItem[] = [
    ...files,
    ...notes.map((note) => ({
      id: note.id,
      name: note.title + ".ai-note",
      type: "ai-note",
      size: note.content.length,
      date: new Date(note.created_at).toLocaleDateString(),
      tags: note.tags || [],
      isFavorite: note.isFavorite || false,
      isArchived: false,
      aiSummary: note.content.slice(0, 200) + "...",
      folder: note.folder || "AI Notes",
      lastOpened: new Date(note.updated_at).toLocaleString(),
    })),
  ];

  // Filtering
  const allTags = [
    "All",
    "PDFs",
    "AI Notes",
    "Favorites",
    "Archived",
    ...new Set(allItems.flatMap((i) => i.tags)),
  ];

  const filteredItems = (() => {
    let filtered = allItems;

    switch (selectedTag) {
      case "PDFs":
        filtered = filtered.filter((item) => item.type === "pdf");
        break;
      case "AI Notes":
        filtered = filtered.filter((item) => item.type === "ai-note");
        break;
      case "Favorites":
        filtered = filtered.filter((item) => item.isFavorite);
        break;
      case "Archived":
        filtered = filtered.filter((item) => item.isArchived);
        break;
      default:
        if (selectedTag !== "All") {
          filtered = filtered.filter((item) =>
            item.tags.some((tag) => tag === selectedTag)
          );
        }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          (item.aiSummary && item.aiSummary.toLowerCase().includes(q))
      );
    }
    return filtered;
  })();

  return (
    <PageShell>
      <PageHeader
        title="Files & AI Knowledge Base"
        subtitle="Search, organize, and ask JARVIS about your notes."
        icon={<FileText className="h-5 w-5" />}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 },
          },
        }}
        className="mt-6 space-y-6"
      >
        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search files, notes & AI summaries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Upload Button */}
                  <Button
                    className="gap-2 bg-blue-500 hover:bg-blue-600"
                    disabled={uploading}
                    asChild
                  >
                    <label className="cursor-pointer">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploading ? "Uploading..." : "Upload"}
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                      />
                    </label>
                  </Button>

                  {/* New Folder Button – opens dialog */}
                  <Button
                    variant="outline"
                    className="gap-2 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    onClick={() => setShowFolderDialog(true)}
                  >
                    <FolderPlus className="h-4 w-4" /> New Folder
                  </Button>

                  {/* AI Note Dialog */}
                  <Dialog
                    open={showNewNoteDialog}
                    onOpenChange={setShowNewNoteDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-2 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                      >
                        <Sparkles className="h-4 w-4" /> Create AI Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          ✨ New AI Note
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          placeholder="Note title"
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                        <textarea
                          className="w-full min-h-[120px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Write your note content..."
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setShowNewNoteDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-blue-500 hover:bg-blue-600"
                          onClick={handleCreateNote}
                        >
                          Create Note
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* View mode toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "list" : "grid")
                    }
                  >
                    {viewMode === "grid" ? (
                      <LayoutList className="h-4 w-4" />
                    ) : (
                      <Grid3x3 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                className={
                  selectedTag === tag
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
          transition={{ duration: 0.3 }}
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
              <File className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <p className="text-gray-400">
                No files found. Upload a file or create an AI note.
              </p>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredItems.map((item) => (
                <FileCard
                  key={item.id}
                  file={item}
                  onFileClick={setSelectedFile}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteFile}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full overflow-y-auto border-l border-white/10 bg-black/95 text-white sm:w-[400px]">
          {selectedFile && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="flex items-start justify-between text-white">
                  <span className="line-clamp-2 text-lg font-semibold">
                    {selectedFile.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="flex flex-wrap gap-2">
                  {selectedFile.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="border-0 bg-blue-500/10 text-blue-400"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {selectedFile.type === "ai-note" && (
                    <Badge
                      variant="outline"
                      className="border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
                    >
                      ✨ AI Generated
                    </Badge>
                  )}
                </div>

                {selectedFile.aiSummary && (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                    <p className="mb-1 text-xs font-medium text-blue-400">
                      🤖 AI Summary
                    </p>
                    <p className="text-sm leading-relaxed text-gray-300">
                      {selectedFile.aiSummary}
                    </p>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size</span>
                    <span className="text-white">
                      {selectedFile.size < 1024
                        ? `${selectedFile.size} B`
                        : selectedFile.size < 1048576
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                        : `${(selectedFile.size / 1048576).toFixed(1)} MB`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Opened</span>
                    <span className="text-white">
                      {selectedFile.lastOpened || "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Folder</span>
                    <span className="text-white">
                      {selectedFile.folder || "Root"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4">
                  <Button className="w-full justify-start gap-2 bg-blue-500 hover:bg-blue-600">
                    <MessageCircle className="h-4 w-4" /> Ask JARVIS about this
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  >
                    <Sparkles className="h-4 w-4" /> Generate Flashcards
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  >
                    <Clock className="h-4 w-4" /> Add to Today&apos;s Routine
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* === NEW: Folder Creation Dialog === */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent className="bg-slate-950 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">📁 New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowFolderDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}