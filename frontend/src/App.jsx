import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowRight,
  FaBell,
  FaBrain,
  FaChartLine,
  FaHome,
  FaLock,
  FaListAlt,
  FaNetworkWired,
  FaShieldAlt,
  FaSyncAlt,
  FaWater,
} from "react-icons/fa";
import Header from "./components/Header";
import KPICard from "./components/KPICard";
import LiveCharts from "./components/LiveCharts";
import IncidentLog from "./components/IncidentLog";
import AIExplanation from "./components/AIExplanation";
import NetworkMap from "./components/NetworkMap";
import FaultTolerancePanel from "./components/FaultTolerancePanel";
import ModelPerformancePanel from "./components/ModelPerformancePanel";
import { runMlPrediction } from "./api/mlApi";
const ML_API_URL = "http://127.0.0.1:8000/predict";

async function fetchPrediction(sensorWindow) {
  try {
    const response = await fetch(ML_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sensor_data: sensorWindow,
      }),
    });

    if (!response.ok) throw new Error("ML API error");

    return await response.json();
  } catch (err) {
    console.error("ML backend error:", err);
    return null;
  }
}
const MAX_POINTS = 44;
const TICK_MS = 900;
const STORAGE_KEY = "hydrovigil_countermeasure_memory_v1";
const SENSOR_IDS = ["P-11", "P-17", "P-23", "W-05", "GW-A2"];

const MODEL_REPORTS = {
  transformerLstmFallback: {
    accuracy: 0.97,
    macroF1: 0.83,
    weightedF1: 0.97,
    attackPrecision: 0.62,
    attackRecall: 0.72,
    attackF1: 0.67,
    normalSupport: 138700,
    attackSupport: 5462,
  },
  dualModelRedundancy: {
    accuracy: 0.98,
    macroF1: 0.86,
    weightedF1: 0.98,
    attackPrecision: 0.75,
    attackRecall: 0.7,
    attackF1: 0.73,
    normalSupport: 138700,
    attackSupport: 5462,
  },
};

const FALSE_POSITIVE_PATTERNS = [
  {
    key: "pressure-harmonic-variance",
    label: "Pressure harmonic variance",
    countermeasure: "Apply 8s temporal smoothing and cross-check with valve-state channel.",
  },
  {
    key: "flow-calibration-drift",
    label: "Flow calibration drift",
    countermeasure: "Trigger sensor recalibration and fallback to redundant flow estimator.",
  },
  {
    key: "water-level-noise-burst",
    label: "Water level noise burst",
    countermeasure: "Suppress burst window and re-validate with dual-model consensus.",
  },
];

const PRIMARY_BG_IMAGE =
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1920&q=80";
const SECONDARY_BG_IMAGE =
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1920&q=80";

const LANDING_CARDS = [
  {
    title: "AI-Driven Threat Intelligence",
    description:
      "Real-time anomaly detection across pressure, flow, and water-level streams with coordinated attack correlation.",
    icon: FaBrain,
  },
  {
    title: "Secure Pipeline Telemetry Grid",
    description:
      "Industrial-grade monitoring network with continuous signal validation and resilient data acquisition pathways.",
    icon: FaNetworkWired,
  },
  {
    title: "Autonomous Containment Layer",
    description:
      "Adaptive counter-actions, false-positive memory reuse, and fault-tolerant response for mission-critical operations.",
    icon: FaLock,
  },
];

const DASHBOARD_MENU = [
  { key: "operations", label: "Operations", icon: FaHome },
  { key: "validation", label: "Model & Fault Metrics", icon: FaListAlt },
];

const AI_BRIEFING = {
  normal: {
    confidence: 18,
    headline: "All monitored signals remain within trusted baseline.",
    summary:
      "Correlation drift is minimal across pressure-flow-level channels. Redundancy checks are stable and no malicious indicators are present.",
    threatLevel: "Low",
    expanded: false,
    signals: [
      "Pressure-flow covariance stable across rolling window.",
      "Fallback model idle with healthy confidence margins.",
      "No sustained divergence in water-level telemetry.",
    ],
    recommendations: [
      "Maintain routine sensor calibration cycle.",
      "Continue passive anomaly scoring at 900ms cadence.",
      "Archive latest baseline profile for drift monitoring.",
    ],
  },
  phase1: {
    confidence: 57,
    headline: "Irregular signal variance detected.",
    summary:
      "Pressure oscillation and flow drift exceed normal operating variance. Correlation integrity check is flagged as suspicious but not yet critical.",
    threatLevel: "Guarded",
    expanded: false,
    signals: [
      "Pressure waveform shows growing high-frequency oscillation.",
      "Flow baseline drifting beyond learned seasonal envelope.",
      "Redundancy cross-check disagreement at 0.42 anomaly score.",
    ],
    recommendations: [
      "Increase polling sensitivity on zone-3 pressure cluster.",
      "Activate shadow model verification for flow channel.",
      "Prepare containment rules for coordinated manipulation pattern.",
    ],
  },
  phase2: {
    confidence: 88,
    headline: "Escalation detected across correlated sensor channels.",
    summary:
      "Rapid pressure spikes and aggressive flow inflation indicate potential malicious data manipulation. Active intrusion pattern now likely.",
    threatLevel: "High",
    expanded: false,
    signals: [
      "Pressure exceeds secure envelope with synchronized spike intervals.",
      "Flow threshold breached above safe hydraulic band.",
      "Water-level fluctuation no longer aligns with demand profile.",
    ],
    recommendations: [
      "Force dual-model arbitration on all critical channels.",
      "Throttle unsafe actuation requests from suspect node.",
      "Prioritize incident response for affected sensor gateway.",
    ],
  },
  phase3: {
    confidence: 94,
    headline: "Containment protocol engaged. Investigation in progress.",
    summary:
      "Detected coordinated manipulation of flow-pressure correlation. Probability of malicious intrusion: 94%.",
    threatLevel: "High",
    expanded: true,
    signals: [
      "Correlated anomaly fingerprint matches known adversarial pattern.",
      "Fallback path confirms attack-class confidence above threshold.",
      "Containment policy reduced active drift across all channels.",
    ],
    recommendations: [
      "Lock suspect source and preserve forensic packet traces.",
      "Keep dual-model redundancy active during stabilization window.",
      "Commit validated counter-action to long-term memory.",
    ],
  },
};

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatClock(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatIncidentTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function generateTelemetryPoint(step, phase) {
  const now = new Date();
  const drift = (step % 24) / 24;
  let pressure = 72 + Math.sin(step / 3.7) * 1.8 + (Math.random() - 0.5) * 0.9;
  let flow = 40 + Math.sin(step / 5.4) * 1.3 + (Math.random() - 0.5) * 0.65;
  let level = 68 + Math.sin(step / 8) * 0.9 + (Math.random() - 0.5) * 0.42;
  let anomalyLevel = 0.1 + Math.random() * 0.12;

  if (phase === "phase1") {
    pressure += Math.sin(step * 1.7) * 2.5;
    flow += 1.8 + drift * 3;
    anomalyLevel = 0.45 + Math.random() * 0.1;
  } else if (phase === "phase2") {
    pressure += 7.5 + Math.sin(step * 2.2) * 6.4 + (Math.random() > 0.74 ? 4.8 : 0);
    flow += 7.2 + Math.sin(step / 1.8) * 3.9;
    level += Math.sin(step * 1.9) * 5.6;
    anomalyLevel = 0.8 + Math.random() * 0.15;
  } else if (phase === "phase3") {
    pressure += 3.4 + Math.sin(step * 1.6) * 3.2;
    flow += 3.1 + Math.sin(step / 2.5) * 2.3;
    level += Math.sin(step * 1.4) * 2.8;
    anomalyLevel = 0.63 + Math.random() * 0.13;
  }

  return {
    time: formatClock(now),
    pressure: clamp(pressure, 52, 96),
    flow: clamp(flow, 28, 64),
    level: clamp(level, 50, 84),
    anomalyLevel: clamp(anomalyLevel, 0, 1),
  };
}

function buildMlWindow(telemetryPoints) {
  return telemetryPoints.slice(-10).map((p) => [
    p.pressure,
    p.flow,
    p.level,
    p.anomalyLevel,
  ]);
}

function loadCountermeasureMemory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function createSeedIncidents() {
  return [
    {
      id: "seed-1",
      timestamp: formatIncidentTimestamp(new Date(Date.now() - 1000 * 60 * 11)),
      sensorId: "P-17",
      event: "Baseline drift check completed successfully.",
      predictionType: "Threat",
      severity: "low",
      countermeasure: "No action required.",
      memoryAction: "N/A",
      status: "Closed",
      mitigationSeconds: 12,
    },
    {
      id: "seed-2",
      timestamp: formatIncidentTimestamp(new Date(Date.now() - 1000 * 60 * 7)),
      sensorId: "W-05",
      event: "False alert from transient level turbulence.",
      predictionType: "False Positive",
      severity: "medium",
      countermeasure: "Burst suppression filter applied and confirmed.",
      memoryAction: "Stored for future reuse",
      status: "Resolved",
      mitigationSeconds: 38,
    },
    {
      id: "seed-3",
      timestamp: formatIncidentTimestamp(new Date(Date.now() - 1000 * 60 * 3)),
      sensorId: "GW-A2",
      event: "Primary model confidence dip. LSTM fallback engaged.",
      predictionType: "Threat",
      severity: "low",
      countermeasure: "Dual-model arbitration maintained service continuity.",
      memoryAction: "N/A",
      status: "Mitigated",
      mitigationSeconds: 21,
      fallbackActivated: true,
    },
  ];
}

function tryPlayBeep() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 640;
    gain.gain.value = 0.012;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.08);
  } catch {
    // Ignore silent failures where browser blocks autoplay audio.
  }
}

function LandingScreen({ onEnter }) {
  return (
    <motion.section
      className="landing-screen relative z-30 flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="landing-orb landing-orb-a" />
      <div className="landing-orb landing-orb-b" />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
        <motion.div
          className="landing-hero glass-panel w-full rounded-xl px-6 py-10 text-center shadow-elevate sm:px-10"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[#baf2ff] [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
            National Water Cybersecurity Grid
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.42)] sm:text-5xl">
            <span className="text-white">HydroVigil</span>
            <span className="block text-xl font-medium text-[#d9f6ff] sm:mt-2 sm:text-3xl">
              AI-Powered Cyber Defense for Smart Water Infrastructure
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[#e7f4ff] sm:text-base">
            A futuristic command interface for real-time attack simulation, intelligent threat reasoning, and resilient
            system stabilization.
          </p>

          <motion.button
            type="button"
            onClick={onEnter}
            className="ripple-btn mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-bg"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Enter Command Center
            <FaArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </motion.div>

        <div className="mt-6 grid w-full gap-4 md:grid-cols-3">
          {LANDING_CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                className="landing-card glass-panel rounded-xl p-5 shadow-panel"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: 0.08 * index }}
                whileHover={{ y: -4 }}
              >
                <div className="inline-flex rounded-lg border border-accent/45 bg-accent/10 p-2 text-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#dcefff]">{card.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeView, setActiveView] = useState("operations");
  const [timestamp, setTimestamp] = useState(() => new Date());
  const [systemStatus, setSystemStatus] = useState("normal");
  const [simulationPhase, setSimulationPhase] = useState("normal");
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [targetNodeId, setTargetNodeId] = useState(() => randomItem(SENSOR_IDS));
  const [ambientAttackGlow, setAmbientAttackGlow] = useState(false);
  const [overlayFlash, setOverlayFlash] = useState(false);
  const [toast, setToast] = useState(null);
  const [aiBriefing, setAiBriefing] = useState(AI_BRIEFING.normal);
  const [incidents, setIncidents] = useState(createSeedIncidents);
  const [countermeasureMemory, setCountermeasureMemory] = useState(() => loadCountermeasureMemory());
  const phaseRef = useRef("normal");
  const tickRef = useRef(0);
  const timeoutsRef = useRef([]);
  // ML backend outputs (REAL inference)
  const [mlDecision, setMlDecision] = useState(null);     // "NORMAL" | "SUSPICIOUS" | "ATTACK"
  const [mlRiskScore, setMlRiskScore] = useState(null);   // number (0–100)
  const [mlConfidence, setMlConfidence] = useState(null); // "LOW" | "MEDIUM" | "HIGH"
  const toastTimerRef = useRef(null);
  const memoryRef = useRef(countermeasureMemory);
  const [telemetry, setTelemetry] = useState(() => {
    const points = [];
    for (let i = 0; i < 34; i += 1) points.push(generateTelemetryPoint(i, "normal"));
    tickRef.current = points.length;
    return points;
  });

  const addIncident = useCallback((entry) => {
    setIncidents((prev) => [
      {
        id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: formatIncidentTimestamp(),
        ...entry,
      },
      ...prev,
    ].slice(0, 36));
  }, []);

  const showToast = useCallback((payload) => {
    setToast(payload);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4200);
  }, []);

  const clearSimulationTimers = useCallback(() => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutsRef.current = [];
  }, []);

  const applyCountermeasureMemory = useCallback((pattern) => {
    const existing = memoryRef.current[pattern.key];
    const now = Date.now();
    let nextMemory;
    let countermeasure;
    let memoryAction;

    if (existing) {
      countermeasure = existing.countermeasure;
      memoryAction = "Reused from memory";
      nextMemory = {
        ...memoryRef.current,
        [pattern.key]: {
          ...existing,
          useCount: existing.useCount + 1,
          lastUsed: now,
        },
      };
    } else {
      countermeasure = pattern.countermeasure;
      memoryAction = "Stored for future reuse";
      nextMemory = {
        ...memoryRef.current,
        [pattern.key]: {
          key: pattern.key,
          label: pattern.label,
          countermeasure: pattern.countermeasure,
          useCount: 1,
          lastUsed: now,
        },
      };
    }

    memoryRef.current = nextMemory;
    setCountermeasureMemory(nextMemory);
    return { countermeasure, memoryAction };
  }, []);

  
  

  const startPhaseOne = useCallback(() => {
    setSimulationPhase("phase1");
    setSystemStatus("suspicious");
    setAiBriefing(AI_BRIEFING.phase1);
    setAmbientAttackGlow(false);
  }, []);

  const startPhaseTwo = useCallback(
    (nodeId) => {
      setSimulationPhase("phase2");
      setSystemStatus("active_attack");
      setAiBriefing(AI_BRIEFING.phase2);
      setAmbientAttackGlow(true);
      setOverlayFlash(true);
      tryPlayBeep();
      setTimeout(() => setOverlayFlash(false), 340);
      showToast({
        type: "critical",
        message: `Critical anomaly detected in sensor ${nodeId}`,
      });
      addIncident({
        sensorId: nodeId,
        event: "Critical anomaly burst detected during coordinated attack escalation.",
        predictionType: "Threat",
        severity: "critical",
        countermeasure: "Attack signature isolation and emergency cross-correlation initiated.",
        memoryAction: "N/A",
        status: "Investigating",
        mitigationSeconds: 59,
      });
    },
    [addIncident, showToast]
  );

  const startPhaseThree = useCallback(
    (nodeId) => {
      setSimulationPhase("phase3");
      setSystemStatus("active_attack");
      setAiBriefing(AI_BRIEFING.phase3);

      const memoryOutcome = applyCountermeasureMemory({
        key: "coordinated-flow-pressure-manipulation",
        label: "Coordinated flow-pressure manipulation",
        countermeasure: "Deploy correlation lock, freeze suspect actuator path, and keep dual-model voting active.",
      });

      addIncident({
        sensorId: nodeId,
        event: "Detected coordinated manipulation of flow-pressure correlation.",
        predictionType: "Threat",
        severity: "critical",
        countermeasure: memoryOutcome.countermeasure,
        memoryAction: memoryOutcome.memoryAction,
        status: "Investigating",
        mitigationSeconds: 72,
      });
    },
    [addIncident, applyCountermeasureMemory]
  );

  const handleSimulateAttack = useCallback(() => {
    clearSimulationTimers();
    setSimulationRunning(true);
    const nodeId = randomItem(SENSOR_IDS);
    setTargetNodeId(nodeId);
    startPhaseOne();

    const phaseTwoTimeout = setTimeout(() => startPhaseTwo(nodeId), 2000);
    const phaseThreeTimeout = setTimeout(() => startPhaseThree(nodeId), 5600);
    timeoutsRef.current = [phaseTwoTimeout, phaseThreeTimeout];
  }, [clearSimulationTimers, startPhaseOne, startPhaseThree, startPhaseTwo]);

  const handleResetSystem = useCallback(() => {
    clearSimulationTimers();
    setSimulationRunning(false);
    setSimulationPhase("normal");
    setSystemStatus("normal");
    setAmbientAttackGlow(false);
    setAiBriefing(AI_BRIEFING.normal);
    showToast({ type: "info", message: "Threat contained. System stabilized." });
    addIncident({
      sensorId: targetNodeId,
      event: "Threat contained. System stabilized.",
      predictionType: "Threat",
      severity: "low",
      countermeasure: "Restored nominal telemetry controls and baseline watchdog profile.",
      memoryAction: "N/A",
      status: "Closed",
      mitigationSeconds: 24,
    });
  }, [addIncident, clearSimulationTimers, showToast, targetNodeId]);

  useEffect(() => {
    memoryRef.current = countermeasureMemory;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(countermeasureMemory));
  }, [countermeasureMemory]);

  useEffect(() => {
    phaseRef.current = simulationPhase;
  }, [simulationPhase]);

  useEffect(() => {
    const clock = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
  if (!mlDecision) return;

  if (mlDecision === "ATTACK") {
    setSystemStatus("active_attack");
  } else if (mlDecision === "SUSPICIOUS") {
    setSystemStatus("suspicious");
  } else {
    setSystemStatus("normal");
  }
}, [mlDecision]);

    // === REAL ML INFERENCE HOOK ===

useEffect(() => {
  if (telemetry.length < 20) return;

  console.log("🚀 Sending telemetry window to ML");

  const runMl = async () => {
    try {
      const windowData = telemetry
        .slice(-20)
        .map(t => [t.pressure, t.flow, t.level]);

      const result = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sensor_data: windowData })
      }).then(res => res.json());

      console.log("✅ ML RESULT:", result);

      setMlDecision(result.final_decision);
      setMlRiskScore(result.risk_score);
      setMlConfidence(result.confidence);

    } catch (err) {
      console.error("❌ ML failed:", err);
    }
  };

  runMl();
}, [telemetry]);

  
  useEffect(() => {
    const falsePredictionTimer = setInterval(() => {
      const roll = Math.random();

      if (roll < 0.36) {
        const sensorId = randomItem(SENSOR_IDS);
        const pattern = randomItem(FALSE_POSITIVE_PATTERNS);
        const memoryOutcome = applyCountermeasureMemory(pattern);
        addIncident({
          sensorId,
          event: `False prediction on ${pattern.label.toLowerCase()} channel.`,
          predictionType: "False Positive",
          severity: "medium",
          countermeasure: memoryOutcome.countermeasure,
          memoryAction: memoryOutcome.memoryAction,
          status: "Resolved",
          mitigationSeconds: 32 + Math.round(Math.random() * 21),
        });
      } else if (roll < 0.52) {
        addIncident({
          sensorId: randomItem(SENSOR_IDS),
          event: "Primary confidence dip detected. LSTM fallback engaged for redundancy.",
          predictionType: "Threat",
          severity: "low",
          countermeasure: "Fallback channel activated and synchronized with transformer output.",
          memoryAction: "N/A",
          status: "Mitigated",
          mitigationSeconds: 18 + Math.round(Math.random() * 14),
          fallbackActivated: true,
        });
      }
    }, 16000);

    return () => clearInterval(falsePredictionTimer);
  }, [addIncident, applyCountermeasureMemory]);

  useEffect(() => {
    return () => {
      clearSimulationTimers();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [clearSimulationTimers]);

  const latestTelemetry = telemetry[telemetry.length - 1] ?? { pressure: 0, flow: 0, level: 0, anomalyLevel: 0 };
  const previousTelemetry = telemetry[telemetry.length - 2] ?? latestTelemetry;

 const threatConfidence =
  mlRiskScore !== null
    ? mlRiskScore
    : simulationPhase === "phase3"
    ? 94
    : simulationPhase === "phase2"
    ? 88
    : simulationPhase === "phase1"
    ? 57
    : 18;

  const learnedCountermeasures = useMemo(
    () =>
      Object.values(countermeasureMemory)
        .sort((a, b) => b.lastUsed - a.lastUsed)
        .map((entry) => ({
          key: entry.key,
          label: entry.label,
          countermeasure: entry.countermeasure,
          useCount: entry.useCount,
        })),
    [countermeasureMemory]
  );

  const faultMetrics = useMemo(() => {
    const falsePredictions = incidents.filter((incident) => incident.predictionType === "False Positive");
    const resolved = incidents.filter(
      (incident) => incident.status === "Resolved" || incident.status === "Closed" || incident.status === "Mitigated"
    );
    const reuseHits = incidents.filter((incident) => incident.memoryAction?.includes("Reused")).length;
    const fallbackActivations = incidents.filter((incident) => incident.fallbackActivated).length;
    const mitigationList = incidents
      .filter((incident) => typeof incident.mitigationSeconds === "number")
      .map((incident) => incident.mitigationSeconds);
    const mitigationAvg =
      mitigationList.length > 0 ? mitigationList.reduce((total, item) => total + item, 0) / mitigationList.length : 0;
    const falseRate = incidents.length > 0 ? (falsePredictions.length / incidents.length) * 100 : 0;
    const recoveryRate = incidents.length > 0 ? (resolved.length / incidents.length) * 100 : 100;
    const reuseRate = falsePredictions.length > 0 ? (reuseHits / falsePredictions.length) * 100 : 0;

    return {
      falsePredictionRate: falseRate,
      recoverySuccessRate: recoveryRate,
      countermeasureReuseHitRate: reuseRate,
      fallbackActivations,
      memoryEntries: learnedCountermeasures.length,
      meanMitigationSeconds: mitigationAvg,
      benchmarkAttackF1: MODEL_REPORTS.dualModelRedundancy.attackF1,
      benchmarkAttackRecall: MODEL_REPORTS.dualModelRedundancy.attackRecall,
      benchmarkAccuracy: MODEL_REPORTS.dualModelRedundancy.accuracy,
    };
  }, [incidents, learnedCountermeasures.length]);

  const kpiCards = useMemo(
    () => [
      {
        title: "Pressure",
        value: latestTelemetry.pressure,
        unit: "psi",
        decimals: 1,
        delta: ((latestTelemetry.pressure - previousTelemetry.pressure) / previousTelemetry.pressure) * 100 || 0,
        severity: simulationPhase === "phase2" || simulationPhase === "phase3" ? "critical" : simulationPhase === "phase1" ? "warning" : "normal",
        icon: FaChartLine,
      },
      {
        title: "Flow Rate",
        value: latestTelemetry.flow,
        unit: "m3/h",
        decimals: 1,
        delta: ((latestTelemetry.flow - previousTelemetry.flow) / previousTelemetry.flow) * 100 || 0,
        severity: simulationPhase === "phase2" || simulationPhase === "phase3" ? "critical" : simulationPhase === "phase1" ? "warning" : "normal",
        icon: FaWater,
      },
      {
        title: "Water Level",
        value: latestTelemetry.level,
        unit: "%",
        decimals: 1,
        delta: ((latestTelemetry.level - previousTelemetry.level) / previousTelemetry.level) * 100 || 0,
        severity: simulationPhase === "phase2" ? "critical" : simulationPhase === "phase1" ? "warning" : "normal",
        icon: FaBell,
      },
      {
        title: "Threat Confidence",
        value: threatConfidence,
        unit: "%",
        decimals: 0,
        delta: simulationPhase === "normal" ? -1.2 : 6.8,
        severity: threatConfidence > 80 ? "critical" : threatConfidence > 40 ? "warning" : "normal",
        icon: FaBrain,
      },
      {
        title: "False Prediction Rate",
        value: faultMetrics.falsePredictionRate,
        unit: "%",
        decimals: 1,
        delta: -0.6,
        severity: faultMetrics.falsePredictionRate > 20 ? "warning" : "normal",
        icon: FaShieldAlt,
      },
    ],
    [
      faultMetrics.falsePredictionRate,
      latestTelemetry.flow,
      latestTelemetry.level,
      latestTelemetry.pressure,
      previousTelemetry.flow,
      previousTelemetry.level,
      previousTelemetry.pressure,
      simulationPhase,
      threatConfidence,
    ]
  );

  const validationLog = useMemo(
    () =>
      incidents.filter(
        (incident) => incident.predictionType === "False Positive" || incident.memoryAction?.includes("Stored") || incident.memoryAction?.includes("Reused")
      ),
    [incidents]
  );
  const falsePredictionCount = incidents.filter((incident) => incident.predictionType === "False Positive").length;
  const unresolvedCount = incidents.filter(
    (incident) => incident.status === "Investigating" || incident.status === "Open"
  ).length;
  const criticalCount = incidents.filter((incident) => incident.severity === "critical").length;
  const recoveryRateLabel = `${faultMetrics.recoverySuccessRate.toFixed(1)}%`;

  return (
    <div className="watertech-shell min-h-screen">
      <div
        className="watertech-background"
        style={{
          "--bg-image-primary": `url('${PRIMARY_BG_IMAGE}')`,
          "--bg-image-secondary": `url('${SECONDARY_BG_IMAGE}')`,
        }}
      />
      <div className="watertech-overlay" />
      <div className="watertech-gradient" />
      <div className="watertech-lightveil" />
      <div className="watertech-particles" />
      <div className="floating-glow floating-glow-a" />
      <div className="floating-glow floating-glow-b" />

      <AnimatePresence>
        {!showLanding && ambientAttackGlow ? (
          <motion.div
            className="attack-ambient"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34 }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!showLanding && overlayFlash ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-40 bg-critical/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34 }}
          />
        ) : null}
      </AnimatePresence>

      {!showLanding ? <div className="dashboard-curtain" /> : null}

      <AnimatePresence mode="wait">
        {showLanding ? (
          <LandingScreen key="landing" onEnter={() => setShowLanding(false)} />
        ) : (
          <motion.div
            key="dashboard"
            className="relative z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.36 }}
          >
            <Header systemStatus={systemStatus} timestamp={timestamp} />

            <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
              <div className="dashboard-stage layout-frame">
                <div className="layout-body">
                  <aside className="layout-sidebar">
                    <div className="layout-sidebar-panel">
                      <p className="layout-sidebar-title">Navigation</p>
                      <div className="layout-menu">
                        {DASHBOARD_MENU.map((item) => {
                          const Icon = item.icon;
                          const isActive =
                            (item.key === "operations" && activeView === "operations") ||
                            (item.key === "validation" && activeView === "validation");
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                if (item.key === "operations") setActiveView("operations");
                                if (item.key === "validation") setActiveView("validation");
                              }}
                              className={`layout-menu-item ${
                                isActive ? "layout-menu-item-active" : ""
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="layout-sidebar-panel">
                      <p className="layout-sidebar-title">Simulation Controls</p>
                      <div className="mt-3 flex flex-col gap-2.5">
                        <button
                          type="button"
                          onClick={handleSimulateAttack}
                          className="ripple-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-bg"
                        >
                          <FaChartLine className="h-3.5 w-3.5" />
                          Simulate Coordinated Attack
                        </button>
                        <button
                          type="button"
                          onClick={handleResetSystem}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-card/85 px-4 py-2.5 text-sm font-semibold text-textPrimary transition-all duration-300 hover:-translate-y-0.5 hover:bg-card"
                        >
                          <FaSyncAlt className="h-3.5 w-3.5" />
                          Reset System
                        </button>
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.11em] text-textSecondary">
                        Target node: <span className="font-semibold text-textPrimary">{targetNodeId}</span>
                      </p>
                    </div>

                    <div className="layout-status-grid">
                      <div className="status-chip">
                        <p>Critical Incidents</p>
                        <span>{criticalCount}</span>
                      </div>
                      <div className="status-chip">
                        <p>Open Investigations</p>
                        <span>{unresolvedCount}</span>
                      </div>
                      <div className="status-chip">
                        <p>False Positives</p>
                        <span>{falsePredictionCount}</span>
                      </div>
                      <div className="status-chip">
                        <p>Recovery Success</p>
                        <span>{recoveryRateLabel}</span>
                      </div>
                    </div>

                  </aside>

                  <section className="layout-main">
                    <AnimatePresence mode="wait">
                      {activeView === "operations" ? (
                        <motion.div
                          key="operations"
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          <div className="layout-panel-head">
                            <p className="text-[10px] uppercase tracking-[0.14em] text-textSecondary">
                              Operational Snapshot
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.11em] text-textSecondary">
                              5 Live Metrics
                            </p>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                            {kpiCards.map((card, index) => (
                              <KPICard key={card.title} index={index} {...card} />
                            ))}
                          </div>
                          <LiveCharts data={telemetry} simulationPhase={simulationPhase} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="validation"
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          <div className="layout-panel-head">
                            <p className="text-xs uppercase tracking-[0.14em] text-textSecondary">
                              Model Validation and Fault-Tolerance Intelligence
                            </p>
                          </div>
                          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                            <ModelPerformancePanel reports={MODEL_REPORTS} />
                            <FaultTolerancePanel metrics={faultMetrics} />
                          </section>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>

                  <aside className="layout-right">
                    {activeView === "operations" ? (
                      <>
                        <AIExplanation {...aiBriefing} />
                        <NetworkMap simulationPhase={simulationPhase} targetNodeId={targetNodeId} />
                      </>
                    ) : (
                      <>
                        <div className="layout-sidebar-panel">
                          <p className="layout-sidebar-title">Key Outcomes</p>
                          <div className="mt-3 space-y-2 text-sm text-textSecondary">
                            <p className="rounded-lg border border-white/10 bg-card/60 px-3 py-2">
                              Dual redundancy attack F1:{" "}
                              <span className="font-semibold text-textPrimary">
                                {MODEL_REPORTS.dualModelRedundancy.attackF1.toFixed(2)}
                              </span>
                            </p>
                            <p className="rounded-lg border border-white/10 bg-card/60 px-3 py-2">
                              Countermeasure reuse hit:{" "}
                              <span className="font-semibold text-textPrimary">
                                {faultMetrics.countermeasureReuseHitRate.toFixed(1)}%
                              </span>
                            </p>
                            <p className="rounded-lg border border-white/10 bg-card/60 px-3 py-2">
                              False prediction rate:{" "}
                              <span className="font-semibold text-textPrimary">
                                {faultMetrics.falsePredictionRate.toFixed(1)}%
                              </span>
                            </p>
                          </div>
                        </div>

                        <section className="layout-sidebar-panel">
                          <p className="layout-sidebar-title">Learned Counter-Action Memory</p>
                          <div className="mt-2 space-y-2">
                            {learnedCountermeasures.length === 0 ? (
                              <p className="text-sm text-textSecondary">No learned counter-actions yet.</p>
                            ) : (
                              learnedCountermeasures.slice(0, 4).map((entry) => (
                                <div
                                  key={entry.key}
                                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                                >
                                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-textPrimary">
                                    {entry.label}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-textSecondary">{entry.countermeasure}</p>
                                  <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-accent">
                                    Reuse count: {entry.useCount}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </section>
                      </>
                    )}
                  </aside>
                </div>

                <AnimatePresence mode="wait">
                  {activeView === "operations" ? (
                    <motion.section
                      key="operations-log"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.28 }}
                      className="mt-4"
                    >
                      <IncidentLog incidents={incidents} hideCounterAction />
                    </motion.section>
                  ) : (
                    <motion.section
                      key="validation-log"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.28 }}
                      className="mt-4"
                    >
                      <IncidentLog
                        incidents={validationLog.length > 0 ? validationLog : incidents.slice(0, 8)}
                        hidePredictionSeverity
                      />
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
            </main>

            <AnimatePresence>
              {toast ? (
                <motion.div
                  className="fixed right-4 top-[92px] z-50 max-w-sm rounded-xl border border-critical/50 bg-[linear-gradient(140deg,rgba(78,16,24,0.92),rgba(42,10,16,0.94))] p-4 text-textPrimary shadow-[0_18px_42px_rgba(0,0,0,0.5)]"
                  initial={{ opacity: 0, x: 56 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 56 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-critical/90">
                    {toast.type === "critical" ? "Critical Alert" : "System Update"}
                  </p>
                  <p className="mt-1 text-sm text-textPrimary">{toast.message}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
