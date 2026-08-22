import { useState } from 'react'
import type { TransferItem, TransferStatusUpdate } from '../../types'

interface Step9CentreApprovalProps {
  transfers: (TransferItem & {
    distance_km?: number
    is_connected_to_anchor?: boolean
    route_score?: number
    urgency_level?: string
    recommendation_reason?: string
    clinical_impact?: string
  })[]
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
    <div className="p-6 md:p-10 lg:p-12 max-w-4xl mx-auto w-full space-y-10 select-none font-sans bg-[#FAF7F5]">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#FCECEE] text-[#7A1C28] text-[11px] font-bold rounded-full uppercase tracking-wider font-mono">
            Step 09 of 10
          </span>
          <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
            Centre Logistics Officer Sign-Off
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#7A1C28] leading-tight">
          Authorize 200 km Transfer Dispatch
        </h1>

        <p className="text-base sm:text-lg text-[#5A5451] leading-relaxed">
          Authoritative clinical sign-off required by Chennai Regional Clinical Logistics Officer before physical dispatch execution.
        </p>
      </section>

      {/* Decision Card */}
      {currentTransfer ? (
        <section className="bg-white p-8 md:p-10 rounded-3xl border border-[#E8E1DC] space-y-8 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#FAF7F5] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#7A1C28] uppercase tracking-widest font-mono">
                  Recommendation #{currentTransfer.id}
                </span>
                <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#166534] font-bold rounded-md font-mono text-[10px]">
                  Priority Score: {currentTransfer.route_score ?? 98}/100
                </span>
              </div>
              <div className="flex items-center gap-3 text-lg sm:text-xl font-bold text-[#1F1B19] mt-1.5 flex-wrap">
                <span className="max-w-[260px] truncate">{currentTransfer.source_bank}</span>
                <span className="material-symbols-outlined text-[#7A7471]">arrow_forward</span>
                <span className="text-[#7A1C28] max-w-[260px] truncate">{currentTransfer.destination_bank}</span>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-3xl sm:text-4xl font-bold text-[#7A1C28] block font-mono">
                {currentTransfer.quantity} Units
              </span>
              <span className="text-xs text-[#7A7471] font-semibold">
                {currentTransfer.blood_group} {currentTransfer.component}
              </span>
            </div>
          </div>

          {/* Clinical Rationale Box */}
          <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#7A1C28] font-bold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>CLINICAL JUSTIFICATION &amp; BENEFIT</span>
            </div>
            <p className="text-[#5A5451] leading-relaxed">
              {currentTransfer.recommendation_reason ||
                `Balances surplus inventory along 200 km regional corridor minimizing cold-chain exposure.`}
            </p>
            {currentTransfer.clinical_impact && (
              <p className="text-[#166534] font-semibold pt-1 border-t border-[#E8E1DC]">
                Clinical Impact: {currentTransfer.clinical_impact}
              </p>
            )}
          </div>

          {/* Key Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-1">
              <span className="text-[#7A7471] font-semibold">Transit Distance:</span>
              <p className="font-bold text-[#7A1C28] font-mono text-sm">{(currentTransfer.distance_km ?? 0).toFixed(1)} km</p>
            </div>
            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-1">
              <span className="text-[#7A7471] font-semibold">Cold Storage Vehicle:</span>
              <p className="font-bold text-[#1F1B19] text-sm">{currentTransfer.vehicle || 'Refrigerated Van @ 22.0°C ± 2°C'}</p>
            </div>
            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-1">
              <span className="text-[#7A7471] font-semibold">Current State:</span>
              <p className={`font-bold font-mono text-sm uppercase ${currentTransfer.status === 'APPROVED' ? 'text-[#16A34A]' : 'text-[#D97706]'}`}>
                {currentTransfer.status}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#FAF7F5]">
            <button
              onClick={() => handleDecision('APPROVED')}
              disabled={loadingAction || currentTransfer.status === 'APPROVED'}
              className="flex-1 py-4 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white rounded-2xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{currentTransfer.status === 'APPROVED' ? 'Transfer Authorized' : 'Authorize & Dispatch Blood'}</span>
            </button>

            <button
              onClick={() => handleDecision('REJECTED')}
              disabled={loadingAction || currentTransfer.status === 'REJECTED'}
              className="px-8 py-4 bg-[#FAF7F5] hover:bg-[#FCECEE] text-[#7A1C28] border border-[#E8E1DC] rounded-2xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>Reject</span>
            </button>
          </div>

          {decisionFeedback && (
            <div className="p-4 bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl text-xs font-bold text-[#166534] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#16A34A]">info</span>
              <span>{decisionFeedback}</span>
            </div>
          )}
        </section>
      ) : (
        <section className="bg-white p-12 rounded-3xl border border-[#E8E1DC] text-center space-y-4">
          <p className="text-sm font-semibold text-[#7A7471]">
            No pending transfers to authorize.
          </p>
          <button
            onClick={() => onNavigateToStep('transfers')}
            className="px-6 py-3 bg-[#7A1C28] text-white rounded-full text-xs font-bold uppercase cursor-pointer"
          >
            View Redistribution Routes
          </button>
        </section>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => onNavigateToStep('transfers')}
          className="text-xs font-bold text-[#7A7471] hover:text-[#1F1B19] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Transfers Map</span>
        </button>

        <button
          onClick={() => onNavigateToStep('audit')}
          className="text-xs font-bold text-[#7A1C28] hover:text-[#63141F] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          <span>Step 10 · Regulatory Audit Ledger</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
