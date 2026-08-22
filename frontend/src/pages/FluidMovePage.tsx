import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TransferItem, TransferStatusUpdate } from '../types'

interface FluidMovePageProps {
  transfers: TransferItem[]
  onUpdateStatus: (id: number, status: TransferStatusUpdate) => Promise<void>
}

export function FluidMovePage({ transfers, onUpdateStatus }: FluidMovePageProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [selectedTransferId, setSelectedTransferId] = useState<number>(transfers[0]?.id || 1)

  const handleAction = async (id: number, status: TransferStatusUpdate) => {
    setUpdatingId(id)
    try {
      await onUpdateStatus(id, status)
    } finally {
      setUpdatingId(null)
    }
  }

  const selected = transfers.find((t) => t.id === selectedTransferId) || transfers[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto w-full pt-20 pb-16 px-4 space-y-10 select-none"
    >
      {/* Editorial Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E96B73]">
          VASCULAR TRANSFERS
        </div>
        <h1 className="text-4xl sm:text-5xl font-light text-[#F4EFE7] font-serif">
          Move what matters.
        </h1>
        <p className="text-xs font-mono text-[#9A8BC7]/80">
          Redistribution routes flowing blood from regional surplus to ICU shortage.
        </p>
      </div>

      {/* Transfer Corridors List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {transfers.slice(0, 6).map((t) => {
          const isSelected = selected?.id === t.id
          const isApproved = t.status === 'APPROVED'

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTransferId(t.id)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 ${
                isSelected
                  ? 'border-[#E96B73] bg-[#E96B73]/15 shadow-2xl'
                  : 'border-white/5 bg-[#181631]/40 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#9A8BC7] uppercase tracking-widest font-bold">ROUTE #{t.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    isApproved ? 'bg-[#7EAA92]/20 text-[#7EAA92]' : 'bg-[#E96B73]/20 text-[#E96B73]'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              {/* Source -> Flow -> Destination */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-[#F4EFE7] flex items-center justify-between">
                  <span className="font-serif text-sm">{t.source_bank.replace('[DEMO] ', '')}</span>
                  <span className="text-[#E96B73]">➔</span>
                  <span className="font-serif text-sm">{t.destination_bank.replace('[DEMO] ', '')}</span>
                </div>

                <div className="flex items-center justify-center gap-1 py-1.5 bg-[#111124]/50 rounded-xl">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-[#E96B73] animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>

                <div className="text-xs font-mono text-[#9A8BC7] flex justify-between">
                  <span>{t.component} ({t.blood_group})</span>
                  <span className="text-[#E96B73] font-bold">{t.quantity} Units</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Route Action Panel */}
      {selected && (
        <div className="p-8 rounded-3xl border border-white/10 bg-[#181631]/50 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E96B73]">
                DISPATCH CHANNEL
              </span>
              <h3 className="text-2xl font-light text-[#F4EFE7] font-serif mt-0.5">
                {selected.source_bank.replace('[DEMO] ', '')} ➔ {selected.destination_bank.replace('[DEMO] ', '')}
              </h3>
            </div>

            {selected.status === 'PENDING' && (
              <div className="flex items-center gap-3">
                <button
                  disabled={updatingId === selected.id}
                  onClick={() => handleAction(selected.id, 'APPROVED')}
                  className="px-6 py-2.5 rounded-full bg-[#7EAA92] hover:bg-[#68947d] text-[#111124] text-xs font-mono font-bold uppercase transition cursor-pointer disabled:opacity-50"
                >
                  {updatingId === selected.id ? 'Starting Flow...' : 'Approve Transfer'}
                </button>
                <button
                  disabled={updatingId === selected.id}
                  onClick={() => handleAction(selected.id, 'REJECTED')}
                  className="px-4 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-[#9A8BC7] text-xs font-mono uppercase transition cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono text-[#9A8BC7]">
            <div>
              <div>Component</div>
              <div className="text-base text-[#F4EFE7] font-serif mt-1">{selected.component}</div>
            </div>
            <div>
              <div>Blood Group</div>
              <div className="text-base text-[#E96B73] font-serif mt-1">{selected.blood_group}</div>
            </div>
            <div>
              <div>Quantity</div>
              <div className="text-base text-[#F4EFE7] font-serif mt-1">{selected.quantity} Units</div>
            </div>
            <div>
              <div>Vehicle Channel</div>
              <div className="text-base text-[#70B9C6] font-serif mt-1">Refrigerated Van (22°C)</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
