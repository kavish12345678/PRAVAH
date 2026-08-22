import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Screen1GenesisProps {
  onNext: () => void
}

export function Screen1Genesis({ onNext }: Screen1GenesisProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 600)
    const t2 = setTimeout(() => setStage(2), 1500)
    const t3 = setTimeout(() => setStage(3), 2400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] text-center px-4 max-w-4xl mx-auto select-none">
      {/* Living Canvas Emergence */}
      <div className="relative w-full max-w-2xl h-80 flex items-center justify-center mb-8">
        <svg viewBox="0 0 600 300" className="w-full h-full">
          {/* First Node */}
          {stage >= 1 && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <circle cx="200" cy="150" r="18" fill="none" stroke="#dc2626" strokeWidth="1.5" className="animate-heartbeat" />
              <circle cx="200" cy="150" r="6" fill="#dc2626" />
              <text x="200" y="185" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                DELHI
              </text>
            </motion.g>
          )}

          {/* Connecting Vascular Line */}
          {stage >= 2 && (
            <motion.path
              d="M 200 150 Q 300 120 400 150"
              fill="none"
              stroke="#dc2626"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Second Node */}
          {stage >= 2 && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <circle cx="400" cy="150" r="18" fill="none" stroke="#dc2626" strokeWidth="1.5" className="animate-heartbeat" />
              <circle cx="400" cy="150" r="6" fill="#dc2626" />
              <text x="400" y="185" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                MUMBAI
              </text>
            </motion.g>
          )}

          {/* Additional Nodes Emerge */}
          {stage >= 3 && (
            <>
              <motion.path
                d="M 400 150 Q 350 220 300 240"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
              <motion.path
                d="M 300 240 Q 380 230 450 240"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <circle cx="300" cy="240" r="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <circle cx="300" cy="240" r="4" fill="#f8fafc" />
                <text x="300" y="268" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
                  BENGALURU
                </text>
              </motion.g>
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <circle cx="450" cy="240" r="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <circle cx="450" cy="240" r="4" fill="#f8fafc" />
                <text x="450" y="268" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
                  CHENNAI
                </text>
              </motion.g>
            </>
          )}
        </svg>
      </div>

      {/* Typography & Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="space-y-4"
      >
        <div className="text-4xl sm:text-5xl font-black tracking-tight text-white font-sans">
          PRAVAH
        </div>
        <p className="text-base sm:text-lg text-slate-400 font-serif italic">
          &ldquo;Every unit has a destination.&rdquo;
        </p>

        <div className="pt-4">
          <button
            onClick={onNext}
            className="px-6 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-mono tracking-wider uppercase transition cursor-pointer"
          >
            Enter the flow →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
