import { motion } from 'framer-motion'

interface Screen4InvisibleForcesProps {
  onNext: () => void
}

export function Screen4InvisibleForces({ onNext }: Screen4InvisibleForcesProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] text-center px-4 max-w-4xl mx-auto select-none">
      {/* 3 Invisible Physical Forces Visualization */}
      <div className="relative w-full max-w-2xl h-80 flex items-center justify-center mb-6">
        <svg viewBox="0 0 600 280" className="w-full h-full">
          {/* Node 1: Demand Pull */}
          <g>
            <circle cx="120" cy="140" r="32" fill="none" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="120" cy="140" r="18" fill="#0a0e17" stroke="#3b82f6" strokeWidth="1.5" />
            {/* Particles converging inward */}
            <circle cx="90" cy="140" r="3" fill="#3b82f6" />
            <circle cx="150" cy="140" r="3" fill="#3b82f6" />
            <circle cx="120" cy="110" r="3" fill="#3b82f6" />
            <circle cx="120" cy="170" r="3" fill="#3b82f6" />
            <text x="120" y="200" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold" fontFamily="monospace">
              DEMAND PRESSURE
            </text>
            <text x="120" y="215" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
              Pulls supply inward
            </text>
          </g>

          {/* Node 2: Expiry Disturbance Halo */}
          <g>
            <circle cx="300" cy="140" r="34" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 6" className="animate-pulse" />
            <circle cx="300" cy="140" r="20" fill="#0a0e17" stroke="#dc2626" strokeWidth="2" />
            <circle cx="300" cy="140" r="6" fill="#dc2626" />
            <text x="300" y="200" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold" fontFamily="monospace">
              EXPIRY DISTURBANCE
            </text>
            <text x="300" y="215" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
              Degradation alert
            </text>
          </g>

          {/* Node 3: Cold-Chain Thermal Distortion */}
          <g>
            <path
              d="M 440 140 Q 460 120 480 140 T 520 140"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              className="animate-thermal-wave"
            />
            <circle cx="480" cy="140" r="20" fill="#0a0e17" stroke="#06b6d4" strokeWidth="1.5" />
            <circle cx="480" cy="140" r="5" fill="#06b6d4" />
            <text x="480" y="200" textAnchor="middle" fill="#67e8f9" fontSize="10" fontWeight="bold" fontFamily="monospace">
              THERMAL TELEMETRY
            </text>
            <text x="480" y="215" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
              Continuous 20-24°C bounds
            </text>
          </g>
        </svg>
      </div>

      {/* Narrative */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4 max-w-lg"
      >
        <div className="text-xl sm:text-2xl font-normal text-white font-sans">
          The intelligence layers are physical forces.
        </div>
        <p className="text-xs text-slate-400 font-mono leading-relaxed">
          Demand exerts pressure. Expiry causes disturbance. Cold-chain fluctuations create thermal distortions.
        </p>

        <div className="pt-3">
          <button
            onClick={onNext}
            className="px-6 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-mono tracking-wider uppercase transition cursor-pointer"
          >
            Enter the living twin →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
