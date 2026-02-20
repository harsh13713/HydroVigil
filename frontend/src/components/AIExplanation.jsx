import { AnimatePresence, motion } from "framer-motion";

const THREAT_STYLE = {
  Low: "bg-accent/15 text-accent ring-accent/40",
  Guarded: "bg-warning/15 text-warning ring-warning/40",
  High: "bg-critical/15 text-critical ring-critical/40",
};

export default function AIExplanation({
  confidence,
  headline,
  summary,
  signals,
  recommendations,
  threatLevel,
  expanded,
}) {
  const threatClass = THREAT_STYLE[threatLevel] ?? THREAT_STYLE.Low;

  return (
    <section className="glass-panel rounded-2xl p-4 shadow-panel sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-textPrimary">AI Threat Briefing</h2>
        <p className="text-xs uppercase tracking-[0.14em] text-textSecondary">Inference Core v4.8</p>
      </div>

      <motion.div
        className="rounded-xl border border-white/10 bg-card/72 p-4"
        animate={{ boxShadow: expanded ? "0 0 0 1px rgba(220,38,38,0.22)" : "0 0 0 1px rgba(0,0,0,0)" }}
        transition={{ duration: 0.34, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-textPrimary">{headline}</p>
          <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold uppercase ring-1 ${threatClass}`}>
            Threat Level: {threatLevel}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-textSecondary">{summary}</p>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.12em]">
            <span className="text-textSecondary">Confidence</span>
            <span className="font-semibold text-textPrimary">{confidence}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-bg/80">
            <motion.div
              className="h-2 rounded-full bg-accent"
              initial={false}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.34, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence>
          {expanded ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.34, ease: "easeOut" }}
              className="mt-4 rounded-xl border border-critical/35 bg-critical/10 px-3 py-2 text-sm text-textPrimary"
            >
              Detected coordinated manipulation of flow-pressure correlation. Probability of malicious intrusion: 94%.
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-textSecondary">Indicators</p>
            <ul className="mt-2 space-y-2 text-sm text-textPrimary">
              {signals.map((signal) => (
                <li key={signal} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 leading-6">
                  {signal}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-textSecondary">Recommended Actions</p>
            <ul className="mt-2 space-y-2 text-sm text-textPrimary">
              {recommendations.map((recommendation) => (
                <li
                  key={recommendation}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 leading-6"
                >
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
