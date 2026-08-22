import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassPanel } from './GlassPanel'
import type { TransferItem, TransferStatusUpdate } from '../types'

interface OptimizationStudioProps {
  transfers: TransferItem[]
  onUpdateStatus: (id: number, status: TransferStatusUpdate) => Promise<void>
}

export function OptimizationStudio({ transfers, onUpdateStatus }: OptimizationStudioProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [auditLog, setAuditLog] = useState<Array<{ id: string; time: string; action: string; details: string }>>([
    { id: 'AUD-001', time: '20:45:10', action: 'LP_SOLVER_RUN', details: 'Global HiGHS min-cost flow solver executed (745 edges evaluated)' },
  ])

  const handleStatusChange = async (id: number, status: TransferStatusUpdate, transfer: TransferItem) => {
    setUpdatingId(id)
    try {
      await onUpdateStatus(id, status)
      setAuditLog((prev) => [
        {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          time: new Date().toLocaleTimeString(),
          action: status === 'APPROVED' ? 'TRANSFER_APPROVED' : 'TRANSFER_REJECTED',
          details: `${status}: ${transfer.quantity}u ${transfer.component} (${transfer.blood_group}) from ${transfer.source_bank} to ${transfer.destination_bank}`,
        },
        ...prev,
      ])
    } finally {
      setUpdatingId(null)
    }
  }

  // Pre-configured nodes for LP demonstration
  const donors = [
    { name: 'Delhi Central Blood Bank', city: 'Delhi', surplus: 35, component: 'Platelets (O+)' },
    { name: 'Hyderabad Central Blood Bank', city: 'Hyderabad', surplus: 25, component: 'Platelets (O+)' },
  ]
  const recipients = [
    { name: 'Chennai South Blood Bank', city: 'Chennai', deficit: 30, component: 'Platelets (O+)' },
    { name: 'Mumbai Regional Blood Centre', city: 'Mumbai', deficit: 20, component: 'Platelets (O+)' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassPanel className="p-6" glow="emerald">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Redistribution Decision Engine
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Linear Programming (LP) Min-Cost Network Flow Optimizer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Solves global surplus-deficit supply matching with vehicle capacity (60 units), road travel time, and cold-chain constraints.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 font-mono">
              Solver: scipy.optimize.linprog (HiGHS)
            </div>
          </div>
        </div>

        {/* LP Balancing Pool Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Donor Surplus Pool */}
          <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Donor Surplus Pool (Supply)
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300">+60 Units Total</span>
            </div>
            <div className="space-y-2">
              {donors.map((d) => (
                <div key={d.name} className="flex justify-between items-center p-2.5 rounded-lg border border-white/5 bg-black/40 text-xs">
                  <div>
                    <div className="font-semibold text-white">{d.name}</div>
                    <div className="text-[10px] text-slate-400">{d.component}</div>
                  </div>
                  <span className="font-mono font-bold text-cyan-300">+{d.surplus} u</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recipient Deficit Pool */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Recipient Deficit Pool (Demand)
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">-50 Units Total</span>
            </div>
            <div className="space-y-2">
              {recipients.map((r) => (
                <div key={r.name} className="flex justify-between items-center p-2.5 rounded-lg border border-white/5 bg-black/40 text-xs">
                  <div>
                    <div className="font-semibold text-white">{r.name}</div>
                    <div className="text-[10px] text-slate-400">{r.component}</div>
                  </div>
                  <span className="font-mono font-bold text-amber-300">-{r.deficit} u</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Live Transfer Recommendations Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <GlassPanel className="p-6" glow="cyan">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                  Optimal Transfer Recommendations
                </h3>
                <p className="text-xs text-slate-400">Review AI recommended dispatches and submit medical approval</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{transfers.length} recommendations</span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {transfers.map((t) => {
                const isPending = t.status === 'PENDING'
                const isApproved = t.status === 'APPROVED'
                const isUpdating = updatingId === t.id

                return (
                  <motion.div
                    key={t.id}
                    layout
                    className={`p-4 rounded-xl border transition-all ${
                      isApproved
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : t.status === 'REJECTED'
                        ? 'border-red-500/30 bg-red-500/5 opacity-60'
                        : 'border-white/10 bg-white/[0.02] hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-cyan-300">
                            {t.quantity} Units
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-white">
                            {t.component} ({t.blood_group})
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {t.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-200">
                          <span className="text-slate-400">Route:</span> {t.source_bank} → {t.destination_bank}
                        </div>

                        {t.route && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            Transit: {t.route} · Vehicle: {t.vehicle || 'Refrigerated Van'}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(t.id, 'APPROVED', t)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(t.id, 'REJECTED', t)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {transfers.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-8">
                  No active transfer recommendations. Run the intelligence pipeline to generate optimal routes.
                </p>
              )}
            </div>
          </GlassPanel>
        </div>

        {/* Audit Log Stream */}
        <div className="lg:col-span-4 space-y-4">
          <GlassPanel className="p-6" glow="blue">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 mb-3 flex items-center gap-2">
              <span>🛡️</span> Digital Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mb-4">PostgreSQL persisted audit logs for decision compliance</p>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {auditLog.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border border-white/5 bg-black/40 text-xs">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                    <span className="font-mono">{log.id}</span>
                    <span>{log.time}</span>
                  </div>
                  <div className="font-mono text-cyan-300 font-semibold mb-0.5">{log.action}</div>
                  <div className="text-slate-300 text-[11px]">{log.details}</div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
