
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

const SUGGESTIONS = [
  { label: "Jarvis open youtube", icon: <Youtube className="h-3.5 w-3.5 text-red-400" /> },
  { label: "Jarvis open google", icon: <Chrome className="h-3.5 w-3.5 text-blue-400" /> },
  { label: "Jarvis open teligram", icon: <Telegram className="h-3.5 w-3.5 text-sky-400" /> },
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

export default function Dashboard() {
  const [command, setCommand] = useState("");
  const [weather, setWeather] = useState<WeatherData>({
    temp: 27,
    condition: "Light Rain",
    humidity: 34,
    wind: 12,
    pressure: 1013,
  });

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
    const cmd = command.toLowerCase();
    const match = QUICK_APPS.find((a) => cmd.includes(a.name.toLowerCase()));
    if (match) openApp(match.url);
    setCommand("");
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* CENTER */}
        <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-between">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 pt-4">
            <p className="font-display text-2xl tracking-widest text-cyan-100/90">Listening...</p>

            {/* AI Core */}
            <div className="relative grid h-[320px] w-[320px] place-items-center">
              <Waveform side="left" />
              <Waveform side="right" />
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-cyan-300/40"
                  style={{
                    inset: i * 22,
                    boxShadow: `0 0 30px oklch(0.88 0.18 210 / ${0.25 - i * 0.06}) inset, 0 0 20px oklch(0.88 0.18 210 / ${0.2 - i * 0.05})`,
                  }}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 18 + i * 6, repeat: Infinity, ease: "linear" }}
                />
              ))}
              <div className="absolute inset-16 rounded-full border border-dashed border-cyan-300/30" />
              <motion.div
                className="relative grid h-40 w-40 place-items-center rounded-full"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, oklch(0.45 0.1 250), oklch(0.1 0.04 270) 75%)",
                  boxShadow:
                    "inset 0 -12px 36px oklch(0 0 0 / 0.6), 0 0 60px oklch(0.88 0.18 210 / 0.55), 0 0 120px oklch(0.88 0.18 210 / 0.3)",
                }}
              >
                <div className="absolute left-1 top-1/2 h-10 w-4 -translate-y-1/2 rounded-l-full bg-cyan-300/70 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
                <div className="absolute right-1 top-1/2 h-10 w-4 -translate-y-1/2 rounded-r-full bg-cyan-300/70 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-3">
                    <div className="h-3.5 w-3.5 rounded-full bg-cyan-200" style={{ boxShadow: "0 0 14px rgba(103,232,249,0.9)" }} />
                    <div className="h-3.5 w-3.5 rounded-full bg-cyan-200" style={{ boxShadow: "0 0 14px rgba(103,232,249,0.9)" }} />
                  </div>
                  <div className="h-1.5 w-9 rounded-full bg-cyan-200/80" />
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

            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setCommand(s.label)}
                  className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100 backdrop-blur transition hover:bg-cyan-400/20"
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
              <button className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/5 text-cyan-200">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Command bar */}
          <form onSubmit={handleSubmit} className="mt-6 w-full max-w-2xl">
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
              <div className="mt-2 flex items-center gap-1 border-t border-white/5 pt-2">
                {QUICK_APPS.map((a) => (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => openApp(a.url)}
                    title={a.name}
                    className={`grid h-9 w-9 place-items-center rounded-full bg-white/5 transition hover:bg-white/10 ${a.color}`}
                  >
                    {a.icon}
                  </button>
                ))}
                <button type="button" className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10">
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
              <CloudRain className="h-12 w-12 text-cyan-300" />
              <div>
                <div className="font-display text-4xl font-bold text-white">{weather.temp}°C</div>
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
  return (
    <div
      className="absolute top-1/2 flex h-16 -translate-y-1/2 items-center gap-[3px]"
      style={{ [side]: "-110px" } as React.CSSProperties}
    >
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-cyan-300"
          style={{ boxShadow: "0 0 8px rgba(103,232,249,0.8)" }}
          animate={{ height: [h * 0.3, h, h * 0.3] }}
          transition={{ duration: 0.9 + (i % 4) * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}
