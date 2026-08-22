import { motion } from 'framer-motion'
import type { DashboardSummary } from '../types'
import { AnimatedCounter } from './AnimatedCounter'
import { GlassPanel } from './GlassPanel'

interface KpiStripProps {
  summary: DashboardSummary | null
}

const KPI_CONFIG = [
  {
    key: 'blood_banks' as const,
    label: 'Blood Banks',
    subtext: '36 States & UTs',
    accent: 'text-white',
    glow: 'none' as const,
  },
  {
    key: 'total_inventory' as const,
    label: 'Total Inventory',
    subtext: 'Active Batches',
    accent: 'text-slate-100',
    glow: 'none' as const,
  },
  {
    key: 'low_stock' as const,
    label: 'Low Stock',
    subtext: '< 10u Threshold',
    accent: 'text-amber-300',
    glow: 'amber' as const,
  },
  {
    key: 'near_expiry' as const,
    label: 'Near Expiry',
    subtext: '≤ 48h Window',
    accent: 'text-rose-400',
    glow: 'red' as const,
  },
  {
    key: 'high_risk' as const,
    label: 'High Risk',
    subtext: 'Degradation > 65%',
    accent: 'text-rose-400 font-bold',
    glow: 'red' as const,
    highlight: true,
  },
  {
    key: 'active_transfers' as const,
    label: 'Active Transfers',
    subtext: 'LP Optimized',
    accent: 'text-cyan-300',
    glow: 'cyan' as const,
  },
  {
    key: 'equipment_warnings' as const,
    label: 'Equipment Flags',
    subtext: 'Thermal / Agitation',
    accent: 'text-amber-400',
    glow: 'amber' as const,
  },
]

export function KpiStrip({ summary }: KpiStripProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
      {KPI_CONFIG.map((kpi, index) => {
        const val = summary ? summary[kpi.key] ?? 0 : null

        return (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.04, duration: 0.4 }}
          >
            <GlassPanel
              className={`p-3 relative overflow-hidden transition-all hover:border-white/20 ${
                kpi.highlight ? 'border-rose-500/40 bg-rose-500/5' : ''
              }`}
              glow={kpi.glow}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  {kpi.label}
                </span>
                {kpi.highlight && (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>

              <div className={`mt-1 text-2xl font-bold font-mono tabular-nums ${kpi.accent}`}>
                {val !== null ? (
                  <AnimatedCounter value={val} />
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </div>

              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {kpi.subtext}
              </div>
            </GlassPanel>
          </motion.div>
        )
      })}
    </div>
  )
}
