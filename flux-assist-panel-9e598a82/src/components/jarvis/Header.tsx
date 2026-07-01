import { useEffect, useState } from "react";
import { Menu, Mic, Wifi } from "lucide-react";
import { useSidebarState } from "./AppShell";

export function Header() {
  const [now, setNow] = useState(new Date());
  const { setOpen } = useSidebarState();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const [t, ampm] = time.split(" ");
  const date = now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="grid h-16 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/5 bg-[oklch(0.12_0.02_270)]/40 px-3 backdrop-blur-xl sm:h-20 sm:gap-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-6 lg:px-8">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/5 text-cyan-300 hover:bg-white/10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground sm:text-sm">How can I help you today?</p>
      </div>

      <div className="glass-card hidden items-center gap-3 px-5 py-2 lg:flex">
        <div className="text-right leading-tight">
          <div className="font-display text-xl font-bold tracking-wider xl:text-2xl">
            {t} <span className="text-sm text-cyan-300/80">{ampm}</span>
          </div>
          <div className="text-[11px] text-muted-foreground">{date}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2 text-sm md:flex">
          <Wifi className="h-4 w-4 text-cyan-300" />
          <div className="leading-tight">
            <div className="text-sm font-medium">System Online</div>
            <div className="text-[11px] text-muted-foreground">All systems normal</div>
          </div>
        </div>
        <button
          className="animate-glow-pulse grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-cyan-300 transition hover:bg-cyan-300/20"
          aria-label="Microphone"
        >
          <Mic className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
