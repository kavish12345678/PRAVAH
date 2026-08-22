import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { TransferItem, TransferStatusUpdate } from '../types'

interface TransfersPageProps {
  transfers: TransferItem[]
  onUpdateStatus: (id: number, status: TransferStatusUpdate) => Promise<void>
}

export function TransfersPage({ transfers, onUpdateStatus }: TransfersPageProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

  const handleAction = async (id: number, status: TransferStatusUpdate) => {
    setUpdatingId(id)
    try {
      await onUpdateStatus(id, status)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return transfers
    return transfers.filter((t) => t.status === statusFilter)
  }, [transfers, statusFilter])

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
          Transfers
        </h1>
        <p className="text-base text-slate-600">
          Where blood should move to resolve deficits and prevent expiry waste.
        </p>
      </section>

      {/* 2. STATUS FILTER */}
      <section className="flex items-center gap-3 border-b border-[#e8e6df] pb-4">
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-[#e8e6df] text-slate-700 hover:bg-slate-50'
          }`}
        >
          Pending Review ({transfers.filter((t) => t.status === 'PENDING').length})
        </button>

        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-900 text-white'
              : 'bg-white border border-[#e8e6df] text-slate-700 hover:bg-slate-50'
          }`}
        >
          Approved Dispatches ({transfers.filter((t) => t.status === 'APPROVED').length})
        </button>

        <button
          onClick={() => setStatusFilter('ALL')}
          className={`ml-auto text-xs font-mono text-slate-500 hover:text-slate-900 cursor-pointer ${
            statusFilter === 'ALL' ? 'font-bold underline text-slate-900' : ''
          }`}
        >
          All Recommendations ({transfers.length})
        </button>
      </section>

      {/* 3. SOURCE -> DESTINATION TRANSFER CARDS */}
      <section className="space-y-4">
        {filtered.slice(0, 25).map((t) => {
          const isPending = t.status === 'PENDING'
          const isApproved = t.status === 'APPROVED'
          const isUpdating = updatingId === t.id

          return (
            <div
              key={t.id}
              className="p-6 rounded-2xl border border-[#e8e6df] bg-white space-y-4 shadow-2xs hover:border-slate-300 transition"
            >
              {/* Top Source -> Destination Flow Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#f1efe9]">
                <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                  {/* Origin */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
                      SOURCE (SURPLUS)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {t.source_bank.replace('[DEMO] ', '')}
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="text-rose-800 font-mono text-lg font-bold">
                    ────►
                  </div>

                  {/* Destination */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-rose-800 font-bold">
                      DESTINATION (SHORTAGE)
                    </span>
                    <div className="text-base font-bold text-rose-950">
                      {t.destination_bank.replace('[DEMO] ', '')}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : isPending
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>

              {/* Transfer Details Grid & Decision Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-slate-400 font-medium">Component</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{t.component}</div>
                  </div>

                  <div>
                    <div className="text-slate-400 font-medium">Blood Group</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{t.blood_group}</div>
                  </div>

                  <div>
                    <div className="text-slate-400 font-medium">Transfer Volume</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{t.quantity} Units</div>
                  </div>

                  <div>
                    <div className="text-slate-400 font-medium">Redistribution Route</div>
                    <div className="font-mono text-slate-600 mt-0.5 truncate max-w-[140px]">
                      {t.route || 'Direct Cold-Chain Corridor'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isPending && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={isUpdating}
                      onClick={() => handleAction(t.id, 'APPROVED')}
                      className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                    >
                      {isUpdating ? 'Approving...' : 'Approve Transfer'}
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => handleAction(t.id, 'REJECTED')}
                      className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="p-10 text-center border border-dashed border-slate-200 rounded-2xl text-slate-500 text-sm">
            No transfer recommendations in this state.
          </div>
        )}
      </section>
    </motion.div>
  )
}
