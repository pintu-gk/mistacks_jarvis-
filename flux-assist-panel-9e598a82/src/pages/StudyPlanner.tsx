import { useState } from "react";
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
  Check,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";

interface Session {
  id: string;
  time: string;
  subject: string;
  task: string;
}

const SortableRow = ({ session }: { session: Session }) => {
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
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default function StudyPlanner() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState("today");
  const [sessions, setSessions] = useState<Session[]>([
    { id: "1", time: "7:00 AM", subject: "🛏️ Wake Up", task: "Morning Routine" },
    { id: "2", time: "8:00 AM", subject: "📖 Physics", task: "Chapter 5: Thermodynamics" },
    { id: "3", time: "9:30 AM", subject: "☕ Break", task: "Rest / Snack" },
    { id: "4", time: "10:00 AM", subject: "🧮 Maths", task: "Solve 20 Integration Qs" },
    { id: "5", time: "11:30 AM", subject: "🌐 English", task: "Read AI Reader PDF" },
  ]);

  const [chapters, setChapters] = useState(2);
  const [questions, setQuestions] = useState(30);
  const [hours, setHours] = useState(3);
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [readAloud, setReadAloud] = useState(true);
  const [remindBefore, setRemindBefore] = useState(true);
  const [pushOnSkip, setPushOnSkip] = useState(false);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
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
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white" onClick={() => navigate({ to: "/" })}>
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
              📅 Smart Study Planner
            </h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
              <TabsList className="w-full rounded-xl border border-white/10 bg-white/5 p-1 sm:w-auto">
                <TabsTrigger value="today" className="text-white data-[state=active]:bg-blue-500/20">TODAY</TabsTrigger>
                <TabsTrigger value="weekly" className="text-white data-[state=active]:bg-blue-500/20">WEEKLY</TabsTrigger>
                <TabsTrigger value="ai" className="text-white data-[state=active]:bg-blue-500/20">AI RECOMMEND</TabsTrigger>
                <TabsTrigger value="settings" className="text-white data-[state=active]:bg-blue-500/20">⚙️ Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">⏰ Today&apos;s Schedule</CardTitle>
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
                      <SortableRow key={session.id} session={session} />
                    ))}
                  </SortableContext>
                </DndContext>
                <Button variant="outline" className="w-full border-dashed border-white/20 text-gray-400 hover:border-white/40 hover:text-white">
                  + Add New Session
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">🎯 Set Daily Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="chapters" className="text-sm text-gray-300">Chapters to read</Label>
                    <Input id="chapters" type="number" value={chapters} onChange={(event) => setChapters(Number(event.target.value))} className="border-white/10 bg-white/5 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="questions" className="text-sm text-gray-300">Questions to solve</Label>
                    <Input id="questions" type="number" value={questions} onChange={(event) => setQuestions(Number(event.target.value))} className="border-white/10 bg-white/5 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hours" className="text-sm text-gray-300">Hours of deep focus</Label>
                    <Input id="hours" type="number" value={hours} onChange={(event) => setHours(Number(event.target.value))} className="border-white/10 bg-white/5 text-white" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch id="auto-adjust" checked={autoAdjust} onCheckedChange={setAutoAdjust} className="data-[state=checked]:bg-blue-500" />
                  <Label htmlFor="auto-adjust" className="cursor-pointer text-sm text-gray-300">✅ Auto-adjust if I miss a session</Label>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">🤖 JARVIS Wake-up Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔊</span>
                      <Label htmlFor="read-aloud" className="cursor-pointer text-sm text-gray-300">Read my schedule aloud at 7:00 AM</Label>
                    </div>
                    <Switch id="read-aloud" checked={readAloud} onCheckedChange={setReadAloud} className="data-[state=checked]:bg-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔔</span>
                      <Label htmlFor="remind-before" className="cursor-pointer text-sm text-gray-300">Remind me 5 mins before every session</Label>
                    </div>
                    <Switch id="remind-before" checked={remindBefore} onCheckedChange={setRemindBefore} className="data-[state=checked]:bg-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📱</span>
                      <Label htmlFor="push-skip" className="cursor-pointer text-sm text-gray-300">Send push notification if I skip a session</Label>
                    </div>
                    <Switch id="push-skip" checked={pushOnSkip} onCheckedChange={setPushOnSkip} className="data-[state=checked]:bg-blue-500" />
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <Input className="flex-1 border-white/10 bg-white/5 text-white placeholder:text-gray-500" placeholder="JARVIS, wake me up for Physics tomorrow at 7 AM" readOnly />
                  <Button size="icon" className="rounded-full border border-blue-500/30 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40">
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
                  <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white">
                    <X className="h-4 w-4" /> Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </PageShell>
  );
}
