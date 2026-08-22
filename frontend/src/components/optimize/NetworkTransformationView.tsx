import { useState } from 'react'
import { motion } from 'framer-motion'

export function NetworkTransformationView() {
  const [isOptimized, setIsOptimized] = useState(false)
  const [isSolving, setIsSolving] = useState(false)

  const handleRunOptimizer = () => {
    setIsSolving(true)
    setTimeout(() => {
      setIsSolving(false)
      setIsOptimized(true)
    }, 900)
  }

  return (
    <div className="space-y-8 select-none">
      {/* 1. INTERACTIVE BEFORE VS AFTER CANAVS */}
      <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0e17] space-y-6 shadow-2xl network-canvas-grid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              GLOBAL LINEAR PROGRAMMING SIMPLEX
            </span>
            <h2 className="text-2xl font-bold text-white font-sans mt-0.5">
              Network Flow Transformation
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOptimized(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition cursor-pointer ${
                !isOptimized ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              BEFORE OPTIMIZATION
            </button>

            <button
              disabled={isSolving}
              onClick={handleRunOptimizer}
              className={`px-6 py-2 rounded-full text-xs font-mono font-bold uppercase transition cursor-pointer flex items-center gap-2 ${
                isOptimized
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-950 animate-pulse'
              }`}
            >
              <span>⚡</span>
              <span>{isSolving ? 'Solving HiGHS LP Simplex...' : isOptimized ? 'OPTIMIZED STATE (ACTIVE)' : 'RUN OPTIMIZER'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Topology Transformation Visual */}
        <div className="relative w-full aspect-[16/8] bg-[#06090e] rounded-2xl border border-white/5 p-4 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 700 320" className="w-full h-full">
            {/* Unoptimized Routes (Chaotic, long crossings) */}
            {!isOptimized && (
              <>
                <line x1="200" y1="80" x2="520" y2="240" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="200" y1="80" x2="350" y2="220" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                <text x="360" y="160" fill="#f87171" fontSize="10" fontFamily="monospace">UNBALANCED CORRIDOR (340km)</text>
              </>
            )}

            {/* Optimized Routes (Direct, balanced, min-cost) */}
            {isOptimized && (
              <>
                <motion.line
                  x1="200"
                  y1="80"
                  x2="350"
                  y2="100"
                  stroke="#10b981"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.line
                  x1="350"
                  y1="100"
                  x2="520"
                  y2="240"
                  stroke="#10b981"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
                <text x="350" y="65" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  OPTIMAL SHORTEST PATH (120km · 0 DEFICIT)
                </text>
              </>
            )}

            {/* Delhi Node */}
            <circle cx="200" cy="80" r="18" fill="#0a0e17" stroke={isOptimized ? '#10b981' : '#dc2626'} strokeWidth="2" />
            <text x="200" y="115" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace">DELHI (+45u)</text>

            {/* Jaipur Hub */}
            <circle cx="350" cy="100" r="16" fill="#0a0e17" stroke={isOptimized ? '#10b981' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" />
            <text x="350" y="130" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace">JAIPUR</text>

            {/* Mumbai Node */}
            <circle cx="520" cy="240" r="20" fill="#0a0e17" stroke={isOptimized ? '#10b981' : '#dc2626'} strokeWidth="2" />
            <text x="520" y="275" textAnchor="middle" fill={isOptimized ? '#34d399' : '#f87171'} fontSize="10" fontFamily="monospace">
              {isOptimized ? 'MUMBAI (RESOLVED ✓)' : 'MUMBAI (-20u SHORTAGE)'}
            </text>
          </svg>
        </div>

        {/* Tangible Network Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono">
          <div className="p-4 rounded-xl border border-white/5 bg-black/40">
            <div className="text-[10px] text-slate-500 uppercase">Hospital Deficit Resolution</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">100% Resolved</div>
            <div className="text-[10px] text-slate-400 mt-0.5">All trauma centers buffered</div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-black/40">
            <div className="text-[10px] text-slate-500 uppercase">Expiry Waste Prevented</div>
            <div className="text-xl font-bold text-white mt-1">42 Units Saved</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Reallocated before 48h boundary</div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-black/40">
            <div className="text-[10px] text-slate-500 uppercase">Cold-Chain Transit Time</div>
            <div className="text-xl font-bold text-cyan-300 mt-1">-58% Transit Delay</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Direct min-cost routing</div>
          </div>
        </div>
      </div>
    </div>
  )
}
