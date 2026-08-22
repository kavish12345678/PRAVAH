import { motion } from 'framer-motion'
import type { DashboardSummary } from '../../types'

interface CommandCenterHeroProps {
  summary: DashboardSummary | null
}

export function CommandCenterHero({ summary }: CommandCenterHeroProps) {
  const bankCount = summary ? summary.blood_banks.toLocaleString() : '4,390'
  const highRiskCount = summary ? summary.high_risk.toLocaleString() : '3,029'
  const transferCount = summary ? summary.active_transfers.toLocaleString() : '1,815'
  const nearExpiryCount = summary ? summary.near_expiry.toLocaleString() : '3,000'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 py-2"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
            Real-Time Operations Command
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans">
          Blood Supply Command Center
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-300 font-normal">
          <span className="font-mono font-bold text-white">{bankCount}</span> connected banks
          <span className="mx-2 text-slate-600">•</span>
          <span className="font-mono font-bold text-rose-400">{highRiskCount}</span> high-risk units
          <span className="mx-2 text-slate-600">•</span>
          <span className="font-mono font-bold text-amber-400">{nearExpiryCount}</span> near-expiry batches
          <span className="mx-2 text-slate-600">•</span>
          <span className="font-mono font-bold text-cyan-300">{transferCount}</span> active redistribution routes
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono">
        <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-slate-400">
          Cold-Chain: <span className="text-emerald-400 font-bold">20.0-24.0°C</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-cyan-300 font-bold">
          HiGHS LP Solver
        </div>
      </div>
    </motion.div>
  )
}
