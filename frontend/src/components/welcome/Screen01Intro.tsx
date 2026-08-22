import { motion } from 'framer-motion'

interface Screen01IntroProps {
  onNext: () => void
}

export function Screen01Intro({ onNext }: Screen01IntroProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4 py-16 max-w-2xl mx-auto space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div className="space-y-3">
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-slate-400">
            Healthcare Logistics Intelligence
          </span>
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-slate-900 font-sans">
            PRAVAH
          </h1>
          <p className="text-xl sm:text-2xl text-rose-900/80 font-medium tracking-tight font-serif italic">
            &ldquo;Blood supply, in motion.&rdquo;
          </p>
        </div>

        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-md mx-auto">
          An intelligent system for predicting, monitoring and moving blood where it is needed.
        </p>

        <div className="pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="px-8 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium tracking-wide transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
          >
            <span>Begin</span>
            <span>→</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
