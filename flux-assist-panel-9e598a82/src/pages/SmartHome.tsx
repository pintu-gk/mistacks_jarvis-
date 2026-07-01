import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Home,
  Lightbulb,
  Thermometer,
  Lock,
  Tv,
  Fan,
  Camera,
  Plug,
  Speaker,
  ChevronDown,
  ChevronUp,
  Mic,
  Sparkles,
  ShieldCheck,
  Wifi,
  Battery,
  Bluetooth,
  Droplet,
  Wind,
  Zap,
  Clock,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";

interface Device {
  id: string;
  name: string;
  room: string;
  type: "light" | "thermostat" | "lock" | "fan" | "camera" | "plug" | "speaker";
  status: Record<string, any>;
  isOnline: boolean;
  icon: keyof typeof iconMap;
}

interface Scene {
  id: string;
  name: string;
  icon: string;
  description: string;
  active: boolean;
}

const iconMap = {
  light: Lightbulb,
  thermostat: Thermometer,
  lock: Lock,
  fan: Fan,
  camera: Camera,
  plug: Plug,
  speaker: Speaker,
} as const;

function DeviceCard({
  device,
  onToggle,
  onAdjust,
}: {
  device: Device;
  onToggle: (id: string) => void;
  onAdjust: (id: string, updates: Record<string, any>) => void;
}) {
  const Icon = iconMap[device.type];
  const isOn = device.type === "lock" ? device.status.locked : device.status.power === "on";

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`rounded-xl border p-4 transition-all ${isOn ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/5"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${isOn ? "bg-cyan-400/20 text-cyan-300" : "bg-white/5 text-gray-400"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">{device.name}</h3>
            <p className="text-xs text-gray-400">{device.room}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!device.isOnline && (
            <Badge variant="outline" className="border-red-400/30 text-xs text-red-400">
              Offline
            </Badge>
          )}
          {device.type === "lock" && (
            <Button variant="ghost" size="sm" className={`${device.status.locked ? "text-red-400" : "text-green-400"}`} onClick={() => onToggle(device.id)}>
              {device.status.locked ? "Locked" : "Unlocked"}
            </Button>
          )}
          {(device.type === "light" || device.type === "plug") && (
            <Switch checked={device.status.power === "on"} onCheckedChange={() => onToggle(device.id)} className="data-[state=checked]:bg-cyan-400" />
          )}
          {device.type === "fan" && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdjust(device.id, { speed: Math.max(0, (device.status.speed || 0) - 1) })}>
                <ChevronDown className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-xs text-white">{device.status.speed || 0}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdjust(device.id, { speed: Math.min(3, (device.status.speed || 0) + 1) })}>
                <ChevronUp className="h-3 w-3" />
              </Button>
            </div>
          )}
          {device.type === "thermostat" && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdjust(device.id, { temperature: Math.max(16, (device.status.temperature || 20) - 1) })}>
                <ChevronDown className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium text-white">{device.status.temperature || 20}°</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdjust(device.id, { temperature: Math.min(30, (device.status.temperature || 20) + 1) })}>
                <ChevronUp className="h-3 w-3" />
              </Button>
            </div>
          )}
          {device.type === "camera" && <Badge className="border-0 bg-green-500/10 text-green-400">● Live</Badge>}
        </div>
      </div>

      {device.type === "light" && device.status.power === "on" && (
        <div className="mt-3">
          <Slider value={[device.status.brightness || 70]} max={100} step={1} onValueChange={(value) => onAdjust(device.id, { brightness: value[0] })} />
          <div className="mt-1 flex justify-between text-[11px] text-gray-400">
            <span>0%</span>
            <span>{device.status.brightness || 70}%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SceneCard({ scene, onActivate }: { scene: Scene; onActivate: (id: string) => void }) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={() => onActivate(scene.id)}
      className={`cursor-pointer rounded-xl border p-4 transition-all ${scene.active ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-2xl">{scene.icon}</div>
          <h3 className="text-sm font-medium text-white">{scene.name}</h3>
          <p className="mt-1 text-xs text-gray-400">{scene.description}</p>
        </div>
        {scene.active && <Badge className="border-0 bg-cyan-400/20 text-cyan-300">Active</Badge>}
      </div>
    </motion.div>
  );
}

export default function SmartHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [voiceCommand, setVoiceCommand] = useState("");
  const [environment] = useState({ temperature: 24, humidity: 58, aqi: 42, power: 1.2 });
  const [activityLog, setActivityLog] = useState([
    { id: "1", text: "Front door locked", time: "9:45 PM", type: "info" },
    { id: "2", text: "Living room lights turned on", time: "9:30 PM", type: "success" },
    { id: "3", text: "Thermostat set to 23°C", time: "8:15 PM", type: "info" },
  ]);
  const [scenes, setScenes] = useState<Scene[]>([
    { id: "morning", name: "Good Morning", icon: "🌅", description: "Lights 30% · Temp 22°C", active: false },
    { id: "study", name: "Study Mode", icon: "📖", description: "Lights 70% · Fan On", active: true },
    { id: "movie", name: "Movie Mode", icon: "🎬", description: "Lights 10% · Temp 20°C", active: false },
    { id: "night", name: "Good Night", icon: "🌙", description: "All Off · Security On", active: false },
    { id: "away", name: "Away Mode", icon: "🚪", description: "All Locked · Cameras On", active: false },
  ]);
  const [devices, setDevices] = useState<Device[]>([
    { id: "living-light", name: "Living Room Lights", room: "Living", type: "light", status: { power: "on", brightness: 70 }, isOnline: true, icon: "light" },
    { id: "thermostat", name: "Thermostat", room: "Living", type: "thermostat", status: { power: "on", temperature: 23 }, isOnline: true, icon: "thermostat" },
    { id: "front-door", name: "Front Door", room: "Hallway", type: "lock", status: { locked: true }, isOnline: true, icon: "lock" },
    { id: "bed-fan", name: "Bedroom Fan", room: "Bedroom", type: "fan", status: { power: "on", speed: 2 }, isOnline: true, icon: "fan" },
    { id: "camera", name: "Security Camera", room: "Hallway", type: "camera", status: { power: "on", recording: false }, isOnline: true, icon: "camera" },
    { id: "charger", name: "Phone Charger", room: "Bedroom", type: "plug", status: { power: "on" }, isOnline: true, icon: "plug" },
    { id: "study-lamp", name: "Study Lamp", room: "Study Room", type: "light", status: { power: "off", brightness: 0 }, isOnline: true, icon: "light" },
    { id: "speaker", name: "Smart Speaker", room: "Living", type: "speaker", status: { power: "on", volume: 60 }, isOnline: true, icon: "speaker" },
  ]);

  const addActivityLog = (text: string, type: "info" | "success" | "warning") => {
    setActivityLog((prev) => [{ id: Date.now().toString(), text, time: new Date().toLocaleTimeString(), type }, ...prev.slice(0, 9)]);
  };

  const handleDeviceToggle = (id: string) => {
    setDevices((prev) =>
      prev.map((device) => {
        if (device.id !== id) return device;
        const nextStatus = { ...device.status };
        if (device.type === "lock") {
          nextStatus.locked = !nextStatus.locked;
          addActivityLog(`${device.name} ${nextStatus.locked ? "locked" : "unlocked"}`, "success");
        } else if (device.type === "light" || device.type === "plug") {
          nextStatus.power = nextStatus.power === "on" ? "off" : "on";
          addActivityLog(`${device.name} turned ${nextStatus.power === "on" ? "on" : "off"}`, "success");
        } else if (device.type === "fan") {
          nextStatus.power = nextStatus.power === "on" ? "off" : "on";
          if (nextStatus.power === "on") nextStatus.speed = 1;
          addActivityLog(`${device.name} turned ${nextStatus.power === "on" ? "on" : "off"}`, "success");
        }
        return { ...device, status: nextStatus };
      })
    );
  };

  const handleDeviceAdjust = (id: string, updates: Record<string, any>) => {
    setDevices((prev) =>
      prev.map((device) => {
        if (device.id !== id) return device;
        const nextStatus = { ...device.status, ...updates };
        if (device.type === "light" && updates.brightness !== undefined) {
          addActivityLog(`${device.name} brightness set to ${updates.brightness}%`, "info");
        }
        if (device.type === "thermostat" && updates.temperature !== undefined) {
          addActivityLog(`${device.name} set to ${updates.temperature}°C`, "info");
        }
        if (device.type === "fan" && updates.speed !== undefined) {
          const speedNames = ["Off", "Low", "Medium", "High"];
          addActivityLog(`${device.name} speed set to ${speedNames[updates.speed] || "Off"}`, "info");
        }
        return { ...device, status: nextStatus };
      })
    );
  };

  const handleSceneActivate = (id: string) => {
    setScenes((prev) => prev.map((scene) => ({ ...scene, active: scene.id === id })));
    const scene = scenes.find((item) => item.id === id);
    if (scene) addActivityLog(`Scene "${scene.name}" activated`, "success");
  };

  const handleVoiceCommand = () => {
    if (!voiceCommand.trim()) return;
    addActivityLog(`🎤 Command: "${voiceCommand}"`, "info");
    setVoiceCommand("");
    window.setTimeout(() => addActivityLog("✅ JARVIS: Command executed", "success"), 500);
  };

  const rooms = useMemo(() => ["All", "Living", "Bedroom", "Kitchen", "Hallway", "Study Room"], []);
  const filteredDevices = selectedRoom === "All" ? devices : devices.filter((device) => device.room === selectedRoom);

  return (
    <PageShell>
      <PageHeader title="Smart Home Control" subtitle="Monitor your environment and control every room in one view." icon={<Home className="h-5 w-5" />} />

      <div className="mt-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" className="w-fit gap-2 text-gray-400 hover:text-white" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 sm:w-[320px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="scenes">Scenes</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-400/20 p-2 text-cyan-300"><Thermometer className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-gray-400">Temperature</p>
                  <p className="text-lg font-semibold text-white">{environment.temperature}°C</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-400/20 p-2 text-cyan-300"><Droplet className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-gray-400">Humidity</p>
                  <p className="text-lg font-semibold text-white">{environment.humidity}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/20 p-2 text-green-400"><Wind className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-gray-400">AQI</p>
                  <p className="text-lg font-semibold text-white">{environment.aqi} <span className="text-xs text-gray-400">Good</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-500/20 p-2 text-yellow-400"><Zap className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-gray-400">Power Usage</p>
                  <p className="text-lg font-semibold text-white">{environment.power} kW</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex flex-wrap gap-2">
          {rooms.map((room) => (
            <Button key={room} variant={selectedRoom === room ? "default" : "outline"} size="sm" className={selectedRoom === room ? "bg-cyan-400 hover:bg-cyan-500" : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"} onClick={() => setSelectedRoom(room)}>
              {room}
            </Button>
          ))}
        </div>

        {(activeTab === "overview" || activeTab === "scenes") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Smart Scenes</h2>
              <Badge variant="outline" className="border-white/10 text-gray-400">{scenes.filter((scene) => scene.active).length} active</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {scenes.map((scene) => (
                <SceneCard key={scene.id} scene={scene} onActivate={handleSceneActivate} />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Connected Devices</h2>
            <Badge variant="outline" className="border-white/10 text-gray-400">{filteredDevices.length} devices</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDevices.map((device) => (
              <DeviceCard key={device.id} device={device} onToggle={handleDeviceToggle} onAdjust={handleDeviceAdjust} />
            ))}
          </div>
        </div>

        {(activeTab === "overview" || activeTab === "voice") && (
          <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-cyan-400/20 p-3 text-cyan-300">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Voice control</h3>
                  <p className="text-xs text-gray-400">Ask JARVIS to adjust lights, locks, or routines.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input value={voiceCommand} onChange={(event) => setVoiceCommand(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleVoiceCommand()} placeholder='Try: “JARVIS, turn off the bedroom lights”' className="border-white/10 bg-white/5 text-white placeholder:text-gray-500" />
                <Button className="bg-cyan-400 text-black hover:bg-cyan-300" onClick={handleVoiceCommand}>Run Command</Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm text-white"><ShieldCheck className="h-4 w-4" /> Security</div>
                  <p className="text-xs text-gray-400">Front door locked • Cameras active</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm text-white"><Wifi className="h-4 w-4" /> Network</div>
                  <p className="text-xs text-gray-400">Stable • 14 devices connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="h-3.5 w-3.5" /> Live feed
              </div>
            </div>
            <div className="space-y-2">
              {activityLog.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
                  <span className="text-gray-300">{entry.text}</span>
                  <span className="text-xs text-gray-500">{entry.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
