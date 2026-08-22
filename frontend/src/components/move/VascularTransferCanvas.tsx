import { useState } from 'react'
import type { TransferItem, TransferStatusUpdate } from '../../types'

interface VascularTransferCanvasProps {
  transfers: TransferItem[]
  onUpdateStatus: (id: number, status: TransferStatusUpdate) => Promise<void>
}

export function VascularTransferCanvas({
  transfers,
  onUpdateStatus,
}: VascularTransferCanvasProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [selectedTransferId, setSelectedTransferId] = useState<number>(
    transfers[0]?.id || 1
  )

  const handleAction = async (id: number, status: TransferStatusUpdate) => {
    setUpdatingId(id)
    try {
      await onUpdateStatus(id, status)
    } finally {
      setUpdatingId(null)
    }
  }

  const selectedTransfer =
    transfers.find((t) => t.id === selectedTransferId) || transfers[0]

  return (
    <div className="space-y-8 select-none">
      {/* 1. VASCULAR ROUTE CAROUSEL / SELECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {transfers.slice(0, 6).map((t) => {
          const isSelected = selectedTransfer?.id === t.id
          const isApproved = t.status === 'APPROVED'
          const particleCount = Math.min(8, Math.max(3, Math.round(t.quantity / 5)))

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTransferId(t.id)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 ${
                isSelected
                  ? 'border-rose-500 bg-rose-950/20 shadow-xl shadow-rose-950/30'
                  : 'border-white/5 bg-[#0a0e17] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400">
                  CORRIDOR #{t.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              {/* Source -> Particle Stream -> Destination */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[110px]">
                    {t.source_bank.replace('[DEMO] ', '')}
                  </span>
                  <span className="text-rose-500 font-bold">➔</span>
                  <span className="font-bold text-white truncate max-w-[110px]">
                    {t.destination_bank.replace('[DEMO] ', '')}
                  </span>
                </div>

                {/* Animated Particles Along Corridor */}
                <div className="flex items-center justify-center gap-1.5 py-2 bg-black/40 rounded-xl">
                  {[...Array(particleCount)].map((_, i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-rose-600 animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>

                <div className="text-xs text-slate-400 font-mono flex justify-between">
                  <span>{t.component} ({t.blood_group})</span>
                  <span className="font-bold text-rose-400">{t.quantity} Units</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 2. DETAILED CORRIDOR DISPATCH CONTROL PANEL */}
      {selectedTransfer && (
        <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0e17] space-y-6 shadow-2xl network-canvas-grid">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                PHYSICAL DISPATCH SPECIFICATION
              </span>
              <h3 className="text-2xl font-bold text-white font-sans mt-0.5">
                {selectedTransfer.source_bank.replace('[DEMO] ', '')} ➔ {selectedTransfer.destination_bank.replace('[DEMO] ', '')}
              </h3>
            </div>

            {selectedTransfer.status === 'PENDING' && (
              <div className="flex items-center gap-3">
                <button
                  disabled={updatingId === selectedTransfer.id}
                  onClick={() => handleAction(selectedTransfer.id, 'APPROVED')}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase transition cursor-pointer disabled:opacity-50"
                >
                  {updatingId === selectedTransfer.id ? 'Activating Route...' : 'Approve & Dispatch Flow'}
                </button>
                <button
                  disabled={updatingId === selectedTransfer.id}
                  onClick={() => handleAction(selectedTransfer.id, 'REJECTED')}
                  className="px-4 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-slate-400 text-xs font-mono uppercase transition cursor-pointer disabled:opacity-50"
                >
                  Dissolve Route
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono">
            <div>
              <div className="text-slate-500">Component</div>
              <div className="text-base font-bold text-white mt-1">{selectedTransfer.component}</div>
            </div>

            <div>
              <div className="text-slate-500">Blood Group</div>
              <div className="text-base font-bold text-rose-400 mt-1">{selectedTransfer.blood_group}</div>
            </div>

            <div>
              <div className="text-slate-500">Transfer Volume</div>
              <div className="text-base font-bold text-white mt-1">{selectedTransfer.quantity} Units</div>
            </div>

            <div>
              <div className="text-slate-500">Vehicle / Corridor</div>
              <div className="text-base font-bold text-cyan-300 mt-1">
                {selectedTransfer.vehicle || 'Refrigerated EV Van (22°C)'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
