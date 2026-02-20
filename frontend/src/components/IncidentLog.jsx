import { motion } from "framer-motion";

const SEVERITY_STYLES = {
  low: "bg-accent/15 text-accent ring-accent/40",
  medium: "bg-warning/15 text-warning ring-warning/40",
  critical: "bg-critical/15 text-critical ring-critical/40",
};
const PREDICTION_STYLES = {
  Threat: "bg-critical/15 text-critical ring-critical/40",
  "False Positive": "bg-warning/15 text-warning ring-warning/40",
};

export default function IncidentLog({ incidents }) {
  return (
    <section className="glass-panel rounded-xl p-4 shadow-panel sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-textPrimary">Incident Log</h2>
        <p className="text-xs uppercase tracking-[0.14em] text-textSecondary">SOC Event Stream</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] table-auto border-collapse text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.14em] text-textSecondary">
              <th className="border-b border-white/10 px-3 py-2">Timestamp</th>
              <th className="border-b border-white/10 px-3 py-2">Sensor ID</th>
              <th className="border-b border-white/10 px-3 py-2">Event</th>
              <th className="border-b border-white/10 px-3 py-2">Prediction</th>
              <th className="border-b border-white/10 px-3 py-2">Severity</th>
              <th className="border-b border-white/10 px-3 py-2">Counter-Action</th>
              <th className="border-b border-white/10 px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident, index) => (
              <motion.tr
                key={incident.id}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32, delay: index * 0.02 }}
                className="border-b border-white/5 text-sm text-textPrimary transition-colors duration-300 hover:bg-white/5"
              >
                <td className="px-3 py-3 font-mono text-xs text-textSecondary">{incident.timestamp}</td>
                <td className="px-3 py-3 font-mono text-xs text-textPrimary">{incident.sensorId ?? "N/A"}</td>
                <td className="px-3 py-3">{incident.event}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold uppercase ring-1 ${
                      PREDICTION_STYLES[incident.predictionType ?? "Threat"]
                    }`}
                  >
                    {incident.predictionType ?? "Threat"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold uppercase ring-1 ${
                      SEVERITY_STYLES[incident.severity]
                    }`}
                  >
                    {incident.severity}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-textSecondary">
                  <p className="text-sm text-textPrimary">{incident.countermeasure ?? "--"}</p>
                  {incident.memoryAction && incident.memoryAction !== "N/A" ? (
                    <span className="mt-1 inline-flex rounded-md border border-accent/35 bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
                      {incident.memoryAction}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-textSecondary">{incident.status}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
