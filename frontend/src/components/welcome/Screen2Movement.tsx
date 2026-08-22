import { motion } from 'framer-motion'

interface Screen2MovementProps {
  onNext: () => void
}

export function Screen2Movement({ onNext }: Screen2MovementProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] text-center px-4 max-w-4xl mx-auto select-none">
      {/* Living Particle Movement Canvas */}
      <div className="relative w-full max-w-2xl h-80 flex items-center justify-center mb-6">
        <svg viewBox="0 0 600 300" className="w-full h-full">
          {/* Vascular Channel */}
          <path
            d="M 150 150 Q 300 90 450 150"
            fill="none"
            stroke="rgba(220, 38, 38, 0.4)"
            strokeWidth="3"
          />

          {/* Animated Particles Along the Channel */}
          <path
            d="M 150 150 Q 300 90 450 150"
            fill="none"
            stroke="#dc2626"
            strokeWidth="3"
            strokeDasharray="6 14"
            className="animate-vascular-flow"
          />

          {/* Surplus Origin Node */}
          <g>
            <circle cx="150" cy="150" r="24" fill="#0a0e17" stroke="#dc2626" strokeWidth="1.5" />
            <circle cx="150" cy="150" r="6" fill="#dc2626" />
            <text x="150" y="195" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="monospace">
              DELHI (SURPLUS)
            </text>
            <text x="150" y="210" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              +48 O+ Units Available
            </text>
          </g>

          {/* Shortage Destination Node */}
          <g>
            <circle cx="450" cy="150" r="24" fill="#0a0e17" stroke="#dc2626" strokeWidth="1.5" />
            <circle cx="450" cy="150" r="6" fill="#f8fafc" />
            <text x="450" y="195" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="monospace">
              MUMBAI (DEFICIT)
            </text>
            <text x="450" y="210" textAnchor="middle" fill="#f43f5e" fontSize="9" fontFamily="monospace">
              -16 Units ICU Shortage
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
          Somewhere, blood is waiting.
        </div>
        <div className="text-lg sm:text-xl text-rose-400 font-light italic">
          Somewhere else, it is urgently needed.
        </div>
        <p className="text-xs text-slate-400 font-mono pt-1">
          A vascular route forms automatically to balance regional pressure.
        </p>

        <div className="pt-4">
          <button
            onClick={onNext}
            className="px-6 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-mono tracking-wider uppercase transition cursor-pointer"
          >
            Follow the unit →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
