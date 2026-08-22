import { useState } from 'react'
import type { TransferItem } from '../../types'

interface Step8CentreTransfersProps {
  transfers: (TransferItem & { distance_km: number; is_connected_to_anchor: boolean })[]
  onSelectTransfer: (id: number) => void
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step8CentreTransfers({
  transfers,
  onSelectTransfer,
  onNavigateToStep,
}: Step8CentreTransfersProps) {
  const [filterAnchorOnly, setFilterAnchorOnly] = useState(false)

  const displayedTransfers = filterAnchorOnly
    ? transfers.filter((t) => t.is_connected_to_anchor)
    : transfers

  const handleApproveClick = (id: number) => {
    onSelectTransfer(id)
    onNavigateToStep('approval')
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
              Step 08 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Regional Transfer Dispatch Corridors
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-primary leading-[1.06] tracking-tight">
            Where should blood move around this centre?
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-[800px]">
            Optimized redistribution dispatches generated within the <strong className="text-on-surface font-semibold">200 km Chennai network</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('approval')}
          className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>Step 09 · Clinical Authorization</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      {/* Filter Bar */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-outline-variant/15 text-xs font-bold shadow-2xs">
        <span className="text-on-surface-variant">
          Showing {displayedTransfers.length} Generated Transfer Recommendations
        </span>

        <button
          onClick={() => setFilterAnchorOnly(!filterAnchorOnly)}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            filterAnchorOnly
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {filterAnchorOnly ? 'Showing Anchor Dispatches' : 'Filter: Chennai RGH Only'}
        </button>
      </section>

      {/* Transfers Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTransfers.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white rounded-3xl border border-outline-variant/15 hover:border-primary/40 transition-all shadow-2xs space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
                  Transfer #{item.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    item.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Source -> Destination */}
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase block">From (Donor):</span>
                  <p className="font-bold text-sm text-on-surface leading-tight truncate">{item.source_bank}</p>
                </div>
                <div className="flex items-center gap-1.5 text-primary py-0.5">
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  <span className="text-[11px] font-mono font-bold">{item.distance_km.toFixed(1)} km transit corridor</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase block">To (Recipient):</span>
                  <p className="font-bold text-sm text-primary leading-tight truncate">{item.destination_bank}</p>
                </div>
              </div>

              {/* Quantity & Component */}
              <div className="p-3.5 bg-surface-container-low rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Blood Component</span>
                  <span className="font-bold text-on-surface">{item.blood_group} {item.component}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-on-surface-variant block">Volume</span>
                  <span className="font-bold text-primary font-mono text-base">{item.quantity} Units</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleApproveClick(item.id)}
              className="w-full py-3.5 bg-secondary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <span>Authorize Transfer</span>
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}
