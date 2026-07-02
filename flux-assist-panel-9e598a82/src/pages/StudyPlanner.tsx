import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  GripVertical,
  Pencil,
  Mic,
  MicOff,
  Check,
  X,
  Trash2,
  Plus,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Send,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";
import { toast } from "sonner";

// ==================== API BASE ====================
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function apiFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || "API error");
  }
  return res.json();
}

// ==================== TYPES ====================
interface Session {
  id: string;
  time: string;
  subject: string;
  task: string;
}

// ==================== SORTABLE ROW ====================
const SortableRow = ({
  session,
  onEdit,
  onDelete,
}: {
  session: Session;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-12 items-center gap-2 rounded-lg border border-white/5 p-3 transition-colors hover:bg-white/5 ${
        isDragging ? "shadow-lg shadow-blue-500/20" : ""
      }`}
    >
      <div className="col-span-1 flex justify-center">
        <button {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <div className="col-span-2 text-sm font-medium text-white/80">{session.time}</div>
      <div className="col-span-3 text-sm font-medium">{session.subject}</div>
      <div className="col-span-4 text-sm text-gray-400">{session.task}</div>
      <div className="col-span-2 flex justify-end gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(session.id)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-500" onClick={() => onDelete(session.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function StudyPlanner() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState("today");

  // === State ===
  const [sessions, setSessions] = useState<Session[]>([]);
  const [chapters, setChapters] = useState(2);
  const [questions, setQuestions] = useState(30);
  const [hours, setHours] = useState(3);
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [readAloud, setReadAloud] = useState(true);
  const [remindBefore, setRemindBefore] = useState(true);
  const [pushOnSkip, setPushOnSkip] = useState(false);
  const [loading, setLoading] = useState(true);

  // Voice / command input
  const [command, setCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // === Dialog states ===
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editTask, setEditTask] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newTask, setNewTask] = useState("");

  const [suggestionVisible, setSuggestionVisible] = useState(true);

  // ========== Alarm & Notification Timers ==========
  const [scheduleReadTimer, setScheduleReadTimer] = useState<NodeJS.Timeout | null>(null);
  const [reminderTimer, setReminderTimer] = useState<NodeJS.Timeout | null>(null);
  const [notificationTimer, setNotificationTimer] = useState<NodeJS.Timeout | null>(null);

  // ========== Load Data ==========
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/study/plan");
      setSessions(data.sessions || []);
      setChapters(data.chapters ?? 2);
      setQuestions(data.questions ?? 30);
      setHours(data.hours ?? 3);
      setAutoAdjust(data.autoAdjust ?? true);
      setReadAloud(data.readAloud ?? true);
      setRemindBefore(data.remindBefore ?? true);
      setPushOnSkip(data.pushOnSkip ?? false);
    } catch (err) {
      toast.error("Failed to load study plan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========== Save Plan ==========
  const savePlan = async () => {
    try {
      await apiFetch("/api/study/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessions,
          chapters,
          questions,
          hours,
          autoAdjust,
          readAloud,
          remindBefore,
          pushOnSkip,
        }),
      });
      toast.success("Plan saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save plan");
    }
  };

  // ========== Session CRUD ==========
  const handleAddSession = async () => {
    if (!newTime || !newSubject || !newTask) {
      toast.warning("Please fill in all fields.");
      return;
    }
    const newSession: Session = {
      id: Date.now().toString(),
      time: newTime,
      subject: newSubject,
      task: newTask,
    };
    try {
      await apiFetch("/api/study/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });
      toast.success("Session added");
      setNewTime("");
      setNewSubject("");
      setNewTask("");
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add session");
    }
  };

  const handleEditSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    setEditingId(id);
    setEditTime(session.time);
    setEditSubject(session.subject);
    setEditTask(session.task);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editTime || !editSubject || !editTask) {
      toast.warning("Please fill in all fields.");
      return;
    }
    try {
      await apiFetch(`/api/study/sessions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          time: editTime,
          subject: editSubject,
          task: editTask,
        }),
      });
      toast.success("Session updated");
      setIsEditOpen(false);
      setEditingId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update session");
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    try {
      await apiFetch(`/api/study/sessions/${id}`, { method: "DELETE" });
      toast.success("Session deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete session");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sessions.findIndex((s) => s.id === String(active.id));
    const newIndex = sessions.findIndex((s) => s.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const newSessions = arrayMove(sessions, oldIndex, newIndex);
    setSessions(newSessions);
    // Save order to backend
    try {
      await apiFetch("/api/study/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessions: newSessions,
          chapters,
          questions,
          hours,
          autoAdjust,
          readAloud,
          remindBefore,
          pushOnSkip,
        }),
      });
    } catch (err) {
      toast.error("Failed to save new order");
    }
  };

  // ========== Voice / Speech Recognition ==========
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.warning("Speech recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCommand(transcript);
      // Auto-execute after a short delay
      setTimeout(() => handleVoiceCommand(transcript), 300);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Process voice/text command
  const handleVoiceCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    // Check for "add session" pattern
    const addMatch = lower.match(/add (?:a )?session (?:for )?(.+?) (?:at|from) (.+)/i);
    if (addMatch) {
      const subject = addMatch[1].trim();
      const time = addMatch[2].trim();
      // Auto-fill the add dialog
      setNewSubject(subject.charAt(0).toUpperCase() + subject.slice(1));
      setNewTime(time);
      setNewTask("Study " + subject);
      setIsAddOpen(true);
      toast.info(`📝 Adding session for ${subject} at ${time}`);
      setCommand("");
      return;
    }
    // Check for "read my schedule"
    if (lower.includes("read my schedule") || lower.includes("read schedule")) {
      speakSchedule();
      toast.info("🔊 Reading schedule aloud");
      setCommand("");
      return;
    }
    // Check for "set study plan"
    if (lower.includes("set my study plan") || lower.includes("create study plan")) {
      // Generate a default plan based on current targets
      toast.info("📅 Generating study plan...");
      // Could add AI-based generation here
      setCommand("");
      return;
    }
    toast.warning(`Command not recognized: "${cmd}"`);
    setCommand("");
  };

  // ========== Speak Schedule ==========
  const speakSchedule = () => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = "Here is your study schedule: ";
    sessions.forEach((s, i) => {
      utterance.text += `${i+1}. At ${s.time}, ${s.subject} - ${s.task}. `;
    });
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // ========== Read Aloud Toggle (repeated every 10s for 2min) ==========
  useEffect(() => {
    if (readAloud) {
      if (scheduleReadTimer) clearInterval(scheduleReadTimer);
      // Start reading every 10 seconds for 2 minutes
      let count = 0;
      const timer = setInterval(() => {
        if (count >= 12) { // 12 * 10 = 120 seconds (2 minutes)
          clearInterval(timer);
          setScheduleReadTimer(null);
          toast.info("🔊 Schedule reading finished.");
          return;
        }
        speakSchedule();
        count++;
      }, 10000);
      setScheduleReadTimer(timer);
    } else {
      if (scheduleReadTimer) {
        clearInterval(scheduleReadTimer);
        setScheduleReadTimer(null);
      }
    }
    return () => {
      if (scheduleReadTimer) clearInterval(scheduleReadTimer);
    };
  }, [readAloud, sessions]);

  // ========== Reminder Alarm (1 minute before each session) ==========
  const checkReminders = useCallback(() => {
    if (!remindBefore) return;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    sessions.forEach(session => {
      const timeParts = session.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeParts) return;
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const ampm = timeParts[3].toUpperCase();
      if (ampm === "PM" && hours !== 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      const sessionMinutes = hours * 60 + minutes;
      const diff = sessionMinutes - nowMinutes;
      // Trigger if within 0-1 minutes (i.e., now is exactly at session time or within next minute)
      if (diff >= 0 && diff <= 1) {
        // Play alarm sound
        const audio = new Audio("/alarm.mp3"); // you need to place an alarm.mp3 in public folder
        audio.play().catch(() => {});
        toast.warning(`⏰ ${session.subject} is starting now!`, { duration: 10000 });
      }
    });
  }, [sessions, remindBefore]);

  useEffect(() => {
    if (remindBefore) {
      if (reminderTimer) clearInterval(reminderTimer);
      const timer = setInterval(checkReminders, 10000); // check every 10 seconds
      setReminderTimer(timer);
    } else {
      if (reminderTimer) {
        clearInterval(reminderTimer);
        setReminderTimer(null);
      }
    }
    return () => {
      if (reminderTimer) clearInterval(reminderTimer);
    };
  }, [remindBefore, sessions, checkReminders]);

  // ========== Push Notifications (3 times every 10 sec) ==========
  const sendNotifications = useCallback(() => {
    if (!pushOnSkip) return;
    // Request permission if not granted
    if ("Notification" in window && Notification.permission === "granted") {
      let count = 0;
      const timer = setInterval(() => {
        if (count >= 3) {
          clearInterval(timer);
          setNotificationTimer(null);
          return;
        }
        new Notification("📚 JARVIS Study Reminder", {
          body: "Don't forget your study sessions!",
          icon: "/favicon.ico",
        });
        count++;
      }, 10000);
      setNotificationTimer(timer);
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, [pushOnSkip]);

  useEffect(() => {
    if (pushOnSkip) {
      sendNotifications();
    } else {
      if (notificationTimer) {
        clearInterval(notificationTimer);
        setNotificationTimer(null);
      }
    }
    return () => {
      if (notificationTimer) clearInterval(notificationTimer);
    };
  }, [pushOnSkip, sendNotifications]);

  // ========== Sensors ==========
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ========== UI ==========
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <PageShell>
      <PageHeader title="Study Planner" subtitle="Plan your day with smart scheduling and AI suggestions." icon={<span className="text-xl">📅</span>} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-2xl shadow-black/30"
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white" onClick={() => navigate({ to: "/" })}>
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
            <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
              📅 Smart Study Planner
            </h1>
          </motion.div>

          {/* Voice Command Bar */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="relative flex-1 w-full">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder='Say or type: "Jarvis, add Physics at 2 PM" or "read my schedule"'
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 pr-16"
                onKeyDown={(e) => e.key === "Enter" && handleVoiceCommand(command)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-full ${isListening ? "text-red-400" : "text-cyan-300"}`}
                  onClick={startListening}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-cyan-300"
                  onClick={() => handleVoiceCommand(command)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
              <TabsList className="w-full rounded-xl border border-white/10 bg-white/5 p-1 sm:w-auto">
                <TabsTrigger value="today" className="text-white data-[state=active]:bg-blue-500/20">📅 TODAY</TabsTrigger>
                <TabsTrigger value="ai" className="text-white data-[state=active]:bg-blue-500/20">🤖 AI SUGGEST</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Today / Schedule Tab */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">⏰ Today&apos;s Schedule</CardTitle>
                <div className="flex items-center gap-3">
                  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1 border-dashed border-white/20 text-gray-400 hover:border-white/40 hover:text-white">
                        <Plus className="h-4 w-4" /> Add Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-white">➕ New Session</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          placeholder="Time (e.g., 2:30 PM)"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Input
                          placeholder="Subject (e.g., Physics)"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Input
                          placeholder="Task"
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleAddSession}>Add</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-center text-gray-400 py-4">Loading...</p>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sessions.map((s) => s.id)}>
                      <div className="grid grid-cols-12 gap-2 border-b border-white/5 px-3 py-2 text-xs font-medium text-gray-400">
                        <div className="col-span-1" />
                        <div className="col-span-2">Time</div>
                        <div className="col-span-3">Subject</div>
                        <div className="col-span-4">Task</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      {sessions.map((session) => (
                        <SortableRow
                          key={session.id}
                          session={session}
                          onEdit={handleEditSession}
                          onDelete={handleDeleteSession}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Suggestions Tab */}
          {tabValue === "ai" && (
            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden rounded-xl border-l-4 border-blue-500 border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">💡 JARVIS Suggests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="leading-relaxed text-gray-200">
                    You studied Physics yesterday. Today, focus on Maths to balance your weekly schedule. I&apos;ve moved English to evening.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
                      <Check className="h-4 w-4" /> Accept Suggestion
                    </Button>
                    <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white" onClick={() => setSuggestionVisible(false)}>
                      <X className="h-4 w-4" /> Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Toggles */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-6 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 flex items-center gap-1">
                {readAloud ? <Volume2 className="h-4 w-4 text-cyan-300" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
                Read Schedule
              </span>
              <Switch checked={readAloud} onCheckedChange={setReadAloud} className="data-[state=checked]:bg-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 flex items-center gap-1">
                {remindBefore ? <Bell className="h-4 w-4 text-yellow-300" /> : <BellOff className="h-4 w-4 text-gray-500" />}
                Remind 5 min before
              </span>
              <Switch checked={remindBefore} onCheckedChange={setRemindBefore} className="data-[state=checked]:bg-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Send Push Notification</span>
              <Switch checked={pushOnSkip} onCheckedChange={setPushOnSkip} className="data-[state=checked]:bg-blue-500" />
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={savePlan}>
              💾 Save All
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-950 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">✏️ Edit Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              placeholder="Subject"
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              placeholder="Task"
              value={editTask}
              onChange={(e) => setEditTask(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}