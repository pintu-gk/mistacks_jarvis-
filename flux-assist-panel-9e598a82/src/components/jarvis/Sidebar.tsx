import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Mic,
  Users,
  GraduationCap,
  AlarmClock,
  BookOpen,
  MessageCircle,
  LayoutGrid,
  FileText,
  Home,
  ShieldCheck,
  Settings,
  Power,
  X,
} from "lucide-react";
import { useSidebarState } from "./AppShell";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/voice", label: "Voice Assistant", icon: Mic },
  { to: "/friends", label: "Friends & Voices", icon: Users },
  { to: "/study-planner", label: "Study Planner", icon: GraduationCap },
  { to: "/routine", label: "Routine & Alarm", icon: AlarmClock },
  { to: "/reader", label: "AI Reader", icon: BookOpen },
  { to: "/chat", label: "AI Chat", icon: MessageCircle },
  { to: "/apps", label: "Apps & Tools", icon: LayoutGrid },
  { to: "/files", label: "Files & Notes", icon: FileText },
  { to: "/smart-home", label: "Smart Home", icon: Home },
  { to: "/security", label: "Security Center", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { open, setOpen } = useSidebarState();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[260px] shrink-0 flex-col border-r border-white/5 bg-[oklch(0.12_0.02_270)]/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:bg-[oklch(0.12_0.02_270)]/80 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Logo */}
      <div className="flex items-start justify-between px-6 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/dvb4mqhhh/image/upload/f_auto,q_auto/jarvis_ai_logo_hmr1n3"
            alt="JARVIS AI"
            className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(103,232,249,0.45)]"
          />
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`sidebar-link group relative min-h-11 text-sm font-medium ${active ? "active" : ""}`}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(90deg, oklch(0.88 0.18 210 / 0.18), oklch(0.7 0.22 295 / 0.12))",
                        boxShadow: "inset 0 0 0 1px oklch(0.88 0.18 210 / 0.35), 0 0 24px oklch(0.88 0.18 210 / 0.15)",
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={`relative h-[18px] w-[18px] transition ${
                      active ? "text-cyan-300" : "text-muted-foreground group-hover:text-cyan-300/80"
                    }`}
                  />
                  <span className={`relative ${active ? "text-foreground" : ""}`}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Exit */}
      <div className="px-3 pb-5 pt-3">
        <button className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10">
          <Power className="h-4 w-4" />
          Exit Jarvis
        </button>
      </div>
    </aside>
  );
}
