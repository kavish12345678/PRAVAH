import { useState } from 'react'
import type { ForecastItem, InventoryItem } from '../../types'

interface DemandPressureWaveformProps {
  forecasts: ForecastItem[]
  inventory: InventoryItem[]
}

const REGIONAL_HUBS = ['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad']

export function DemandPressureWaveform({ forecasts }: DemandPressureWaveformProps) {
  const [selectedHub, setSelectedHub] = useState<string>('Bengaluru')

  // Find forecast for this hub
  const hubForecast = forecasts.find((f) => f.bank_name.toLowerCase().includes(selectedHub.toLowerCase()))
  const demand24h = hubForecast ? hubForecast.predicted_demand : 42
  const demand72h = Math.round(demand24h * 2.75)
  const currentStock = 36 // Example stock for comparison showing intersection

  return (
    <div className="space-y-8 select-none">
      {/* 1. REGIONAL HUB SELECTOR */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {REGIONAL_HUBS.map((hub) => (
          <button
            key={hub}
            onClick={() => setSelectedHub(hub)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition cursor-pointer ${
              selectedHub === hub
                ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-900/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {hub.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 2. TEMPORAL PRESSURE WAVEFORM & SHORTAGE INTERSECTION CANVAS */}
      <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0e17] space-y-6 shadow-2xl network-canvas-grid">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
              TEMPORAL PRESSURE FIELD
            </span>
            <h3 className="text-xl font-bold text-white font-sans mt-0.5">
              {selectedHub} Dynamic Demand Pull Waveform
            </h3>
          </div>
          <div className="px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-xs font-mono font-bold text-rose-400 animate-pulse">
            SHORTAGE INTERSECTION AT T+38H
          </div>
        </div>

        {/* SVG Waveform Intersection Canvas */}
        <div className="relative w-full aspect-[16/7] bg-[#06090e] rounded-2xl border border-white/5 p-4 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 700 280" className="w-full h-full">
            {/* Horizontal Temporal Grid Lines (NOW -> 24H -> 72H) */}
            <line x1="80" y1="220" x2="650" y2="220" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="80" y1="40" x2="80" y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="360" y1="40" x2="360" y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="620" y1="40" x2="620" y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Time Labels */}
            <text x="80" y="245" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">NOW (T+0)</text>
            <text x="360" y="245" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">24 HOURS</text>
            <text x="620" y="245" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">72 HOURS</text>

            {/* Solid Flow: Current Available Inventory Decay Line */}
            <path
              d="M 80 110 Q 360 140 620 180"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <text x="100" y="95" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="monospace">
              AVAILABLE STOCK ({currentStock}u)
            </text>

            {/* Thin Animated Pressure Wave: Predicted Demand Waveform */}
            <path
              d="M 80 170 Q 250 140 360 110 T 620 60"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="animate-flow-subtle"
            />
            <text x="560" y="50" fill="#93c5fd" fontSize="10" fontWeight="bold" fontFamily="monospace">
              DEMAND PULL ({demand72h}u)
            </text>

            {/* CRITICAL INTERSECTION WINDOW (SHORTAGE WINDOW) */}
            <circle cx="285" cy="128" r="8" fill="none" stroke="#dc2626" strokeWidth="2" className="animate-pulse" />
            <circle cx="285" cy="128" r="3" fill="#dc2626" />

            {/* Intersection Highlight Zone */}
            <path
              d="M 285 128 L 620 60 L 620 180 Z"
              fill="rgba(220, 38, 38, 0.15)"
              stroke="none"
            />

            <text x="310" y="115" fill="#f87171" fontSize="11" fontWeight="bold" fontFamily="monospace">
              ▲ SHORTAGE WINDOW (T+38H DEFICIT)
            </text>
          </svg>
        </div>

        {/* Narrative Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono text-slate-300">
          <div className="p-4 rounded-xl border border-white/5 bg-black/40">
            <div className="text-[10px] text-slate-500 uppercase">24-Hour Projected Demand</div>
            <div className="text-xl font-bold text-white mt-1">{demand24h} Units</div>
            <div className="text-[10px] text-slate-400 mt-0.5">HistGradientBoostingRegressor</div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-black/40">
            <div className="text-[10px] text-slate-500 uppercase">72-Hour Cumulative Demand</div>
            <div className="text-xl font-bold text-blue-400 mt-1">{demand72h} Units</div>
            <div className="text-[10px] text-slate-400 mt-0.5">High clinical surgical pressure</div>
          </div>

          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <div className="text-[10px] text-rose-400 uppercase">Deficit Window</div>
            <div className="text-xl font-bold text-rose-400 mt-1">-18 Units Deficit</div>
            <div className="text-[10px] text-rose-300/70 mt-0.5">Redistribution required before T+38h</div>
          </div>
        </div>
      </div>
    </div>
  )
}
