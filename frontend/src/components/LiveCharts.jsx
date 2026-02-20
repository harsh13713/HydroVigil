import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHARTS = [
  { key: "pressure", label: "Pressure", unit: "psi" },
  { key: "flow", label: "Flow Rate", unit: "m3/h" },
  { key: "level", label: "Water Level", unit: "%" },
];

const PHASE_STYLES = {
  normal: {
    lineColor: "#2563EB",
    feed: "Nominal",
    feedDot: "bg-accent",
  },
  phase1: {
    lineColor: "#D97706",
    feed: "Suspicious",
    feedDot: "bg-warning",
  },
  phase2: {
    lineColor: "#DC2626",
    feed: "Critical",
    feedDot: "bg-critical",
  },
  phase3: {
    lineColor: "#DC2626",
    feed: "Contained",
    feedDot: "bg-critical",
  },
};

export default function LiveCharts({ data, simulationPhase }) {
  const phaseStyle = PHASE_STYLES[simulationPhase] ?? PHASE_STYLES.normal;
  const showCriticalRegion = simulationPhase === "phase2" || simulationPhase === "phase3";
  const anomalyData = data.filter((point) => point.anomalyLevel >= 0.6);
  const anomalyStart = anomalyData[0]?.time;
  const anomalyEnd = anomalyData[anomalyData.length - 1]?.time;

  return (
    <section className="glass-panel rounded-2xl p-4 shadow-panel sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-textPrimary">Live Monitoring</h2>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-textSecondary">
          Feed health: {phaseStyle.feed}
          <motion.span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${phaseStyle.feedDot}`}
            animate={
              simulationPhase === "phase2"
                ? { scale: [1, 1.35, 1], opacity: [0.95, 0.5, 0.95] }
                : simulationPhase === "phase1"
                ? { scale: [1, 1.18, 1], opacity: [0.9, 0.58, 0.9] }
                : { scale: 1, opacity: 1 }
            }
            transition={{
              duration: simulationPhase === "normal" ? 0.3 : 1,
              repeat: simulationPhase === "normal" ? 0 : Infinity,
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {CHARTS.map((chart, index) => (
          <motion.div
            key={chart.key}
            className={`rounded-xl border border-white/10 bg-card/68 p-3 ${
              chart.key === "level" ? "lg:col-span-2" : ""
            }`}
            style={{ "--line-color": phaseStyle.lineColor }}
            animate={{ "--line-color": phaseStyle.lineColor }}
            transition={{ duration: 0.36, ease: "easeInOut", delay: index * 0.02 }}
            whileHover={{ y: -2 }}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-textPrimary">{chart.label}</p>
              <p className="text-xs text-textSecondary">Real-time sensor telemetry</p>
            </div>
            <div className="h-40 sm:h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`anomaly-gradient-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(220,38,38,0.22)" />
                      <stop offset="100%" stopColor="rgba(220,38,38,0.05)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(156, 163, 175, 0.24)" }}
                    minTickGap={18}
                  />
                  <YAxis
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(156, 163, 175, 0.24)" }}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17,24,39,0.95)",
                      border: "1px solid rgba(156,163,175,0.25)",
                      borderRadius: "10px",
                      color: "#E5E7EB",
                    }}
                    labelStyle={{ color: "#E5E7EB", fontSize: "12px" }}
                    formatter={(value) => [`${Number(value).toFixed(2)} ${chart.unit}`, chart.label]}
                  />
                  {showCriticalRegion && anomalyStart && anomalyEnd ? (
                    <ReferenceArea
                      x1={anomalyStart}
                      x2={anomalyEnd}
                      fill={`url(#anomaly-gradient-${chart.key})`}
                      fillOpacity={1}
                    />
                  ) : null}
                  <Line
                    type="monotone"
                    dataKey={chart.key}
                    stroke="var(--line-color)"
                    strokeWidth={2.2}
                    dot={false}
                    isAnimationActive
                    animationDuration={360}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
