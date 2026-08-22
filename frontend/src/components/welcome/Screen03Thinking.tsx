import { motion } from 'framer-motion'

interface Screen03ThinkingProps {
  onNext: () => void
}

const JOURNEY_STEPS = [
  {
    phase: 'Inventory',
    desc: 'Know what exists.',
  },
  {
    phase: 'Prediction',
    desc: 'Know what is coming.',
  },
  {
    phase: 'Risk',
    desc: 'Know what needs attention.',
  },
  {
    phase: 'Decision',
    desc: 'Know what to do.',
  },
  {
    phase: 'Transfer',
    desc: 'Move it where needed.',
  },
]

export function Screen03Thinking({ onNext }: Screen03ThinkingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4 py-12 max-w-4xl mx-auto space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 font-sans">
          PRAVAH follows the entire journey.
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto">
          A unified operational flow connecting data to clinical action.
        </p>
      </motion.div>

      {/* Connected Horizontal Flow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-full grid grid-cols-1 sm:grid-cols-5 gap-3 text-left"
      >
        {JOURNEY_STEPS.map((step, idx) => (
          <div
            key={step.phase}
            className="p-5 rounded-xl border border-[#e6e4dc] bg-white space-y-1.5 shadow-xs relative"
          >
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              0{idx + 1}
            </div>
            <div className="text-base font-bold text-slate-900">{step.phase}</div>
            <div className="text-xs text-slate-600 leading-relaxed">{step.desc}</div>

            {idx < 4 && (
              <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-mono">
                →
              </div>
            )}
          </div>
        ))}
      </motion.div>

      <div className="pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium tracking-wide transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
        >
          <span>Next</span>
          <span>→</span>
        </motion.button>
      </div>
    </div>
  )
}
