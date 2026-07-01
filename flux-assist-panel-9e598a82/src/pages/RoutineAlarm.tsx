import { useState, useEffect, useRef } from "react";
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
  Plus,
  Trash2,
  Mic,
  Check,
  X,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

// ==================== TYPES ====================
interface RoutineSession {
  id: string;
  time: string;
  subject: string;
  task: string;
  isBreak?: boolean;
}

const STORAGE_KEY = "jarvis_routine_v1";

// ==================== SORTABLE ROW ====================
const SortableRow = ({
  session,
  onEdit,
  onDelete,
}: {
  session: RoutineSession;
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
export default function RoutineAlarm() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState("today");
  const [sessions, setSessions] = useState<RoutineSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      { id: "1", time: "7:00 AM", subject: "🛏️ Wake Up", task: "Morning Routine" },
      { id: "2", time: "8:00 AM", subject: "📖 Physics", task: "Chapter 5: Thermodynamics" },
      { id: "3", time: "9:30 AM", subject: "☕ Break", task: "Rest / Snack", isBreak: true },
      { id: "4", time: "10:00 AM", subject: "🧮 Maths", task: "Solve 20 Integration Qs" },
      { id: "5", time: "11:30 AM", subject: "🌐 English", task: "Read AI Reader PDF" },
    ];
  });

  const [wakeupMode, setWakeupMode] = useState(true);
  const [remindMinutes, setRemindMinutes] = useState(5);
  const [voiceAlert, setVoiceAlert] = useState(true);
  const [pushNotification, setPushNotification] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editTask, setEditTask] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newTask, setNewTask] = useState("");
  const [nextAlertTime, setNextAlertTime] = useState<string | null>(null);

  // Timer reference for alarm simulation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ========== Persistence ==========
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // ========== Alarm Simulation ==========
  useEffect(() => {
    if (!wakeupMode) {
      if (timerRef.current) clearInterval(timerRef.current);
      setNextAlertTime(null);
      return;
    }

    // Check every 10 seconds if any session's time matches current time (within 1 minute)
    const checkAlarm = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const session of sessions) {
        // Parse time string like "7:00 AM"
        const timeParts = session.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeParts) continue;
        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const ampm = timeParts[3].toUpperCase();
        if (ampm === "PM" && hours !== 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        const sessionMinutes = hours * 60 + minutes;

        // Check if within 1 minute of current time (or exactly)
        const diff = sessionMinutes - currentMinutes;
        if (diff >= 0 && diff < 1) {
          // Trigger alert
          if (voiceAlert) {
            speakText(`Reminder: ${session.subject} - ${session.task}`);
          }
          if (pushNotification) {
            sendNotification(`📚 ${session.subject}`, `Time for: ${session.task}`);
          }
          toast.info(`⏰ ${session.subject}: ${session.task}`, {
            duration: 5000,
          });
          setNextAlertTime(session.time);
          break;
        }
      }
    };

    timerRef.current = setInterval(checkAlarm, 10000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessions, wakeupMode, voiceAlert, pushNotification, remindMinutes]);

  // ========== Speech Synthesis ==========
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  // ========== Browser Notification ==========
  const sendNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") new Notification(title, { body });
      });
    }
  };

  // ========== CRUD Handlers ==========
  const handleAddSession = () => {
    if (!newTime || !newSubject || !newTask) {
      toast.warning("Please fill in all fields.");
      return;
    }
    const newSession: RoutineSession = {
      id: Date.now().toString(),
      time: newTime,
      subject: newSubject,
      task: newTask,
    };
    setSessions((prev) => [...prev, newSession]);
    setNewTime("");
    setNewSubject("");
    setNewTask("");
    setIsAddDialogOpen(false);
    toast.success("Session added!");
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Session deleted.");
  };

  const handleEditSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    setEditingId(id);
    setEditTime(session.time);
    setEditSubject(session.subject);
    setEditTask(session.task);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    if (!editTime || !editSubject || !editTask) {
      toast.warning("Please fill in all fields.");
      return;
    }
    setSessions((prev) =>
      prev.map((s) =>
        s.id === editingId
          ? { ...s, time: editTime, subject: editSubject, task: editTask }
          : s
      )
    );
    setEditingId(null);
    setEditTime("");
    setEditSubject("");
    setEditTask("");
    toast.success("Session updated!");
  };

  // ========== Drag & Drop ==========
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSessions((current) => {
      const oldIndex = current.findIndex((session) => session.id === String(active.id));
      const newIndex = current.findIndex((session) => session.id === String(over.id));
      if (oldIndex === -1 || newIndex === -1) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  // ========== Animations ==========
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

  // ========== Render ==========
  return (
    <PageShell>
      <PageHeader title="Routine & Alarm" subtitle="Schedule and stay on track." icon={<span className="text-xl">⏰</span>} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-2xl shadow-black/30"
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white" onClick={() => navigate({ to: "/" })}>
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
              ⏰ Routine & Alarm
            </h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
              <TabsList className="w-full rounded-xl border border-white/10 bg-white/5 p-1 sm:w-auto">
                <TabsTrigger value="today" className="text-white data-[state=active]:bg-blue-500/20">📅 TODAY</TabsTrigger>
                <TabsTrigger value="weekly" className="text-white data-[state=active]:bg-blue-500/20">📆 WEEKLY</TabsTrigger>
                <TabsTrigger value="ai" className="text-white data-[state=active]:bg-blue-500/20">🤖 AI AUTO-PLAN</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">⏰ Today&apos;s Routine</CardTitle>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 border-dashed border-white/20 text-gray-400 hover:border-white/40 hover:text-white">
                      <Plus className="h-4 w-4" /> Add Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-950 border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Session</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right text-white/80">Time</Label>
                        <Input
                          id="time"
                          placeholder="e.g., 1:30 PM"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject" className="text-right text-white/80">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="e.g., Physics"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task" className="text-right text-white/80">Task</Label>
                        <Input
                          id="task"
                          placeholder="e.g., Read Chapter 5"
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                      <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleAddSession}>Add</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sessions.map((session) => session.id)}>
                    <div className="grid grid-cols-12 gap-2 border-b border-white/5 px-3 py-2 text-xs font-medium text-gray-400">
                      <div className="col-span-1" />
                      <div className="col-span-2">Time</div>
                      <div className="col-span-3">Subject</div>
                      <div className="col-span-4">Task</div>
                      <div className="col-span-2 text-right">Action</div>
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
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit Dialog */}
          <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
            <DialogContent className="bg-slate-950 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Session</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-time" className="text-right text-white/80">Time</Label>
                  <Input
                    id="edit-time"
                    placeholder="e.g., 1:30 PM"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="col-span-3 bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-subject" className="text-right text-white/80">Subject</Label>
                  <Input
                    id="edit-subject"
                    placeholder="e.g., Physics"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="col-span-3 bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-task" className="text-right text-white/80">Task</Label>
                  <Input
                    id="edit-task"
                    placeholder="e.g., Read Chapter 5"
                    value={editTask}
                    onChange={(e) => setEditTask(e.target.value)}
                    className="col-span-3 bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSaveEdit}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <motion.div variants={itemVariants}>
            <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">🔔 JARVIS Wake-up Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{wakeupMode ? "🔔" : "🔕"}</span>
                    <div>
                      <Label className="text-sm font-medium text-white">JARVIS Wake-up Mode</Label>
                      <p className="text-xs text-gray-400">JARVIS will remind you before every session</p>
                    </div>
                  </div>
                  <Switch checked={wakeupMode} onCheckedChange={setWakeupMode} className="data-[state=checked]:bg-blue-500" />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <Label className="text-sm font-medium text-white">Remind me before every session</Label>
                      <p className="text-xs text-gray-400">Set how early JARVIS should alert you</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setRemindMinutes(Math.max(1, remindMinutes - 5))}>
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{remindMinutes} min</span>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setRemindMinutes(Math.min(30, remindMinutes + 5))}>
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{voiceAlert ? "🔊" : "🔇"}</span>
                    <div>
                      <Label className="text-sm font-medium text-white">Voice Alert</Label>
                      <p className="text-xs text-gray-400">JARVIS will speak your reminders aloud</p>
                    </div>
                  </div>
                  <Switch checked={voiceAlert} onCheckedChange={setVoiceAlert} className="data-[state=checked]:bg-blue-500" />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <Label className="text-sm font-medium text-white">Missed Session Alert</Label>
                      <p className="text-xs text-gray-400">Send push notification if you skip a session</p>
                    </div>
                  </div>
                  <Switch checked={pushNotification} onCheckedChange={setPushNotification} className="data-[state=checked]:bg-blue-500" />
                </div>

                {/* Voice command interface */}
                <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <Mic className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
                      placeholder='Say: "JARVIS, wake me up for Physics tomorrow at 7 AM"'
                      readOnly
                    />
                  </div>
                  <Button
                    className="rounded-full border border-blue-500/30 bg-blue-500/20 px-4 text-blue-400 hover:bg-blue-500/40"
                    onClick={() => {
                      // Simulate voice command: add a session for tomorrow at 7 AM
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const timeStr = "7:00 AM";
                      const newSession: RoutineSession = {
                        id: Date.now().toString(),
                        time: timeStr,
                        subject: "📚 Physics (Voice)",
                        task: "Review Chapter 5",
                      };
                      setSessions((prev) => [...prev, newSession]);
                      toast.success("🎤 Voice command captured! Session added.");
                    }}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>

                {nextAlertTime && (
                  <div className="mt-2 rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-center text-sm text-green-400">
                    🔔 Next alert at {nextAlertTime}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {showSuggestion && (
            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden rounded-xl border-l-4 border-blue-500 border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">💡 JARVIS Suggests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="leading-relaxed text-gray-200">
                    You studied Physics yesterday. Today, focus on Maths to balance your weekly schedule. I&apos;ve moved English to evening.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
                      <Check className="h-4 w-4" /> Accept Schedule Change
                    </Button>
                    <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white" onClick={() => setShowSuggestion(false)}>
                      <X className="h-4 w-4" /> Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </PageShell>
  );
}