import { useMemo, useState, useEffect, useRef } from "react";
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
  MicOff,
  Sparkles,
  ShieldCheck,
  Wifi,
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

// ==================== TYPES ====================
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
  actions: { deviceId: string; updates: Record<string, any> }[];
}

interface Environment {
  temperature: number;
  humidity: number;
  aqi: number;
  power: number;
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

const STORAGE_KEY = "jarvis_smarthome_v1";

// ==================== COMPONENTS ====================
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
      className={`rounded-xl border p-4 transition-all ${
        isOn ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/5"
      }`}
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
            <Button
              variant="ghost"
              size="sm"
              className={device.status.locked ? "text-red-400" : "text-green-400"}
              onClick={() => onToggle(device.id)}
            >
              {device.status.locked ? "Locked" : "Unlocked"}
            </Button>
          )}
          {(device.type === "light" || device.type === "plug") && (
            <Switch
              checked={device.status.power === "on"}
              onCheckedChange={() => onToggle(device.id)}
              className="data-[state=checked]:bg-cyan-400"
            />
          )}
          {device.type === "fan" && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onAdjust(device.id, { speed: Math.max(0, (device.status.speed || 0) - 1) })}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-xs text-white">{device.status.speed || 0}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onAdjust(device.id, { speed: Math.min(3, (device.status.speed || 0) + 1) })}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            </div>
          )}
          {device.type === "thermostat" && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onAdjust(device.id, { temperature: Math.max(16, (device.status.temperature || 20) - 1) })}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium text-white">
                {device.status.temperature || 20}°
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onAdjust(device.id, { temperature: Math.min(30, (device.status.temperature || 20) + 1) })}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            </div>
          )}
          {device.type === "camera" && <Badge className="border-0 bg-green-500/10 text-green-400">● Live</Badge>}
        </div>
      </div>

      {device.type === "light" && device.status.power === "on" && (
        <div className="mt-3">
          <Slider
            value={[device.status.brightness || 70]}
            max={100}
            step={1}
            onValueChange={(value) => onAdjust(device.id, { brightness: value[0] })}
          />
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
      className={`cursor-pointer rounded-xl border p-4 transition-all ${
        scene.active ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
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

// ==================== MAIN COMPONENT ====================
export default function SmartHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [voiceCommand, setVoiceCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ---------- State with localStorage ----------
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.devices) return parsed.devices;
      } catch {}
    }
    return [
      { id: "living-light", name: "Living Room Lights", room: "Living", type: "light", status: { power: "on", brightness: 70 }, isOnline: true, icon: "light" },
      { id: "thermostat", name: "Thermostat", room: "Living", type: "thermostat", status: { power: "on", temperature: 23 }, isOnline: true, icon: "thermostat" },
      { id: "front-door", name: "Front Door", room: "Hallway", type: "lock", status: { locked: true }, isOnline: true, icon: "lock" },
      { id: "bed-fan", name: "Bedroom Fan", room: "Bedroom", type: "fan", status: { power: "on", speed: 2 }, isOnline: true, icon: "fan" },
      { id: "camera", name: "Security Camera", room: "Hallway", type: "camera", status: { power: "on", recording: false }, isOnline: true, icon: "camera" },
      { id: "charger", name: "Phone Charger", room: "Bedroom", type: "plug", status: { power: "on" }, isOnline: true, icon: "plug" },
      { id: "study-lamp", name: "Study Lamp", room: "Study Room", type: "light", status: { power: "off", brightness: 0 }, isOnline: true, icon: "light" },
      { id: "speaker", name: "Smart Speaker", room: "Living", type: "speaker", status: { power: "on", volume: 60 }, isOnline: true, icon: "speaker" },
    ];
  });

  const [scenes, setScenes] = useState<Scene[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.scenes) return parsed.scenes;
      } catch {}
    }
    return [
      {
        id: "morning",
        name: "Good Morning",
        icon: "🌅",
        description: "Lights 30% · Temp 22°C",
        active: false,
        actions: [
          { deviceId: "living-light", updates: { power: "on", brightness: 30 } },
          { deviceId: "study-lamp", updates: { power: "on", brightness: 30 } },
          { deviceId: "thermostat", updates: { temperature: 22 } },
        ],
      },
      {
        id: "study",
        name: "Study Mode",
        icon: "📖",
        description: "Lights 70% · Fan On",
        active: false,
        actions: [
          { deviceId: "study-lamp", updates: { power: "on", brightness: 70 } },
          { deviceId: "bed-fan", updates: { power: "on", speed: 2 } },
          { deviceId: "living-light", updates: { power: "off" } },
        ],
      },
      {
        id: "movie",
        name: "Movie Mode",
        icon: "🎬",
        description: "Lights 10% · Temp 20°C",
        active: false,
        actions: [
          { deviceId: "living-light", updates: { power: "on", brightness: 10 } },
          { deviceId: "study-lamp", updates: { power: "off" } },
          { deviceId: "thermostat", updates: { temperature: 20 } },
        ],
      },
      {
        id: "night",
        name: "Good Night",
        icon: "🌙",
        description: "All Off · Security On",
        active: false,
        actions: [
          { deviceId: "living-light", updates: { power: "off" } },
          { deviceId: "study-lamp", updates: { power: "off" } },
          { deviceId: "bed-fan", updates: { power: "off" } },
          { deviceId: "front-door", updates: { locked: true } },
        ],
      },
      {
        id: "away",
        name: "Away Mode",
        icon: "🚪",
        description: "All Locked · Cameras On",
        active: false,
        actions: [
          { deviceId: "front-door", updates: { locked: true } },
          { deviceId: "camera", updates: { power: "on", recording: true } },
          { deviceId: "living-light", updates: { power: "off" } },
          { deviceId: "study-lamp", updates: { power: "off" } },
        ],
      },
    ];
  });

  const [activityLog, setActivityLog] = useState<{ id: string; text: string; time: string; type: string }[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.log) return parsed.log;
      } catch {}
    }
    return [
      { id: "1", text: "Front door locked", time: "9:45 PM", type: "info" },
      { id: "2", text: "Living room lights turned on", time: "9:30 PM", type: "success" },
      { id: "3", text: "Thermostat set to 23°C", time: "8:15 PM", type: "info" },
    ];
  });

  // Compute environment from device states
  const environment = useMemo<Environment>(() => {
    let temp = 24;
    let humidity = 58;
    let aqi = 42;
    let power = 1.2;

    const thermostat = devices.find((d) => d.type === "thermostat");
    if (thermostat && thermostat.status.power === "on") {
      temp = thermostat.status.temperature || 24;
    }

    const lightsOn = devices.filter((d) => d.type === "light" && d.status.power === "on");
    if (lightsOn.length > 0) {
      temp += lightsOn.length * 0.5;
      power += lightsOn.length * 0.15;
    }

    const fansOn = devices.filter((d) => d.type === "fan" && d.status.power === "on");
    if (fansOn.length > 0) {
      temp -= fansOn.length * 0.3;
      power += fansOn.length * 0.1;
    }

    const plugsOn = devices.filter((d) => d.type === "plug" && d.status.power === "on");
    power += plugsOn.length * 0.05;

    return {
      temperature: Math.round(temp * 10) / 10,
      humidity: humidity + (Math.random() * 2 - 1),
      aqi: aqi + (Math.random() * 4 - 2),
      power: Math.round(power * 10) / 10,
    };
  }, [devices]);

  // ---------- Helpers ----------
  const addActivityLog = (text: string, type: "info" | "success" | "warning") => {
    const newEntry = { id: Date.now().toString(), text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type };
    setActivityLog((prev) => [newEntry, ...prev.slice(0, 19)]);
  };

  // ---------- Handlers ----------
  const handleDeviceToggle = (id: string) => {
    setDevices((prev) =>
      prev.map((device) => {
        if (device.id !== id) return device;
        const nextStatus = { ...device.status };
        let logMsg = "";
        if (device.type === "lock") {
          nextStatus.locked = !nextStatus.locked;
          logMsg = `${device.name} ${nextStatus.locked ? "locked" : "unlocked"}`;
          addActivityLog(logMsg, "success");
        } else if (device.type === "light" || device.type === "plug") {
          nextStatus.power = nextStatus.power === "on" ? "off" : "on";
          logMsg = `${device.name} turned ${nextStatus.power === "on" ? "on" : "off"}`;
          addActivityLog(logMsg, "success");
        } else if (device.type === "fan") {
          nextStatus.power = nextStatus.power === "on" ? "off" : "on";
          if (nextStatus.power === "on") nextStatus.speed = 1;
          logMsg = `${device.name} turned ${nextStatus.power === "on" ? "on" : "off"}`;
          addActivityLog(logMsg, "success");
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
        let logMsg = "";
        if (device.type === "light" && updates.brightness !== undefined) {
          logMsg = `${device.name} brightness set to ${updates.brightness}%`;
          addActivityLog(logMsg, "info");
        }
        if (device.type === "thermostat" && updates.temperature !== undefined) {
          logMsg = `${device.name} set to ${updates.temperature}°C`;
          addActivityLog(logMsg, "info");
        }
        if (device.type === "fan" && updates.speed !== undefined) {
          const speedNames = ["Off", "Low", "Medium", "High"];
          logMsg = `${device.name} speed set to ${speedNames[updates.speed] || "Off"}`;
          addActivityLog(logMsg, "info");
        }
        return { ...device, status: nextStatus };
      })
    );
  };

  const handleSceneActivate = (id: string) => {
    const scene = scenes.find((s) => s.id === id);
    if (!scene) return;

    scene.actions.forEach((action) => {
      setDevices((prev) =>
        prev.map((d) => {
          if (d.id !== action.deviceId) return d;
          return { ...d, status: { ...d.status, ...action.updates } };
        })
      );
    });

    setScenes((prev) =>
      prev.map((s) => ({ ...s, active: s.id === id }))
    );

    addActivityLog(`Scene "${scene.name}" activated`, "success");
  };

  // ---------- Voice Command Parsing ----------
  const executeVoiceCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    addActivityLog(`🎤 Command: "${trimmed}"`, "info");

    let executed = false;

    // "turn on/off <device>"
    const toggleMatch = trimmed.match(/(turn|switch)\s+(on|off)\s+(.+)/);
    if (toggleMatch) {
      const action = toggleMatch[2];
      const target = toggleMatch[3].trim();
      const device = devices.find((d) => d.name.toLowerCase().includes(target) || d.room.toLowerCase().includes(target));
      if (device) {
        if (device.type === "light" || device.type === "plug" || device.type === "fan") {
          handleDeviceToggle(device.id);
          executed = true;
        } else if (device.type === "lock") {
          const newLocked = action === "off";
          setDevices((prev) =>
            prev.map((d) => {
              if (d.id !== device.id) return d;
              return { ...d, status: { ...d.status, locked: newLocked } };
            })
          );
          addActivityLog(`${device.name} ${newLocked ? "locked" : "unlocked"}`, "success");
          executed = true;
        }
      }
    }

    // "set temperature to <number>"
    const tempMatch = trimmed.match(/set temperature (?:to|at)\s*(\d+)/);
    if (tempMatch) {
      const temp = parseInt(tempMatch[1]);
      const thermostat = devices.find((d) => d.type === "thermostat");
      if (thermostat) {
        handleDeviceAdjust(thermostat.id, { temperature: temp });
        executed = true;
      }
    }

    // "activate <scene>"
    const sceneMatch = trimmed.match(/activate\s+(.+)/);
    if (sceneMatch) {
      const sceneName = sceneMatch[1].trim();
      const scene = scenes.find((s) => s.name.toLowerCase().includes(sceneName));
      if (scene) {
        handleSceneActivate(scene.id);
        executed = true;
      }
    }

    if (!executed) {
      addActivityLog(`⚠️ Command not recognized: "${trimmed}"`, "warning");
    }
  };

  // ---------- Speech Recognition ----------
  const startListening = () => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addActivityLog("⚠️ Speech recognition not supported in this browser.", "warning");
      return;
    }

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      addActivityLog("🎤 Listening...", "info");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceCommand(transcript);
      // Auto-execute after a short delay so the user sees the text
      setTimeout(() => {
        executeVoiceCommand(transcript);
        setVoiceCommand("");
      }, 300);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      addActivityLog(`⚠️ Speech error: ${event.error}`, "warning");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ---------- Persist state ----------
  useEffect(() => {
    const data = { devices, scenes, log: activityLog };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [devices, scenes, activityLog]);

  // ---------- Computed ----------
  const rooms = useMemo(() => ["All", ...new Set(devices.map((d) => d.room))], [devices]);
  const filteredDevices = selectedRoom === "All" ? devices : devices.filter((d) => d.room === selectedRoom);

  return (
    <PageShell>
      <PageHeader title="Smart Home Control" subtitle="Monitor your environment and control every room." icon={<Home className="h-5 w-5" />} />

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

        {/* Environment Cards */}
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
                  <p className="text-lg font-semibold text-white">{Math.round(environment.humidity)}%</p>
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
                  <p className="text-lg font-semibold text-white">{Math.round(environment.aqi)} <span className="text-xs text-gray-400">Good</span></p>
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
                  <p className="text-lg font-semibold text-white">{environment.power.toFixed(1)} kW</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Room Tabs */}
        <div className="flex flex-wrap gap-2">
          {rooms.map((room) => (
            <Button
              key={room}
              variant={selectedRoom === room ? "default" : "outline"}
              size="sm"
              className={
                selectedRoom === room
                  ? "bg-cyan-400 hover:bg-cyan-500"
                  : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }
              onClick={() => setSelectedRoom(room)}
            >
              {room}
            </Button>
          ))}
        </div>

        {/* Scenes */}
        {(activeTab === "overview" || activeTab === "scenes") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Smart Scenes</h2>
              <Badge variant="outline" className="border-white/10 text-gray-400">
                {scenes.filter((s) => s.active).length} active
              </Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {scenes.map((scene) => (
                <SceneCard key={scene.id} scene={scene} onActivate={handleSceneActivate} />
              ))}
            </div>
          </div>
        )}

        {/* Devices Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Connected Devices</h2>
            <Badge variant="outline" className="border-white/10 text-gray-400">{filteredDevices.length} devices</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDevices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onToggle={handleDeviceToggle}
                onAdjust={handleDeviceAdjust}
              />
            ))}
          </div>
        </div>

        {/* Voice & Activity */}
        {(activeTab === "overview" || activeTab === "voice") && (
          <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-3 transition ${isListening ? "bg-red-500/30 text-red-400 animate-pulse" : "bg-cyan-400/20 text-cyan-300"}`}>
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Voice control</h3>
                  <p className="text-xs text-gray-400">
                    {isListening ? "Listening... speak your command" : "Ask JARVIS to adjust lights, locks, or routines."}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={voiceCommand}
                  onChange={(e) => setVoiceCommand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && executeVoiceCommand(voiceCommand)}
                  placeholder='Try: “turn off the bedroom lights”'
                  className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                />
                <div className="flex gap-2">
                  <Button
                    className={`gap-2 ${isListening ? "bg-red-500 hover:bg-red-400" : "bg-cyan-400 text-black hover:bg-cyan-300"}`}
                    onClick={startListening}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isListening ? "Stop" : "Mic"}
                  </Button>
                  <Button
                    className="bg-cyan-400 text-black hover:bg-cyan-300"
                    onClick={() => executeVoiceCommand(voiceCommand)}
                  >
                    Run
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm text-white"><ShieldCheck className="h-4 w-4" /> Security</div>
                  <p className="text-xs text-gray-400">
                    {devices.find(d => d.type === "lock")?.status.locked ? "Front door locked" : "Front door unlocked"} • 
                    Cameras {devices.find(d => d.type === "camera")?.status.power === "on" ? "active" : "inactive"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm text-white"><Wifi className="h-4 w-4" /> Network</div>
                  <p className="text-xs text-gray-400">Stable • {devices.filter(d => d.isOnline).length} devices connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Log */}
        <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="h-3.5 w-3.5" /> Live feed
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
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