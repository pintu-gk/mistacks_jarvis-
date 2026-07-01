import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Globe, Youtube, MessageCircle, Mail, Map, Search, Github } from "lucide-react";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";
import { GlassCard } from "@/components/jarvis/ui";
import { parseCommand } from "@/lib/jarvis-parse.functions";

export const Route = createFileRoute("/voice")({ component: JarvisVoicePage });

type Status = "idle" | "listening" | "processing" | "error";

interface LocalAction {
  keywords: string[];
  label: string;
  run: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

const ACTIONS: LocalAction[] = [
  { keywords: ["youtube"], label: "YouTube", icon: Youtube, run: () => open("https://youtube.com") },
  { keywords: ["google"], label: "Google", icon: Search, run: () => open("https://google.com") },
  { keywords: ["whatsapp"], label: "WhatsApp", icon: MessageCircle, run: () => open("https://web.whatsapp.com") },
  { keywords: ["gmail", "mail", "email"], label: "Gmail", icon: Mail, run: () => open("https://mail.google.com") },
  { keywords: ["map", "maps"], label: "Maps", icon: Map, run: () => open("https://maps.google.com") },
  { keywords: ["github"], label: "GitHub", icon: Github, run: () => open("https://github.com") },
];

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

function stripWake(text: string): string | null {
  const lower = text.toLowerCase();
  const idx = lower.indexOf("jarvis");
  if (idx === -1) return null;
  return text.slice(idx + "jarvis".length).replace(/^[\s,.:;!?-]+/, "").trim();
}

function tryLocal(command: string): LocalAction | null {
  const c = command.toLowerCase();
  if (!c.includes("open")) {
    // also allow "youtube please"
  }
  for (const a of ACTIONS) {
    if (a.keywords.some((k) => c.includes(k))) return a;
  }
  return null;
}

function executeParsed(parsed: { action?: string; target?: string; app?: string } | null): string | null {
  if (!parsed) return null;
  const target = (parsed.target || parsed.app || "").toLowerCase();
  if (!target) return null;
  for (const a of ACTIONS) {
    if (a.keywords.some((k) => target.includes(k))) {
      a.run();
      return a.label;
    }
  }
  return null;
}

function JarvisVoicePage() {
  const [status, setStatus] = useState<Status>("idle");
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<string>("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);
  const listeningRef = useRef(false);

  const pushLog = useCallback((m: string) => {
    setLog((l) => [`${new Date().toLocaleTimeString()}  ${m}`, ...l].slice(0, 20));
  }, []);

  const handleCommand = useCallback(
    async (raw: string) => {
      const cmd = stripWake(raw);
      if (cmd === null) {
        pushLog(`Heard: "${raw}" — Wake word not detected`);
        return;
      }
      if (!cmd) {
        pushLog("Wake word detected, awaiting command…");
        speak("Yes?");
        return;
      }
      pushLog(`Command: "${cmd}"`);
      const local = tryLocal(cmd);
      if (local) {
        local.run();
        const msg = `Opening ${local.label}`;
        speak(msg);
        pushLog(msg);
        return;
      }
      setStatus("processing");
      try {
        const res = await parseCommand({ data: { command: cmd } });
        setAiResult(JSON.stringify(res.parsed ?? res.raw, null, 2));
        const label = executeParsed(res.parsed as any);
        if (label) {
          const msg = `Opening ${label}`;
          speak(msg);
          pushLog(`AI parsed → ${msg}`);
        } else {
          speak("Sorry, I couldn't perform that action.");
          pushLog("AI parsed but no matching action.");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "AI request failed";
        pushLog(`Error: ${msg}`);
        speak("Network error.");
      } finally {
        setStatus(listeningRef.current ? "listening" : "idle");
      }
    },
    [pushLog],
  );

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (ev: any) => {
      let interimStr = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        const t = r[0].transcript;
        if (r.isFinal) {
          setFinalText((prev) => (prev ? prev + " " : "") + t.trim());
          setInterim("");
          handleCommand(t.trim());
        } else {
          interimStr += t;
        }
      }
      if (interimStr) setInterim(interimStr);
    };
    rec.onerror = (e: any) => {
      pushLog(`Recognition error: ${e.error ?? "unknown"}`);
      setStatus("error");
    };
    rec.onend = () => {
      if (listeningRef.current) {
        try {
          rec.start();
        } catch {
          /* ignore */
        }
      } else {
        setStatus("idle");
      }
    };
    recRef.current = rec;
    return () => {
      listeningRef.current = false;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    };
  }, [handleCommand, pushLog]);

  const toggle = () => {
    const rec = recRef.current;
    if (!rec) return;
    if (listeningRef.current) {
      listeningRef.current = false;
      rec.stop();
      setStatus("idle");
    } else {
      listeningRef.current = true;
      setInterim("");
      try {
        rec.start();
        setStatus("listening");
        speak("Listening");
      } catch {
        /* already started */
      }
    }
  };

  const statusLabel =
    status === "listening" ? "Listening…" : status === "processing" ? "Processing…" : status === "error" ? "Error" : "Idle";
  const statusColor =
    status === "listening"
      ? "text-cyan-300"
      : status === "processing"
        ? "text-amber-300"
        : status === "error"
          ? "text-rose-400"
          : "text-white/60";

  return (
    <PageShell>
      <PageHeader
        title="Jarvis Voice Assistant"
        subtitle='Say "Jarvis, open YouTube" — wake word required.'
        icon={<Mic className="h-5 w-5" />}
      />

      <GlassCard className="grid place-items-center !p-8 sm:!p-12">
        <motion.button
          onClick={toggle}
          whileTap={{ scale: 0.95 }}
          disabled={!supported}
          className={`relative grid h-36 w-36 sm:h-44 sm:w-44 place-items-center rounded-full border transition-all ${
            status === "listening"
              ? "border-cyan-300/70 bg-cyan-300/20 shadow-[0_0_60px_rgba(34,211,238,0.55)] animate-pulse"
              : "border-cyan-300/30 bg-cyan-300/10 hover:bg-cyan-300/20"
          } text-cyan-300 disabled:opacity-40`}
        >
          {status === "listening" ? <MicOff className="h-14 w-14" /> : <Mic className="h-14 w-14" />}
          <span className="pointer-events-none absolute inset-0 rounded-full border border-cyan-300/20" />
        </motion.button>

        <p className={`mt-6 font-display text-xl ${statusColor}`}>{statusLabel}</p>
        {!supported && (
          <p className="mt-2 text-sm text-rose-400">
            SpeechRecognition is not supported in this browser. Try Chrome.
          </p>
        )}

        <div className="mt-6 w-full max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-white/40 mb-2">Transcript</div>
          <div className="min-h-24 rounded-lg border border-white/10 bg-black/40 p-4 text-sm leading-relaxed">
            <span className="text-white/90">{finalText}</span>{" "}
            <span className="text-cyan-300/70 italic">{interim}</span>
            {!finalText && !interim && <span className="text-white/30">Press the mic and start speaking…</span>}
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <div className="mb-3 text-sm font-semibold text-white/80">Quick Commands</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={a.run}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 hover:border-cyan-300/40 transition"
              >
                <a.icon className="h-4 w-4 text-cyan-300" />
                {a.label}
              </button>
            ))}
          </div>
          <div className="mt-4 text-xs text-white/40">
            Try: <em>"Jarvis, open YouTube"</em>, <em>"Jarvis, open Gmail"</em>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Globe className="h-4 w-4 text-cyan-300" /> Activity Log
          </div>
          <div className="max-h-48 overflow-y-auto text-xs font-mono space-y-1 scrollbar-thin">
            {log.length === 0 && <div className="text-white/30">No activity yet.</div>}
            {log.map((l, i) => (
              <div key={i} className="text-white/70">
                {l}
              </div>
            ))}
          </div>
          {aiResult && (
            <>
              <div className="mt-4 mb-2 text-xs uppercase tracking-wider text-white/40">AI Parsed JSON</div>
              <pre className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-cyan-200 overflow-auto">
                {aiResult}
              </pre>
            </>
          )}
        </GlassCard>
      </div>
    </PageShell>
  );
}
