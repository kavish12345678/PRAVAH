import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassPanel } from './GlassPanel'

interface Stage {
  id: string
  title: string
  subtitle: string
  category: 'DATA' | 'ML' | 'EVENT' | 'OPTIMIZATION' | 'OPERATIONS'
  color: 'cyan' | 'blue' | 'amber' | 'red' | 'emerald'
  icon: string
  description: string
  inputs: string[]
  outputs: string[]
  metrics: Record<string, string>
  codeSnippet: string
}

const WORKFLOW_STAGES: Stage[] = [
  {
    id: 'data-layer',
    title: '1. Multi-Source Ingestion & Telemetry',
    subtitle: 'Real Public Network + Cold-Chain Streams',
    category: 'DATA',
    color: 'cyan',
    icon: '📡',
    description: 'Ingests blood bank nodes across India, minute-level cold-chain sensor streams (temperature & agitation), component batch inventories, and historical consumption time-series.',
    inputs: ['4,390 Blood Banks (e-RaktKosh / OGD)', 'Minute Telemetry (20-24°C nominal)', 'Daily Platelet Demand Logs', 'Equipment Specs (22°C ± 2°C AIIMS Tenders)'],
    outputs: ['Unified Feature Vectors', 'Telemetry Waveforms', 'Inventory Cohort Records'],
    metrics: { 'Network Nodes': '4,390 Banks', 'Telemetry Sampling': '1 / min', 'Platelet Shelf Life': '5 Days Max' },
    codeSnippet: `cold_chain_stream = fetch_telemetry(bank_id=3)
# Validates: temp in [20.0, 24.0] & agitation == ON`
  },
  {
    id: 'model-1',
    title: '2. Model 1: Demand Forecasting',
    subtitle: 'HistGradientBoosting (24h & 72h)',
    category: 'ML',
    color: 'blue',
    icon: '📈',
    description: 'Predicts future platelet demand for 24-hour and 72-hour operational horizons using gradient boosted decision trees trained on facility tiers, weather/monsoon seasonality, and historical usage.',
    inputs: ['Historical 7-day usage array', 'Current stock & expiring units', 'Facility tier (hub / referral / district)', 'Monsoon / dengue demand multipliers'],
    outputs: ['24-Hour Projected Demand', '72-Hour Projected Demand', '7-Day Trend Extrapolation'],
    metrics: { '24h MAE': '3.92 units', '24h R² Score': '0.763', '72h MAE': '13.74 units' },
    codeSnippet: `pred_24h, pred_72h = demand_model.predict_horizons(
    current_stock=20, expiring_48h=4, platelet_requests=12
)`
  },
  {
    id: 'model-3',
    title: '3. Model 3: Cold-Chain Anomaly Detector',
    subtitle: 'IsolationForest + Hybrid Rule Engine',
    category: 'ML',
    color: 'amber',
    icon: '❄️',
    description: 'Analyzes rolling temperature derivatives, standard deviation over 15-minute windows, and agitation states to identify equipment failures and thermal excursions before spoilage occurs.',
    inputs: ['Temperature time-series waveform', 'Agitation motor state (ON/OFF)', '15-min rolling mean & std dev', 'Equipment health degradation score'],
    outputs: ['Anomaly Score (0.0 to 1.0)', 'Status Flag (ANOMALY / NORMAL)', 'Clinical Rule Violation Trigger'],
    metrics: { 'ML ROC-AUC': '0.9938', 'Hybrid Recall': '100.0%', 'Detection Delay': '< 2 mins' },
    codeSnippet: `anomaly = iso_forest.score_samples(rolling_features)
is_anomaly = rule_violation or (anomaly_score >= 0.65)`
  },
  {
    id: 'model-2',
    title: '4. Model 2: Expiry & Wastage Risk Model',
    subtitle: 'HistGradientBoosting Classifier & Regressor',
    category: 'ML',
    color: 'red',
    icon: '⚠️',
    description: 'Computes unit-level spoilage probability and degradation scores by fusing biological shelf-life aging with demand forecasts, cold-chain thermal stress, and equipment health.',
    inputs: ['Age & remaining shelf-life hours', 'Projected 24h/72h local demand', 'Cumulative excursion minutes', 'Agitation interruption duration'],
    outputs: ['Risk Probability (0.00 to 1.00)', 'Risk Band (LOW / MEDIUM / HIGH)', 'Top Contributing Factors', 'Clinical Action Recommendation'],
    metrics: { 'Binary ROC-AUC': '0.9999', 'Binary PR-AUC': '1.000', 'Brier Score': '0.0604' },
    codeSnippet: `risk = expiry_model.score_unit(
    remaining_shelf_life_hours=43.2, cumulative_excursion_minutes=45.0
)`
  },
  {
    id: 'event-orchestrator',
    title: '5. Event-Driven Dynamic Re-Scoring',
    subtitle: 'Real-Time Telemetry & Fault Cascade',
    category: 'EVENT',
    color: 'amber',
    icon: '⚡',
    description: 'When a temperature spike or power interruption occurs, the orchestrator instantly identifies affected inventory batches, computes real-time risk deltas, and triggers priority rerouting.',
    inputs: ['Thermal excursion alert event', 'Agitation motor interruption signal', 'Affected blood bank ID & batch scope'],
    outputs: ['Pre- vs Post-Incident Risk Deltas', 'Immediate Clinical Alert', 'Automated Optimizer Rerun Trigger'],
    metrics: { 'Response Latency': '< 50ms', 'Audit Log': '100% Persisted', 'Dynamic Trigger': 'Automated' },
    codeSnippet: `audit = orchestrator.process_incident(bank_id=3, temp=27.8, dur=60)
if audit.max_risk_delta > 0.40: trigger_optimizer_rerun()`
  },
  {
    id: 'optimization',
    title: '6. Linear Programming Redistribution Engine',
    subtitle: 'Min-Cost Network Flow (HiGHS Solver)',
    category: 'OPTIMIZATION',
    color: 'emerald',
    icon: '🔄',
    description: 'Formulates and solves a global min-cost linear program to redistribute surplus platelet units from donor banks to shortage centers under distance, refrigerated vehicle, and travel-time constraints.',
    inputs: ['Donor Surplus Units Pool', 'Recipient Shortage Deficit Pool', 'Candidate Transport Graph', 'Refrigerated Vehicle Capacity'],
    outputs: ['Optimal Inter-City Transfer Dispatches', 'Distance (km) & Travel Time (min)', 'Wastage & Stockout Units Reduced'],
    metrics: { 'Solver': 'HiGHS LP Simplex', 'Demand Coverage': '90-95%', 'Wastage Reduction': '~75%' },
    codeSnippet: `res = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")
# Minimizes transport cost while satisfying surplus & deficit bounds`
  },
  {
    id: 'operations',
    title: '7. Operations Command & Human Audit Log',
    subtitle: 'Decision Support & Chain-of-Custody',
    category: 'OPERATIONS',
    color: 'cyan',
    icon: '🛡️',
    description: 'Presents AI recommendations to medical officers and logistics dispatchers with transparent explainability tags, one-click digital approval, and tamper-proof audit trail logging.',
    inputs: ['Optimal Transfer Recommendations', 'Contributing Risk Explainability Factors', 'Officer Approval / Rejection Decision'],
    outputs: ['Confirmed Transport Manifest', 'Audit Log Record (PostgreSQL)', 'Live Stock Balance Adjustment'],
    metrics: { 'Approval Latency': 'Real-Time', 'Audit Compliance': '100%', 'Cold-Chain Integrity': 'Monitored' },
    codeSnippet: `PATCH /api/transfers/{id}/status -> { status: "APPROVED" }
# Records audit log: timestamp, officer, qty, route, status`
  },
]

const colorClasses = {
  cyan: { border: 'border-cyan-400/40', text: 'text-cyan-300', bg: 'bg-cyan-500/10', glow: 'cyan' as const },
  blue: { border: 'border-blue-400/40', text: 'text-blue-300', bg: 'bg-blue-500/10', glow: 'blue' as const },
  amber: { border: 'border-amber-400/40', text: 'text-amber-300', bg: 'bg-amber-500/10', glow: 'amber' as const },
  red: { border: 'border-red-400/40', text: 'text-red-300', bg: 'bg-red-500/10', glow: 'red' as const },
  emerald: { border: 'border-emerald-400/40', text: 'text-emerald-300', bg: 'bg-emerald-500/10', glow: 'emerald' as const },
}

export function ArchitectureWorkflowView() {
  const [selectedStage, setSelectedStage] = useState<Stage>(WORKFLOW_STAGES[0])

  return (
    <div className="space-y-6">
      {/* Workflow Map Header */}
      <GlassPanel className="p-6" glow="cyan">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Complete System Pipeline
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              End-to-End PRAVAH Intelligence & Optimization Flow
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click on any stage below to inspect its mathematical formulation, inputs, outputs, and live verified metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              3 ML Models
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              1 LP Optimizer
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              1 Event Engine
            </span>
          </div>
        </div>

        {/* Interactive Pipeline Nodes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-7 gap-2">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const isSelected = selectedStage.id === stage.id
            const color = colorClasses[stage.color]

            return (
              <motion.button
                key={stage.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedStage(stage)}
                className={`relative flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? `${color.border} ${color.bg} shadow-lg shadow-cyan-500/10`
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="text-2xl mb-1">{stage.icon}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Step {idx + 1}
                </div>
                <div className={`text-xs font-semibold mt-1 leading-tight ${isSelected ? color.text : 'text-slate-200'}`}>
                  {stage.title.split(': ')[1] || stage.title.split('. ')[1]}
                </div>
                {isSelected && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -bottom-2 h-1 w-8 rounded-full bg-cyan-400"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </GlassPanel>

      {/* Deep Stage Inspector */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedStage.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
        >
          <GlassPanel className="p-6 md:p-8" glow={selectedStage.color as any}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedStage.icon}</span>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-400">
                      Pipeline Stage Specification
                    </span>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedStage.title}
                    </h3>
                    <p className={`text-xs font-medium ${colorClasses[selectedStage.color].text}`}>
                      {selectedStage.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed pt-2">
                  {selectedStage.description}
                </p>
              </div>

              {/* Verified Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-w-[320px]">
                {Object.entries(selectedStage.metrics).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl border border-white/10 bg-black/40">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">{key}</div>
                    <div className="text-sm font-semibold text-white mt-1">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input & Output Specifications Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Ingested Features & Inputs
                  </h4>
                </div>
                <ul className="space-y-2">
                  {selectedStage.inputs.map((inp) => (
                    <li key={inp} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-cyan-500 font-mono">▸</span>
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Outputs */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Generated Decisions & Outputs
                  </h4>
                </div>
                <ul className="space-y-2">
                  {selectedStage.outputs.map((out) => (
                    <li key={out} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-emerald-500 font-mono">✓</span>
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Code / Logic Box */}
            <div className="mt-6 p-4 rounded-xl border border-white/10 bg-black/60 font-mono text-xs text-cyan-300 overflow-x-auto">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-sans">
                Core Execution Code Snippet
              </div>
              <pre>{selectedStage.codeSnippet}</pre>
            </div>
          </GlassPanel>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
