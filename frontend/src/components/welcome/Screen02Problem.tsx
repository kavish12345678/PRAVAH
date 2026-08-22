import { motion } from 'framer-motion'

interface Screen02ProblemProps {
  onNext: () => void
}

export function Screen02Problem({ onNext }: Screen02ProblemProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4 py-12 max-w-3xl mx-auto space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 font-sans">
          The problem is not scarcity alone.
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
          Blood can be available in one location while another location is approaching shortage.
        </p>
      </motion.div>

      {/* Clean Visual Flow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-xl p-8 rounded-2xl border border-[#e6e4dc] bg-white shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">
              ORIGIN
            </div>
            <div className="text-xl font-bold text-slate-800">SURPLUS</div>
            <div className="text-xs text-slate-500">Unused available units</div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="px-3.5 py-1.5 rounded-full border border-rose-200 bg-rose-50 text-xs font-mono font-bold text-rose-900">
              PRAVAH
            </div>
            <div className="text-slate-400 text-xs font-mono">────►</div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <div className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">
              DESTINATION
            </div>
            <div className="text-xl font-bold text-rose-800">SHORTAGE</div>
            <div className="text-xs text-slate-500">Critical hospital deficit</div>
          </div>
        </div>
      </motion.div>

      <div className="pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium tracking-wide transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
        >
          <span>See how PRAVAH works</span>
          <span>→</span>
        </motion.button>
      </div>
    </div>
  )
}
