import { useState } from 'react'

const INCUBATOR_NODES = [
  { id: 'EQ-01', name: 'AIIMS Delhi Incubator A', temp: 22.1, status: 'NORMAL', agitation: 'ACTIVE (60 RPM)' },
  { id: 'EQ-02', name: 'Tata Memorial Mumbai Chamber 2', temp: 22.4, status: 'NORMAL', agitation: 'ACTIVE (60 RPM)' },
  { id: 'EQ-03', name: 'Bengaluru Victoria Chamber 1', temp: 26.8, status: 'EXCURSION', agitation: 'STOPPED (FAULT)' },
  { id: 'EQ-04', name: 'Rajiv Gandhi Chennai Unit B', temp: 21.8, status: 'NORMAL', agitation: 'ACTIVE (60 RPM)' },
  { id: 'EQ-05', name: 'NIMS Hyderabad Incubator 3', temp: 22.0, status: 'NORMAL', agitation: 'ACTIVE (60 RPM)' },
]

export function ThermalRibbonCanvas() {
  const [selectedEq, setSelectedEq] = useState(INCUBATOR_NODES[2])

  return (
    <div className="space-y-8 select-none">
      {/* 1. LONG THERMAL RIBBON CANVAS */}
      <div className="p-8 rounded-3xl border border-cyan-500/20 bg-[#071018] space-y-6 shadow-2xl network-canvas-grid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              CONTINUOUS ENVIRONMENTAL STATE
            </span>
            <h2 className="text-2xl font-bold text-white font-sans mt-0.5">
              Cold-Chain Thermal Ribbon
            </h2>
          </div>
          <div className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-mono text-cyan-300">
            WHO Safe Boundary: 20.0°C – 24.0°C
          </div>
        </div>

        {/* Thermal Ribbon Visualizer */}
        <div className="relative w-full aspect-[16/7] bg-[#04080e] rounded-2xl border border-cyan-500/10 p-6 flex flex-col justify-center overflow-hidden">
          <svg viewBox="0 0 720 220" className="w-full h-full">
            {/* Upper Critical Limit Line (24.0°C) */}
            <line x1="60" y1="60" x2="660" y2="60" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="670" y="64" fill="#f43f5e" fontSize="10" fontFamily="monospace">24.0°C MAX</text>

            {/* Nominal Target Line (22.0°C) */}
            <line x1="60" y1="110" x2="660" y2="110" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            <text x="670" y="114" fill="#06b6d4" fontSize="10" fontFamily="monospace">22.0°C NOMINAL</text>

            {/* Lower Critical Limit Line (20.0°C) */}
            <line x1="60" y1="160" x2="660" y2="160" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="670" y="164" fill="#f43f5e" fontSize="10" fontFamily="monospace">20.0°C MIN</text>

            {/* WHO Safe Ribbon Corridor */}
            <rect x="60" y="60" width="600" height="100" fill="rgba(6, 182, 212, 0.05)" />

            {/* Telemetry Stream Path with Excursion Breach */}
            <path
              d="M 60 110 Q 180 105 280 115 T 440 40 T 560 110 T 660 112"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
            />

            {/* Equipment Nodes along Ribbon */}
            <g onClick={() => setSelectedEq(INCUBATOR_NODES[0])} className="cursor-pointer">
              <circle cx="160" cy="108" r="7" fill="#06b6d4" />
              <text x="160" y="130" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">EQ-01 (22.1°C)</text>
            </g>

            <g onClick={() => setSelectedEq(INCUBATOR_NODES[1])} className="cursor-pointer">
              <circle cx="300" cy="114" r="7" fill="#06b6d4" />
              <text x="300" y="136" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">EQ-02 (22.4°C)</text>
            </g>

            {/* EXCURSION NODE (BREACH OUTSIDE SAFE ZONE) */}
            <g onClick={() => setSelectedEq(INCUBATOR_NODES[2])} className="cursor-pointer">
              <circle cx="440" cy="40" r="14" fill="none" stroke="#dc2626" strokeWidth="2" className="animate-pulse" />
              <circle cx="440" cy="40" r="7" fill="#dc2626" />
              <text x="440" y="22" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="bold" fontFamily="monospace">
                EQ-03 (26.8°C EXCURSION!)
              </text>
            </g>

            <g onClick={() => setSelectedEq(INCUBATOR_NODES[3])} className="cursor-pointer">
              <circle cx="560" cy="110" r="7" fill="#06b6d4" />
              <text x="560" y="130" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">EQ-04 (21.8°C)</text>
            </g>
          </svg>
        </div>

        {/* Selected Equipment Node Telemetry Detail */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#06090e] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                PHYSICAL EQUIPMENT TELEMETRY
              </span>
              <div className="text-lg font-bold text-white font-sans mt-0.5">
                {selectedEq.name} ({selectedEq.id})
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                selectedEq.status === 'EXCURSION'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {selectedEq.status}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <div className="text-slate-500">Chamber Temperature</div>
              <div className="text-xl font-bold text-white mt-1">{selectedEq.temp}°C</div>
            </div>

            <div>
              <div className="text-slate-500">Agitation Mechanism</div>
              <div className="text-base font-bold text-slate-200 mt-1">{selectedEq.agitation}</div>
            </div>

            <div>
              <div className="text-slate-500">Anomaly Isolation Forest</div>
              <div className="text-base font-bold text-cyan-300 mt-1">
                {selectedEq.status === 'EXCURSION' ? '0.822 (Outlier)' : '0.180 (Normal)'}
              </div>
            </div>

            <div>
              <div className="text-slate-500">Telemetry Stream Rate</div>
              <div className="text-base font-bold text-slate-400 mt-1">1 Hz MQTT Stream</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
