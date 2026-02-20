import { useMemo } from "react";
import { motion } from "framer-motion";
import { FaWater } from "react-icons/fa";
import StatusBadge from "./StatusBadge";

function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}

export default function Header({ systemStatus, timestamp }) {
  const formattedTime = useMemo(() => formatTimestamp(timestamp), [timestamp]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-bg/88 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 py-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-textPrimary sm:text-2xl">
            <span className="rounded-lg border border-accent/40 bg-accent/12 p-1.5 text-accent">
              <FaWater className="h-4 w-4" />
            </span>
            HydroVigil
            <span className="ml-2 text-sm font-medium uppercase tracking-[0.18em] text-accent/90 sm:text-xs">
              National Water Cyber Command
            </span>
          </h1>
          <p className="mt-1 text-xs tracking-[0.08em] text-textSecondary sm:text-sm">
            AI-Powered Cyber Attack Detection for Smart Water Infrastructure
          </p>
        </div>

        <motion.div
          className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="rounded-xl border border-white/10 bg-card/72 px-3 py-2 text-right shadow-panel">
            <p className="text-[10px] uppercase tracking-[0.2em] text-textSecondary">Live Timestamp</p>
            <p className="mt-1 font-mono text-xs text-textPrimary sm:text-sm">{formattedTime}</p>
          </div>
          <StatusBadge status={systemStatus} />
        </motion.div>
      </div>
    </header>
  );
}
