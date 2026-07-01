import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  X,
  Sparkles,
  Globe,
  Camera,
  Languages,
  Music,
  Calculator,
  Timer,
  QrCode,
  Zap,
  Cloud,
  Wifi,
  Battery,
  Bluetooth,
  Flashlight,
  Monitor,
  Volume2,
  RefreshCw,
  Sun,
  Moon,
  Search,
  Send,
  MessageCircle,
  BookOpen,
  Smartphone,
  Tv,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  cta: string;
}

interface QuickAction {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

interface ExternalApp {
  id: string;
  name: string;
  icon: string;
  color: string;
  url: string;
}

interface Utility {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export default function AppsTools() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("quick");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: "1",
      title: "It is warm outside at 33°C.",
      description: "Should JARVIS cool the room through Smart Home?",
      cta: "❄️ Cool the Room",
    },
    {
      id: "2",
      title: "Physics study block starts at 2:00 PM.",
      description: "Open your AI Reader and keep the flow going.",
      cta: "📖 Open Reader",
    },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [systemState, setSystemState] = useState({
    wifi: true,
    battery: 78,
    bluetooth: false,
    flashlight: false,
    volume: 62,
    darkMode: true,
  });

  const quickActions: QuickAction[] = [
    { id: "draft", name: "Draft Email", icon: "✍️", description: "Compose with AI support", color: "from-blue-500/20 to-cyan-500/20" },
    { id: "search", name: "Web Search", icon: "🌐", description: "Fast browser lookup", color: "from-emerald-500/20 to-teal-500/20" },
    { id: "scan", name: "Scan Document", icon: "📷", description: "OCR + summarize", color: "from-purple-500/20 to-fuchsia-500/20" },
    { id: "translate", name: "Translate", icon: "🗣️", description: "Voice or text", color: "from-amber-500/20 to-orange-500/20" },
    { id: "music", name: "Play Music", icon: "🎵", description: "Spotify or podcasts", color: "from-rose-500/20 to-pink-500/20" },
    { id: "calc", name: "Smart Calculator", icon: "🧮", description: "Quick math and units", color: "from-indigo-500/20 to-violet-500/20" },
  ];

  const externalApps: ExternalApp[] = [
    { id: "google", name: "Google", icon: "🌐", color: "bg-blue-500/15", url: "https://google.com" },
    { id: "youtube", name: "YouTube", icon: "🎥", color: "bg-red-500/15", url: "https://youtube.com" },
    { id: "whatsapp", name: "WhatsApp", icon: "💬", color: "bg-green-500/15", url: "https://wa.me" },
    { id: "gmail", name: "Gmail", icon: "📧", color: "bg-rose-500/15", url: "https://gmail.com" },
    { id: "instagram", name: "Instagram", icon: "📱", color: "bg-pink-500/15", url: "https://instagram.com" },
    { id: "spotify", name: "Spotify", icon: "🎵", color: "bg-emerald-500/15", url: "https://spotify.com" },
    { id: "amazon", name: "Amazon", icon: "🛒", color: "bg-orange-500/15", url: "https://amazon.com" },
    { id: "maps", name: "Maps", icon: "🗺️", color: "bg-cyan-500/15", url: "https://maps.google.com" },
  ];

  const utilities: Utility[] = [
    { id: "converter", name: "Unit Converter", icon: "📋", description: "Length, weight, currency", color: "from-blue-500/20" },
    { id: "timer", name: "Timer / Pomodoro", icon: "⏱️", description: "Focus and breaks", color: "from-emerald-500/20" },
    { id: "qr", name: "QR Generator", icon: "🔗", description: "Share links and files", color: "from-violet-500/20" },
    { id: "flashcards", name: "Flash Cards", icon: "📝", description: "Turn notes into study cards", color: "from-amber-500/20" },
    { id: "weather", name: "Weather Radar", icon: "🌦️", description: "Live forecasts", color: "from-cyan-500/20" },
  ];

  const handleDismissSuggestion = (id: string) => setSuggestions((current) => current.filter((item) => item.id !== id));

  const handleQuickActionClick = (action: QuickAction) => {
    setSelectedAction(action.name);
    setDialogOpen(true);
  };

  const handleExternalAppClick = (app: ExternalApp) => {
    window.open(app.url, "_blank", "noopener,noreferrer");
  };

  const handleUtilityClick = (utility: Utility) => {
    setSelectedAction(utility.name);
    setDialogOpen(true);
  };

  return (
    <PageShell>
      <PageHeader title="Apps & Tools" subtitle="A focused action hub for AI helpers, apps, and system shortcuts." icon={<Zap className="h-5 w-5" />} />

      <div className="mt-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" className="w-fit gap-2 text-gray-400 hover:text-white" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 sm:w-[320px]">
              <TabsTrigger value="quick">Quick</TabsTrigger>
              <TabsTrigger value="apps">Apps</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white/10 p-2 text-cyan-300"><Sparkles className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-medium text-white">{suggestion.title}</p>
                      <p className="text-sm text-gray-300">{suggestion.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-2 bg-cyan-400 text-black hover:bg-cyan-300">
                      <Check className="h-4 w-4" /> {suggestion.cta}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => handleDismissSuggestion(suggestion.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {(activeTab === "quick" || activeTab === "apps") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Quick AI Actions</h2>
              <Badge variant="outline" className="border-white/10 text-gray-400">{quickActions.length} available</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  onClick={() => handleQuickActionClick(action)}
                  className={`rounded-xl border border-white/10 bg-gradient-to-br ${action.color} p-4 text-left transition hover:border-cyan-400/30`}
                >
                  <div className="mb-2 text-2xl">{action.icon}</div>
                  <h3 className="text-sm font-medium text-white">{action.name}</h3>
                  <p className="mt-1 text-xs text-gray-400">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {(activeTab === "quick" || activeTab === "apps") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">External Apps</h2>
              <Badge variant="outline" className="border-white/10 text-gray-400">{externalApps.length} shortcuts</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
              {externalApps.map((app) => (
                <motion.button
                  key={app.id}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  onClick={() => handleExternalAppClick(app)}
                  className={`rounded-xl border border-white/10 ${app.color} p-3 text-center transition hover:border-cyan-400/30`}
                >
                  <div className="mb-1 text-2xl">{app.icon}</div>
                  <p className="text-xs font-medium text-white">{app.name}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {(activeTab === "quick" || activeTab === "apps") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">JARVIS Utilities</h2>
              <Badge variant="outline" className="border-white/10 text-gray-400">{utilities.length} tools</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {utilities.map((utility) => (
                <motion.button
                  key={utility.id}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  onClick={() => handleUtilityClick(utility)}
                  className={`rounded-xl border border-white/10 bg-gradient-to-br ${utility.color} to-transparent p-4 text-left transition hover:border-cyan-400/30`}
                >
                  <div className="mb-2 text-2xl">{utility.icon}</div>
                  <h3 className="text-sm font-medium text-white">{utility.name}</h3>
                  <p className="mt-1 text-xs text-gray-400">{utility.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {(activeTab === "system" || activeTab === "quick") && (
          <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">System & Device Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white">
                  <Wifi className={`h-4 w-4 ${systemState.wifi ? "text-cyan-300" : "text-gray-500"}`} />
                  Wi-Fi {systemState.wifi ? "ON" : "OFF"}
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white">
                  <Battery className="h-4 w-4 text-green-400" />
                  {systemState.battery}% battery
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white">
                  <Bluetooth className={`h-4 w-4 ${systemState.bluetooth ? "text-cyan-300" : "text-gray-500"}`} />
                  Bluetooth {systemState.bluetooth ? "ON" : "OFF"}
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white">
                  <Monitor className={`h-4 w-4 ${systemState.darkMode ? "text-purple-400" : "text-gray-500"}`} />
                  {systemState.darkMode ? "Dark" : "Light"} mode
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className={`gap-2 border-white/10 ${systemState.flashlight ? "bg-yellow-500/20 text-yellow-300" : "text-gray-400"}`} onClick={() => setSystemState((current) => ({ ...current, flashlight: !current.flashlight }))}>
                  <Flashlight className="h-4 w-4" /> {systemState.flashlight ? "Flashlight ON" : "Flashlight OFF"}
                </Button>
                <Button variant="outline" className="gap-2 border-white/10 text-gray-400 hover:text-white">
                  <Camera className="h-4 w-4" /> Screenshot
                </Button>
                <Button variant="outline" className="gap-2 border-white/10 text-gray-400 hover:text-white">
                  <RefreshCw className="h-4 w-4" /> Sync Now
                </Button>
                <Button variant="outline" className="gap-2 border-white/10 text-gray-400 hover:text-white" onClick={() => setSystemState((current) => ({ ...current, darkMode: !current.darkMode }))}>
                  {systemState.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} {systemState.darkMode ? "Dark Mode" : "Light Mode"}
                </Button>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <Slider value={[systemState.volume]} onValueChange={(value) => setSystemState((current) => ({ ...current, volume: value[0] }))} max={100} step={1} className="flex-1" />
                <span className="w-12 text-right text-sm text-white">{systemState.volume}%</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-white/10 bg-[#060816] text-white">
          <DialogHeader>
            <DialogTitle>{selectedAction || "JARVIS Action"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-300">
            <p>This action hub is ready to launch your next AI task.</p>
            <div className="flex flex-wrap gap-2">
              <Button className="gap-2 bg-cyan-400 text-black hover:bg-cyan-300"><Send className="h-4 w-4" /> Run Now</Button>
              <Button variant="outline" className="gap-2 border-white/10 text-gray-400 hover:text-white"><MessageCircle className="h-4 w-4" /> Ask JARVIS</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
