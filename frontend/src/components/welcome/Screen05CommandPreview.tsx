import { motion } from 'framer-motion'

interface Screen05CommandPreviewProps {
  onEnter: () => void
}

export function Screen05CommandPreview({ onEnter }: Screen05CommandPreviewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4 py-16 max-w-2xl mx-auto space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="space-y-3">
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-slate-400">
            Operations Ready
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 font-sans">
            Welcome to PRAVAH.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
            One connected view of blood inventory, demand, risk and movement.
          </p>
        </div>

        <div className="pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            className="px-8 py-3.5 rounded-lg bg-rose-900 hover:bg-rose-950 text-white text-base font-semibold tracking-wide shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Enter PRAVAH</span>
            <span>→</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
