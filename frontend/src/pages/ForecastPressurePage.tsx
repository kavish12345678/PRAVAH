import { motion } from 'framer-motion'
import { DemandPressureWaveform } from '../components/forecast/DemandPressureWaveform'
import type { ForecastItem, InventoryItem } from '../types'

interface ForecastPressurePageProps {
  forecasts: ForecastItem[]
  inventory: InventoryItem[]
}

export function ForecastPressurePage({ forecasts, inventory }: ForecastPressurePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto w-full pt-16 pb-12 space-y-6"
    >
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-blue-400 font-bold">
          CLINICAL DEMAND PRESSURE
        </div>
        <h1 className="text-3xl font-black text-white font-sans tracking-tight">
          WHAT IS PULLING THE NETWORK?
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Temporal pressure waveform comparing available stock decay against projected surgical pull.
        </p>
      </div>

      <DemandPressureWaveform forecasts={forecasts} inventory={inventory} />
    </motion.div>
  )
}
