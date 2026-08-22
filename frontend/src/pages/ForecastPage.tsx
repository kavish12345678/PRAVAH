import { motion } from 'framer-motion'
import { DemandForecastPanel } from '../components/DemandForecastPanel'
import { GlassPanel } from '../components/GlassPanel'
import type { ForecastItem } from '../types'

interface ForecastPageProps {
  forecasts: ForecastItem[]
}

export function ForecastPage({ forecasts }: ForecastPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <GlassPanel className="p-6" glow="blue">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-blue-400">
              Predictive Requirement Horizon
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Multi-Horizon Demand Forecasting
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Projected 24-hour and 72-hour clinical demand by facility hierarchy and component group.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-blue-300">
            Model: <span className="font-bold">HistGradientBoostingRegressor (R²=0.9561)</span>
          </div>
        </div>
      </GlassPanel>

      <DemandForecastPanel forecasts={forecasts} />
    </motion.div>
  )
}
