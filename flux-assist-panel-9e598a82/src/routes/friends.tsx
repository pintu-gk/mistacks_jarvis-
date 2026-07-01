import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Plus, Upload, Mic2, X } from "lucide-react";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";
import { GlassCard } from "@/components/jarvis/ui";

export const Route = createFileRoute("/friends")({ component: Page });

const initial = [
  { name: "Rahul", role: "Friend", initial: "R", gradient: "linear-gradient(135deg,#60a5fa,#a78bfa)", active: true },
  { name: "Aayush", role: "Best Friend", initial: "A", gradient: "linear-gradient(135deg,#fb7185,#fbbf24)", active: false },
  { name: "Riya", role: "Sister", initial: "R", gradient: "linear-gradient(135deg,#f0abfc,#67e8f9)", active: false },
  { name: "Priya", role: "Mom", initial: "P", gradient: "linear-gradient(135deg,#4ade80,#67e8f9)", active: false },
];

function Page() {
  const [friends, setFriends] = useState(initial);
  const [open, setOpen] = useState(false);

  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader title="Friends & Voices" subtitle="Personalize Jarvis with familiar voices." icon={<Users className="h-5 w-5" />} />
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-300/20"
        >
          <Plus className="h-4 w-4" /> Add Friend
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {friends.map((f, idx) => (
          <GlassCard key={f.name}>
            <div className="flex flex-col items-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full text-2xl font-bold text-black" style={{ background: f.gradient }}>
                {f.initial}
              </div>
              <p className="mt-3 text-base font-semibold">{f.name}</p>
              <p className="text-xs text-cyan-300/80">{f.role}</p>
              <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">
                <Upload className="h-3 w-3" /> Upload voice
              </button>
              <button
                onClick={() => setFriends(friends.map((x, i) => ({ ...x, active: i === idx })))}
                className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
                  f.active ? "bg-cyan-300/20 text-cyan-200 ring-1 ring-cyan-300/40" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <Mic2 className="h-3 w-3" /> {f.active ? "Active voice" : "Use this voice"}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <GlassCard className="w-[420px] !p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Add a Friend</h3>
              <button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Name" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-300/50" />
              <input placeholder="Role (e.g., Friend)" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-300/50" />
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-6 text-sm text-muted-foreground hover:border-cyan-300/50">
                <Upload className="h-4 w-4" /> Upload photo & voice sample
              </button>
              <button onClick={() => setOpen(false)} className="w-full rounded-lg bg-cyan-300 py-2 text-sm font-semibold text-black hover:bg-cyan-200">
                Save Friend
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </PageShell>
  );
}
