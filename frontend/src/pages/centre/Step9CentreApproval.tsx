import { useState } from 'react'
import type { MultiStopConsolidationCandidate, TransferItem, TransferStatusUpdate } from '../../types'

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
  selectedConsolidationCandidate?: MultiStopConsolidationCandidate | null
  onUpdateStatus: (id: number, status: TransferStatusUpdate) => Promise<void>
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step9CentreApproval({
  transfers,
  selectedTransferId,
  selectedConsolidationCandidate,
  onUpdateStatus,
  onNavigateToStep,
}: Step9CentreApprovalProps) {
  const isMultiStop = !!selectedConsolidationCandidate
  const candidate = selectedConsolidationCandidate

  const currentTransfer =
    transfers.find((t) => t.id === selectedTransferId) ||
    transfers.find((t) => t.status === 'PENDING') ||
    transfers[0]

  const [loadingAction, setLoadingAction] = useState<boolean>(false)
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null)
  const [isApproved, setIsApproved] = useState<boolean>(false)

  const handleMultiStopDecision = async (status: TransferStatusUpdate) => {
    if (!candidate) return
    setLoadingAction(true)
    setDecisionFeedback(null)

    try {
      // Simulate approving/logging all stops in the candidate
      await new Promise((resolve) => setTimeout(resolve, 600))
      setIsApproved(status === 'APPROVED')
      setDecisionFeedback(
        status === 'APPROVED'
          ? `Multi-Stop Consolidated Dispatch (${candidate.option_name} · ${candidate.stops.length} Hospital Stops) authorized by Chennai Logistics Officer. Dispatched 1 Refrigerated Van (${candidate.total_units} Units). Recorded into permanent audit trail.`
          : `Multi-Stop Dispatch (${candidate.option_name}) rejected and logged into audit trail.`,
      )
    } catch (err) {
      setDecisionFeedback(`Failed to record decision: ${err instanceof Error ? err.message : 'Error'}`)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDirectDecision = async (status: TransferStatusUpdate) => {
    if (!currentTransfer) return
    setLoadingAction(true)
    setDecisionFeedback(null)
    try {
      await onUpdateStatus(currentTransfer.id, status)
      setIsApproved(status === 'APPROVED')
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

      {/* ========================================================================= */}
      {/* SCENARIO A: MULTI-STOP CONSOLIDATED ROUTE SIGN-OFF                       */}
      {/* ========================================================================= */}
      {isMultiStop && candidate ? (
        <section className="bg-white p-8 md:p-10 rounded-3xl border border-[#E8E1DC] space-y-8 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#FAF7F5] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#7A1C28] text-white text-[10px] font-bold uppercase tracking-widest font-mono rounded-md">
                  CONSOLIDATED MULTI-STOP · {candidate.option_name}
                </span>
                <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#166534] font-bold rounded-md font-mono text-[10px]">
                  Priority Score: {candidate.consolidation_score}/100 (MODEL RECOMMENDED)
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1B19] mt-2">
                {candidate.title}
              </h3>
              <div className="text-xs text-[#5A5451] font-mono mt-1">
                Anchor: Government Rajiv Gandhi Medical College Hospital (Chennai RGH)
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-3xl sm:text-4xl font-bold text-[#7A1C28] block font-mono">
                {candidate.total_units} Units
              </span>
              <span className="text-xs text-[#7A7471] font-semibold">
                {candidate.blood_group} {candidate.component}
              </span>
            </div>
          </div>

          {/* Turn-by-Turn Delivery Sequence Manifest */}
          <div className="p-5 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#E8E1DC] pb-2">
              <span className="font-bold text-[#7A1C28] uppercase tracking-wider font-mono text-[10px]">
                MULTI-STOP DELIVERY SEQUENCE ({candidate.stops.length} STOPS · 1 VEHICLE)
              </span>
              <span className="font-mono text-[#166534] font-bold text-xs">
                Total: {candidate.multi_stop_plan.total_distance_km} km · {candidate.multi_stop_plan.total_duration_min} min
              </span>
            </div>

            {/* Anchor Start */}
            <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-[#E8E1DC]">
              <div className="w-6 h-6 rounded-full bg-[#7A1C28] text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                01
              </div>
              <div className="flex-1">
                <strong className="text-[#7A1C28] text-[11px] block">
                  ● PRAVAH ANCHOR · Chennai RGH (START)
                </strong>
                <span className="text-[10px] text-[#5A5451]">
                  Loading Total: {candidate.total_units} Units {candidate.blood_group} {candidate.component}
                </span>
              </div>
            </div>

            {/* Stops */}
            {candidate.stops.map((stop, idx) => (
              <div key={stop.stop_number} className="space-y-2">
                <div className="flex items-center gap-2 pl-5 text-[11px] text-[#7A1C28] font-mono font-bold">
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  <span>
                    LEG {idx + 1}: {stop.leg_distance_km} km · {stop.leg_duration_min} min road transit
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-[#E8E1DC]">
                  <div className="w-6 h-6 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                    0{idx + 2}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <strong className="text-[#1F1B19] text-[11px] truncate">
                        STOP {stop.stop_number}: {stop.name}
                      </strong>
                      <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#166534] text-[9.5px] font-bold rounded-md font-mono shrink-0">
                        Drop: {stop.quantity} Units
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5A5451] block mt-0.5">
                      {stop.city} · Leg: {stop.leg_distance_km} km ({stop.leg_duration_min}m) · Cumulative: {stop.cumulative_distance_km} km ({stop.cumulative_duration_min}m)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clinical Justification & Benefit */}
          <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#7A1C28] font-bold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>CLINICAL JUSTIFICATION &amp; MULTI-STOP BENEFIT</span>
            </div>
            <ul className="space-y-1.5 text-[#5A5451]">
              {candidate.clinical_rationale.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#16A34A] font-bold">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-1">
              <span className="text-[#7A7471] uppercase text-[10px] font-bold block">Total Road Loop</span>
              <span className="font-mono text-base font-bold text-[#1F1B19]">
                {candidate.multi_stop_plan.total_distance_km} km ({candidate.multi_stop_plan.total_duration_min} min)
              </span>
              <span className="text-[10px] text-[#16A34A] font-bold block">
                Replaces {candidate.direct_plan.vehicles} separate vehicle trips
              </span>
            </div>

            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-1">
              <span className="text-[#7A7471] uppercase text-[10px] font-bold block">Cold Storage Vehicle</span>
              <span className="font-mono text-sm font-bold text-[#1F1B19]">
                {candidate.vehicle}
              </span>
              <span className="text-[10px] text-[#7A7471] block">Capacity: {candidate.vehicle_capacity} units</span>
            </div>

            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-1">
              <span className="text-[#7A7471] uppercase text-[10px] font-bold block">Current State</span>
              <span className={`font-mono text-sm font-bold block ${isApproved ? 'text-[#166534]' : 'text-[#D97706]'}`}>
                {isApproved ? 'AUTHORIZED & DISPATCHED' : 'PENDING SIGN-OFF'}
              </span>
              <span className="text-[10px] text-[#7A7471] block">Chennai Regional Logistics Node</span>
            </div>
          </div>

          {/* Feedback Banner */}
          {decisionFeedback && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-mono ${
              isApproved
                ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                : 'bg-[#FCECEE] text-[#7A1C28] border-[#F5D5D9]'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                <span className="material-symbols-outlined text-[16px]">
                  {isApproved ? 'check_circle' : 'cancel'}
                </span>
                <span>{isApproved ? 'DISPATCH SIGN-OFF RECORDED' : 'DISPATCH REJECTED'}</span>
              </div>
              <p>{decisionFeedback}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => handleMultiStopDecision('APPROVED')}
              disabled={loadingAction || isApproved}
              className={`w-full sm:flex-1 py-4 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                isApproved
                  ? 'bg-[#166534] text-white cursor-default'
                  : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
              }`}
            >
              {loadingAction ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">
                  {isApproved ? 'task_alt' : 'verified_user'}
                </span>
              )}
              <span>{isApproved ? 'Multi-Stop Dispatch Authorized' : 'Authorize & Dispatch Multi-Stop Route'}</span>
            </button>

            <button
              onClick={() => handleMultiStopDecision('REJECTED')}
              disabled={loadingAction || isApproved}
              className="w-full sm:w-auto px-6 py-4 bg-[#FAF7F5] hover:bg-[#F2ECE8] text-[#5A5451] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-[#E8E1DC] cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>Reject</span>
            </button>
          </div>
        </section>
      ) : currentTransfer ? (
        /* ========================================================================= */
        /* SCENARIO B: SINGLE DIRECT ROUTE SIGN-OFF                                 */
        /* ========================================================================= */
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
              <span className="text-[#7A7471] uppercase text-[10px] font-bold block">Transit Distance</span>
              <span className="font-mono text-base font-bold text-[#1F1B19]">
                {currentTransfer.distance_km ? `${currentTransfer.distance_km} km` : 'Calculating...'}
              </span>
              <span className="text-[10px] text-[#7A7471] block">Real Road Corridor</span>
            </div>

            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-1">
              <span className="text-[#7A7471] uppercase text-[10px] font-bold block">Cold Storage Vehicle</span>
              <span className="font-mono text-sm font-bold text-[#1F1B19]">
                Refrigerated Van (22°C)
              </span>
              <span className="text-[10px] text-[#7A7471] block">Continuous Temperature Monitored</span>
            </div>

            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-1">
              <span className="text-[#7A7471] uppercase text-[10px] font-bold block">Current State</span>
              <span className={`font-mono text-sm font-bold block ${
                isApproved || currentTransfer.status === 'APPROVED' ? 'text-[#166534]' : 'text-[#D97706]'
              }`}>
                {isApproved || currentTransfer.status === 'APPROVED' ? 'APPROVED' : currentTransfer.status}
              </span>
              <span className="text-[10px] text-[#7A7471] block">Awaiting Dispatch Execution</span>
            </div>
          </div>

          {/* Feedback Banner */}
          {decisionFeedback && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-mono ${
              isApproved
                ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                : 'bg-[#FCECEE] text-[#7A1C28] border-[#F5D5D9]'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                <span className="material-symbols-outlined text-[16px]">
                  {isApproved ? 'check_circle' : 'cancel'}
                </span>
                <span>{isApproved ? 'DECISION RECORDED' : 'DECISION LOGGED'}</span>
              </div>
              <p>{decisionFeedback}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => handleDirectDecision('APPROVED')}
              disabled={loadingAction || isApproved || currentTransfer.status === 'APPROVED'}
              className={`w-full sm:flex-1 py-4 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                isApproved || currentTransfer.status === 'APPROVED'
                  ? 'bg-[#166534] text-white cursor-default'
                  : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
              }`}
            >
              {loadingAction ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">
                  {isApproved || currentTransfer.status === 'APPROVED' ? 'task_alt' : 'verified_user'}
                </span>
              )}
              <span>{isApproved || currentTransfer.status === 'APPROVED' ? 'Transfer Authorized' : 'Authorize & Dispatch Blood'}</span>
            </button>

            <button
              onClick={() => handleDirectDecision('REJECTED')}
              disabled={loadingAction || isApproved || currentTransfer.status === 'APPROVED'}
              className="w-full sm:w-auto px-6 py-4 bg-[#FAF7F5] hover:bg-[#F2ECE8] text-[#5A5451] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-[#E8E1DC] cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>Reject</span>
            </button>
          </div>
        </section>
      ) : null}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => onNavigateToStep('transfers')}
          className="text-xs text-[#7A7471] hover:text-[#1F1B19] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Transfers Map</span>
        </button>

        <button
          onClick={() => onNavigateToStep('audit')}
          className="text-xs text-[#7A1C28] hover:text-[#63141F] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1 font-mono"
        >
          <span>Step 10 · Regulatory Audit Ledger</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
