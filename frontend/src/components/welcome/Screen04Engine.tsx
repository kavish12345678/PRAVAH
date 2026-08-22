import { motion } from 'framer-motion'

interface Screen04EngineProps {
  onNext: () => void
}

const UNIT_LIFECYCLE = [
  { step: '01', title: 'Collected', note: 'Donation registered' },
  { step: '02', title: 'Stored', note: '22°C agitation' },
  { step: '03', title: 'Monitored', note: 'Continuous cold-chain' },
  { step: '04', title: 'Predicted', note: 'Demand & expiry horizon' },
  { step: '05', title: 'Moved', note: 'Optimized transfer' },
]

export function Screen04Engine({ onNext }: Screen04EngineProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4 py-12 max-w-4xl mx-auto space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 font-sans">
          From information to action.
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto">
          Tracking the complete lifecycle of each blood unit across the network.
        </p>
      </motion.div>

      {/* Thin Line Connected Blood-Unit Journey */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-full max-w-3xl p-8 rounded-2xl border border-[#e6e4dc] bg-white shadow-xs"
      >
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2">
          {/* Subtle connecting horizontal line */}
          <div className="hidden sm:block absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#e8e6df] -z-0" />

          {UNIT_LIFECYCLE.map((item, idx) => (
            <div key={item.step} className="relative z-10 flex flex-col items-center text-center space-y-2 bg-white px-2">
              <div className="h-8 w-8 rounded-full border border-slate-300 bg-white flex items-center justify-center text-xs font-mono font-bold text-slate-700">
                {idx + 1}
              </div>
              <div className="text-sm font-bold text-slate-900">{item.title}</div>
              <div className="text-[11px] text-slate-500 font-normal">{item.note}</div>
            </div>
          ))}
        </div>
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
