import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import type { RiskItem } from '../types'
import { GlassPanel } from './GlassPanel'

interface RiskIntelligenceProps {
  risks: RiskItem[]
}

const LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const

const levelStyles = {
  HIGH: { ring: 'border-red-400/50', text: 'text-red-300', glow: 'red' as const, pulse: '#f87171' },
  MEDIUM: { ring: 'border-amber-400/50', text: 'text-amber-300', glow: 'amber' as const, pulse: '#fbbf24' },
  LOW: { ring: 'border-emerald-400/30', text: 'text-emerald-300', glow: 'cyan' as const, pulse: '#34d399' },
}

function parseFeatures(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [raw]
  } catch {
    return raw ? [raw] : []
  }
}

export function RiskIntelligence({ risks }: RiskIntelligenceProps) {
  const [selected, setSelected] = useState<RiskItem | null>(null)

  const grouped = useMemo(() => {
    return LEVELS.reduce(
      (acc, level) => {
        acc[level] = risks.filter((r) => r.risk_level === level)
        return acc
      },
      {} as Record<(typeof LEVELS)[number], RiskItem[]>,
    )
  }, [risks])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {LEVELS.map((level) => {
          const style = levelStyles[level]
          const items = grouped[level]
          const avgScore =
            items.length > 0
              ? items.reduce((sum, r) => sum + r.risk_score, 0) / items.length
              : 0

          return (
            <GlassPanel key={level} className="p-5" glow={style.glow}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${style.text}`}>
                  {level}
                </span>
                <span className="text-2xl font-semibold tabular-nums text-white">{items.length}</span>
              </div>

              <div className="relative mx-auto my-6 flex h-28 w-28 items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: level === 'HIGH' ? 1.5 : 3 }}
                  className={`absolute inset-0 rounded-full border-2 ${style.ring}`}
                />
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Avg Score</div>
                  <div className={`text-xl font-semibold ${style.text}`}>{avgScore.toFixed(2)}</div>
                </div>
              </div>

              <div className="max-h-40 space-y-2 overflow-y-auto">
                {items.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-left transition hover:border-white/15 hover:bg-white/[0.04]"
                  >
                    <span className="text-xs text-slate-400">INV #{item.inventory_id}</span>
                    <span className={`text-sm font-medium ${style.text}`}>
                      {item.risk_score.toFixed(2)}
                    </span>
                  </button>
                ))}
                {items.length === 0 && (
                  <p className="text-center text-xs text-slate-600">No {level} risk records</p>
                )}
              </div>
            </GlassPanel>
          )
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <GlassPanel className="p-5" glow="blue">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-blue-300">
                    Risk Detail
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">Inventory #{selected.inventory_id}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Detail label="Risk Score" value={selected.risk_score.toFixed(2)} />
                <Detail label="Risk Level" value={selected.risk_level} />
                <Detail label="Model Version" value={selected.model_version} />
                <Detail label="Record ID" value={String(selected.id)} />
              </div>
              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  Contributing Features
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {parseFeatures(selected.contributing_features).map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300"
                    >
                      {feature}
                    </span>
                  ))}
                  {parseFeatures(selected.contributing_features).length === 0 && (
                    <span className="text-xs text-slate-600">No contributing features flagged</span>
                  )}
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-white">{value}</div>
    </div>
  )
}
