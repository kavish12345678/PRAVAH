import { useState } from 'react'
import { motion } from 'framer-motion'

const EQUIPMENT_STREAM = [
  { id: 'INC-01', name: 'Bengaluru Victoria Chamber 1', temp: 26.8, status: 'EXCURSION', rpm: 0 },
  { id: 'INC-02', name: 'Delhi AIIMS Incubator 4', temp: 22.1, status: 'OPTIMAL', rpm: 60 },
  { id: 'INC-03', name: 'Mumbai KEM Hospital Unit 2', temp: 22.4, status: 'OPTIMAL', rpm: 60 },
  { id: 'INC-04', name: 'Chennai Rajiv Gandhi Chamber A', temp: 21.8, status: 'OPTIMAL', rpm: 60 },
]

export function FluidColdPage() {
  const [selectedEq, setSelectedEq] = useState(EQUIPMENT_STREAM[0])

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
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#70B9C6]">
          ENVIRONMENTAL EQUILIBRIUM
        </div>
        <h1 className="text-4xl sm:text-5xl font-light text-[#F4EFE7] font-serif">
          Keep the flow cold.
        </h1>
        <p className="text-xs font-mono text-[#9A8BC7]/80">
          Continuous cold-chain thermal ribbon maintaining 20.0–24.0°C biological viability.
        </p>
      </div>

      {/* Large Thermal Ribbon Visualizer */}
      <div className="p-8 rounded-3xl border border-[#70B9C6]/20 bg-[#0e1726]/50 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="text-lg font-light text-[#F4EFE7] font-serif">
            Live Thermal Ribbon & Excursion Deformations
          </div>
          <div className="text-xs font-mono text-[#70B9C6]">
            WHO Safe Range: 20.0°C – 24.0°C
          </div>
        </div>

        {/* Ribbon Canvas SVG */}
        <div className="relative w-full aspect-[16/7] bg-[#09111c] rounded-2xl p-4 flex items-center justify-center">
          <svg viewBox="0 0 700 240" className="w-full h-full">
            {/* Safe Range Shaded Corridor */}
            <rect x="50" y="60" width="600" height="110" fill="rgba(112, 185, 198, 0.06)" />

            <line x1="50" y1="60" x2="650" y2="60" stroke="#E96B73" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="660" y="64" fill="#E96B73" fontSize="10" fontFamily="monospace">24.0°C MAX</text>

            <line x1="50" y1="115" x2="650" y2="115" stroke="#70B9C6" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            <text x="660" y="119" fill="#70B9C6" fontSize="10" fontFamily="monospace">22.0°C NOMINAL</text>

            <line x1="50" y1="170" x2="650" y2="170" stroke="#E96B73" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="660" y="174" fill="#E96B73" fontSize="10" fontFamily="monospace">20.0°C MIN</text>

            {/* Continuous Thermal Waveform with Excursion Breach */}
            <path
              d="M 50 115 Q 180 110 260 120 T 400 35 T 520 115 T 650 118"
              fill="none"
              stroke="#70B9C6"
              strokeWidth="2.5"
            />

            {/* Physical Telemetry Points */}
            <g onClick={() => setSelectedEq(EQUIPMENT_STREAM[1])} className="cursor-pointer">
              <circle cx="160" cy="112" r="6" fill="#70B9C6" />
              <text x="160" y="135" textAnchor="middle" fill="#9A8BC7" fontSize="9" fontFamily="monospace">INC-02 (22.1°C)</text>
            </g>

            {/* Critical Excursion Node */}
            <g onClick={() => setSelectedEq(EQUIPMENT_STREAM[0])} className="cursor-pointer">
              <circle cx="400" cy="35" r="12" fill="none" stroke="#E96B73" strokeWidth="2" className="animate-pulse" />
              <circle cx="400" cy="35" r="6" fill="#E96B73" />
              <text x="400" y="18" textAnchor="middle" fill="#E96B73" fontSize="10" fontWeight="bold" fontFamily="monospace">
                INC-01 EXCURSION (26.8°C!)
              </text>
            </g>

            <g onClick={() => setSelectedEq(EQUIPMENT_STREAM[2])} className="cursor-pointer">
              <circle cx="530" cy="116" r="6" fill="#70B9C6" />
              <text x="530" y="140" textAnchor="middle" fill="#9A8BC7" fontSize="9" fontFamily="monospace">INC-03 (22.4°C)</text>
            </g>
          </svg>
        </div>

        {/* Environmental Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-[#9A8BC7]">
          <div className="p-4 rounded-2xl bg-[#09111c]/60 border border-white/5">
            <div className="text-[10px] uppercase">Selected Chamber</div>
            <div className="text-base font-light text-[#F4EFE7] font-serif mt-1">{selectedEq.name}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#09111c]/60 border border-white/5">
            <div className="text-[10px] uppercase">Temperature Reading</div>
            <div className={`text-2xl font-light font-serif mt-1 ${selectedEq.status === 'EXCURSION' ? 'text-[#E96B73]' : 'text-[#70B9C6]'}`}>
              {selectedEq.temp}°C
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#09111c]/60 border border-white/5">
            <div className="text-[10px] uppercase">Agitation Motor</div>
            <div className="text-base font-light text-[#F4EFE7] font-serif mt-1">{selectedEq.rpm > 0 ? '60 RPM (ACTIVE)' : 'STOPPED (FAULT)'}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#09111c]/60 border border-white/5">
            <div className="text-[10px] uppercase">Telemetry State</div>
            <div className="text-base font-light text-[#70B9C6] font-serif mt-1">{selectedEq.status}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
