import { motion } from 'framer-motion'

import type { DashboardSummary } from '../types'
import { AnimatedCounter } from './AnimatedCounter'
import { GlassPanel } from './GlassPanel'

interface KpiStripProps {
  summary: DashboardSummary | null
}

const KPI_CONFIG = [
  { key: 'blood_banks' as const, label: 'Blood Banks', accent: 'text-cyan-300' },
  { key: 'total_inventory' as const, label: 'Total Inventory', accent: 'text-white' },
  { key: 'low_stock' as const, label: 'Low Stock', accent: 'text-amber-300' },
  { key: 'near_expiry' as const, label: 'Near Expiry', accent: 'text-amber-300' },
  { key: 'high_risk' as const, label: 'High Risk', accent: 'text-red-300' },
  { key: 'active_transfers' as const, label: 'Active Transfers', accent: 'text-cyan-300' },
]

export function KpiStrip({ summary }: KpiStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {KPI_CONFIG.map((kpi, index) => (
        <motion.div
          key={kpi.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.06, duration: 0.5 }}
        >
          <GlassPanel className="p-4" glow={kpi.key === 'high_risk' ? 'red' : 'cyan'}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{kpi.label}</div>
            <div className={`mt-2 text-2xl font-semibold tabular-nums ${kpi.accent}`}>
              {summary ? (
                <AnimatedCounter value={summary[kpi.key]} />
              ) : (
                <span className="text-slate-600">—</span>
              )}
            </div>
          </GlassPanel>
        </motion.div>
      ))}
    </div>
  )
}
