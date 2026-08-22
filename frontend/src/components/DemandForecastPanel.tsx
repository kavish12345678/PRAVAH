import { useMemo } from 'react'
import { motion } from 'framer-motion'

import type { ForecastItem } from '../types'
import { GlassPanel } from './GlassPanel'

interface DemandForecastProps {
  forecasts: ForecastItem[]
}

export function DemandForecastPanel({ forecasts }: DemandForecastProps) {
  const chartData = useMemo(() => {
    const grouped = new Map<string, ForecastItem>()
    forecasts.forEach((item) => {
      const key = `${item.bank_name}|${item.component}|${item.forecast_date}`
      const existing = grouped.get(key)
      if (!existing || item.predicted_demand > existing.predicted_demand) {
        grouped.set(key, item)
      }
    })
    return [...grouped.values()]
      .sort((a, b) => b.predicted_demand - a.predicted_demand)
      .slice(0, 12)
  }, [forecasts])

  const maxDemand = Math.max(...chartData.map((d) => d.predicted_demand), 1)

  return (
    <GlassPanel className="p-5" glow="blue">
      <div className="mb-6">
        <h2 className="text-sm font-medium uppercase tracking-[0.25em] text-blue-300">
          Demand Forecast
        </h2>
        <p className="mt-1 text-xs text-slate-500">Predicted demand by bank and component</p>
      </div>

      <div className="space-y-4">
        {chartData.map((item, index) => {
          const width = (item.predicted_demand / maxDemand) * 100
          const bankShort = item.bank_name.replace('[DEMO] ', '').split(' ')[0]

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  {bankShort} · {item.component} · {item.blood_group}
                </span>
                <span className="tabular-nums text-cyan-300">{item.predicted_demand.toFixed(1)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.8, delay: index * 0.04 }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500/80 to-cyan-400/80"
                />
              </div>
              <div className="mt-1 text-[10px] text-slate-600">
                {item.forecast_date} · {item.model_version}
              </div>
            </motion.div>
          )
        })}
        {chartData.length === 0 && (
          <p className="text-center text-sm text-slate-600">No forecast data available</p>
        )}
      </div>
    </GlassPanel>
  )
}
