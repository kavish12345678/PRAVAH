import { useState } from 'react'
import { motion } from 'framer-motion'

const SYSTEMS = [
  {
    id: 'demand',
    title: 'Demand Forecasting Flow',
    algorithm: 'HistGradientBoostingRegressor (150 Trees)',
    data: 'Historical usage logs & local facility multipliers',
    model: '150-tree Gradient Boosted Regressor',
    prediction: '24h & 72h requirement projections',
    action: 'Deficit/surplus balance calculation for LP solver',
    metrics: 'R² = 0.9561 · MAE = 2.72 units',
  },
  {
    id: 'risk',
    title: 'Biological Spoilage Flow',
    algorithm: 'HistGradientBoostingClassifier & Regressor',
    data: 'Platelet age, thermal excursions & issue velocity',
    model: 'Dual GBDT probability models',
    prediction: 'Unit-level degradation probability (0.0 to 1.0)',
    action: 'Prioritize near-expiry units for rapid transfer',
    metrics: 'ROC-AUC = 0.9999 · Accuracy = 99.65%',
  },
  {
    id: 'cold',
    title: 'Cold-Chain Anomaly Flow',
    algorithm: 'Isolation Forest (100 Trees)',
    data: 'Chamber temperature streams & motor agitation sensor',
    model: 'Unsupervised tree isolation',
    prediction: 'Anomaly score & Outlier classification',
    action: 'Trigger emergency technician alert & cold-chain quarantine',
    metrics: '100% Recall on thermal spikes > 26°C',
  },
  {
    id: 'optimize',
    title: 'Global Redistribution Flow',
    algorithm: 'Linear Programming (HiGHS Simplex)',
    data: 'Surplus/deficit balances & transit travel times',
    model: 'Min-cost network flow optimization',
    prediction: 'Global optimal route assignments',
    action: 'Dispatch recommended transfers with 0 stockouts',
    metrics: 'Optimal solution found in < 50ms across national grid',
  },
]

export function FluidModelsPage() {
  const [selectedSystemId, setSelectedSystemId] = useState<string>('demand')

  const active = SYSTEMS.find((s) => s.id === selectedSystemId) || SYSTEMS[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto w-full pt-20 pb-16 px-4 space-y-10 select-none"
    >
      {/* Editorial Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#9A8BC7]">
          INTELLIGENCE PATHWAYS
        </div>
        <h1 className="text-4xl sm:text-5xl font-light text-[#F4EFE7] font-serif">
          Inside the intelligence.
        </h1>
        <p className="text-xs font-mono text-[#9A8BC7]/80">
          Four flowing systems translating biological streams into optimized clinical actions.
        </p>
      </div>

      {/* System Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {SYSTEMS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSystemId(s.id)}
            className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider transition cursor-pointer whitespace-nowrap ${
              selectedSystemId === s.id
                ? 'bg-[#E96B73] text-[#111124] font-bold shadow-lg shadow-black'
                : 'text-[#9A8BC7] hover:text-[#F4EFE7]'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Connected Pathway Grid */}
      <div className="p-8 rounded-3xl border border-white/10 bg-[#181631]/40 space-y-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="text-2xl font-light text-[#F4EFE7] font-serif">{active.title}</div>
          <div className="text-xs font-mono text-[#7EAA92] font-bold">{active.metrics}</div>
        </div>

        {/* 4 Continuous Flow Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#111124]/60 border border-white/5 space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-[#9A8BC7]">01 · DATA</div>
            <div className="text-xs font-mono text-[#F4EFE7]">{active.data}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111124]/60 border border-white/5 space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-[#E96B73]">02 · MODEL</div>
            <div className="text-xs font-mono text-[#F4EFE7]">{active.model}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111124]/60 border border-white/5 space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-[#70B9C6]">03 · PREDICTION</div>
            <div className="text-xs font-mono text-[#F4EFE7]">{active.prediction}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111124]/60 border border-[#7EAA92]/20 space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-[#7EAA92]">04 · ACTION</div>
            <div className="text-xs font-mono text-[#F4EFE7]">{active.action}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
