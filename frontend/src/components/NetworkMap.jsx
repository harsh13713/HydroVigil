import { motion } from "framer-motion";

const NODES = [
  { id: "P-11", x: 42, y: 42 },
  { id: "P-17", x: 108, y: 64 },
  { id: "P-23", x: 182, y: 78 },
  { id: "W-05", x: 76, y: 122 },
  { id: "GW-A2", x: 152, y: 132 },
];

const LINKS = [
  ["P-11", "P-17"],
  ["P-17", "P-23"],
  ["P-11", "W-05"],
  ["W-05", "GW-A2"],
  ["P-23", "GW-A2"],
];

function getNode(id) {
  return NODES.find((node) => node.id === id);
}

export default function NetworkMap({ simulationPhase, targetNodeId = "P-23" }) {
  const attackMode = simulationPhase === "phase2" || simulationPhase === "phase3";
  const suspiciousMode = simulationPhase === "phase1";
  const targetNode = getNode(targetNodeId) ?? getNode("P-23");

  return (
    <section className="glass-panel rounded-2xl p-4 shadow-panel sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-textPrimary">Sensor Network Map</h2>
        <span className="text-xs uppercase tracking-[0.12em] text-textSecondary">Zone-3 Topology</span>
      </div>

      <div className="rounded-xl border border-white/10 bg-card/72 p-3">
        <svg viewBox="0 0 230 170" className="h-44 w-full">
          {LINKS.map(([from, to]) => {
            const a = getNode(from);
            const b = getNode(to);
            if (!a || !b) return null;
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(37,99,235,0.45)"
                strokeWidth="1.2"
              />
            );
          })}

          {attackMode ? (
            <motion.line
              x1="12"
              y1="84"
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="rgba(220,38,38,0.52)"
              strokeWidth="1.7"
              strokeDasharray="5 5"
              initial={{ pathLength: 0.1, opacity: 0.15 }}
              animate={{ pathLength: 1, opacity: 0.9, strokeDashoffset: [0, -14] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          ) : null}

          {NODES.map((node) => {
            const isTarget = node.id === targetNode.id;
            const fill = attackMode && isTarget ? "#DC2626" : suspiciousMode && isTarget ? "#D97706" : "#2563EB";
            const glow = attackMode && isTarget ? "rgba(220,38,38,0.35)" : "rgba(37,99,235,0.2)";
            return (
              <g key={node.id}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="7"
                  fill={fill}
                  animate={
                    isTarget && (attackMode || suspiciousMode)
                      ? {
                          r: attackMode ? [7, 9.4, 7] : [7, 8.2, 7],
                          opacity: [1, 0.62, 1],
                        }
                      : { r: 7, opacity: 1 }
                  }
                  transition={{
                    duration: attackMode ? 0.95 : 1.2,
                    repeat: isTarget && (attackMode || suspiciousMode) ? Infinity : 0,
                  }}
                  style={{ filter: `drop-shadow(0 0 10px ${glow})` }}
                />
                <text x={node.x + 10} y={node.y + 4} fill="#9CA3AF" fontSize="10">
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
