import { useState } from 'react'
import type { TransferItem, TransferStatusUpdate } from '../../types'

interface Step9ApprovalProps {
  transfers: TransferItem[]
  selectedTransferId: number | null
  onUpdateStatus: (id: number, status: TransferStatusUpdate) => Promise<void>
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step9Approval({
  transfers,
  selectedTransferId,
  onUpdateStatus,
  onNavigateToStep,
}: Step9ApprovalProps) {
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
          ? `Transfer #${currentTransfer.id} successfully authorized. Recorded into permanent audit trail.`
          : `Transfer #${currentTransfer.id} rejected and updated in audit ledger.`,
      )
    } catch (err) {
      setDecisionFeedback(`Failed to record decision: ${err instanceof Error ? err.message : 'Error'}`)
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
            Step 09 of 10
          </span>
          <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
            Human Authorization
          </span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-primary">
          Should a human approve this transfer?
        </h2>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
          Authoritative sign-off required by National Clinical Logistics Officer before physical dispatch execution.
        </p>
      </header>

      {/* Decision Card */}
      {currentTransfer ? (
        <div className="bg-white p-8 md:p-10 rounded-2xl border border-outline-variant/15 space-y-8 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hairline-b pb-6">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                Transfer Recommendation #{currentTransfer.id}
              </span>
              <div className="flex items-center gap-3 text-xl font-bold text-on-surface mt-1">
                <span className="max-w-[200px] truncate">{currentTransfer.source_bank}</span>
                <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                <span className="text-primary max-w-[200px] truncate">{currentTransfer.destination_bank}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-3xl font-bold text-primary block">
                {currentTransfer.quantity} Units
              </span>
              <span className="text-xs text-on-surface-variant font-semibold">
                {currentTransfer.blood_group} {currentTransfer.component}
              </span>
            </div>
          </div>

          {/* Key Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-on-surface-variant font-semibold">Transit Corridor:</span>
              <p className="font-bold text-on-surface">{currentTransfer.route || 'Refrigerated Cold Corridor'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-on-surface-variant font-semibold">Cold Storage Vehicle:</span>
              <p className="font-bold text-on-surface">{currentTransfer.vehicle || 'Refrigerated Van (22°C)'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-on-surface-variant font-semibold">Current State:</span>
              <p className="font-bold text-secondary">{currentTransfer.status}</p>
            </div>
          </div>

          {/* Decision Feedback Message */}
          {decisionFeedback && (
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-xl text-xs font-bold text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{decisionFeedback}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-outline-variant/15 flex flex-wrap items-center gap-4">
            <button
              disabled={loadingAction}
              onClick={() => handleDecision('APPROVED')}
              className="px-8 py-4 bg-secondary text-white font-sans text-xs font-bold uppercase rounded-full hover:opacity-90 transition-opacity cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>{loadingAction ? 'Authorizing...' : 'Approve Transfer'}</span>
            </button>

            <button
              disabled={loadingAction}
              onClick={() => handleDecision('REJECTED')}
              className="px-8 py-4 border border-outline-variant text-on-surface-variant font-sans text-xs font-bold uppercase rounded-full hover:text-primary hover:border-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>Reject Transfer</span>
            </button>

            <button
              onClick={() => onNavigateToStep('audit')}
              className="ml-auto text-primary text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <span>Step 10 · View Audit Log</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-on-surface-variant bg-f5f1ee rounded-2xl">
          No transfers currently available for authorization.
        </div>
      )}

      {/* Footer step navigation */}
      <div className="flex justify-between items-center text-xs text-on-surface-variant">
        <button
          onClick={() => onNavigateToStep('transfers')}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          ← Step 08 Transfer Recommendations
        </button>
        <button
          onClick={() => onNavigateToStep('audit')}
          className="text-primary font-bold hover:underline cursor-pointer"
        >
          Step 10 Audit Result →
        </button>
      </div>
    </div>
  )
}
