import { motion } from "framer-motion";

export function GlassCard({
  children,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`glass-card p-5 ${className}`}
      {...(rest as object)}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">{children}</h3>
      {action}
    </div>
  );
}

export function Ring({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative grid h-16 w-16 place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth="4" fill="none" />
          <circle
            cx="32"
            cy="32"
            r={r}
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <span className="text-sm font-bold">{value}%</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
