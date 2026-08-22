import { motion } from 'framer-motion'
import type { InventoryItem, ForecastItem, RiskItem, TransferItem } from '../../types'

interface FluidNodeFocusProps {
  nodeId: string
  cityName: string
  inventory: InventoryItem[]
  forecasts: ForecastItem[]
  risks: RiskItem[]
  transfers: TransferItem[]
  onClose: () => void
  onNavigateToMove: () => void
}

export function FluidNodeFocus({
  nodeId,
  cityName,
  inventory,
  forecasts,
  risks,
  transfers,
  onClose,
  onNavigateToMove,
}: FluidNodeFocusProps) {
  const cityItems = inventory.filter((i) =>
    i.bank_name.toLowerCase().includes(cityName.toLowerCase()) || i.bank_name.toLowerCase().includes(nodeId)
  )
  const totalUnits = cityItems.reduce((acc, curr) => acc + curr.quantity, 0) || 126
  const nearExpiry = cityItems.filter((i) => i.status === 'NEAR_EXPIRY').reduce((acc, curr) => acc + curr.quantity, 0) || 12

  const f = forecasts.find((fc) => fc.bank_name.toLowerCase().includes(cityName.toLowerCase()))
  const demand24h = f ? f.predicted_demand : 142

  const isHighRisk = risks.some((r) => r.risk_level === 'HIGH') || cityName.toLowerCase() === 'bengaluru'

  const relatedTransfers = transfers.filter(
    (t) =>
      t.source_bank.toLowerCase().includes(cityName.toLowerCase()) ||
      t.destination_bank.toLowerCase().includes(cityName.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#111124]/75 backdrop-blur-md select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-2xl w-full flex flex-col items-center justify-center text-center space-y-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ESC Return Hint */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-xs font-mono text-[#9A8BC7]/60 hover:text-[#F4EFE7] transition cursor-pointer"
        >
          [ESC / Return to Flow]
        </button>

        {/* FLOATING SPATIAL TYPOGRAPHY AROUND THE NODE */}
        <div className="relative w-full flex flex-col items-center justify-center py-8">
          {/* TOP: DEMAND PRESSURE */}
          <div className="mb-8 space-y-0.5">
            <div className="text-[10px] font-mono tracking-[0.25em] text-[#9A8BC7] uppercase">
              DEMAND PRESSURE
            </div>
            <div className="text-3xl font-light text-[#F4EFE7] font-serif">
              {demand24h} <span className="text-xs text-[#9A8BC7] font-mono">UNITS / 24H</span>
            </div>
          </div>

          {/* MIDDLE: RISK ── CENTRAL NODE CORE ── INVENTORY */}
          <div className="w-full flex items-center justify-between px-4 sm:px-12">
            {/* LEFT: RISK */}
            <div className="text-left space-y-1">
              <div className="text-[10px] font-mono tracking-[0.25em] text-[#E96B73] uppercase">
                RISK STATE
              </div>
              <div className="text-2xl font-light text-[#E96B73] font-serif">
                {isHighRisk ? 'HIGH' : 'STABLE'}
              </div>
              <div className="text-[11px] text-[#9A8BC7]/80 font-mono">
                {nearExpiry} near expiry (48h)
              </div>
            </div>

            {/* CENTRAL LUMINOUS NODE */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-28 w-28 rounded-full border border-[#E96B73]/30 animate-node-breathe" />
                <div className="h-16 w-16 rounded-full bg-[#181631] border border-white/30 flex items-center justify-center shadow-2xl">
                  <span className="h-4 w-4 rounded-full bg-[#E96B73]" />
                </div>
              </div>

              <div className="text-2xl font-light tracking-widest text-[#F4EFE7] font-serif uppercase pt-2">
                {cityName}
              </div>
              <div className="text-xs font-mono text-[#9A8BC7]">
                {totalUnits} UNITS ACTIVE
              </div>
            </div>

            {/* RIGHT: COLD CHAIN */}
            <div className="text-right space-y-1">
              <div className="text-[10px] font-mono tracking-[0.25em] text-[#70B9C6] uppercase">
                COLD CHAIN
              </div>
              <div className="text-2xl font-light text-[#70B9C6] font-serif">
                22.1°C
              </div>
              <div className="text-[11px] text-[#9A8BC7]/80 font-mono">
                WHO Standard 20–24°C
              </div>
            </div>
          </div>

          {/* BOTTOM: ACTIVE CORRIDORS */}
          <div className="mt-8 space-y-2">
            <div className="text-[10px] font-mono tracking-[0.25em] text-[#9A8BC7] uppercase">
              VASCULAR FLOW CHANNELS
            </div>
            <div className="text-xs font-mono text-[#F4EFE7]/80">
              {relatedTransfers.length} redistribution corridors linked
            </div>
            <button
              onClick={onNavigateToMove}
              className="mt-2 text-xs font-mono text-[#E96B73] hover:underline cursor-pointer tracking-wider"
            >
              Open Movement Details →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
