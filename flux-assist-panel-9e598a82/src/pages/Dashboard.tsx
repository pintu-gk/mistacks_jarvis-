import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  MoreHorizontal,
  Minus,
  Droplet,
  Wind,
  Gauge,
  CloudRain,
  BookOpen,
  Calculator,
  Dumbbell,
  Briefcase,
  Newspaper,
  Brain,
  TrendingUp,
  Youtube,
  MessageCircle,
  Send as Telegram,
  Music2,
  Mail,
  Chrome,
  Globe,
} from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  pressure: number;
}

const REMINDERS = [
  { id: "1", icon: <BookOpen className="h-4 w-4 text-cyan-300" />, label: "Study Python", time: "10AM" },
  { id: "2", icon: <Calculator className="h-4 w-4 text-cyan-300" />, label: "Maths", time: "12:30PM" },
  { id: "3", icon: <Dumbbell className="h-4 w-4 text-cyan-300" />, label: "Gym", time: "3PM" },
  { id: "4", icon: <Briefcase className="h-4 w-4 text-cyan-300" />, label: "Project", time: "7PM" },
];

const NEWS = [
  { id: "1", title: "Tech Mergers Surge", time: "18 hours ago", icon: <Newspaper className="h-5 w-5 text-cyan-300" /> },
  { id: "2", title: "AI Breakthroughs: What's New", time: "23 hours ago", icon: <Brain className="h-5 w-5 text-cyan-300" /> },
  { id: "3", title: "Global Market Index Update", time: "24 hours ago", icon: <TrendingUp className="h-5 w-5 text-cyan-300" /> },
];

const QUICK_APPS = [
  { name: "Google", icon: <Chrome className="h-5 w-5" />, color: "text-blue-400", url: "https://google.com" },
  { name: "YouTube", icon: <Youtube className="h-5 w-5" />, color: "text-red-400", url: "https://youtube.com" },
  { name: "WhatsApp", icon: <MessageCircle className="h-5 w-5" />, color: "text-green-400", url: "https://web.whatsapp.com" },
  { name: "Telegram", icon: <Telegram className="h-5 w-5" />, color: "text-sky-400", url: "https://web.telegram.org" },
  { name: "Spotify", icon: <Music2 className="h-5 w-5" />, color: "text-green-500", url: "https://open.spotify.com" },
  { name: "Gmail", icon: <Mail className="h-5 w-5" />, color: "text-rose-400", url: "https://mail.google.com" },
  { name: "Web", icon: <Globe className="h-5 w-5" />, color: "text-orange-400", url: "https://duckduckgo.com" },
];

// ============ COMMAND SYSTEM ============
type CommandHandler = (args: string) => void;

interface Command {
  id: string;
  category: string;
  label: string;
  pattern: RegExp;
  handler: CommandHandler;
}

const COMMANDS: Command[] = [
  // 🧠 AI Brain
  { id: "explain", category: "🧠 AI Brain", label: "Jarvis explain this", pattern: /jarvis explain (.+)/i, handler: (args) => alert(`Explaining: ${args}`) },
  { id: "answer", category: "🧠 AI Brain", label: "Jarvis answer my question", pattern: /jarvis answer (.+)/i, handler: (args) => alert(`Answering: ${args}`) },
  { id: "summarize", category: "🧠 AI Brain", label: "Jarvis summarize this", pattern: /jarvis summarize (.+)/i, handler: (args) => alert(`Summarizing: ${args}`) },
  { id: "generate", category: "🧠 AI Brain", label: "Jarvis generate ideas", pattern: /jarvis generate (.+)/i, handler: (args) => alert(`Generating ideas for: ${args}`) },
  { id: "write", category: "🧠 AI Brain", label: "Jarvis write something", pattern: /jarvis write (.+)/i, handler: (args) => alert(`Writing about: ${args}`) },
  { id: "translate", category: "🧠 AI Brain", label: "Jarvis translate this", pattern: /jarvis translate (.+)/i, handler: (args) => alert(`Translating: ${args}`) },
  { id: "remember", category: "🧠 AI Brain", label: "Jarvis remember this", pattern: /jarvis remember (.+)/i, handler: (args) => alert(`Remembering: ${args}`) },
  { id: "search", category: "🧠 AI Brain", label: "Jarvis search this", pattern: /jarvis search (.+)/i, handler: (args) => window.open(`https://google.com/search?q=${encodeURIComponent(args)}`, "_blank") },

  // 🎙️ Voice Assistant
  { id: "start_listening", category: "🎙️ Voice Assistant", label: "Jarvis start listening", pattern: /jarvis start listening/i, handler: () => alert("🎤 Listening...") },
  { id: "stop_listening", category: "🎙️ Voice Assistant", label: "Jarvis stop listening", pattern: /jarvis stop listening/i, handler: () => alert("🔇 Stopped.") },
  { id: "read_this", category: "🎙️ Voice Assistant", label: "Jarvis read this", pattern: /jarvis read this/i, handler: () => alert("📖 Reading aloud...") },
  { id: "speak_this", category: "🎙️ Voice Assistant", label: "Jarvis speak this", pattern: /jarvis speak (.+)/i, handler: (args) => alert(`🗣️ Speaking: ${args}`) },
  { id: "change_voice", category: "🎙️ Voice Assistant", label: "Jarvis change voice", pattern: /jarvis change voice/i, handler: () => alert("🎚️ Voice changed.") },
  { id: "repeat", category: "🎙️ Voice Assistant", label: "Jarvis repeat", pattern: /jarvis repeat/i, handler: () => alert("🔁 Repeating...") },

  // 📚 Study Planner
  { id: "create_study_plan", category: "📚 Study Planner", label: "Jarvis create study plan", pattern: /jarvis create study plan/i, handler: () => alert("📚 Creating study plan...") },
  { id: "show_tasks", category: "📚 Study Planner", label: "Jarvis show today's tasks", pattern: /jarvis show today's tasks/i, handler: () => alert("📋 Showing tasks...") },
  { id: "set_reminder", category: "📚 Study Planner", label: "Jarvis set study reminder", pattern: /jarvis set study reminder/i, handler: () => alert("⏰ Reminder set!") },
  { id: "focus_mode", category: "📚 Study Planner", label: "Jarvis start focus mode", pattern: /jarvis start focus mode/i, handler: () => alert("🎯 Focus mode activated!") },
  { id: "explain_topic", category: "📚 Study Planner", label: "Jarvis explain topic", pattern: /jarvis explain topic (.+)/i, handler: (args) => alert(`📖 Explaining: ${args}`) },
  { id: "make_notes", category: "📚 Study Planner", label: "Jarvis make notes", pattern: /jarvis make notes/i, handler: () => alert("📝 Notes ready.") },
  { id: "generate_quiz", category: "📚 Study Planner", label: "Jarvis generate quiz", pattern: /jarvis generate quiz/i, handler: () => alert("📝 Quiz generated.") },

  // 📄 PDF Reader
  { id: "open_pdf", category: "📄 PDF Reader", label: "Jarvis open PDF", pattern: /jarvis open pdf/i, handler: () => alert("📄 Opening PDF reader...") },
  { id: "read_pdf", category: "📄 PDF Reader", label: "Jarvis read PDF", pattern: /jarvis read pdf/i, handler: () => alert("🔊 Reading PDF aloud...") },
  { id: "summarize_pdf", category: "📄 PDF Reader", label: "Jarvis summarize PDF", pattern: /jarvis summarize pdf/i, handler: () => alert("📋 Summarizing PDF...") },
  { id: "find_in_pdf", category: "📄 PDF Reader", label: "Jarvis find topic in PDF", pattern: /jarvis find topic in pdf (.+)/i, handler: (args) => alert(`🔍 Searching PDF for: ${args}`) },
  { id: "pdf_to_audio", category: "📄 PDF Reader", label: "Jarvis convert PDF to audio", pattern: /jarvis convert pdf to audio/i, handler: () => alert("🎵 Converting to audio...") },

  // ⚙️ Automation
  { id: "open_app", category: "⚙️ Automation", label: "Jarvis open application", pattern: /jarvis open application (.+)/i, handler: (args) => alert(`🚀 Opening: ${args}`) },
  { id: "close_app", category: "⚙️ Automation", label: "Jarvis close application", pattern: /jarvis close application (.+)/i, handler: (args) => alert(`❌ Closing: ${args}`) },
  { id: "screenshot", category: "⚙️ Automation", label: "Jarvis take screenshot", pattern: /jarvis take screenshot/i, handler: () => alert("📸 Screenshot taken!") },
  { id: "check_system", category: "⚙️ Automation", label: "Jarvis check system", pattern: /jarvis check system/i, handler: () => alert("🖥️ System check done.") },
  { id: "check_battery", category: "⚙️ Automation", label: "Jarvis check battery", pattern: /jarvis check battery/i, handler: () => alert("🔋 Battery: 75%") },
  { id: "organize_files", category: "⚙️ Automation", label: "Jarvis organize files", pattern: /jarvis organize files/i, handler: () => alert("📂 Files organized!") },

  // 🏠 Smart Assistant
  { id: "show_routine", category: "🏠 Smart Assistant", label: "Jarvis show routine", pattern: /jarvis show routine/i, handler: () => alert("📅 Showing routine...") },
  { id: "set_alarm", category: "🏠 Smart Assistant", label: "Jarvis set alarm", pattern: /jarvis set alarm/i, handler: () => alert("⏰ Alarm set!") },
  { id: "create_reminder", category: "🏠 Smart Assistant", label: "Jarvis create reminder", pattern: /jarvis create reminder/i, handler: () => alert("✅ Reminder created!") },
  { id: "show_notifications", category: "🏠 Smart Assistant", label: "Jarvis show notifications", pattern: /jarvis show notifications/i, handler: () => alert("🔔 No new notifications.") },

  // 👨‍💻 Developer Mode
  { id: "analyze_code", category: "👨‍💻 Developer Mode", label: "Jarvis analyze code", pattern: /jarvis analyze code/i, handler: () => alert("🧐 Analyzing code...") },
  { id: "find_bug", category: "👨‍💻 Developer Mode", label: "Jarvis find bug", pattern: /jarvis find bug/i, handler: () => alert("🐛 Looking for bugs...") },
  { id: "explain_error", category: "👨‍💻 Developer Mode", label: "Jarvis explain error", pattern: /jarvis explain error (.+)/i, handler: (args) => alert(`❌ Explaining: ${args}`) },
  { id: "generate_code", category: "👨‍💻 Developer Mode", label: "Jarvis generate code", pattern: /jarvis generate code (.+)/i, handler: (args) => alert(`💻 Generating code for: ${args}`) },

  // 📷 Vision AI (Future)
  { id: "identify_object", category: "📷 Vision AI (Future)", label: "Jarvis identify object", pattern: /jarvis identify object/i, handler: () => alert("🔍 Identifying object...") },
  { id: "recognize_face", category: "📷 Vision AI (Future)", label: "Jarvis recognize face", pattern: /jarvis recognize face/i, handler: () => alert("👤 Recognizing face...") },
  { id: "analyze_camera", category: "📷 Vision AI (Future)", label: "Jarvis analyze camera", pattern: /jarvis analyze camera/i, handler: () => alert("📷 Analyzing camera...") },

  // 📱 Mobile Assistant (Future)
  { id: "open_app_mobile", category: "📱 Mobile Assistant (Future)", label: "Jarvis open app", pattern: /jarvis open app (.+)/i, handler: (args) => alert(`📱 Opening app: ${args}`) },
  { id: "send_message", category: "📱 Mobile Assistant (Future)", label: "Jarvis send message", pattern: /jarvis send message (.+)/i, handler: (args) => alert(`📩 Sending message: ${args}`) },
  { id: "control_phone", category: "📱 Mobile Assistant (Future)", label: "Jarvis control phone", pattern: /jarvis control phone/i, handler: () => alert("📱 Controlling phone...") },

  // 🤖 Agent Mode (Future)
  { id: "complete_task", category: "🤖 Agent Mode (Future)", label: "Jarvis complete this task", pattern: /jarvis complete this task (.+)/i, handler: (args) => alert(`🤖 Completing task: ${args}`) },
  { id: "plan_day", category: "🤖 Agent Mode (Future)", label: "Jarvis plan my day", pattern: /jarvis plan my day/i, handler: () => alert("📋 Planning your day...") },
  { id: "execute_workflow", category: "🤖 Agent Mode (Future)", label: "Jarvis execute workflow", pattern: /jarvis execute workflow/i, handler: () => alert("⚙️ Executing workflow...") },
];

const CATEGORIES = [
  "🧠 AI Brain",
  "🎙️ Voice Assistant",
  "📚 Study Planner",
  "📄 PDF Reader",
  "⚙️ Automation",
  "🏠 Smart Assistant",
  "👨‍💻 Developer Mode",
  "📷 Vision AI (Future)",
  "📱 Mobile Assistant (Future)",
  "🤖 Agent Mode (Future)",
];

export default function Dashboard() {
  const [command, setCommand] = useState("");
  const [weather, setWeather] = useState<WeatherData>({
    temp: 27,
    condition: "Light Rain",
    humidity: 34,
    wind: 12,
    pressure: 1013,
  });
  const [showCommands, setShowCommands] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,weather_code",
        );
        const j = await r.json();
        if (cancelled || !j?.current) return;
        const codes: Record<number, string> = {
          0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
          45: "Foggy", 48: "Foggy", 51: "Light Drizzle", 53: "Drizzle", 55: "Heavy Drizzle",
          61: "Light Rain", 63: "Rain", 65: "Heavy Rain", 71: "Light Snow", 80: "Showers",
          95: "Thunderstorm",
        };
        setWeather({
          temp: Math.round(j.current.temperature_2m),
          condition: codes[j.current.weather_code as number] ?? "Cloudy",
          humidity: Math.round(j.current.relative_humidity_2m),
          wind: Math.round(j.current.wind_speed_10m),
          pressure: Math.round(j.current.pressure_msl),
        });
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openApp = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim();

    // 1. Quick app commands (existing)
    const lower = cmd.toLowerCase();
    const appMatch = QUICK_APPS.find((a) => lower.includes(a.name.toLowerCase()));
    if (appMatch) {
      openApp(appMatch.url);
      setCommand("");
      return;
    }

    // 2. JARVIS command registry
    for (const c of COMMANDS) {
      const match = cmd.match(c.pattern);
      if (match) {
        const args = match[1] || "";
        c.handler(args);
        setCommand("");
        return;
      }
    }

    // 3. Fallback
    alert(`I don't understand: "${cmd}"\nTry saying "Jarvis help" to see available commands.`);
    setCommand("");
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 md:grid-cols-[1fr_280px] lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* CENTER */}
        <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-between">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 pt-4">
            <p className="font-display text-xl tracking-widest text-cyan-100/90 md:text-2xl">Listening...</p>

            {/* AI Core - Responsive */}
            <div className="relative grid w-full max-w-[280px] place-items-center aspect-square sm:max-w-[300px] lg:max-w-[320px]">
              <Waveform side="left" />
              <Waveform side="right" />
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-cyan-300/40"
                  style={{
                    inset: i * 18,
                    boxShadow: `0 0 30px oklch(0.88 0.18 210 / ${0.25 - i * 0.06}) inset, 0 0 20px oklch(0.88 0.18 210 / ${0.2 - i * 0.05})`,
                  }}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 18 + i * 6, repeat: Infinity, ease: "linear" }}
                />
              ))}
              <div className="absolute inset-14 rounded-full border border-dashed border-cyan-300/30" />
              <motion.div
                className="relative grid h-32 w-32 place-items-center rounded-full sm:h-36 sm:w-36 lg:h-40 lg:w-40"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, oklch(0.45 0.1 250), oklch(0.1 0.04 270) 75%)",
                  boxShadow:
                    "inset 0 -12px 36px oklch(0 0 0 / 0.6), 0 0 60px oklch(0.88 0.18 210 / 0.55), 0 0 120px oklch(0.88 0.18 210 / 0.3)",
                }}
              >
                <div className="absolute left-1 top-1/2 h-8 w-3 -translate-y-1/2 rounded-l-full bg-cyan-300/70 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
                <div className="absolute right-1 top-1/2 h-8 w-3 -translate-y-1/2 rounded-r-full bg-cyan-300/70 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-3">
                    <div className="h-3 w-3 rounded-full bg-cyan-200" style={{ boxShadow: "0 0 14px rgba(103,232,249,0.9)" }} />
                    <div className="h-3 w-3 rounded-full bg-cyan-200" style={{ boxShadow: "0 0 14px rgba(103,232,249,0.9)" }} />
                  </div>
                  <div className="h-1 w-7 rounded-full bg-cyan-200/80" />
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cyan-200/90 backdrop-blur">
                Hey Jarvis
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cyan-200/70 backdrop-blur">
                I'm listening...
              </span>
            </div>

            {/* Command Suggestions (first 6 commands) */}
            <div className="flex flex-wrap items-center justify-center gap-2 px-4 relative">
              {COMMANDS.slice(0, 6).map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => setCommand(cmd.label)}
                  className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100 backdrop-blur transition hover:bg-cyan-400/20"
                >
                  {cmd.label}
                </button>
              ))}
              <button
                onClick={() => setShowCommands(!showCommands)}
                className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/5 text-cyan-200 hover:bg-white/10"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>

              {/* Commands Menu Dropdown */}
              {showCommands && (
                <div className="absolute top-full left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-black/95 p-4 backdrop-blur-xl z-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">All Commands</span>
                    <button onClick={() => setShowCommands(false)} className="text-slate-400 hover:text-white">
                      ✕
                    </button>
                  </div>
                  {CATEGORIES.map((category) => {
                    const cmds = COMMANDS.filter((c) => c.category === category);
                    if (cmds.length === 0) return null;
                    return (
                      <div key={category} className="mb-4">
                        <h4 className="text-xs font-semibold text-cyan-300 mb-2">{category}</h4>
                        <div className="space-y-1">
                          {cmds.map((cmd) => (
                            <button
                              key={cmd.id}
                              onClick={() => {
                                setCommand(cmd.label);
                                setShowCommands(false);
                                // Auto-submit after a short delay
                                setTimeout(() => {
                                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                                  handleSubmit(fakeEvent);
                                }, 100);
                              }}
                              className="w-full text-left text-sm text-slate-300 hover:text-white hover:bg-white/5 px-2 py-1 rounded-lg transition"
                            >
                              {cmd.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Command bar */}
          <form onSubmit={handleSubmit} className="mt-6 w-full max-w-2xl px-4 sm:px-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Type your command here or say 'Hey Jarvis'..."
                  className="flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="grid h-9 w-9 place-items-center rounded-full bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-white/5 pt-2">
                {QUICK_APPS.map((a) => (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => openApp(a.url)}
                    title={a.name}
                    className={`grid h-8 w-8 place-items-center rounded-full bg-white/5 transition hover:bg-white/10 ${a.color}`}
                  >
                    {a.icon}
                  </button>
                ))}
                <button type="button" className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT PANELS */}
        <div className="space-y-4">
          <Panel title="Weather">
            <div className="flex items-start gap-4">
              <CloudRain className="h-10 w-10 text-cyan-300 md:h-12 md:w-12" />
              <div>
                <div className="font-display text-3xl font-bold text-white md:text-4xl">{weather.temp}°C</div>
                <div className="text-xs text-slate-400">{weather.condition}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-300">
              <Metric icon={<Droplet className="h-3.5 w-3.5 text-cyan-300" />} label={`${weather.humidity}% Humidity`} />
              <Metric icon={<Wind className="h-3.5 w-3.5 text-cyan-300" />} label={`${weather.wind} km/h Wind`} />
              <Metric icon={<Gauge className="h-3.5 w-3.5 text-cyan-300" />} label={`${weather.pressure} hPa`} />
              <Metric icon={<CloudRain className="h-3.5 w-3.5 text-cyan-300" />} label="New Delhi" />
            </div>
          </Panel>

          <Panel title="Today's Reminders">
            <ul className="space-y-2">
              {REMINDERS.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 text-slate-200">
                    {r.icon}
                    {r.label}
                  </div>
                  <span className="text-xs font-medium text-cyan-300">{r.time}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="News Update" action={<Minus className="h-4 w-4 text-slate-400" />}>
            <ul className="space-y-3">
              {NEWS.map((n) => (
                <li key={n.id} className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">
                    {n.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{n.title}</p>
                    <p className="text-[11px] text-slate-400">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold tracking-wide text-white">{title}</h3>
        {action ?? <MoreHorizontal className="h-4 w-4 text-slate-400" />}
      </div>
      {children}
    </motion.div>
  );
}

function Metric({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

function Waveform({ side }: { side: "left" | "right" }) {
  const heights = [10, 22, 14, 30, 40, 24, 50, 36, 28, 44, 18, 32];
  const translateX = side === "left" ? "-translate-x-[120%]" : "translate-x-[120%]";
  return (
    <div
      className={`absolute top-1/2 flex h-12 -translate-y-1/2 items-center gap-[3px] ${translateX} md:h-14 lg:h-16`}
    >
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-cyan-300 md:w-[3px]"
          style={{ boxShadow: "0 0 8px rgba(103,232,249,0.8)" }}
          animate={{ height: [h * 0.3, h, h * 0.3] }}
          transition={{ duration: 0.9 + (i % 4) * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}