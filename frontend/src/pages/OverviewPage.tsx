import { motion } from 'framer-motion'
import { CleanFlowMap } from '../components/command/CleanFlowMap'
import type { PravahData } from '../hooks/usePravahData'
import type { NavPage } from '../components/common/Navigation'

interface OverviewPageProps {
  data: PravahData
  onNavigate: (page: NavPage) => void
}

export function OverviewPage({ data, onNavigate }: OverviewPageProps) {
  const summary = data.summary
  const bankCount = summary ? summary.blood_banks.toLocaleString() : '5'
  const totalUnits = summary ? summary.total_inventory.toLocaleString() : '3,216'
  const lowStock = summary ? summary.low_stock.toLocaleString() : '44'
  const nearExpiry = summary ? summary.near_expiry.toLocaleString() : '56'
  const transferCount = data.transfers.length || (summary ? summary.active_transfers : 8)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="space-y-12 py-4 max-w-5xl mx-auto"
    >
      {/* 1. EDITORIAL HERO */}
      <section className="space-y-3 pt-2">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08] font-sans">
          Blood supply,<br />
          <span className="text-slate-500 font-normal">in motion.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-normal pt-1">
          <span className="font-semibold text-slate-900">{bankCount}</span> blood banks connected across the network.
        </p>
      </section>

      {/* 2. CURRENT NETWORK STATUS (4 Large Horizontal Numbers) */}
      <section className="py-6 border-y border-[#e8e6df]">
        <div className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold mb-4">
          CURRENT NETWORK
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-slate-900 font-sans tracking-tight">
              {bankCount}
            </div>
            <div className="text-xs text-slate-500 font-medium">Blood Banks</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-slate-900 font-sans tracking-tight">
              {totalUnits}
            </div>
            <div className="text-xs text-slate-500 font-medium">Units Available</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-amber-700 font-sans tracking-tight">
              {lowStock}
            </div>
            <div className="text-xs text-slate-500 font-medium">Low Stock Batches</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-rose-800 font-sans tracking-tight">
              {nearExpiry}
            </div>
            <div className="text-xs text-slate-500 font-medium">Near Expiry (&le; 48h)</div>
          </div>
        </div>
      </section>

      {/* 3. MAIN VISUAL: FLOW MAP */}
      <section className="space-y-4">
        <CleanFlowMap transfers={data.transfers} inventory={data.inventory} />
      </section>

      {/* 4. NEXT ACTION: ONE ACTION BANNER */}
      <section className="p-6 rounded-2xl border border-rose-200 bg-rose-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-rose-900">
            Pending Dispatch Decision
          </div>
          <div className="text-base sm:text-lg font-bold text-rose-950 mt-0.5">
            {transferCount} transfer recommendations require attention.
          </div>
          <div className="text-xs text-rose-800/80 mt-0.5">
            Inter-city routes calculated to prevent spoilage and balance ICU stockouts.
          </div>
        </div>

        <button
          onClick={() => onNavigate('transfers')}
          className="px-5 py-2.5 rounded-lg bg-rose-900 hover:bg-rose-950 text-white text-xs font-semibold tracking-wide transition cursor-pointer shrink-0"
        >
          Review transfers →
        </button>
      </section>
    </motion.div>
  )
}
