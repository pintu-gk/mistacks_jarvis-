import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Settings as Cog,
  User,
  Brain,
  Mic,
  Palette,
  Languages,
  Zap,
  Shield,
  Bell,
  Cpu,
  Database,
  Info,
  Check,
  Trash2,
  LogOut,
  Upload,
  Crown,
  ChevronRight,
  X,
  Plus,
  Smartphone,
  Laptop,
  Lightbulb,
  Camera,
  Wifi,
  AlertTriangle,
  Menu,
  FileText,
} from "lucide-react";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";
import { GlassCard, SectionTitle } from "@/components/jarvis/ui";

export const Route = createFileRoute("/settings")({ component: Page });

// ============== Primitives ==============
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 ${
        on ? "bg-cyan-300/40 shadow-[0_0_18px_oklch(0.88_0.18_210/0.55)]" : "bg-white/10"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-6 w-6 rounded-full ${
          on ? "left-[1.375rem] bg-cyan-200" : "left-0.5 bg-white"
        }`}
      />
    </button>
  );
}

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        {desc && <p className="truncate text-xs text-muted-foreground">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm outline-none transition focus:border-cyan-300/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_oklch(0.88_0.18_210/0.15)] ${props.className ?? ""}`}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm outline-none transition focus:border-cyan-300/50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#0f0f18]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`relative flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
              active ? "text-black" : "text-muted-foreground hover:text-white"
            }`}
          >
            {active && (
              <motion.span
                layoutId="segmented-pill"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 rounded-lg bg-cyan-300 shadow-[0_0_18px_oklch(0.88_0.18_210/0.5)]"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Slider({
  value,
  onChange,
  min,
  max,
  step,
  marks,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  marks?: { v: number; label: string }[];
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="relative h-2 rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
          style={{ width: `${pct}%`, boxShadow: "0 0 12px oklch(0.88 0.18 210 / 0.6)" }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 ring-2 ring-cyan-300/60"
          style={{ left: `${pct}%`, boxShadow: "0 0 12px oklch(0.88 0.18 210 / 0.8)" }}
        />
      </div>
      {marks && (
        <div className="mt-2 flex justify-between text-[10px] font-semibold text-muted-foreground">
          {marks.map((m) => (
            <span key={m.v}>{m.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-black transition hover:bg-cyan-200 hover:shadow-[0_0_24px_oklch(0.88_0.18_210/0.55)]"
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  danger,
  icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
        danger
          ? "border-red-500/30 bg-red-500/5 text-red-300 hover:border-red-500/50 hover:bg-red-500/10"
          : "border-white/10 bg-white/[0.03] text-white hover:border-cyan-300/40 hover:bg-white/[0.06]"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// ============== Settings state ==============
// ✅ REMOVED: "developer" and "model" sections
const SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "ai", label: "AI Assistant", icon: Brain },
  { id: "voice", label: "Voice & Speech", icon: Mic },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language", icon: Languages },
  { id: "automation", label: "Automation", icon: Zap },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "devices", label: "Connected Devices", icon: Cpu },
  { id: "data", label: "Data Management", icon: Database },
  { id: "about", label: "About JARVIS", icon: Info },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

type State = {
  account: { name: string; email: string; profileImage: string; plan: string };
  assistant: { name: string; personality: string; responseStyle: string; memoryEnabled: boolean; prefs: boolean; saveChats: boolean; saveStudy: boolean };
  voice: { voice: string; preset: string; wake: string; customWake: string; speed: number; language: string; speakReplies: boolean };
  appearance: { theme: string; accent: string; orb: boolean; wave: boolean; bg: boolean };
  language: { app: string; reply: string; voice: string };
  automation: { autoStart: boolean; backgroundListen: boolean; autoOpen: boolean };
  privacy: { mic: boolean; cam: boolean; share: boolean; saveHistory: boolean };
  notifications: { alarm: boolean; reminder: boolean; updates: boolean; security: boolean };
  devices: Record<string, boolean>;
};

const DEFAULTS: State = {
  account: { name: "Abhi", email: "abhi@jarvis.ai", profileImage: "", plan: "Premium" },
  assistant: { name: "Jarvis", personality: "Friendly", responseStyle: "Balanced", memoryEnabled: true, prefs: true, saveChats: true, saveStudy: false },
  voice: { voice: "Male", preset: "Jarvis Voice", wake: "Hey Jarvis", customWake: "", speed: 1, language: "English", speakReplies: true },
  appearance: { theme: "dark", accent: "cyan", orb: true, wave: true, bg: true },
  language: { app: "English", reply: "English", voice: "English" },
  automation: { autoStart: false, backgroundListen: true, autoOpen: false },
  privacy: { mic: true, cam: false, share: false, saveHistory: true },
  notifications: { alarm: true, reminder: true, updates: true, security: true },
  devices: { Phone: true, Laptop: true, ESP32: false, "Smart Lights": true, Camera: false },
};

const STORAGE_KEY = "jarvis_settings_v1";

function useSettings() {
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULTS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed };
    } catch {
      return DEFAULTS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state]);

  function update<K extends keyof State>(key: K, patch: Partial<State[K]>) {
    setState((s) => ({ ...s, [key]: { ...s[key], ...patch } }));
  }

  return { state, setState, update };
}

// ============== Legal Modal ==============
function LegalModal({
  open,
  onClose,
  title,
  content,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card relative w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300 ring-1 ring-cyan-300/30">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold tracking-wide">{title}</h3>
            </div>
            <div className="prose prose-invert max-w-none text-sm text-slate-300 whitespace-pre-wrap">
              {content}
            </div>
            <div className="mt-6 flex justify-end">
              <PrimaryButton onClick={onClose}>Close</PrimaryButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============== Page ==============
function Page() {
  const [active, setActive] = useState<SectionId>("account");
  const [navOpen, setNavOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<{ title: string; content: string } | null>(null);

  const { state, setState, update } = useSettings();
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<null | string>(null);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const activeMeta = useMemo(() => SECTIONS.find((s) => s.id === active)!, [active]);
  const ActiveIcon = activeMeta.icon;

  return (
    <PageShell>
      <PageHeader
        title="JARVIS Control Center"
        subtitle="Configure every system module."
        icon={<Cog className="h-5 w-5" />}
      />

      {/* Mobile nav trigger */}
      <button
        type="button"
        onClick={() => setNavOpen(true)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold lg:hidden"
      >
        <span className="flex items-center gap-2 text-cyan-200">
          <Menu className="h-4 w-4" />
          {SECTIONS.find((s) => s.id === active)?.label}
        </span>
        <ChevronRight className="h-4 w-4 opacity-50" />
      </button>

      {/* Mobile drawer overlay */}
      {navOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
        {/* Left Nav — drawer on mobile, sticky column on desktop */}
        <GlassCard
          className={`!p-3 lg:sticky lg:top-4 lg:self-start ${
            navOpen
              ? "fixed inset-y-0 left-0 z-50 w-[80vw] max-w-[300px] overflow-y-auto rounded-none lg:static lg:w-auto lg:max-w-none lg:rounded-2xl"
              : "hidden lg:block"
          }`}
        >
          <div className="mb-2 flex items-center justify-between lg:hidden">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Sections</p>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActive(s.id);
                    setNavOpen(false);
                  }}
                  className={`group relative flex min-h-11 w-full shrink-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-cyan-300/10 text-cyan-200"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="settings-active"
                      className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-cyan-300 shadow-[0_0_10px_oklch(0.88_0.18_210/0.8)]"
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{s.label}</span>
                  <ChevronRight className="hidden h-3.5 w-3.5 opacity-40 lg:block" />
                </button>
              );
            })}
          </nav>
        </GlassCard>

        {/* Right Content */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300 ring-1 ring-cyan-300/30">
                  <ActiveIcon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold tracking-wide">{activeMeta.label}</h2>
                  <p className="text-xs text-muted-foreground">Module configuration</p>
                </div>
              </div>

              {active === "account" && (
                <AccountSection state={state} update={update} onDelete={() => setConfirmDelete("account")} />
              )}
              {active === "ai" && <AiSection state={state} update={update} />}
              {active === "voice" && <VoiceSection state={state} update={update} />}
              {active === "appearance" && <AppearanceSection state={state} update={update} />}
              {active === "language" && <LanguageSection state={state} update={update} />}
              {active === "automation" && <AutomationSection state={state} update={update} />}
              {active === "privacy" && (
                <PrivacySection state={state} update={update} onClear={() => setConfirmDelete("history")} />
              )}
              {active === "notifications" && <NotificationsSection state={state} update={update} />}
              {active === "devices" && <DevicesSection state={state} update={update} />}
              {active === "data" && <DataSection onDeleteAll={() => setConfirmDelete("data")} />}
              {active === "about" && <AboutSection onOpenLegal={(title, content) => setLegalModal({ title, content })} />}

              <div className="flex items-center justify-end gap-3 pt-2">
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300"
                    >
                      <Check className="h-3.5 w-3.5" /> Settings saved
                    </motion.span>
                  )}
                </AnimatePresence>
                <PrimaryButton onClick={save}>
                  <Check className="h-4 w-4" /> Save Changes
                </PrimaryButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title={
          confirmDelete === "data"
            ? "Delete all data?"
            : confirmDelete === "history"
              ? "Clear chat history?"
              : "Delete account?"
        }
        description={
          confirmDelete === "data"
            ? "This permanently removes all stored data, settings, and history. This cannot be undone."
            : confirmDelete === "history"
              ? "All previous conversations will be permanently erased."
              : "Your account, profile and subscription will be removed. This cannot be undone."
        }
        onConfirm={() => {
          if (confirmDelete === "data" || confirmDelete === "account") {
            localStorage.removeItem(STORAGE_KEY);
            setState(DEFAULTS);
          }
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Legal Modal */}
      {legalModal && (
        <LegalModal
          open={!!legalModal}
          onClose={() => setLegalModal(null)}
          title={legalModal.title}
          content={legalModal.content}
        />
      )}
    </PageShell>
  );
}

// ============== Sections ==============
function AccountSection({
  state,
  update,
  onDelete,
}: {
  state: State;
  update: <K extends keyof State>(k: K, p: Partial<State[K]>) => void;
  onDelete: () => void;
}) {
  const initials = state.account.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <>
      <GlassCard>
        <SectionTitle>Profile</SectionTitle>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div className="relative">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400/30 to-purple-500/30 text-2xl font-bold ring-1 ring-cyan-300/30">
              {state.account.profileImage ? (
                <img src={state.account.profileImage} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-2 py-0.5 text-[9px] font-bold text-black shadow-lg">
              <Crown className="h-2.5 w-2.5" /> {state.account.plan}
            </span>
          </div>
          <div className="flex-1 space-y-3">
            <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 text-sm font-semibold text-muted-foreground transition hover:border-cyan-300/40 hover:text-cyan-200">
              <Upload className="h-4 w-4" /> Upload profile picture
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => update("account", { profileImage: String(reader.result) });
                  reader.readAsDataURL(f);
                }}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <TextInput
                  value={state.account.name}
                  onChange={(e) => update("account", { name: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <TextInput
                  type="email"
                  value={state.account.email}
                  onChange={(e) => update("account", { email: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Change Password">
              <TextInput type="password" placeholder="••••••••" />
            </Field>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle>Subscription</SectionTitle>
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-amber-300/20 bg-gradient-to-br from-amber-500/10 via-amber-300/[0.03] to-transparent p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-black">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-bold tracking-wide">JARVIS Premium</p>
              <p className="text-xs text-muted-foreground">Unlimited AI · Priority models · Advanced voice</p>
            </div>
          </div>
          <GhostButton>Manage Plan</GhostButton>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle>Account Actions</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <GhostButton icon={<LogOut className="h-4 w-4" />}>Logout</GhostButton>
          <GhostButton danger icon={<Trash2 className="h-4 w-4" />} onClick={onDelete}>
            Delete Account
          </GhostButton>
        </div>
      </GlassCard>
    </>
  );
}

function AiSection({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(k: K, p: Partial<State[K]>) => void;
}) {
  const presets = ["Jarvis", "Friday", "Nova"];
  const isCustom = !presets.includes(state.assistant.name);
  return (
    <>
      <GlassCard>
        <SectionTitle>Assistant Identity</SectionTitle>
        <Field label="Assistant Name">
          <Segmented
            value={isCustom ? "Custom" : state.assistant.name}
            onChange={(v) => update("assistant", { name: v === "Custom" ? "" : v })}
            options={[
              { value: "Jarvis", label: "Jarvis" },
              { value: "Friday", label: "Friday" },
              { value: "Nova", label: "Nova" },
              { value: "Custom", label: "Custom" },
            ]}
          />
        </Field>
        {isCustom && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
            <TextInput
              placeholder="Enter custom name"
              value={state.assistant.name}
              onChange={(e) => update("assistant", { name: e.target.value })}
            />
          </motion.div>
        )}
      </GlassCard>

      <GlassCard>
        <SectionTitle>Personality & Style</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="AI Personality">
            <SelectInput
              value={state.assistant.personality}
              onChange={(v) => update("assistant", { personality: v })}
              options={["Friendly", "Professional", "Funny", "Teacher", "Minimal"].map((v) => ({
                value: v,
                label: v,
              }))}
            />
          </Field>
          <Field label="Response Style">
            <SelectInput
              value={state.assistant.responseStyle}
              onChange={(v) => update("assistant", { responseStyle: v })}
              options={["Short", "Balanced", "Detailed", "Expert"].map((v) => ({ value: v, label: v }))}
            />
          </Field>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle>Memory System</SectionTitle>
        <Row title="Enable Memory" desc="Let JARVIS remember context across sessions">
          <Toggle on={state.assistant.memoryEnabled} onChange={(v) => update("assistant", { memoryEnabled: v })} />
        </Row>
        <AnimatePresence>
          {state.assistant.memoryEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/5"
            >
              <Row title="Remember user preferences">
                <Toggle on={state.assistant.prefs} onChange={(v) => update("assistant", { prefs: v })} />
              </Row>
              <Row title="Save previous conversations">
                <Toggle on={state.assistant.saveChats} onChange={(v) => update("assistant", { saveChats: v })} />
              </Row>
              <Row title="Save study progress">
                <Toggle on={state.assistant.saveStudy} onChange={(v) => update("assistant", { saveStudy: v })} />
              </Row>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </>
  );
}

function VoiceSection({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(k: K, p: Partial<State[K]>) => void;
}) {
  return (
    <>
      <GlassCard>
        <SectionTitle>Voice Selection</SectionTitle>
        <Field label="Voice Type">
          <Segmented
            value={state.voice.voice}
            onChange={(v) => update("voice", { voice: v })}
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Robot", label: "Robot" },
              { value: "Custom", label: "Custom" },
            ]}
          />
        </Field>
        <div className="mt-4">
          <Field label="Voice Preset">
            <div className="grid grid-cols-2 gap-3">
              {["Jarvis Voice", "Friday Voice"].map((p) => {
                const active = state.voice.preset === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => update("voice", { preset: p })}
                    className={`flex min-h-16 items-center gap-3 rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-cyan-300/50 bg-cyan-300/10 shadow-[0_0_18px_oklch(0.88_0.18_210/0.3)]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-lg ${
                        active ? "bg-cyan-300 text-black" : "bg-white/10 text-cyan-300"
                      }`}
                    >
                      <Mic className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{p}</p>
                      <p className="text-[11px] text-muted-foreground">Tap to preview</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle>Wake Word</SectionTitle>
        <Segmented
          value={state.voice.wake}
          onChange={(v) => update("voice", { wake: v })}
          options={[
            { value: "Hey Jarvis", label: "Hey Jarvis" },
            { value: "Hey Assistant", label: "Hey Assistant" },
            { value: "Custom", label: "Custom" },
          ]}
        />
        {state.voice.wake === "Custom" && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
            <TextInput
              placeholder="Enter custom wake word"
              value={state.voice.customWake}
              onChange={(e) => update("voice", { customWake: e.target.value })}
            />
          </motion.div>
        )}
      </GlassCard>

      <GlassCard>
        <SectionTitle>Speech Speed</SectionTitle>
        <Slider
          value={state.voice.speed}
          onChange={(v) => update("voice", { speed: v })}
          min={0.5}
          max={2}
          step={0.5}
          marks={[
            { v: 0.5, label: "0.5x" },
            { v: 1, label: "1x" },
            { v: 1.5, label: "1.5x" },
            { v: 2, label: "2x" },
          ]}
        />
      </GlassCard>

      <GlassCard>
        <SectionTitle>Voice Behavior</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Voice Language">
            <SelectInput
              value={state.voice.language}
              onChange={(v) => update("voice", { language: v })}
              options={["English", "Hindi", "Spanish", "French", "German"].map((v) => ({ value: v, label: v }))}
            />
          </Field>
          <div className="flex items-end">
            <div className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              <Row title="Speak Replies" desc="JARVIS speaks responses aloud">
                <Toggle on={state.voice.speakReplies} onChange={(v) => update("voice", { speakReplies: v })} />
              </Row>
            </div>
          </div>
        </div>
      </GlassCard>
    </>
  );
}

function AppearanceSection({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(k: K, p: Partial<State[K]>) => void;
}) {
  const accents: { value: string; label: string; color: string }[] = [
    { value: "cyan", label: "Cyan", color: "oklch(0.88 0.18 210)" },
    { value: "purple", label: "Purple", color: "oklch(0.7 0.22 295)" },
    { value: "blue", label: "Blue", color: "oklch(0.7 0.22 255)" },
    { value: "red", label: "Red", color: "oklch(0.7 0.24 25)" },
    { value: "green", label: "Green", color: "oklch(0.82 0.2 155)" },
  ];
  return (
    <>
      <GlassCard>
        <SectionTitle>Theme</SectionTitle>
        <Segmented
          value={state.appearance.theme}
          onChange={(v) => update("appearance", { theme: v })}
          options={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
            { value: "auto", label: "Auto" },
          ]}
        />
      </GlassCard>

      <GlassCard>
        <SectionTitle>Accent Color</SectionTitle>
        <div className="flex flex-wrap gap-3">
          {accents.map((a) => {
            const active = state.appearance.accent === a.value;
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => update("appearance", { accent: a.value })}
                aria-label={a.label}
                className={`relative grid h-12 w-12 place-items-center rounded-2xl transition ${
                  active ? "ring-2 ring-white/80" : "ring-1 ring-white/10 hover:ring-white/30"
                }`}
                style={{
                  background: a.color,
                  boxShadow: active ? `0 0 24px ${a.color}` : `0 0 10px ${a.color}55`,
                }}
              >
                {active && <Check className="h-5 w-5 text-black" />}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle>Animation Controls</SectionTitle>
        <Row title="AI Orb Animation" desc="Animated core on dashboard">
          <Toggle on={state.appearance.orb} onChange={(v) => update("appearance", { orb: v })} />
        </Row>
        <Row title="Wave Animation" desc="Voice waveform visuals">
          <Toggle on={state.appearance.wave} onChange={(v) => update("appearance", { wave: v })} />
        </Row>
        <Row title="Background Effects" desc="Ambient gradients & particles">
          <Toggle on={state.appearance.bg} onChange={(v) => update("appearance", { bg: v })} />
        </Row>
      </GlassCard>
    </>
  );
}

function LanguageSection({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(k: K, p: Partial<State[K]>) => void;
}) {
  return (
    <GlassCard>
      <SectionTitle>Language Preferences</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="App Language">
          <SelectInput
            value={state.language.app}
            onChange={(v) => update("language", { app: v })}
            options={["English", "Hindi", "Mixed"].map((v) => ({ value: v, label: v }))}
          />
        </Field>
        <Field label="AI Reply Language">
          <SelectInput
            value={state.language.reply}
            onChange={(v) => update("language", { reply: v })}
            options={["English", "Hindi", "Mixed"].map((v) => ({ value: v, label: v }))}
          />
        </Field>
        <Field label="Voice Language">
          <SelectInput
            value={state.language.voice}
            onChange={(v) => update("language", { voice: v })}
            options={["English", "Hindi", "Spanish", "French", "German"].map((v) => ({ value: v, label: v }))}
          />
        </Field>
      </div>
    </GlassCard>
  );
}

function AutomationSection({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(k: K, p: Partial<State[K]>) => void;
}) {
  return (
    <GlassCard>
      <SectionTitle>Automation</SectionTitle>
      <Row title="Auto Start" desc="Launch JARVIS automatically with your device">
        <Toggle on={state.automation.autoStart} onChange={(v) => update("automation", { autoStart: v })} />
      </Row>
      <Row title="Background Listening" desc="Allow JARVIS to always listen for wake word">
        <Toggle
          on={state.automation.backgroundListen}
          onChange={(v) => update("automation", { backgroundListen: v })}
        />
      </Row>
      <Row title="Auto Open Apps" desc="Open frequently used apps automatically">
        <Toggle on={state.automation.autoOpen} onChange={(v) => update("automation", { autoOpen: v })} />
      </Row>
    </GlassCard>
  );
}

function PrivacySection({
  state,
  update,
  onClear,
}: {
  state: State;
  update: <K extends keyof State>(k: K, p: Partial<State[K]>) => void;
  onClear: () => void;
}) {
  return (
    <>
      <GlassCard>
        <SectionTitle>Permissions</SectionTitle>
        <Row title="Microphone" desc="Voice input access">
          <Toggle on={state.privacy.mic} onChange={(v) => update("privacy", { mic: v })} />
        </Row>
        <Row title="Camera" desc="Vision features access">
          <Toggle on={state.privacy.cam} onChange={(v) => update("privacy", { cam: v })} />
        </Row>
        <Row title="Share anonymous data" desc="Help improve JARVIS">
          <Toggle on={state.privacy.share} onChange={(v) => update("privacy", { share: v })} />
        </Row>
      </GlassCard>

      <GlassCard>
        <SectionTitle>Chat History</SectionTitle>
        <Row title="Save chat history" desc="Store conversations locally">
          <Toggle on={state.privacy.saveHistory} onChange={(v) => update("privacy", { saveHistory: v })} />
        </Row>
        <div className="mt-3 flex flex-wrap gap-3">
          <GhostButton icon={<Trash2 className="h-4 w-4" />}>Delete History</GhostButton>
          <GhostButton danger icon={<Trash2 className="h-4 w-4" />} onClick={onClear}>
            Clear All History
          </GhostButton>
        </div>
      </GlassCard>
    </>
  );
}

function NotificationsSection({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(k: K, p: Partial<State[K]>) => void;
}) {
  return (
    <GlassCard>
      <SectionTitle>Notifications</SectionTitle>
      <Row title="Alarm Notifications" desc="Alerts for scheduled alarms">
        <Toggle on={state.notifications.alarm} onChange={(v) => update("notifications", { alarm: v })} />
      </Row>
      <Row title="Reminders" desc="Daily and recurring reminders">
        <Toggle on={state.notifications.reminder} onChange={(v) => update("notifications", { reminder: v })} />
      </Row>
      <Row title="AI Updates" desc="New features and model upgrades">
        <Toggle on={state.notifications.updates} onChange={(v) => update("notifications", { updates: v })} />
      </Row>
      <Row title="Security Alerts" desc="Account and access warnings">
        <Toggle on={state.notifications.security} onChange={(v) => update("notifications", { security: v })} />
      </Row>
    </GlassCard>
  );
}

const DEVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone: Smartphone,
  Laptop: Laptop,
  ESP32: Cpu,
  "Smart Lights": Lightbulb,
  Camera: Camera,
};

function DevicesSection({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(k: K, p: Partial<State[K]>) => void;
}) {
  const devices = Object.keys(state.devices);
  return (
    <GlassCard>
      <SectionTitle action={<GhostButton icon={<Plus className="h-4 w-4" />}>Add Device</GhostButton>}>
        Connected Devices
      </SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {devices.map((name) => {
          const Icon = DEVICE_ICONS[name] ?? Wifi;
          const connected = state.devices[name];
          return (
            <div
              key={name}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
            >
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                  connected ? "bg-cyan-300/15 text-cyan-200 ring-1 ring-cyan-300/30" : "bg-white/5 text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      connected ? "bg-green-400 shadow-[0_0_6px_oklch(0.8_0.2_155)]" : "bg-white/30"
                    }`}
                  />
                  {connected ? "Connected" : "Disconnected"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => update("devices", { [name]: !connected } as Partial<State["devices"]>)}
                className={`min-h-9 shrink-0 rounded-lg px-3 text-xs font-bold transition ${
                  connected
                    ? "border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-white"
                    : "bg-cyan-300 text-black hover:bg-cyan-200"
                }`}
              >
                {connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function DataSection({ onDeleteAll }: { onDeleteAll: () => void }) {
  const actions = [
    { label: "Export Data", desc: "Download a JSON backup", icon: Database },
    { label: "Import Data", desc: "Restore from a backup file", icon: Upload },
    { label: "Backup Data", desc: "Sync to cloud storage", icon: Wifi },
  ];
  return (
    <>
      <GlassCard>
        <SectionTitle>Data Tools</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              className="group flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.05]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300 ring-1 ring-cyan-300/20 transition group-hover:bg-cyan-300/20">
                <a.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{a.label}</p>
                <p className="text-[11px] text-muted-foreground">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="!border-red-500/20">
        <SectionTitle>Danger Zone</SectionTitle>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">Delete All Data</p>
            <p className="text-xs text-muted-foreground">Permanently erase everything stored locally</p>
          </div>
          <GhostButton danger icon={<Trash2 className="h-4 w-4" />} onClick={onDeleteAll}>
            Delete All Data
          </GhostButton>
        </div>
      </GlassCard>
    </>
  );
}

// ✅ REMOVED: DeveloperSection and ModelSection – they are no longer used

function AboutSection({ onOpenLegal }: { onOpenLegal: (title: string, content: string) => void }) {
  // Full legal texts provided by user (with placeholders)
  const privacyContent = `🔒 JARVIS AI Assistant — Privacy Policy

Last Updated: [Date]

Welcome to JARVIS AI Assistant ("we", "our", "the app"). Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our AI assistant services.

1. Information We Collect

JARVIS may collect:
- User account information
- Chat conversations with AI
- Voice input (when voice features are enabled)
- Uploaded files/documents (for PDF reading and analysis)
- App usage data
- Device information for improving performance

2. How We Use Your Data

Your information may be used for:
- Providing AI assistant features
- Processing voice commands
- Improving user experience
- Maintaining app security
- Fixing bugs and improving performance

3. AI Processing

JARVIS uses AI services to generate responses and perform tasks. Some data may be processed through third-party AI providers required for app functionality.

4. File & Document Privacy

Files uploaded for features like PDF reading or analysis are used only to provide requested services.
We do not sell, rent, or share your personal files with third parties for advertising purposes.

5. Voice Data

Voice commands are processed only to provide voice assistant functionality. Users can disable microphone access anytime from device settings.

6. Data Security

We use reasonable security measures to protect user information. However, no online service can guarantee 100% security.

7. User Control

Users can:
- Delete their data
- Disable permissions
- Stop using AI features anytime

8. Contact

For privacy questions:
Email: [your email]`;

  const termsContent = `📜 JARVIS AI Assistant — Terms & Conditions

Last Updated: [Date]

By using JARVIS AI Assistant, you agree to these Terms & Conditions.

1. Use of Service

JARVIS provides AI-powered assistance including:
- AI conversations
- Voice assistant features
- Document analysis
- Productivity tools

Users must use the application responsibly.

2. AI Responses

JARVIS uses artificial intelligence and generated responses may not always be accurate.
Users should verify important information before making decisions.

3. User Responsibilities

You agree:
- Not to misuse the application
- Not to attempt unauthorized access
- Not to use the service for illegal activities

4. Third Party Services

JARVIS may use third-party services such as:
- AI APIs
- Cloud services
- Authentication providers

Their own policies may apply.

5. Availability

We may update, modify, or improve features without prior notice.

6. Limitation of Liability

JARVIS is provided "as is". We are not responsible for damages caused by incorrect AI-generated information or misuse of the application.

7. Changes

Terms may be updated periodically.

8. Contact

Email: [your email]`;

  const ossContent = `🧩 Open Source License

MIT License

Copyright (c) 2026 JARVIS AI Assistant

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

  return (
    <>
      <GlassCard>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-400/30 to-purple-500/30 ring-1 ring-cyan-300/40">
            <Cog className="h-8 w-8 text-cyan-200" />
            <span className="absolute inset-0 animate-glow-pulse rounded-3xl" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold tracking-wider neon-text">JARVIS AI</h3>
            <p className="text-xs text-muted-foreground">Just A Rather Very Intelligent System</p>
          </div>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-0.5 text-[11px] font-bold tracking-wider text-cyan-200">
            VERSION 1.0
          </span>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle>Developer</SectionTitle>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Built by</span>{" "}
            <span className="font-semibold">Abhi · JARVIS Labs</span>
          </p>
          <p>
            <span className="text-muted-foreground">Contact</span>{" "}
            <span className="font-semibold">support@jarvis.ai</span>
          </p>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionTitle>Legal</SectionTitle>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => onOpenLegal("Privacy Policy", privacyContent)}
            className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-semibold transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            Privacy Policy
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => onOpenLegal("Terms & Conditions", termsContent)}
            className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-semibold transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            Terms & Conditions
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => onOpenLegal("Open Source License", ossContent)}
            className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-semibold transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            Open Source License
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </GlassCard>
    </>
  );
}

// ============== Modals ==============
function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card relative w-full max-w-md p-6"
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-300 ring-1 ring-red-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold tracking-wide">{title}</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">{description}</p>
            <div className="flex justify-end gap-3">
              <GhostButton onClick={onCancel}>Cancel</GhostButton>
              <button
                type="button"
                onClick={onConfirm}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white transition hover:bg-red-400"
              >
                <Trash2 className="h-4 w-4" /> Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}