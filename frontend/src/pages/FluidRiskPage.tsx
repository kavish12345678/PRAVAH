import { useState } from 'react'
import { motion } from 'framer-motion'
import type { RiskItem } from '../types'

interface FluidRiskPageProps {
  risks: RiskItem[]
}

const DISTURBANCE_ZONES = [
  {
    id: 'ZONE-01',
    bank: 'Bengaluru Victoria Hub',
    level: 'HIGH',
    score: 0.887,
    component: 'Platelets (O+)',
    reasons: ['Near expiry (remaining 19h)', 'Low local utilization velocity', 'Chamber thermal stress (26.8°C)'],
    color: '#E96B73',
  },
  {
    id: 'ZONE-02',
    bank: 'Mumbai Tata Memorial',
    level: 'MEDIUM',
    score: 0.654,
    component: 'Packed RBC (A+)',
    reasons: ['Weekend surgical postponement', 'Moderate inventory buildup'],
    color: '#E96B73',
  },
  {
    id: 'ZONE-03',
    bank: 'Delhi AIIMS Center',
    level: 'LOW',
    score: 0.283,
    component: 'Whole Blood (O-)',
    reasons: ['High clinical turnover', 'Normal compliant cold-chain'],
    color: '#7EAA92',
  },
]

export function FluidRiskPage({ risks: _risks }: FluidRiskPageProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ZONE-01')

  const activeZone = DISTURBANCE_ZONES.find((z) => z.id === selectedZoneId) || DISTURBANCE_ZONES[0]

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
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E96B73]">
          DISTURBANCE FIELD
        </div>
        <h1 className="text-4xl sm:text-5xl font-light text-[#F4EFE7] font-serif">
          Where pressure is building.
        </h1>
        <p className="text-xs font-mono text-[#9A8BC7]/80">
          Biological degradation disturbances detected across regional cold-chain units.
        </p>
      </div>

      {/* Disturbance Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DISTURBANCE_ZONES.map((zone) => {
          const isSelected = selectedZoneId === zone.id
          const isHigh = zone.level === 'HIGH'

          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZoneId(zone.id)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 ${
                isSelected
                  ? 'border-[#E96B73] bg-[#E96B73]/15 shadow-2xl'
                  : 'border-white/5 bg-[#181631]/40 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A8BC7]">
                  {zone.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isHigh ? 'bg-[#E96B73]/20 text-[#E96B73]' : 'bg-[#7EAA92]/20 text-[#7EAA92]'
                  }`}
                >
                  {zone.level} DISTURBANCE
                </span>
              </div>

              <div>
                <div className="text-xl font-light text-[#F4EFE7] font-serif">{zone.bank}</div>
                <div className="text-3xl font-light font-serif text-[#E96B73] mt-2">
                  {(zone.score * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-[#9A8BC7] font-mono">{zone.component}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Factor Decomposition Visual */}
      <div className="p-8 rounded-3xl border border-white/10 bg-[#181631]/50 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="text-xl font-light text-[#F4EFE7] font-serif">
            {activeZone.bank} Degradation Causes
          </div>
          <div className="text-xs font-mono text-[#E96B73] font-bold">
            Risk Score: {(activeZone.score * 100).toFixed(1)}%
          </div>
        </div>

        <div className="space-y-3 font-mono text-xs text-[#F4EFE7]/90">
          {activeZone.reasons.map((r) => (
            <div key={r} className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#111124]/60 border border-white/5">
              <span className="h-2 w-2 rounded-full bg-[#E96B73] animate-pulse" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
