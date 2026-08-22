import { motion } from 'framer-motion'

import type { IntelligenceStatus } from '../types'
import { GlassPanel } from './GlassPanel'

interface IntelligencePanelProps {
  intelligence: IntelligenceStatus | null
  scanning: boolean
  scanStep: number
  scanSteps: readonly string[]
  lastRunMessage: string | null
  onRun: () => void
}

export function IntelligencePanel({
  intelligence,
  scanning,
  scanStep,
  scanSteps,
  lastRunMessage,
  onRun,
}: IntelligencePanelProps) {
  return (
    <GlassPanel className="relative overflow-hidden p-5" glow="blue">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.25em] text-blue-300">
            AI Intelligence
          </h2>
          <p className="mt-1 text-xs text-slate-500">Rule-based demo engine · ML-ready contract</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={scanning}
          onClick={onRun}
          className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run Intelligence
        </motion.button>
      </div>

      {intelligence && (
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">System Status</div>
            <div className="mt-1 flex items-center gap-2 text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {intelligence.ready ? 'Ready' : 'Standby'}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Model Mode</div>
            <div className="mt-1 text-blue-200">{intelligence.mode}</div>
          </div>
          <div className="col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Version</div>
            <div className="mt-1 font-mono text-xs text-slate-300">{intelligence.version}</div>
          </div>
        </div>
      )}

      {scanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#050816]/90 backdrop-blur-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-6 h-16 w-16 rounded-full border border-cyan-400/40"
          />
          <div className="space-y-2 text-center">
            {scanSteps.map((step, index) => (
              <motion.div
                key={step}
                animate={{
                  opacity: index <= scanStep ? 1 : 0.25,
                  y: index === scanStep ? 0 : 4,
                }}
                className={`text-xs uppercase tracking-[0.2em] ${
                  index === scanStep ? 'text-cyan-300' : 'text-slate-500'
                }`}
              >
                {step}
                {index < scanSteps.length - 1 && index === scanStep && (
                  <div className="mt-1 text-cyan-500/60">↓</div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {lastRunMessage && !scanning && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-xs text-cyan-300/90"
        >
          {lastRunMessage}
        </motion.p>
      )}
    </GlassPanel>
  )
}
