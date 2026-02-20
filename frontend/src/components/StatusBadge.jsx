import { motion } from "framer-motion";

const STATUS_CONFIG = {
  normal: {
    label: "System Normal",
    color: "text-[#e8f8ff]",
    ring: "ring-accent/40",
    bg: "bg-[#0d3558]/70",
    dot: "bg-accent",
    glow: "rgba(118,213,255,0.28)",
  },
  suspicious: {
    label: "Suspicious Activity",
    color: "text-[#ffe3b3]",
    ring: "ring-warning/45",
    bg: "bg-[#503913]/72",
    dot: "bg-warning",
    glow: "rgba(248,185,90,0.3)",
  },
  active_attack: {
    label: "Active Attack Detected",
    color: "text-[#ffd2d8]",
    ring: "ring-critical/45",
    bg: "bg-[#4d1820]/74",
    dot: "bg-critical",
    glow: "rgba(255,95,109,0.34)",
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.normal;
  const isSuspicious = status === "suspicious";
  const isCritical = status === "active_attack";

  return (
    <motion.div
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 ring-1 ${config.ring} ${config.bg}`}
      animate={
        isCritical || isSuspicious
          ? { boxShadow: [`0 0 0 ${config.glow}`, `0 0 20px ${config.glow}`, `0 0 0 ${config.glow}`] }
          : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
      }
      transition={{ duration: isCritical ? 1 : 1.25, repeat: isCritical || isSuspicious ? Infinity : 0 }}
    >
      <motion.span
        className={`h-2 w-2 rounded-full ${config.dot}`}
        animate={
          isCritical
            ? { opacity: [1, 0.45, 1], scale: [1, 1.35, 1] }
            : isSuspicious
            ? { opacity: [0.92, 0.58, 0.92], scale: [1, 1.18, 1] }
            : { opacity: 1, scale: 1 }
        }
        transition={{
          duration: isCritical ? 0.9 : isSuspicious ? 1 : 0.25,
          repeat: isCritical || isSuspicious ? Infinity : 0,
        }}
      />
      <span className={`text-xs font-semibold uppercase tracking-[0.12em] ${config.color}`}>{config.label}</span>
    </motion.div>
  );
}
