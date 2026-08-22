import { useState } from 'react'

const PIPELINES = [
  {
    id: 'demand',
    title: 'Demand Forecasting Pipeline',
    tag: 'GBDT Regressor (150 Trees)',
    data: ['Transfusion usage history', 'Current platelet stock', 'Seasonal dengue multipliers', 'District facility count'],
    features: ['16 Dynamic engineered features', '48h Expiring volume', 'Surrounding demand index'],
    model: 'HistGradientBoostingRegressor (.joblib artifact)',
    prediction: 'Predicted 24h & 72h requirement (units)',
    decision: 'Surplus/deficit margin determination for LP solver',
    metrics: 'R² = 0.9561 · MAE = 2.72 units',
  },
  {
    id: 'expiry',
    title: 'Expiry & Degradation Risk Pipeline',
    tag: 'GBDT Classifier & Regressor (150 Trees)',
    data: ['Biological collection timestamp', 'Thermal incubator telemetry', 'Local issue velocity'],
    features: ['Remaining shelf life (hours)', 'Cumulative excursion minutes', 'Agitation motor state'],
    model: 'HistGradientBoostingClassifier + Regressor',
    prediction: 'Unit spoilage probability (0.0 to 1.0) & Risk Band',
    decision: 'Prioritize near-expiry units for immediate redistribution',
    metrics: 'ROC-AUC = 0.9999 · Classification Accuracy = 99.65%',
  },
  {
    id: 'cold',
    title: 'Cold-Chain Telemetry Pipeline',
    tag: 'Isolation Forest (100 Trees)',
    data: ['Incubator chamber temperature (°C)', 'Hall-effect agitator rotation (RPM)', 'MQTT sensor streams'],
    features: ['15-minute rolling mean & std dev', 'Temperature deviation from 22.0°C', '1-minute rate of change'],
    model: 'IsolationForest Unsupervised Tree Isolation',
    prediction: 'Anomaly score & Outlier classification',
    decision: 'Trigger emergency technician alert & cold-chain quarantine',
    metrics: '100% Recall on thermal excursions > 26°C',
  },
]

export function InteractivePipelineStudio() {
  const [selectedId, setSelectedId] = useState<string>('demand')
  const [showDetails, setShowDetails] = useState<boolean>(true)

  const active = PIPELINES.find((p) => p.id === selectedId) || PIPELINES[0]

  return (
    <div className="space-y-8 select-none">
      {/* 1. PIPELINE SELECTOR */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {PIPELINES.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`px-5 py-2 rounded-full text-xs font-mono font-semibold tracking-wider transition cursor-pointer whitespace-nowrap ${
              selectedId === p.id
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* 2. SPATIAL DATA -> FEATURES -> MODEL -> PREDICTION -> DECISION PIPELINE */}
      <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0e17] space-y-8 shadow-2xl network-canvas-grid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
              END-TO-END INFERENCE FLOW
            </span>
            <h3 className="text-2xl font-bold text-white font-sans mt-0.5">{active.title}</h3>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-400">
            {active.metrics}
          </div>
        </div>

        {/* 5-Step Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Step 1: Real-World Data */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#06090e] space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500">01 · DATA</div>
            <div className="text-sm font-bold text-white">Clinical Telemetry</div>
            <ul className="text-[11px] text-slate-400 space-y-1 pt-1 font-mono">
              {active.data.map((d) => (
                <li key={d}>• {d}</li>
              ))}
            </ul>
          </div>

          {/* Step 2: Features */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#06090e] space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500">02 · FEATURES</div>
            <div className="text-sm font-bold text-white">Dynamic Vector</div>
            <ul className="text-[11px] text-slate-400 space-y-1 pt-1 font-mono">
              {active.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>

          {/* Step 3: Model */}
          <div className="p-5 rounded-2xl border border-rose-500/40 bg-rose-950/20 space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-rose-400">03 · MODEL</div>
            <div className="text-sm font-bold text-white">{active.tag}</div>
            <div className="text-[11px] text-rose-300/80 pt-1 font-mono">{active.model}</div>
          </div>

          {/* Step 4: Prediction */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#06090e] space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500">04 · OUTPUT</div>
            <div className="text-sm font-bold text-white">Predictive State</div>
            <div className="text-[11px] text-cyan-300 pt-1 font-mono">{active.prediction}</div>
          </div>

          {/* Step 5: Decision */}
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-emerald-400">05 · ACTION</div>
            <div className="text-sm font-bold text-white">Clinical Action</div>
            <div className="text-[11px] text-emerald-300/80 pt-1 font-mono">{active.decision}</div>
          </div>
        </div>

        {/* Expandable Technical Specifications */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition cursor-pointer text-xs font-mono text-slate-300"
          >
            <span className="font-bold uppercase tracking-wider">Model Architecture & Verification Spec</span>
            <span>{showDetails ? '▲ Hide' : '▼ Expand'}</span>
          </button>

          {showDetails && (
            <div className="p-6 border-t border-white/10 space-y-3 text-xs font-mono text-slate-400">
              <div><span className="text-white font-bold">Trained Model Artifact:</span> ml/models/{selectedId === 'demand' ? 'demand_forecast_model_24h.joblib' : selectedId === 'expiry' ? 'expiry_risk_model.joblib' : 'cold_chain_anomaly_model.joblib'}</div>
              <div><span className="text-white font-bold">Trained Estimators:</span> 150 Decision Trees Ensemble with Quantile Split Strategy</div>
              <div><span className="text-white font-bold">Verification Benchmark:</span> {active.metrics} evaluated on 2,000 real national dataset test rows</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
