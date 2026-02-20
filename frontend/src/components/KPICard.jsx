import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function CountUp({ value, decimals }) {
  const previous = useRef(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    // Animate number transitions for KPI updates without abrupt jumps.
    const start = previous.current;
    const end = value;
    const duration = 320;
    let raf;
    const startedAt = performance.now();

    const frame = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const next = start + (end - start) * (1 - Math.pow(1 - progress, 2));
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    previous.current = value;

    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span>{Number(display).toFixed(decimals)}</span>;
}

export default function KPICard({ title, value, unit, decimals = 0, delta, severity, icon: Icon, index }) {
  return (
    <motion.article
      className="glass-panel rounded-xl p-4 shadow-panel transition-shadow duration-300 hover:shadow-elevate"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.04 * index }}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-textSecondary">{title}</p>
          <p className="mt-2 flex items-end gap-1 text-2xl font-semibold text-textPrimary">
            <CountUp value={value} decimals={decimals} />
            {unit ? <span className="pb-1 text-sm text-textSecondary">{unit}</span> : null}
          </p>
        </div>
        <div className="rounded-lg border border-accent/35 bg-accent/12 p-2 text-accent shadow-[0_0_18px_rgba(118,213,255,0.16)]">
          <Icon />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`text-xs font-medium ${
            severity === "critical"
              ? "text-critical"
              : severity === "warning"
              ? "text-warning"
              : "text-accent"
          }`}
        >
          {severity === "critical" ? "Critical variance" : severity === "warning" ? "Elevated variance" : "Nominal"}
        </span>
        <span
          className={`text-xs font-medium ${
            delta > 0
              ? severity === "critical"
                ? "text-critical"
                : "text-warning"
              : "text-accent"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)}%
        </span>
      </div>
    </motion.article>
  );
}
