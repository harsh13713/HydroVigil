import { motion } from "framer-motion";

function MetricTile({ label, value, unit, emphasis = "text-accent" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/70 p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-textSecondary">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${emphasis}`}>
        {value}
        {unit ? <span className="ml-1 text-sm font-medium text-textSecondary">{unit}</span> : null}
      </p>
    </div>
  );
}

export default function FaultTolerancePanel({ metrics, learnedCountermeasures }) {
  return (
    <section className="glass-panel rounded-xl p-4 shadow-panel sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-textPrimary">Fault Tolerance Metrics</h2>
        <p className="text-xs uppercase tracking-[0.12em] text-textSecondary">Adaptive Resilience Layer</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricTile
          label="False Prediction Rate"
          value={metrics.falsePredictionRate.toFixed(1)}
          unit="%"
          emphasis={metrics.falsePredictionRate > 18 ? "text-warning" : "text-accent"}
        />
        <MetricTile
          label="Recovery Success"
          value={metrics.recoverySuccessRate.toFixed(1)}
          unit="%"
          emphasis={metrics.recoverySuccessRate >= 85 ? "text-accent" : "text-warning"}
        />
        <MetricTile
          label="Countermeasure Reuse Hit"
          value={metrics.countermeasureReuseHitRate.toFixed(1)}
          unit="%"
          emphasis="text-accent"
        />
        <MetricTile label="Fallback Activations" value={metrics.fallbackActivations} />
        <MetricTile label="Memory Entries" value={metrics.memoryEntries} />
        <MetricTile label="Mean Mitigation Time" value={metrics.meanMitigationSeconds.toFixed(0)} unit="s" />
        <MetricTile label="Benchmark Attack F1" value={metrics.benchmarkAttackF1.toFixed(2)} />
        <MetricTile label="Benchmark Attack Recall" value={metrics.benchmarkAttackRecall.toFixed(2)} />
        <MetricTile label="Benchmark Accuracy" value={metrics.benchmarkAccuracy.toFixed(2)} />
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-card/65 p-3">
        <p className="text-xs uppercase tracking-[0.12em] text-textSecondary">Learned Counter-Action Memory</p>
        <div className="mt-2 space-y-2">
          {learnedCountermeasures.length === 0 ? (
            <p className="text-sm text-textSecondary">No false-positive counter-actions learned yet.</p>
          ) : (
            learnedCountermeasures.slice(0, 4).map((entry) => (
              <motion.div
                key={entry.key}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-textPrimary">{entry.label}</p>
                <p className="mt-1 text-sm text-textSecondary">{entry.countermeasure}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-accent">
                  Reuse count: {entry.useCount}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
