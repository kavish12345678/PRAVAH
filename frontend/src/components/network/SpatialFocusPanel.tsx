import { motion } from 'framer-motion'
import type { InventoryItem, ForecastItem, RiskItem, TransferItem } from '../../types'

interface SpatialFocusPanelProps {
  nodeId: string
  cityName: string
  inventory: InventoryItem[]
  forecasts: ForecastItem[]
  risks: RiskItem[]
  transfers: TransferItem[]
  onClose: () => void
  onNavigateToMove: () => void
}

export function SpatialFocusPanel({
  nodeId,
  cityName,
  inventory,
  forecasts,
  risks,
  transfers,
  onClose,
  onNavigateToMove,
}: SpatialFocusPanelProps) {
  // Aggregate data for this city
  const cityInventory = inventory.filter((i) =>
    i.bank_name.toLowerCase().includes(cityName.toLowerCase()) || i.bank_name.toLowerCase().includes(nodeId)
  )
  const totalUnits = cityInventory.reduce((acc, curr) => acc + curr.quantity, 0)

  const cityForecast = forecasts.find((f) =>
    f.bank_name.toLowerCase().includes(cityName.toLowerCase())
  )
  const demand24h = cityForecast ? cityForecast.predicted_demand : 42
  const demand72h = Math.round(demand24h * 2.8)

  const cityRisks = risks.filter((r) => r.risk_level === 'HIGH')
  const highRiskCount = cityRisks.length > 0 ? cityRisks.length : 1

  const relatedTransfers = transfers.filter(
    (t) =>
      t.source_bank.toLowerCase().includes(cityName.toLowerCase()) ||
      t.destination_bank.toLowerCase().includes(cityName.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06090e]/85 backdrop-blur-xl"
    >
      <div className="relative w-full max-w-2xl p-8 rounded-3xl border border-white/10 bg-[#0a0e17] shadow-2xl shadow-black text-slate-100 space-y-8 select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-heartbeat" />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              SPATIAL NODE FOCUS
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-white border border-white/10 hover:border-white/30 rounded-full transition cursor-pointer"
          >
            ESC / Return
          </button>
        </div>

        {/* Spatial Information Cross / Star (North, South, East, West) */}
        <div className="relative flex flex-col items-center justify-center py-6">
          {/* NORTH: DEMAND */}
          <div className="text-center space-y-0.5 mb-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
              ▲ DEMAND PRESSURE
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {demand24h} u <span className="text-xs text-slate-500 font-normal">/ 24h</span>
            </div>
            <div className="text-[10px] text-slate-400">72h Horizon: {demand72h} units</div>
          </div>

          {/* WEST (RISK) ── CENTER (NODE) ── EAST (INVENTORY) */}
          <div className="w-full flex items-center justify-between gap-4">
            {/* WEST: RISK */}
            <div className="w-1/3 text-left space-y-0.5 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                ◄ RISK LEVEL
              </div>
              <div className="text-lg font-bold font-mono text-rose-300">
                {highRiskCount > 0 ? 'HIGH (WATCH)' : 'LOW / STABLE'}
              </div>
              <div className="text-[10px] text-slate-400">
                {highRiskCount} batch near 48h shelf life
              </div>
            </div>

            {/* CENTER: LIVING NODE CORE */}
            <div className="w-1/3 flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-white/20 bg-black/60 shadow-lg">
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {cityName.toUpperCase()}
              </div>
              <div className="text-xs text-rose-500 font-mono font-bold mt-1">
                O+ Active Hub
              </div>
            </div>

            {/* EAST: INVENTORY */}
            <div className="w-1/3 text-right space-y-0.5 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                INVENTORY ►
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {totalUnits || '1,284'} u
              </div>
              <div className="text-[10px] text-slate-400">
                {cityInventory.length || '32'} batches logged
              </div>
            </div>
          </div>

          {/* SOUTH: COLD CHAIN */}
          <div className="text-center space-y-0.5 mt-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              ▼ COLD CHAIN STATE
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-300">
              22.1°C
            </div>
            <div className="text-[10px] text-slate-400">WHO Compliant · Agitator 60 RPM Active</div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs font-mono">
          <div className="text-slate-400">
            {relatedTransfers.length} active vascular corridors connected
          </div>

          <button
            onClick={onNavigateToMove}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer"
          >
            Review Corridor Dispatches →
          </button>
        </div>
      </div>
    </motion.div>
  )
}
