import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { RiskItem } from '../types'

interface RiskPageProps {
  risks: RiskItem[]
}

export function RiskPage({ risks }: RiskPageProps) {
  const [activeBand, setActiveBand] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH')

  // Group risks by level
  const grouped = useMemo(() => {
    const high = risks.filter((r) => r.risk_level === 'HIGH')
    const medium = risks.filter((r) => r.risk_level === 'MEDIUM')
    const low = risks.filter((r) => r.risk_level === 'LOW')
    return { high, medium, low }
  }, [risks])

  const displayList = useMemo(() => {
    if (activeBand === 'HIGH') return grouped.high
    if (activeBand === 'MEDIUM') return grouped.medium
    if (activeBand === 'LOW') return grouped.low
    return risks
  }, [risks, activeBand, grouped])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 py-4 max-w-5xl mx-auto"
    >
      {/* 1. EDITORIAL HEADER */}
      <section className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-sans">
          Risk
        </h1>
        <p className="text-base text-slate-600">
          Identify inventory batches and cold-chain units requiring clinical attention.
        </p>
      </section>

      {/* 2. RISK BAND TABS */}
      <section className="flex items-center gap-3 border-b border-[#e8e6df] pb-4">
        <button
          onClick={() => setActiveBand('HIGH')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeBand === 'HIGH'
              ? 'bg-rose-900 text-white'
              : 'bg-white border border-[#e8e6df] text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>HIGH RISK ({grouped.high.length})</span>
        </button>

        <button
          onClick={() => setActiveBand('MEDIUM')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeBand === 'MEDIUM'
              ? 'bg-amber-800 text-white'
              : 'bg-white border border-[#e8e6df] text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>MEDIUM RISK ({grouped.medium.length})</span>
        </button>

        <button
          onClick={() => setActiveBand('LOW')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeBand === 'LOW'
              ? 'bg-emerald-800 text-white'
              : 'bg-white border border-[#e8e6df] text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>LOW / STABLE ({grouped.low.length})</span>
        </button>

        <button
          onClick={() => setActiveBand('ALL')}
          className={`ml-auto text-xs font-mono text-slate-500 hover:text-slate-900 cursor-pointer ${
            activeBand === 'ALL' ? 'font-bold underline text-slate-900' : ''
          }`}
        >
          Show All ({risks.length})
        </button>
      </section>

      {/* 3. CLEAN EDITORIAL RISK CARDS */}
      <section className="space-y-3">
        {displayList.slice(0, 20).map((r) => {
          const isHigh = r.risk_level === 'HIGH'
          const isMedium = r.risk_level === 'MEDIUM'

          // Clean human-readable reason
          let reasonText = 'Approaching biological shelf-life boundary'
          if (Array.isArray(r.contributing_features)) {
            reasonText = r.contributing_features.join(' · ')
          } else if (typeof r.contributing_features === 'string') {
            const raw = r.contributing_features
            if (raw.startsWith('{') || raw.startsWith('[')) {
              try {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) {
                  reasonText = parsed.join(' · ')
                } else if (typeof parsed === 'object') {
                  reasonText = Object.keys(parsed).join(' · ')
                }
              } catch {
                reasonText = raw
              }
            } else {
              reasonText = raw
            }
          }

          return (
            <div
              key={r.id}
              className={`p-5 rounded-xl border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-2xs ${
                isHigh
                  ? 'border-rose-200 hover:border-rose-300'
                  : isMedium
                  ? 'border-amber-200 hover:border-amber-300'
                  : 'border-[#e8e6df]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isHigh
                        ? 'bg-rose-100 text-rose-900'
                        : isMedium
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {r.risk_level} RISK
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Batch #{r.inventory_id}
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-800">
                  {reasonText}
                </div>

                <div className="text-xs text-slate-500">
                  Monitored via: {r.model_version || 'Expiry Degradation GBDT'}
                </div>
              </div>

              <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <div className="text-xs text-slate-400 font-mono">Risk Probability</div>
                <div
                  className={`text-2xl font-bold font-mono ${
                    isHigh ? 'text-rose-800' : isMedium ? 'text-amber-800' : 'text-emerald-800'
                  }`}
                >
                  {(r.risk_score * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )
        })}

        {displayList.length === 0 && (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
            No risk items found under the {activeBand} category.
          </div>
        )}
      </section>
    </motion.div>
  )
}
