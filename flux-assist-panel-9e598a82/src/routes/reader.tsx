import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Upload, Play, Pause } from "lucide-react";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";
import { GlassCard, SectionTitle } from "@/components/jarvis/ui";

export const Route = createFileRoute("/reader")({ component: Page });

function Page() {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [lang, setLang] = useState<"en" | "hi">("en");

  return (
    <PageShell>
      <PageHeader title="AI Reader" subtitle="Upload a document and listen." icon={<BookOpen className="h-5 w-5" />} />
      <div className="grid gap-5 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <SectionTitle>Document</SectionTitle>
          <label className="flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 hover:border-cyan-300/40">
            <Upload className="h-8 w-8 text-cyan-300" />
            <span className="text-sm">Drop PDF or text file</span>
            <span className="text-[11px] text-muted-foreground">or click to upload</span>
            <input type="file" className="hidden" />
          </label>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span><span>32%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-1/3 rounded-full bg-cyan-300" style={{ boxShadow: "0 0 8px #67e8f9" }} />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionTitle>Controls</SectionTitle>
          <button
            onClick={() => setPlaying(!playing)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 py-3 font-semibold text-black hover:bg-cyan-200"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playing ? "Pause" : "Read Aloud"}
          </button>

          <div className="mt-5">
            <label className="text-xs text-muted-foreground">Speed: {speed.toFixed(1)}x</label>
            <input type="range" min={0.5} max={2} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="mt-2 w-full accent-cyan-400" />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs text-muted-foreground">Language</p>
            <div className="grid grid-cols-2 gap-2">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-lg py-2 text-sm ${lang === l ? "bg-cyan-300/20 text-cyan-200 ring-1 ring-cyan-300/40" : "bg-white/5 hover:bg-white/10"}`}
                >
                  {l === "en" ? "English" : "Hindi"}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}
