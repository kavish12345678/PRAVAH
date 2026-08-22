import { useState } from 'react'
import { BloodFlowHover } from '../../components/effects/BloodFlowHover'
import { MagneticButton } from '../../components/effects/MagneticButton'
import { RiskRing } from '../../components/effects/RiskRing'
import type { RiskItem } from '../../types'

interface Step4CentreRiskProps {
  risks: (RiskItem & { distance_km: number; is_anchor: boolean })[]
  onFilterRisk: (level?: string) => void
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step4CentreRisk({
  risks,
  onFilterRisk,
  onNavigateToStep,
}: Step4CentreRiskProps) {
  const [selectedRisk, setSelectedRisk] = useState<
    (RiskItem & { distance_km: number; is_anchor: boolean }) | null
  >(risks[0] || null)
  const [activeBand, setActiveBand] = useState<string>('ALL')

  const handleBandSelect = (band: string) => {
    setActiveBand(band)
    onFilterRisk(band === 'ALL' ? undefined : band)
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans bg-[#FAF7F5]">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FCECEE] text-[#7A1C28] text-[11px] font-bold rounded-full uppercase tracking-wider font-mono">
              Step 04 of 10
            </span>
            <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
              17-Feature Expiry-Risk GBDT Inference
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-[#7A1C28] leading-[1.06] tracking-tight">
            What units are at risk around this centre?
          </h1>

          <p className="text-base sm:text-lg text-[#5A5451] leading-relaxed max-w-[800px]">
            Real continuous GBDT regression and classification predicting wastage probability and degradation velocity across the <strong className="text-[#1F1B19] font-semibold">200 km Chennai network</strong>.
          </p>
        </div>

        <MagneticButton
          onClick={() => onNavigateToStep('cold-chain')}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>Check Cold Chain</span>
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </MagneticButton>
      </section>

      {/* Risk Band Selectors */}
      <section className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-[#E8E1DC] text-xs font-bold shadow-2xs">
        {[
          { code: 'ALL', label: 'All Units' },
          { code: 'CRITICAL', label: 'Critical (>0.90)' },
          { code: 'HIGH', label: 'High (0.70-0.90)' },
          { code: 'MODERATE', label: 'Moderate (0.40-0.70)' },
          { code: 'LOW', label: 'Low (<0.40)' },
        ].map((b) => (
          <button
            key={b.code}
            onClick={() => handleBandSelect(b.code)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeBand === b.code
                ? 'bg-[#7A1C28] text-white shadow-2xs'
                : 'text-[#7A7471] hover:text-[#1F1B19] hover:bg-[#FAF7F5]'
            }`}
          >
            {b.label}
          </button>
        ))}
      </section>

      {/* Risk Master-Detail Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Scored Units List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex justify-between items-center text-xs text-[#7A7471] px-1 font-semibold">
            <span>Showing {risks.length} Scored Units in 200 km Radius</span>
            <span>Sorted by Highest Risk</span>
          </div>

          <div className="space-y-3">
            {risks.map((item, idx) => {
              const isSelected = selectedRisk?.id === item.id
              const flowColor =
                item.risk_score >= 0.7 ? 'burgundy' : item.risk_score >= 0.4 ? 'amber' : 'green'

              const riskColor =
                item.risk_score >= 0.9
                  ? 'text-rose-700 bg-rose-50 border-rose-200'
                  : item.risk_score >= 0.7
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : item.risk_score >= 0.4
                  ? 'text-blue-700 bg-blue-50 border-blue-200'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'

              return (
                <BloodFlowHover
                  key={item.id}
                  flowColor={flowColor}
                  onClick={() => setSelectedRisk(item)}
                  className={`p-5 bg-white rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-[#7A1C28] ring-2 ring-[#7A1C28]/20 shadow-md'
                      : 'border-[#E8E1DC] shadow-2xs'
                  } ${idx < 6 ? `pravah-stagger-${idx + 1}` : ''}`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-[#FAF7F5] text-[#1F1B19] text-[10px] font-bold rounded-md font-mono border border-[#E8E1DC]">
                        {item.unit_id}
                      </span>
                      <span className="text-xs text-[#7A7471] font-mono">
                        {item.distance_km.toFixed(1)} km away
                      </span>
                      {item.is_anchor && (
                        <span className="px-2 py-0.5 bg-[#7A1C28] text-white text-[10px] font-bold rounded-md uppercase font-mono">
                          Anchor Hub
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-[#1F1B19] truncate">{item.bank_name}</h4>
                    <p className="text-xs text-[#5A5451]">
                      {item.blood_group} · {item.component} ({item.quantity} Units) · Expires {item.expiry_date}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <RiskRing score={item.risk_score} size={48} strokeWidth={4} />
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${riskColor}`}>
                      {item.risk_level}
                    </span>
                  </div>
                </BloodFlowHover>
              )
            })}
          </div>
        </div>

        {/* Right: 17-Feature Telemetry Panel */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1DC] shadow-xs space-y-6 sticky top-24">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono">
              Model Feature Telemetry
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1F1B19]">
              {selectedRisk?.unit_id ?? '---'}
            </h3>
            <p className="text-xs text-[#7A7471]">
              {selectedRisk?.bank_name} ({selectedRisk?.distance_km.toFixed(1)} km)
            </p>
          </div>

          {selectedRisk ? (
            <div className="space-y-5 text-xs">
              {/* Dynamic Model Explanation */}
              <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] text-xs text-[#1F1B19] leading-relaxed">
                <span className="font-bold text-[#7A1C28] block mb-1">Clinical AI Assessment:</span>
                {selectedRisk.explanation}
              </div>

              {/* 17 Input Feature Breakdown */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase text-[#7A7471] tracking-wider block">
                  Model Features Vector
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-3 bg-[#FAF7F5] rounded-xl space-y-0.5 border border-[#EFE9E5]">
                    <span className="text-[#7A7471] block">Remaining Shelf Life</span>
                    <span className="font-bold text-[#1F1B19] font-mono text-sm">{selectedRisk.features?.remaining_shelf_life_hours ?? 48} hrs</span>
                  </div>
                  <div className="p-3 bg-[#FAF7F5] rounded-xl space-y-0.5 border border-[#EFE9E5]">
                    <span className="text-[#7A7471] block">Current Stock</span>
                    <span className="font-bold text-[#1F1B19] font-mono text-sm">{selectedRisk.features?.current_stock ?? selectedRisk.quantity} Units</span>
                  </div>
                  <div className="p-3 bg-[#FAF7F5] rounded-xl space-y-0.5 border border-[#EFE9E5]">
                    <span className="text-[#7A7471] block">Demand 24h</span>
                    <span className="font-bold text-[#1F1B19] font-mono text-sm">{selectedRisk.features?.demand_next_24h ?? 6} Units</span>
                  </div>
                  <div className="p-3 bg-[#FAF7F5] rounded-xl space-y-0.5 border border-[#EFE9E5]">
                    <span className="text-[#7A7471] block">Temp Exposure</span>
                    <span className="font-bold text-[#D97706] font-mono text-sm">{selectedRisk.features?.max_temperature_exposure ?? 22.0}°C</span>
                  </div>
                  <div className="p-3 bg-[#FAF7F5] rounded-xl space-y-0.5 border border-[#EFE9E5]">
                    <span className="text-[#7A7471] block">Health Score</span>
                    <span className="font-bold text-[#16A34A] font-mono text-sm">{selectedRisk.features?.health_score ?? 95.0}%</span>
                  </div>
                  <div className="p-3 bg-[#FAF7F5] rounded-xl space-y-0.5 border border-[#EFE9E5]">
                    <span className="text-[#7A7471] block">Wastage Score</span>
                    <span className="font-bold text-[#7A1C28] font-mono text-sm">{selectedRisk.features?.wastage_risk_score ?? selectedRisk.risk_score}</span>
                  </div>
                </div>
              </div>

              <MagneticButton
                onClick={() => onNavigateToStep('pressure')}
                className="w-full py-3.5 bg-[#7A1C28] text-white font-bold uppercase text-xs rounded-full hover:bg-[#63141F] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Step 06 · View Regional Pressure</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </MagneticButton>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#7A7471] bg-[#FAF7F5] rounded-2xl">
              Select a scored unit to view model features.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
