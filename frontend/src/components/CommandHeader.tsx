import { motion } from 'framer-motion'

import type { IntelligenceStatus } from '../types'
import { GlassPanel } from './GlassPanel'

interface CommandHeaderProps {
  intelligence: IntelligenceStatus | null
}

export function CommandHeader({ intelligence }: CommandHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.35em] text-cyan-400/80">
          Operations Command
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
          PRAVAH
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-slate-400">
          AI Blood Supply Intelligence
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <GlassPanel className="px-4 py-3" glow="cyan">
          <div className="flex items-center gap-2 text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="font-medium text-emerald-300">System Operational</span>
          </div>
        </GlassPanel>

        {intelligence && (
          <GlassPanel className="px-4 py-3" glow="blue">
            <div className="text-xs uppercase tracking-wider text-slate-500">Intelligence Engine</div>
            <div className="mt-1 text-sm text-blue-200">{intelligence.engine}</div>
            <div className="text-xs text-slate-400">
              {intelligence.mode} · {intelligence.version}
            </div>
          </GlassPanel>
        )}
      </div>
    </motion.header>
  )
}
