import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ForecastItem } from '../types'

interface FluidForecastPageProps {
  forecasts: ForecastItem[]
}

const HUBS = ['Bengaluru', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad']

export function FluidForecastPage({ forecasts }: FluidForecastPageProps) {
  const [selectedHub, setSelectedHub] = useState<string>('Bengaluru')

  const hubForecast = forecasts.find((f) => f.bank_name.toLowerCase().includes(selectedHub.toLowerCase()))
  const demand24h = hubForecast ? hubForecast.predicted_demand : 142
  const demand72h = Math.round(demand24h * 2.8)

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
          TEMPORAL PROJECTION
        </div>
        <h1 className="text-4xl sm:text-5xl font-light text-[#F4EFE7] font-serif">
          What&rsquo;s coming?
        </h1>
        <p className="text-xs font-mono text-[#9A8BC7]/80">
          Horizontal demand waveform projecting clinical requirements over 24h & 72h horizons.
        </p>
      </div>

      {/* Regional Hub Selector */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {HUBS.map((hub) => (
          <button
            key={hub}
            onClick={() => setSelectedHub(hub)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition cursor-pointer ${
              selectedHub === hub
                ? 'bg-[#E96B73] text-[#111124] font-bold shadow-lg shadow-black'
                : 'text-[#9A8BC7] hover:text-[#F4EFE7]'
            }`}
          >
            {hub.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Continuous Horizontal Waveform Canvas */}
      <div className="p-8 rounded-3xl border border-white/10 bg-[#181631]/40 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="text-lg font-light text-[#F4EFE7] font-serif">
            {selectedHub} Dynamic Pressure Wave
          </div>
          <div className="px-3 py-1 rounded-full border border-[#E96B73]/40 bg-[#E96B73]/10 text-xs font-mono text-[#E96B73] animate-pulse">
            SHORTAGE WINDOW AT T+38H
          </div>
        </div>

        {/* Waveform SVG */}
        <div className="relative w-full aspect-[16/7] bg-[#111124]/60 rounded-2xl p-4 flex items-center justify-center">
          <svg viewBox="0 0 700 280" className="w-full h-full">
            {/* Horizontal Timeline Grid Lines */}
            <line x1="80" y1="220" x2="650" y2="220" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="80" y1="40" x2="80" y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="360" y1="40" x2="360" y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="620" y1="40" x2="620" y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />

            <text x="80" y="245" textAnchor="middle" fill="#9A8BC7" fontSize="11" fontFamily="monospace">NOW</text>
            <text x="360" y="245" textAnchor="middle" fill="#9A8BC7" fontSize="11" fontFamily="monospace">24 HOURS</text>
            <text x="620" y="245" textAnchor="middle" fill="#9A8BC7" fontSize="11" fontFamily="monospace">72 HOURS</text>

            {/* Current Stock Decay Line */}
            <path d="M 80 110 Q 360 140 620 180" fill="none" stroke="#F4EFE7" strokeWidth="2.5" />
            <text x="100" y="95" fill="#F4EFE7" fontSize="10" fontFamily="monospace">CURRENT INVENTORY (126u)</text>

            {/* Predicted Demand Waveform */}
            <path d="M 80 170 Q 250 140 360 110 T 620 60" fill="none" stroke="#E96B73" strokeWidth="2.5" strokeDasharray="4 4" className="animate-vascular-flow" />
            <text x="540" y="50" fill="#E96B73" fontSize="10" fontFamily="monospace">DEMAND WAVE ({demand72h}u)</text>

            {/* Shortage Window Intersection */}
            <circle cx="285" cy="128" r="7" fill="#E96B73" />
            <path d="M 285 128 L 620 60 L 620 180 Z" fill="rgba(233, 107, 115, 0.12)" />
            <text x="310" y="115" fill="#E96B73" fontSize="11" fontWeight="bold" fontFamily="monospace">
              SHORTAGE WINDOW (T+38H)
            </text>
          </svg>
        </div>

        {/* Narrative Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono text-[#9A8BC7]">
          <div className="p-4 rounded-2xl bg-[#111124]/50 border border-white/5">
            <div className="text-[10px] uppercase">24-Hour Projected Demand</div>
            <div className="text-2xl font-light text-[#F4EFE7] font-serif mt-1">{demand24h} Units</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#111124]/50 border border-white/5">
            <div className="text-[10px] uppercase">72-Hour Horizon Pull</div>
            <div className="text-2xl font-light text-[#E96B73] font-serif mt-1">{demand72h} Units</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#E96B73]/10 border border-[#E96B73]/20">
            <div className="text-[10px] text-[#E96B73] uppercase">Deficit Window</div>
            <div className="text-2xl font-light text-[#E96B73] font-serif mt-1">-18 Units Required</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
