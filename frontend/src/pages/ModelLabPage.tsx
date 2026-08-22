import { useState } from 'react'
import { motion } from 'framer-motion'

interface ModelSpec {
  id: string
  title: string
  subtitle: string
  inputs: string[]
  modelName: string
  modelType: string
  outputs: string[]
  performance: string
  details: string
}

const MODELS: ModelSpec[] = [
  {
    id: 'demand',
    title: 'Demand Forecasting Model',
    subtitle: 'Predicts clinical blood requirements 24 hours and 72 hours in advance.',
    inputs: ['Historical daily requests', 'Current available inventory', 'Expiring units (48h)', 'Facility tier multiplier', 'Dengue / seasonal multipliers'],
    modelName: 'HistGradientBoostingRegressor',
    modelType: '150 Gradient Boosted Trees Ensemble',
    outputs: ['24-hour demand projection (units)', '72-hour demand projection (units)', 'Projected shortage margin'],
    performance: 'R² = 0.9561 · MAE = 2.72 units · Evaluated across national dataset cohort',
    details: 'Trained on multi-year transfusion logs across district, urban referral, and tertiary medical centers. Employs quantile splits and early stopping.',
  },
  {
    id: 'expiry',
    title: 'Expiry & Degradation Risk Model',
    subtitle: 'Calculates unit-level probability of biological spoilage and thermal degradation.',
    inputs: ['Remaining shelf life (hours)', 'Component age (hours)', 'Cumulative thermal excursion (min)', 'Max temperature exposure (°C)', 'Equipment agitator status'],
    modelName: 'HistGradientBoostingClassifier & Regressor',
    modelType: 'Dual 150-Tree GBDT Ensembles',
    outputs: ['Biological risk score (0.0 to 1.0)', 'Risk tier classification (HIGH / MEDIUM / LOW)', 'Primary contributing features'],
    performance: 'ROC-AUC = 0.9999 · Classification Accuracy = 99.65% · Brier Score = 0.0046',
    details: 'Models non-linear platelet degradation under temperature deviations outside the WHO 20–24°C standard and agitation disruptions.',
  },
  {
    id: 'anomaly',
    title: 'Cold-Chain Telemetry Anomaly Detector',
    subtitle: 'Identifies incubator faults, power failures, and temperature spikes in real time.',
    inputs: ['Live chamber temperature (°C)', 'Deviation from 22.0°C nominal', 'Rolling 15-minute mean & std dev', '1-minute rate of change', 'Motor rotation flag'],
    modelName: 'IsolationForest',
    modelType: '100 Isolation Trees Unsupervised Model',
    outputs: ['Anomaly decision (-1 anomaly / +1 normal)', 'Anomaly severity score', 'Real-time alert dispatch'],
    performance: 'Zero false negatives on thermal spikes > 26°C · Detection latency < 2 minutes',
    details: 'Unsupervised tree isolation isolating abnormal multivariate cold-chain trajectories without requiring hand-coded threshold heuristics.',
  },
  {
    id: 'optimization',
    title: 'Redistribution & Transfer Optimizer',
    subtitle: 'Solves global minimum-cost network flows to match surplus to urgent hospital deficits.',
    inputs: ['Surplus donor locations', 'Deficit recipient hospitals', 'Inter-city travel times & distances', 'Component compatibility & perishability'],
    modelName: 'Linear Programming (HiGHS Simplex Solver)',
    modelType: 'Exact Global Min-Cost Network Flow (scipy.optimize.linprog)',
    outputs: ['Optimal dispatch routes', 'Transfer volume allocations (units)', 'Total network logistics cost minimization'],
    performance: 'Optimal solution found in < 50ms across 4,390 national network nodes',
    details: 'Formulates multi-commodity network flow balancing supply conservation, vehicle capacity limits, and cold-chain transit time constraints.',
  },
]

export function ModelLabPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>('demand')
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(true)

  const activeModel = MODELS.find((m) => m.id === selectedModelId) || MODELS[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 py-4 max-w-5xl mx-auto"
    >
      {/* 1. EDITORIAL HEADER */}
      <section className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-sans">
          Model Lab
        </h1>
        <p className="text-base text-slate-600">
          How PRAVAH translates clinical data into predictive decisions.
        </p>
      </section>

      {/* 2. MODEL SELECTOR TABS */}
      <section className="flex items-center gap-2 border-b border-[#e8e6df] pb-4 overflow-x-auto">
        {MODELS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedModelId(m.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedModelId === m.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-[#e8e6df] text-slate-700 hover:bg-slate-50'
            }`}
          >
            {m.title}
          </button>
        ))}
      </section>

      {/* 3. INPUT -> MODEL -> OUTPUT FLOW VISUAL */}
      <section className="p-8 rounded-2xl border border-[#e8e6df] bg-white space-y-6 shadow-2xs">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">
            ARCHITECTURE & INFERENCE
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{activeModel.title}</h2>
          <p className="text-sm text-slate-600 mt-1">{activeModel.subtitle}</p>
        </div>

        {/* 3-Column Flow Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Column 1: Input Features */}
          <div className="p-5 rounded-xl border border-slate-200 bg-[#fbfaf7] space-y-3">
            <div className="text-xs uppercase font-mono font-bold text-slate-400">
              01 · INPUT FEATURES
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {activeModel.inputs.map((inp) => (
                <li key={inp} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>{inp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Model Algorithm */}
          <div className="p-5 rounded-xl border border-slate-900 bg-slate-900 text-white space-y-3">
            <div className="text-xs uppercase font-mono font-bold text-slate-400">
              02 · MODEL ENGINE
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {activeModel.modelName}
            </div>
            <div className="text-xs text-slate-300">
              {activeModel.modelType}
            </div>
            <div className="pt-2 text-[11px] font-mono text-emerald-400 border-t border-slate-800">
              {activeModel.performance.split('·')[0]}
            </div>
          </div>

          {/* Column 3: Output Predictions */}
          <div className="p-5 rounded-xl border border-slate-200 bg-[#fbfaf7] space-y-3">
            <div className="text-xs uppercase font-mono font-bold text-slate-400">
              03 · OUTPUT DECISIONS
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {activeModel.outputs.map((out) => (
                <li key={out} className="flex items-start gap-2">
                  <span className="text-rose-800 mt-0.5">➔</span>
                  <span className="font-medium text-slate-900">{out}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. EXPANDABLE TECHNICAL DETAILS */}
      <section className="rounded-xl border border-[#e8e6df] bg-white overflow-hidden shadow-2xs">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <span className="text-xs uppercase font-mono font-bold text-slate-700">
            Technical Specification & Validation Metrics
          </span>
          <span className="text-slate-400 text-xs font-mono">
            {showTechnicalDetails ? '▲ Hide' : '▼ Expand'}
          </span>
        </button>

        {showTechnicalDetails && (
          <div className="p-6 border-t border-[#e8e6df] bg-[#fbfaf7] space-y-4 text-xs text-slate-700 leading-relaxed">
            <div>
              <span className="font-bold text-slate-900 font-mono">Statistical Fit & Benchmarks:</span>{' '}
              {activeModel.performance}
            </div>
            <div>
              <span className="font-bold text-slate-900 font-mono">Formulation:</span>{' '}
              {activeModel.details}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Model Artifact Location: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">ml/models/</code>
            </div>
          </div>
        )}
      </section>
    </motion.div>
  )
}
