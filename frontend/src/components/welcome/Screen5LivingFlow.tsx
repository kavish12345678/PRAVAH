import { motion } from 'framer-motion'

interface Screen5LivingFlowProps {
  onEnter: () => void
}

export function Screen5LivingFlow({ onEnter }: Screen5LivingFlowProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] text-center px-4 max-w-4xl mx-auto select-none">
      {/* Full Integrated Living Network Mini Canvas */}
      <div className="relative w-full max-w-2xl h-80 flex items-center justify-center mb-6">
        <svg viewBox="0 0 600 300" className="w-full h-full">
          {/* Active Network Vascular Paths */}
          <path d="M 280 70 Q 180 140 180 210" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="6 10" className="animate-vascular-flow" />
          <path d="M 280 70 Q 380 140 380 200" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <path d="M 180 210 Q 300 240 340 260" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="6 10" className="animate-vascular-flow" />
          <path d="M 380 200 Q 360 230 340 260" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <path d="M 340 260 Q 420 250 440 260" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="6 10" className="animate-vascular-flow" />

          {/* Delhi */}
          <circle cx="280" cy="70" r="16" fill="#0a0e17" stroke="#dc2626" strokeWidth="1.5" className="animate-heartbeat" />
          <circle cx="280" cy="70" r="5" fill="#dc2626" />
          <text x="280" y="50" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold" fontFamily="monospace">DELHI</text>

          {/* Mumbai */}
          <circle cx="180" cy="210" r="16" fill="#0a0e17" stroke="#dc2626" strokeWidth="1.5" />
          <circle cx="180" cy="210" r="5" fill="#dc2626" />
          <text x="145" y="215" textAnchor="end" fill="#f8fafc" fontSize="9" fontWeight="bold" fontFamily="monospace">MUMBAI</text>

          {/* Hyderabad */}
          <circle cx="380" cy="200" r="14" fill="#0a0e17" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <circle cx="380" cy="200" r="4" fill="#f8fafc" />
          <text x="420" y="205" textAnchor="start" fill="#94a3b8" fontSize="9" fontFamily="monospace">HYDERABAD</text>

          {/* Bengaluru */}
          <circle cx="340" cy="260" r="16" fill="#0a0e17" stroke="#dc2626" strokeWidth="1.5" />
          <circle cx="340" cy="260" r="5" fill="#dc2626" />
          <text x="340" y="290" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold" fontFamily="monospace">BENGALURU</text>

          {/* Chennai */}
          <circle cx="440" cy="260" r="14" fill="#0a0e17" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <circle cx="440" cy="260" r="4" fill="#f8fafc" />
          <text x="440" y="290" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">CHENNAI</text>
        </svg>
      </div>

      {/* Narrative & Entry Trigger */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4 max-w-lg"
      >
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
          PRAVAH sees the flow.
        </h2>

        <div className="flex items-center justify-center gap-4 text-xs font-mono tracking-widest text-slate-400">
          <span className="text-blue-400">PREDICT</span>
          <span className="text-slate-600">·</span>
          <span className="text-rose-400">PROTECT</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400">MOVE</span>
        </div>

        <div className="pt-4">
          <button
            onClick={onEnter}
            className="px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold tracking-widest uppercase transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            Enter Network →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
