import { motion } from 'framer-motion'

interface Screen3UnitJourneyProps {
  onNext: () => void
}

export function Screen3UnitJourney({ onNext }: Screen3UnitJourneyProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] text-center px-4 max-w-4xl mx-auto select-none">
      {/* Isolated Unit Deep View */}
      <div className="relative w-full max-w-xl h-72 flex items-center justify-center mb-6">
        <svg viewBox="0 0 500 260" className="w-full h-full">
          {/* Circular Expiry Countdown Ring */}
          <circle cx="250" cy="120" r="64" fill="#0a0e17" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="4" />
          <circle
            cx="250"
            cy="120"
            r="64"
            fill="none"
            stroke="#dc2626"
            strokeWidth="4"
            strokeDasharray="402"
            strokeDashoffset="120"
            strokeLinecap="round"
            transform="rotate(-90 250 120)"
          />

          {/* Central Unit Particle */}
          <circle cx="250" cy="120" r="14" fill="#dc2626" />
          <text x="250" y="124" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
            O+
          </text>

          {/* Temperature Waveform Underneath */}
          <path
            d="M 170 210 Q 210 195 250 210 T 330 210"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            className="animate-thermal-wave"
          />
          <text x="250" y="235" textAnchor="middle" fill="#06b6d4" fontSize="10" fontFamily="monospace">
            22.1°C · STABLE INCUBATOR
          </text>

          {/* Expiry Label */}
          <text x="250" y="42" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="monospace">
            EXPIRY CLOCK: 42 HOURS REMAINING
          </text>
        </svg>
      </div>

      {/* Lifecycle Flow Ribbon */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4 max-w-xl"
      >
        <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-slate-400 border-y border-white/10 py-2.5">
          <span className="text-slate-200">COLLECTED</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-200">STORED</span>
          <span className="text-slate-600">→</span>
          <span className="text-cyan-400">MONITORED</span>
          <span className="text-slate-600">→</span>
          <span className="text-rose-400">AT RISK</span>
          <span className="text-slate-600">→</span>
          <span className="text-emerald-400">TRANSFERRED</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Every individual platelet unit carries a live biological countdown, continuous telemetry, and local clinical velocity.
        </p>

        <div className="pt-2">
          <button
            onClick={onNext}
            className="px-6 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-mono tracking-wider uppercase transition cursor-pointer"
          >
            See network forces →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
