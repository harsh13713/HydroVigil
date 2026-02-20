import { motion } from "framer-motion";

function MetricPill({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
      <p className="text-[10px] uppercase tracking-[0.1em] text-textSecondary">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-textPrimary">{value}</p>
    </div>
  );
}

function ModelCard({ title, values, highlight }) {
  return (
    <motion.article
      className={`rounded-xl border p-3 ${
        highlight ? "border-accent/45 bg-accent/10" : "border-white/10 bg-card/68"
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-textPrimary">{title}</p>
        {highlight ? (
          <span className="rounded-md border border-accent/45 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
            Preferred
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricPill label="Accuracy" value={values.accuracy.toFixed(2)} />
        <MetricPill label="Macro F1" value={values.macroF1.toFixed(2)} />
        <MetricPill label="Weighted F1" value={values.weightedF1.toFixed(2)} />
        <MetricPill label="Attack F1" value={values.attackF1.toFixed(2)} />
        <MetricPill label="Attack Precision" value={values.attackPrecision.toFixed(2)} />
        <MetricPill label="Attack Recall" value={values.attackRecall.toFixed(2)} />
      </div>

      <p className="mt-3 text-[11px] uppercase tracking-[0.1em] text-textSecondary">
        Support: Normal {values.normalSupport.toLocaleString()} | Attack {values.attackSupport.toLocaleString()}
      </p>
    </motion.article>
  );
}

export default function ModelPerformancePanel({ reports }) {
  return (
    <section className="glass-panel rounded-2xl p-4 shadow-panel sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-textPrimary">Model Validation Results</h2>
        <p className="text-xs uppercase tracking-[0.12em] text-textSecondary">Training/Test Benchmark</p>
      </div>

      <ModelCard title="Dual Model Redundancy" values={reports.dualModelRedundancy} highlight />
    </section>
  );
}
