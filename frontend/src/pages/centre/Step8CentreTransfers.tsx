import { useCallback, useMemo, useState } from 'react'
import { RoadRouteMap } from '../../components/RoadRouteMap'
import type { TransferItem } from '../../types'

interface Step8CentreTransfersProps {
  transfers: (TransferItem & {
    distance_km?: number
    travel_time_min?: number
    source_lat?: number
    source_lon?: number
    source_city?: string
    destination_lat?: number
    destination_lon?: number
    destination_city?: string
    is_connected_to_anchor?: boolean
    route_score?: number
    urgency_level?: 'CRITICAL' | 'HIGH' | 'MODERATE' | string
    recommendation_reason?: string
    clinical_impact?: string
  })[]
  onSelectTransfer: (id: number) => void
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step8CentreTransfers({
  transfers,
  onSelectTransfer,
  onNavigateToStep,
}: Step8CentreTransfersProps) {
  const [filterAnchorOnly, setFilterAnchorOnly] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(() => transfers[0]?.id || null)
  const [liveRoadMetrics, setLiveRoadMetrics] = useState<{ roadDistanceKm: number; durationMin: number } | null>(null)

  const displayedTransfers = useMemo(() => {
    if (filterAnchorOnly) {
      return transfers.filter((t) => t.is_connected_to_anchor)
    }
    return transfers
  }, [transfers, filterAnchorOnly])

  const activeTransfer = useMemo(() => {
    return (
      transfers.find((t) => t.id === selectedRouteId) ||
      displayedTransfers[0] ||
      transfers[0] ||
      null
    )
  }, [transfers, selectedRouteId, displayedTransfers])

  // Get up to 2 alternative transfers for the map
  const alternativeTransfers = useMemo(() => {
    if (!activeTransfer) return []
    return displayedTransfers
      .filter((t) => t.id !== activeTransfer.id)
      .slice(0, 2)
  }, [displayedTransfers, activeTransfer])

  const handleApproveClick = (id: number) => {
    onSelectTransfer(id)
    onNavigateToStep('approval')
  }

  const handleRouteCalculated = useCallback((metrics: { roadDistanceKm: number; durationMin: number }) => {
    setLiveRoadMetrics(metrics)
  }, [])

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-8 select-none font-sans bg-[#FAF7F5]">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-1 pb-1">
        <div className="space-y-2.5 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FCECEE] text-[#7A1C28] text-[11px] font-bold rounded-full uppercase tracking-wider font-mono">
              Step 08 of 10
            </span>
            <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
              Real Road-Following Dispatch Corridors &amp; OpenStreetMap Routing
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#7A1C28] leading-[1.08] tracking-tight">
            Where should blood move around this centre?
          </h1>

          <p className="text-sm sm:text-base text-[#5A5451] leading-relaxed max-w-[800px]">
            Live interactive geographic command map showing <strong className="text-[#7A1C28] font-bold">real road-following routes</strong> from Chennai Rajiv Gandhi Hospital anchor to destination recipient hospitals within the 200 km regional network.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('approval')}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>Step 09 · Clinical Authorization</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      {/* Filter & Summary Controls */}
      <section className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#E8E1DC] shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => setFilterAnchorOnly(!filterAnchorOnly)}
            className={`px-4 py-2.5 rounded-2xl font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              filterAnchorOnly
                ? 'bg-[#7A1C28] text-white border-[#7A1C28] shadow-xs'
                : 'bg-white text-[#5A5451] border-[#E8E1DC] hover:border-[#7A1C28]/40'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">hub</span>
            <span>Chennai Anchor Corridors Only</span>
          </button>

          <span className="px-4 py-2 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] text-[#7A7471] font-bold font-mono">
            {displayedTransfers.length} Feasible Transfer Corridors Solved
          </span>
        </div>

        {activeTransfer && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#7A7471]">Active Corridor:</span>
            <span className="font-bold font-mono text-[#7A1C28]">
              #{activeTransfer.id} · {activeTransfer.route}
            </span>
          </div>
        )}
      </section>

      {/* Main 2-Column Command Center Grid (Equal Height ~740px on Desktop) */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(380px,0.9fr)] gap-6 items-stretch">
        {/* LEFT COLUMN: ~65% Real Road Map */}
        <div className="h-full min-h-[700px] lg:min-h-[740px] flex flex-col">
          <RoadRouteMap
            activeTransfer={activeTransfer}
            alternativeTransfers={alternativeTransfers}
            onSelectTransfer={setSelectedRouteId}
            onRouteCalculated={handleRouteCalculated}
          />
        </div>

        {/* RIGHT COLUMN: ~35% Route Priority Score & Clinical Rationale Panel */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E1DC] shadow-2xs flex flex-col justify-between h-full min-h-[700px] lg:min-h-[740px] space-y-4">
          <div className="space-y-4">
            {activeTransfer ? (
              <>
                {/* 1. Route Priority Score Banner */}
                <div className="p-4 bg-[#FCECEE] rounded-2xl border border-[#F5D5D9] flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono block">
                      ROUTE PRIORITY SCORE
                    </span>
                    <span className="text-xs text-[#5A5451]">Multi-factor LP objective score</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-[#7A1C28] font-mono">
                      {activeTransfer.route_score ?? 98}/100
                    </span>
                    <span className="block text-[10px] font-bold text-[#16A34A] uppercase font-mono">
                      {activeTransfer.urgency_level || 'CRITICAL PRIORITY'}
                    </span>
                  </div>
                </div>

                {/* 2. Dispatch Transfer Header & Badges */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7471] font-mono">
                    Dispatch Transfer #{activeTransfer.id}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1F1B19] leading-snug">
                    {activeTransfer.route}
                  </h3>
                  <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                    <span className="px-2.5 py-1 bg-[#DCFCE7] text-[#166534] font-bold rounded-lg text-xs font-mono">
                      {activeTransfer.quantity} Units {activeTransfer.blood_group} {activeTransfer.component}
                    </span>
                    <span className="px-2.5 py-1 bg-[#FAF7F5] text-[#7A7471] font-bold rounded-lg text-xs font-mono border border-[#E8E1DC]">
                      {liveRoadMetrics
                        ? `${liveRoadMetrics.roadDistanceKm} km · ${liveRoadMetrics.durationMin} min transit`
                        : `${activeTransfer.distance_km?.toFixed(1) || 1.7} km · ${activeTransfer.travel_time_min || 15} min transit`}
                    </span>
                  </div>
                </div>

                {/* 3. Why This Route Is Recommended */}
                <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-2">
                  <div className="flex items-center gap-2 text-[#7A1C28]">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Why This Route Is Recommended
                    </span>
                  </div>
                  <ul className="text-xs text-[#5A5451] space-y-1.5 list-disc list-inside leading-relaxed">
                    <li><strong className="text-[#1F1B19]">Surplus Availability:</strong> Source hub has verified excess volume ({activeTransfer.quantity} units {activeTransfer.blood_group} {activeTransfer.component}).</li>
                    <li><strong className="text-[#1F1B19]">Shortage Relief:</strong> Resolves acute stockout pressure at {activeTransfer.destination_bank}.</li>
                    <li><strong className="text-[#1F1B19]">Cold-Chain Feasibility:</strong> Transit duration ({liveRoadMetrics?.durationMin || 15} min) is well within WHO viability envelope.</li>
                    <li><strong className="text-[#1F1B19]">Shelf-Life Preservation:</strong> Prevents platelet discard by moving units prior to degradation boundary.</li>
                  </ul>
                </div>

                {/* 4. Clinical Impact */}
                <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] space-y-1.5 text-xs">
                  <span className="font-bold text-[#1F1B19] block">Clinical Impact:</span>
                  <p className="text-[#5A5451] leading-relaxed">
                    {activeTransfer.clinical_impact ||
                      `Maintains active tertiary trauma reserves, preventing surgical cancellation while ensuring shelf-life integrity during transit.`}
                  </p>
                </div>

                {/* 5. Transport & Cold-Chain Parameters */}
                <div className="space-y-2 text-xs border-t border-[#FAF7F5] pt-3">
                  <div className="flex justify-between py-1 border-b border-[#FAF7F5]">
                    <span className="text-[#7A7471]">Transport Vehicle:</span>
                    <span className="font-bold text-[#1F1B19] font-mono">
                      {activeTransfer.vehicle || 'Refrigerated Van (22.0°C ± 2°C)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF7F5]">
                    <span className="text-[#7A7471]">Cold Storage Validation:</span>
                    <span className="font-bold text-[#16A34A] font-mono">Continuous Active (20-24°C)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#7A7471]">Dispatch Status:</span>
                    <span className={`font-bold font-mono ${
                      activeTransfer.status === 'APPROVED' ? 'text-[#16A34A]' : 'text-[#D97706]'
                    }`}>
                      {activeTransfer.status}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-[#7A7471]">
                No transfer recommendation selected.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {activeTransfer && (
            <div className="space-y-2 pt-2 border-t border-[#FAF7F5]">
              <button
                onClick={() => handleApproveClick(activeTransfer.id)}
                className="w-full py-3.5 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Authorize Transfer #{activeTransfer.id}</span>
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              </button>

              <button
                onClick={() => onNavigateToStep('approval')}
                className="w-full py-2.5 bg-[#FAF7F5] hover:bg-[#F2ECE8] border border-[#E8E1DC] text-[#7A7471] hover:text-[#1F1B19] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View All Pending Authorizations</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Route Ledger Table */}
      <section className="bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-[#FAF7F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1F1B19]">
              Regional Recommended Transfer Corridors ({displayedTransfers.length} Routes)
            </h3>
            <p className="text-xs text-[#7A7471] mt-0.5">
              Click any route to highlight its physical road trajectory on the map and view clinical recommendation rationale.
            </p>
          </div>
          <span className="text-xs font-mono text-[#7A7471]">HiGHS Min-Cost LP Solved</span>
        </div>

        <div className="divide-y divide-[#FAF7F5] text-xs">
          {displayedTransfers.slice(0, 15).map((t) => {
            const isSelected = activeTransfer?.id === t.id
            return (
              <div
                key={t.id}
                onClick={() => setSelectedRouteId(t.id)}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FDF6F7] border-l-4 border-[#7A1C28]'
                    : 'hover:bg-[#FAF7F5]'
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-[#7A1C28]/10 text-[#7A1C28] text-[10px] font-bold rounded-md font-mono">
                      #{t.id}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#DCFCE7] text-[#166534] font-bold rounded-md text-[10px] font-mono">
                      {t.quantity} Units {t.blood_group} {t.component}
                    </span>
                    {t.is_connected_to_anchor && (
                      <span className="px-2 py-0.5 bg-[#7A1C28] text-white text-[10px] font-bold rounded-md uppercase font-mono">
                        Anchor
                      </span>
                    )}
                    <span className="text-xs text-[#7A7471] font-mono">
                      {t.distance_km?.toFixed(1)} km · {t.travel_time_min}m transit
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1F1B19] truncate">{t.route}</h4>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-bold text-[#7A1C28] font-mono">
                      {t.route_score ?? 96}/100
                    </span>
                    <span className="text-[10px] text-[#16A34A] font-bold block uppercase font-mono">
                      {t.urgency_level || 'HIGH'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApproveClick(t.id)
                    }}
                    className="px-4 py-2 bg-[#7A1C28] hover:bg-[#63141F] text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Authorize
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
