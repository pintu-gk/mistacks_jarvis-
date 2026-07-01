import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui";

export function PageHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
      {icon && (
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300 ring-1 ring-cyan-300/30 sm:h-12 sm:w-12">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold tracking-wide sm:text-2xl">{title}</h1>
        <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-4 pb-10 sm:p-6"
    >
      {children}
    </motion.div>
  );
}

export function PlaceholderGrid({ items }: { items: { label: string; hint?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((i) => (
        <GlassCard key={i.label} className="aspect-square !p-4 transition hover:border-cyan-300/30">
          <div className="flex h-full flex-col justify-between">
            <div className="h-2 w-8 rounded-full bg-cyan-300/60" />
            <div>
              <p className="text-sm font-semibold">{i.label}</p>
              {i.hint && <p className="text-[11px] text-muted-foreground">{i.hint}</p>}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
