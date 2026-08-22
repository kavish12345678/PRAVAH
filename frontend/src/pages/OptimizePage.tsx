import { motion } from 'framer-motion'
import { NetworkTransformationView } from '../components/optimize/NetworkTransformationView'

export function OptimizePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto w-full pt-16 pb-12 space-y-6"
    >
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold">
          TOPOLOGY TRANSFORMATION
        </div>
        <h1 className="text-3xl font-black text-white font-sans tracking-tight">
          FIND A BETTER FLOW.
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Global Linear Programming solver restructuring regional flow channels to eliminate waste and shortage.
        </p>
      </div>

      <NetworkTransformationView />
    </motion.div>
  )
}
