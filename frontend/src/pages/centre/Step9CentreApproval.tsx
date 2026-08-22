import { useState } from 'react'
import type { TransferItem, TransferStatusUpdate } from '../../types'

interface Step9CentreApprovalProps {
  transfers: (TransferItem & { distance_km: number; is_connected_to_anchor: boolean })[]
  selectedTransferId: number | null
  onUpdateStatus: (id: number, status: TransferStatusUpdate) => Promise<void>
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step9CentreApproval({
  transfers,
  selectedTransferId,
  onUpdateStatus,
  onNavigateToStep,
}: Step9CentreApprovalProps) {
  const currentTransfer =
    transfers.find((t) => t.id === selectedTransferId) ||
    transfers.find((t) => t.status === 'PENDING') ||
    transfers[0]

  const [loadingAction, setLoadingAction] = useState<boolean>(false)
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null)

  const handleDecision = async (status: TransferStatusUpdate) => {
    if (!currentTransfer) return
    setLoadingAction(true)
    setDecisionFeedback(null)
    try {
      await onUpdateStatus(currentTransfer.id, status)
      setDecisionFeedback(
        status === 'APPROVED'
          ? `Transfer #${currentTransfer.id} authorized by Chennai Logistics Officer. Recorded into permanent audit trail.`
          : `Transfer #${currentTransfer.id} rejected and logged.`,
      )
    } catch (err) {
      setDecisionFeedback(`Failed to record decision: ${err instanceof Error ? err.message : 'Error'}`)
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-4xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
            Step 09 of 10
          </span>
          <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
            Centre Logistics Officer Sign-Off
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary leading-tight">
          Authorize 200 km Transfer Dispatch
        </h1>

        <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
          Authoritative sign-off required by Chennai Regional Clinical Logistics Officer before physical dispatch execution.
        </p>
      </section>

      {/* Decision Card */}
      {currentTransfer ? (
        <section className="bg-white p-8 md:p-10 rounded-3xl border border-outline-variant/15 space-y-8 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/15 pb-6">
            <div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest block font-mono">
                Recommendation #{currentTransfer.id}
              </span>
              <div className="flex items-center gap-3 text-lg sm:text-xl font-bold text-on-surface mt-1.5 flex-wrap">
                <span className="max-w-[260px] truncate">{currentTransfer.source_bank}</span>
                <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                <span className="text-primary max-w-[260px] truncate">{currentTransfer.destination_bank}</span>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-3xl sm:text-4xl font-bold text-primary block font-mono">
                {currentTransfer.quantity} Units
              </span>
              <span className="text-xs text-on-surface-variant font-semibold">
                {currentTransfer.blood_group} {currentTransfer.component}
              </span>
            </div>
          </div>

          {/* Key Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-surface-container-low rounded-2xl space-y-1">
              <span className="text-on-surface-variant font-semibold">Transit Distance:</span>
              <p className="font-bold text-primary font-mono text-sm">{currentTransfer.distance_km.toFixed(1)} km</p>
            </div>
            <div className="p-4 bg-surface-container-low rounded-2xl space-y-1">
              <span className="text-on-surface-variant font-semibold">Cold Storage Vehicle:</span>
              <p className="font-bold text-on-surface text-sm">{currentTransfer.vehicle || 'Refrigerated Van (22°C)'}</p>
            </div>
            <div className="p-4 bg-surface-container-low rounded-2xl space-y-1">
              <span className="text-on-surface-variant font-semibold">Current State:</span>
              <p className="font-bold text-secondary font-mono text-sm">{currentTransfer.status}</p>
            </div>
          </div>

          {/* Decision Feedback Message */}
          {decisionFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{decisionFeedback}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-outline-variant/15 flex flex-wrap items-center gap-4">
            <button
              disabled={loadingAction}
              onClick={() => handleDecision('APPROVED')}
              className="px-8 py-4 bg-secondary text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:opacity-90 transition-opacity cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>{loadingAction ? 'Authorizing...' : 'Approve Transfer'}</span>
            </button>

            <button
              disabled={loadingAction}
              onClick={() => handleDecision('REJECTED')}
              className="px-8 py-4 border border-outline-variant text-on-surface-variant font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:text-primary hover:border-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>Reject Transfer</span>
            </button>

            <button
              onClick={() => onNavigateToStep('audit')}
              className="ml-auto text-primary text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <span>Step 10 · View Centre Audit Ledger</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </section>
      ) : (
        <div className="p-12 text-center text-on-surface-variant bg-surface-container-low rounded-3xl">
          No transfers currently available for authorization.
        </div>
      )}
    </div>
  )
}
