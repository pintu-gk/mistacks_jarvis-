import { motion } from "framer-motion";

export function JarvisCore() {
  return (
    <div className="relative grid h-[280px] w-[280px] place-items-center">
      {/* Outer rotating ring */}
      <div className="animate-core-spin absolute inset-0 rounded-full">
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, oklch(0.88 0.18 210 / 0.9) 60deg, transparent 120deg, transparent 240deg, oklch(0.7 0.22 295 / 0.7) 300deg, transparent 360deg)",
            mask: "radial-gradient(circle, transparent 58%, black 60%, black 64%, transparent 66%)",
            WebkitMask: "radial-gradient(circle, transparent 58%, black 60%, black 64%, transparent 66%)",
          }}
        />
      </div>

      {/* Inner reverse ring */}
      <div className="animate-core-spin-reverse absolute inset-8 rounded-full">
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "conic-gradient(from 90deg, oklch(0.88 0.18 210 / 0.5), transparent 90deg, transparent 270deg, oklch(0.72 0.24 350 / 0.5))",
            mask: "radial-gradient(circle, transparent 70%, black 72%, black 76%, transparent 78%)",
            WebkitMask: "radial-gradient(circle, transparent 70%, black 72%, black 76%, transparent 78%)",
          }}
        />
      </div>

      {/* Dotted ring */}
      <div className="absolute inset-16 rounded-full border border-dashed border-cyan-300/30" />

      {/* Core orb */}
      <motion.div
        className="relative grid h-32 w-32 place-items-center rounded-full"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 35% 30%, oklch(0.4 0.1 250), oklch(0.12 0.04 270) 70%)",
          boxShadow:
            "inset 0 -10px 30px oklch(0 0 0 / 0.6), inset 0 10px 20px oklch(0.88 0.18 210 / 0.2), 0 0 60px oklch(0.88 0.18 210 / 0.5)",
        }}
      >
        {/* Face */}
        <div className="flex gap-3">
          <div
            className="h-4 w-4 rounded-full bg-cyan-300"
            style={{ boxShadow: "0 0 14px oklch(0.88 0.18 210 / 0.9)" }}
          />
          <div
            className="h-4 w-4 rounded-full bg-cyan-300"
            style={{ boxShadow: "0 0 14px oklch(0.88 0.18 210 / 0.9)" }}
          />
        </div>
        <div className="absolute bottom-9 h-1 w-8 rounded-full bg-cyan-300/80" />
      </motion.div>

      {/* Side waveforms */}
      <Waveform side="left" />
      <Waveform side="right" />
    </div>
  );
}

function Waveform({ side }: { side: "left" | "right" }) {
  const bars = Array.from({ length: 14 });
  return (
    <div
      className="absolute top-1/2 flex h-16 -translate-y-1/2 items-center gap-1"
      style={{ [side]: "-130px" } as React.CSSProperties}
    >
      {bars.map((_, i) => {
        const heights = [10, 22, 14, 30, 40, 24, 50, 36, 28, 44, 18, 32, 20, 12];
        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full bg-cyan-300/80"
            style={{ boxShadow: "0 0 6px oklch(0.88 0.18 210 / 0.7)" }}
            animate={{ height: [heights[i] * 0.4, heights[i], heights[i] * 0.4] }}
            transition={{ duration: 1 + (i % 5) * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
          />
        );
      })}
    </div>
  );
}
