import { motion } from 'framer-motion'
import { RiskPressureField } from '../components/risk/RiskPressureField'
import type { RiskItem } from '../types'

interface RiskFieldPageProps {
  risks: RiskItem[]
}

export function RiskFieldPage({ risks }: RiskFieldPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto w-full pt-16 pb-12 space-y-6"
    >
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-rose-400 font-bold">
          DISTURBANCE FIELD
        </div>
        <h1 className="text-3xl font-black text-white font-sans tracking-tight">
          WHERE IS THE PRESSURE?
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Spatial risk halos and multi-factor decomposition isolating perishable degradation.
        </p>
      </div>

      <RiskPressureField risks={risks} />
    </motion.div>
  )
}
