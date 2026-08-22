import { useState, useEffect } from 'react'
import type { RiskItem } from '../../types'

interface Step4RiskProps {
  risks: RiskItem[]
  selectedBank: string | null
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step4Risk({
  risks,
  selectedBank: _selectedBank,
  onNavigateToStep,
}: Step4RiskProps) {
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(() => risks[0] || null)

  useEffect(() => {
    if (!selectedRisk && risks.length > 0) {
      setSelectedRisk(risks[0])
    }
  }, [risks, selectedRisk])

  let contributingFactors: string[] = []
  if (selectedRisk) {
    try {
      contributingFactors = JSON.parse(selectedRisk.contributing_features)
    } catch {
      contributingFactors = [selectedRisk.contributing_features]
    }
  }

  const hasThermalStress = contributingFactors.some((f) =>
    f.toLowerCase().includes('temperature') || f.toLowerCase().includes('thermal') || f.toLowerCase().includes('excursion') || f.toLowerCase().includes('cold chain'),
  )

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              Step 04 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Risk Intelligence
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight mt-1">
            What blood is likely to become a problem?
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            HistGradientBoosting Expiry Risk Model evaluating shelf-life decay, incubation stress, and stockout vulnerability from actual unit features.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep(hasThermalStress ? 'cold-chain' : 'pressure')}
          className="bg-primary text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span>{hasThermalStress ? 'Investigate Cold-Chain' : 'Analyze Pressure'}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </header>

      {/* Main Grid: Risk List (Left 60%) + Risk Breakdown & Factors (Right 40%) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Risk Predictions List */}
        <div className="w-full lg:w-3/5 space-y-3">
          <h3 className="font-serif text-xl font-semibold text-on-surface">
            Scored Unit Risk Cohort ({risks.length} Predictions)
          </h3>

          {risks.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant text-xs bg-white rounded-2xl border border-outline-variant/15">
              No risk predictions loaded.
            </div>
          ) : (
            <div className="space-y-3">
              {risks.slice(0, 7).map((r) => {
                const isSelected = selectedRisk?.id === r.id

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRisk(r)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? 'bg-f5f1ee border-primary ring-1 ring-primary/20 shadow-xs'
                        : 'bg-white border-outline-variant/15 hover:bg-f5f1ee/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            r.risk_level === 'HIGH' ? 'bg-primary-container' : 'bg-secondary'
                          }`}
                        />
                        <span className="text-xs font-bold text-on-surface">
                          Batch #{r.inventory_id} {r.bank_name ? `· ${r.bank_name}` : ''}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {r.blood_group ? `${r.blood_group} ${r.component}` : `Model: ${r.model_version}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-bold text-primary block">
                        {r.risk_score.toFixed(3)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.risk_level === 'HIGH'
                            ? 'bg-error-container text-error'
                            : 'bg-secondary-container text-secondary'
                        }`}
                      >
                        {r.risk_level}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Risk Detail Card */}
        <div className="w-full lg:w-2/5 bg-f5f1ee p-8 rounded-2xl border border-outline-variant/15 flex flex-col justify-between space-y-6">
          {selectedRisk ? (
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">
                Risk Causal Breakdown · Batch #{selectedRisk.inventory_id}
              </span>
              <h3 className="font-serif text-2xl font-semibold text-on-surface">
                Risk Score: {selectedRisk.risk_score.toFixed(3)} / 1.0
              </h3>

              <div className="p-4 bg-white rounded-xl border border-outline-variant/15 space-y-3 text-xs">
                {selectedRisk.bank_name && (
                  <div className="pb-2 border-b border-outline-variant/10 flex justify-between">
                    <span className="text-on-surface-variant">Facility:</span>
                    <span className="font-semibold text-on-surface">{selectedRisk.bank_name}</span>
                  </div>
                )}
                <span className="font-bold text-on-surface uppercase text-[11px] block">
                  Model Contributing Factors:
                </span>
                <ul className="space-y-2">
                  {contributingFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">
                        warning
                      </span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {hasThermalStress ? (
                <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 text-xs text-primary space-y-1">
                  <strong className="font-bold block uppercase text-[10px]">Cold-Chain Excursion Detected:</strong>
                  <span>Temperature stress contributes significantly to spoilage risk for this batch.</span>
                </div>
              ) : (
                <div className="p-3.5 bg-secondary/10 rounded-xl border border-secondary/20 text-xs text-secondary space-y-1">
                  <strong className="font-bold block uppercase text-[10px]">Logistics Imbalance:</strong>
                  <span>Short shelf-life paired with slow local consumption envelope requires redistribution.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-on-surface-variant text-xs">
              Select a risk prediction to inspect factors.
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-outline-variant/20">
            {hasThermalStress ? (
              <button
                onClick={() => onNavigateToStep('cold-chain')}
                className="w-full py-3.5 bg-primary text-white text-xs font-bold uppercase rounded-full hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Step 05 · Investigate Cold-Chain</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigateToStep('pressure')}
                className="w-full py-3.5 bg-primary text-white text-xs font-bold uppercase rounded-full hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Step 06 · Analyze Network Pressure</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}

            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <button
                onClick={() => onNavigateToStep('forecast')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                ← Step 03 Forecast
              </button>
              <button
                onClick={() => onNavigateToStep('optimize')}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Skip to Optimize →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
